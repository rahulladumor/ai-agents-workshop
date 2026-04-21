// agent-research.js
// ---------------------------------------------------------------------------
// A research assistant agent that actually does work:
//   - Searches the real web (Anthropic's hosted web_search)
//   - Reads specific web pages (Anthropic's hosted web_fetch)
//   - Saves findings to local markdown files (custom saveNote)
//   - Can read previously saved notes (custom readNote, listNotes)
//
// Unlike agent.js (the campus teaching primitive), this one hits real
// external systems, makes real decisions, and produces real artifacts
// on disk. Run it from the CLI and watch the loop in the terminal.
//
// Usage:
//   node --env-file=.env agent-research.js "<your question>"
//
// Examples:
//   node --env-file=.env agent-research.js "Top 3 open-source AI agent frameworks in 2026"
//   node --env-file=.env agent-research.js "Latest research on retrieval-augmented generation, save to rag.md"
//   node --env-file=.env agent-research.js "What are people saying about Claude Haiku 4.5?"
// ---------------------------------------------------------------------------

import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESEARCH_DIR = path.join(__dirname, 'research');
await fs.mkdir(RESEARCH_DIR, { recursive: true });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-6';   // sonnet for multi-step research decisions
const MAX_ITERATIONS = 20;           // web research can take many tool calls

// ---------------------------------------------------------------------------
// Tools
//   - web_search / web_fetch are server-side tools hosted by Anthropic.
//     They execute on Anthropic's infrastructure; we just declare them.
//   - saveNote / listNotes / readNote are client-side: our code executes them.
// ---------------------------------------------------------------------------
const tools = [
  // --- Anthropic-hosted tools (no handler needed on our side) ---
  { type: 'web_search_20260209', name: 'web_search' },
  { type: 'web_fetch_20260209',  name: 'web_fetch'  },

  // --- Our custom tools ---
  {
    name: 'saveNote',
    description:
      'Save research findings to a markdown file in the ./research/ directory. ' +
      'Use this when the user asks you to save, document, or write findings to a file. ' +
      'Include a title, key findings, and source URLs. Markdown is rendered nicely on GitHub.',
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
      'List all previously saved research notes with filenames, sizes, and modified dates. ' +
      'Use this when the user asks what notes exist or wants to continue prior research.',
    input_schema: { type: 'object', properties: {} }
  },
  {
    name: 'readNote',
    description:
      'Read the full contents of a previously saved research note. ' +
      'Use this when the user asks to see, review, or continue from an existing note.',
    input_schema: {
      type: 'object',
      properties: {
        filename: { type: 'string', description: 'Filename in ./research/, e.g. "rag.md"' }
      },
      required: ['filename']
    }
  }
];

// ---------------------------------------------------------------------------
// Client-side tool handlers
// ---------------------------------------------------------------------------
async function saveNote({ filename, content }) {
  const safe = path.basename(String(filename || ''));
  if (!safe.endsWith('.md')) {
    return { error: 'Filename must end in .md' };
  }
  if (safe === '' || safe === '.' || safe === '..') {
    return { error: 'Invalid filename' };
  }
  const fullPath = path.join(RESEARCH_DIR, safe);
  await fs.writeFile(fullPath, content, 'utf8');
  return {
    saved: true,
    path: `./research/${safe}`,
    size_bytes: Buffer.byteLength(content, 'utf8')
  };
}

async function listNotes() {
  const entries = await fs.readdir(RESEARCH_DIR, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.md')) continue;
    const stat = await fs.stat(path.join(RESEARCH_DIR, e.name));
    files.push({
      filename: e.name,
      size_bytes: stat.size,
      modified: stat.mtime.toISOString()
    });
  }
  return { count: files.length, files };
}

async function readNote({ filename }) {
  const safe = path.basename(String(filename || ''));
  try {
    const content = await fs.readFile(path.join(RESEARCH_DIR, safe), 'utf8');
    return { filename: safe, content };
  } catch (err) {
    return { error: `Could not read ${safe}: ${err.message}` };
  }
}

const toolHandlers = { saveNote, listNotes, readNote };

// ---------------------------------------------------------------------------
// ANSI helpers for pretty terminal output
// ---------------------------------------------------------------------------
const c = {
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
  teal:   (s) => `\x1b[36m${s}\x1b[0m`,
  orange: (s) => `\x1b[33m${s}\x1b[0m`,
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`
};

function summarizeInput(input) {
  const str = JSON.stringify(input);
  return str.length > 90 ? str.slice(0, 87) + '...' : str;
}

function summarizeResult(result) {
  if (result.error)                   return c.red(`ERROR: ${result.error}`);
  if (result.saved)                   return c.green(`saved ${result.path} (${result.size_bytes} bytes)`);
  if (typeof result.count === 'number') return c.dim(`${result.count} note(s)`);
  if (result.content)                 return c.dim(`read ${result.content.length} chars`);
  const str = JSON.stringify(result);
  return c.dim(str.length > 90 ? str.slice(0, 87) + '...' : str);
}

// ---------------------------------------------------------------------------
// The agent loop
// ---------------------------------------------------------------------------
async function runResearchAgent(userMessage) {
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
  let totalIn = 0;
  let totalOut = 0;

  console.log('\n' + c.bold('━━━ Research Agent ━━━'));
  console.log(c.dim('model:  ') + MODEL);
  console.log(c.dim('goal:   ') + userMessage + '\n');

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    process.stdout.write(c.dim(`[iter ${i + 1}] `) + c.orange('thinking…'));

    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system,
      tools,
      messages
    });

    process.stdout.write('\r\x1b[K');  // clear "thinking…" line

    totalIn  += resp.usage?.input_tokens  ?? 0;
    totalOut += resp.usage?.output_tokens ?? 0;

    messages.push({ role: 'assistant', content: resp.content });

    // Log text content if any (the model sometimes emits narration between tool calls)
    for (const block of resp.content) {
      if (block.type === 'text' && block.text.trim() && resp.stop_reason !== 'end_turn') {
        const snippet = block.text.trim().split('\n')[0].slice(0, 100);
        console.log(c.dim(`[iter ${i + 1}] `) + c.dim('note: ') + snippet);
      }
    }

    // --- Server-side tool hit its internal iteration cap — resume ---
    if (resp.stop_reason === 'pause_turn') {
      console.log(c.dim(`[iter ${i + 1}] `) + c.dim('server-side tool paused, resuming…'));
      continue;
    }

    // --- Model wants tools executed ---
    if (resp.stop_reason === 'tool_use') {
      const toolUseBlocks = resp.content.filter(b => b.type === 'tool_use');
      const toolResults = [];

      for (const block of toolUseBlocks) {
        const isServerTool = !toolHandlers[block.name];
        const prefix = c.dim(`[iter ${i + 1}] `) + (isServerTool ? c.teal('→ ') : c.green('→ '));
        console.log(prefix + c.bold(block.name) + c.dim('(' + summarizeInput(block.input) + ')'));

        if (isServerTool) {
          // Server-side: Anthropic already ran it; result is in the response,
          // not in our control. We just wait for the model to continue in the
          // next iteration.
          continue;
        }

        // Client-side: we run it
        let result;
        try {
          result = await toolHandlers[block.name](block.input);
        } catch (err) {
          result = { error: `Tool failed: ${err.message}` };
        }
        console.log('           ' + c.dim('└─ ') + summarizeResult(result));
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

    // --- end_turn: final answer ---
    const textBlock = resp.content.find(b => b.type === 'text');
    const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log('\n' + c.bold('━━━ Final Answer') +
      c.dim(`  (${i + 1} iterations · ${elapsed}s · ${totalIn} in / ${totalOut} out tokens)`) + '\n');
    console.log(textBlock?.text ?? c.dim('(no text in response)'));
    console.log();
    return { answer: textBlock?.text ?? '', iterations: i + 1 };
  }

  console.log(c.red('\nAgent stopped: iteration limit reached.'));
  return { answer: 'Iteration limit reached.', iterations: MAX_ITERATIONS };
}

// ---------------------------------------------------------------------------
// CLI entry
// ---------------------------------------------------------------------------
const question = process.argv.slice(2).join(' ').trim();

if (!question) {
  console.log(`
${c.bold('Research Agent')} ${c.dim('— an AI agent that actually does research')}

Usage:
  node --env-file=.env agent-research.js "<your question>"

Examples:
  node --env-file=.env agent-research.js "What are the top 3 open-source AI agent frameworks in 2026?"
  node --env-file=.env agent-research.js "Latest research on retrieval-augmented generation, save to rag.md"
  node --env-file=.env agent-research.js "What's happening with Claude Haiku 4.5 adoption?"
  node --env-file=.env agent-research.js "List my existing research notes"

Output:
  ${c.dim('final answer')}  printed to the terminal
  ${c.dim('saved notes')}   written to ./research/*.md
`);
  process.exit(1);
}

runResearchAgent(question).catch(err => {
  console.error(c.red('Error: ') + err.message);
  process.exit(1);
});
