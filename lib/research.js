// lib/research.js
// ---------------------------------------------------------------------------
// The pure research-agent runtime. Emits events via onEvent so both the CLI
// (agent-research.js) and the HTTP server (agent.js) can drive it.
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs/promises';
import path from 'node:path';

const MAX_ITERATIONS = 20;

// ---------------------------------------------------------------------------
// Tools — allowed_callers: ['direct'] lets Haiku use these too (otherwise
// they require 'programmatic tool calling' which is Sonnet/Opus only).
// ---------------------------------------------------------------------------
function buildTools() {
  return [
    { type: 'web_search_20260209', name: 'web_search', allowed_callers: ['direct'] },
    { type: 'web_fetch_20260209',  name: 'web_fetch',  allowed_callers: ['direct'] },
    {
      name: 'saveNote',
      description:
        'Save research findings to a markdown file in the ./research/ directory. ' +
        'Use this when the user asks you to save, document, or write findings to a file. ' +
        'Include a title, key findings, and source URLs.',
      input_schema: {
        type: 'object',
        properties: {
          filename: {
            type: 'string',
            description: 'Filename ending in .md, e.g. "ai-trends-2026.md". No path separators.'
          },
          content: {
            type: 'string',
            description: 'Full markdown content. Include title, findings, and source citations.'
          }
        },
        required: ['filename', 'content']
      }
    },
    {
      name: 'listNotes',
      description:
        'List all previously saved research notes with filenames, sizes, and modified dates.',
      input_schema: { type: 'object', properties: {} }
    },
    {
      name: 'readNote',
      description: 'Read the full contents of a previously saved research note.',
      input_schema: {
        type: 'object',
        properties: {
          filename: { type: 'string', description: 'Filename in ./research/, e.g. "rag.md"' }
        },
        required: ['filename']
      }
    }
  ];
}

// ---------------------------------------------------------------------------
// Client-side tool handlers
// ---------------------------------------------------------------------------
function makeHandlers(researchDir) {
  return {
    async saveNote({ filename, content }) {
      const safe = path.basename(String(filename || ''));
      if (!safe.endsWith('.md')) return { error: 'Filename must end in .md' };
      if (safe === '' || safe === '.' || safe === '..') return { error: 'Invalid filename' };
      await fs.mkdir(researchDir, { recursive: true });
      await fs.writeFile(path.join(researchDir, safe), content, 'utf8');
      return {
        saved: true,
        path: `./research/${safe}`,
        size_bytes: Buffer.byteLength(content, 'utf8')
      };
    },
    async listNotes() {
      try {
        const entries = await fs.readdir(researchDir, { withFileTypes: true });
        const files = [];
        for (const e of entries) {
          if (!e.isFile() || !e.name.endsWith('.md')) continue;
          const stat = await fs.stat(path.join(researchDir, e.name));
          files.push({
            filename: e.name,
            size_bytes: stat.size,
            modified: stat.mtime.toISOString()
          });
        }
        return { count: files.length, files };
      } catch (err) {
        return { count: 0, files: [] };
      }
    },
    async readNote({ filename }) {
      const safe = path.basename(String(filename || ''));
      try {
        const content = await fs.readFile(path.join(researchDir, safe), 'utf8');
        return { filename: safe, content };
      } catch (err) {
        return { error: `Could not read ${safe}: ${err.message}` };
      }
    }
  };
}

// ---------------------------------------------------------------------------
// The loop. Calls onEvent for every observable step.
// ---------------------------------------------------------------------------
export async function runResearchAgent(userMessage, {
  fast = false,
  researchDir,
  apiKey = process.env.ANTHROPIC_API_KEY,
  onEvent = () => {}
} = {}) {
  const MODEL = fast ? 'claude-haiku-4-5' : 'claude-sonnet-4-6';
  const anthropic = new Anthropic({ apiKey });
  const tools = buildTools();
  const handlers = makeHandlers(researchDir);

  const system = `You are a research assistant for Rahul Ladumor.

When he asks you to research something:
1. Use web_search to find current, authoritative information
2. Use web_fetch to read the most promising pages in detail (2-3 pages typical)
3. Synthesize what you learned — no filler, no marketing language
4. When asked to save, document, or write findings, use saveNote() with a descriptive filename
5. Always cite source URLs in your final answer
6. Be concise. Rahul prefers direct, specific output. Short sentences. No hype words.

If the user asks about existing notes, use listNotes() and readNote() before searching.`;

  const messages = [{ role: 'user', content: userMessage }];
  const startedAt = Date.now();
  let totalIn = 0, totalOut = 0;

  onEvent({ type: 'start', question: userMessage, model: MODEL, fast });

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const iterStart = Date.now();
    onEvent({ type: 'thinking', iteration: i + 1 });

    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 16000,   // long research answers need headroom; stays under SDK HTTP timeout
      system,
      tools,
      messages
    });

    const iterMs = Date.now() - iterStart;
    totalIn  += resp.usage?.input_tokens  ?? 0;
    totalOut += resp.usage?.output_tokens ?? 0;

    messages.push({ role: 'assistant', content: resp.content });

    onEvent({
      type: 'iteration_complete',
      iteration: i + 1,
      elapsed_ms: iterMs,
      input_tokens: resp.usage?.input_tokens ?? 0,
      output_tokens: resp.usage?.output_tokens ?? 0,
      stop_reason: resp.stop_reason
    });

    // Model narration between tool calls
    for (const block of resp.content) {
      if (block.type === 'text' && block.text.trim() && resp.stop_reason !== 'end_turn') {
        onEvent({ type: 'note', iteration: i + 1, text: block.text.trim() });
      }
    }

    // Server-side tools
    // With allowed_callers: ['direct'], web_search/web_fetch return their
    // results as server_tool_use + web_search_tool_result blocks inside
    // the assistant content. We surface these as events so the UI/CLI
    // can show what actually happened.
    for (const block of resp.content) {
      if (block.type === 'server_tool_use') {
        onEvent({
          type: 'tool_call',
          iteration: i + 1,
          name: block.name,
          input: block.input,
          server_side: true
        });
      } else if (block.type === 'web_search_tool_result') {
        onEvent({
          type: 'tool_result',
          iteration: i + 1,
          name: 'web_search',
          result: block.content,  // array of {type:'web_search_result', title, url, snippet...}
          server_side: true
        });
      } else if (block.type === 'web_fetch_tool_result') {
        onEvent({
          type: 'tool_result',
          iteration: i + 1,
          name: 'web_fetch',
          result: block.content,  // {type:'web_fetch_result', url, content}
          server_side: true
        });
      }
    }

    if (resp.stop_reason === 'pause_turn') {
      onEvent({ type: 'pause_turn', iteration: i + 1 });
      continue;
    }

    if (resp.stop_reason === 'tool_use') {
      const toolUseBlocks = resp.content.filter(b => b.type === 'tool_use');
      const toolResults = [];

      for (const block of toolUseBlocks) {
        const handler = handlers[block.name];
        let result;
        try {
          result = handler
            ? await handler(block.input)
            : { error: `Unknown tool: ${block.name}` };
        } catch (err) {
          result = { error: `Tool failed: ${err.message}` };
        }
        onEvent({
          type: 'tool_call',
          iteration: i + 1,
          name: block.name,
          input: block.input,
          result,
          server_side: false
        });
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result)
        });
      }

      if (toolResults.length > 0) {
        messages.push({ role: 'user', content: toolResults });
      }
      continue;
    }

    // end_turn — final answer.
    //
    // IMPORTANT: concatenate ALL text blocks, not just the first one.
    // With server-side web tools, the assistant's response can interleave:
    //   text → server_tool_use(web_search) → web_search_tool_result → text → ...
    // Taking only the first text block truncates the answer to whatever
    // Claude wrote BEFORE its first search call.
    const answer = resp.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n\n')
      .trim();
    const elapsedMs = Date.now() - startedAt;
    onEvent({
      type: 'final',
      iteration: i + 1,
      answer,
      elapsed_ms: elapsedMs,
      input_tokens: totalIn,
      output_tokens: totalOut
    });
    return { answer, iterations: i + 1, elapsed_ms: elapsedMs };
  }

  const stopped = { answer: 'Agent stopped: iteration limit reached.', iterations: MAX_ITERATIONS };
  onEvent({ type: 'final', ...stopped, stopped_on_limit: true });
  return stopped;
}
