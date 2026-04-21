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

Workflow (follow in order):
1. Call web_search FIRST with a focused query. Do not write headings before you have facts.
2. Optionally web_fetch 1-2 of the most useful URLs for depth.
3. THEN write the full answer in markdown. Every heading MUST have real content beneath it — specific numbers, names, and dates from the sources. Never emit an empty section.
4. End with a "Sources" line listing the URLs you actually used.
5. When asked to save, document, or write findings, also call saveNote() with a descriptive filename.
6. Tone: direct, specific, no marketing fluff. Short sentences are fine, but the answer must be complete.

If the user asks about existing notes, use listNotes() and readNote() before searching.`;

  const messages = [{ role: 'user', content: userMessage }];
  const startedAt = Date.now();
  let totalIn = 0, totalOut = 0;
  // Accumulates text across iterations so pause_turn doesn't drop partial output.
  let accumulatedText = '';

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

    // Citation-split text blocks already contain their own whitespace. Join
    // with empty string so "- " markers stay attached to their content instead
    // of becoming orphan paragraphs that render as literal "- " in the UI.
    const iterText = resp.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    if (resp.stop_reason === 'pause_turn') {
      // Paused mid-generation. The text so far IS part of the final answer;
      // keep it so the next iteration can continue where this one stopped.
      if (iterText) accumulatedText += iterText;
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
    // Two things must be right here:
    //
    // 1) Concatenate ALL text blocks in this response. With server-side web
    //    tools the assistant's response interleaves text/tool/result blocks,
    //    and citations further split prose into many tiny text blocks. A naive
    //    .find(type='text') or a noisy '\n\n' join both drop or mangle content.
    //    Empty-string join preserves the model's own whitespace.
    //
    // 2) Prepend anything captured from earlier pause_turn iterations so a
    //    paused generation that resumed on this turn lands the FULL answer,
    //    not just the tail end.
    const answer = (accumulatedText + iterText).trim();
    const elapsedMs = Date.now() - startedAt;
    console.log(`[research] final · ${answer.length} chars · ${totalOut} out tokens · stop=${resp.stop_reason}`);
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
