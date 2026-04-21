// agent-research.js
// ---------------------------------------------------------------------------
// CLI wrapper for the research agent. The actual loop lives in lib/research.js
// so it can be shared with the HTTP server (agent.js).
//
// Usage:
//   node --env-file=.env agent-research.js [--fast] "<your question>"
// ---------------------------------------------------------------------------

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runResearchAgent } from './lib/research.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESEARCH_DIR = path.join(__dirname, 'research');

const FAST = process.argv.includes('--fast');
const question = process.argv.slice(2).filter(a => a !== '--fast').join(' ').trim();

// ANSI helpers for pretty terminal output
const c = {
  dim:    (s) => `\x1b[2m${s}\x1b[0m`,
  teal:   (s) => `\x1b[36m${s}\x1b[0m`,
  orange: (s) => `\x1b[33m${s}\x1b[0m`,
  green:  (s) => `\x1b[32m${s}\x1b[0m`,
  red:    (s) => `\x1b[31m${s}\x1b[0m`,
  bold:   (s) => `\x1b[1m${s}\x1b[0m`
};

if (!question) {
  console.log(`
${c.bold('Research Agent')} ${c.dim('— an AI agent that actually does research')}

Usage:
  node --env-file=.env agent-research.js [--fast] "<your question>"

Examples:
  node --env-file=.env agent-research.js "Top 3 open-source AI agent frameworks in 2026"
  node --env-file=.env agent-research.js "Latest research on RAG, save to rag.md"
  node --env-file=.env agent-research.js --fast "What is Claude Haiku 4.5?"
  node --env-file=.env agent-research.js "List my existing research notes"

Flags:
  --fast    use claude-haiku-4-5 instead of claude-sonnet-4-6
            (faster, cheaper, slightly less reasoning depth)

Typical timing (expected, not a bug):
  Sonnet + web_search   ${c.dim('iter 1:')} ${c.orange('8–15s')}
  Haiku (with --fast)   ${c.dim('iter 1:')} ${c.orange('4–8s')}

Output:
  ${c.dim('final answer')}  printed to the terminal
  ${c.dim('saved notes')}   written to ./research/*.md
`);
  process.exit(1);
}

// Live spinner while "thinking"
let spinnerTimer = null;
let currentIter = 0;
const spinChars = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'];

function startSpinner(iter) {
  currentIter = iter;
  const start = Date.now();
  let idx = 0;
  spinnerTimer = setInterval(() => {
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    process.stdout.write(
      '\r\x1b[K' +
      c.dim(`[iter ${iter}] `) +
      c.orange(spinChars[idx++ % spinChars.length]) + ' ' +
      c.orange('thinking…') + ' ' + c.dim(`${elapsed}s`)
    );
  }, 100);
}
function stopSpinner() {
  if (spinnerTimer) {
    clearInterval(spinnerTimer);
    spinnerTimer = null;
    process.stdout.write('\r\x1b[K');
  }
}

function truncate(str, max = 90) {
  return str.length > max ? str.slice(0, max - 3) + '...' : str;
}
function summarizeInput(input) { return truncate(JSON.stringify(input)); }
function summarizeResult(result) {
  if (!result) return c.dim('(no result)');
  if (result.error)                    return c.red(`ERROR: ${result.error}`);
  if (result.saved)                    return c.green(`saved ${result.path} (${result.size_bytes} bytes)`);
  if (typeof result.count === 'number') return c.dim(`${result.count} note(s)`);
  if (result.content)                  return c.dim(`read ${String(result.content).length} chars`);
  if (Array.isArray(result))           return c.dim(`${result.length} items`);
  return c.dim(truncate(JSON.stringify(result)));
}

const onEvent = (event) => {
  switch (event.type) {
    case 'start':
      console.log('\n' + c.bold('━━━ Research Agent ━━━'));
      console.log(c.dim('model:  ') + event.model + (event.fast ? c.dim('  (--fast)') : ''));
      console.log(c.dim('goal:   ') + event.question);
      console.log(c.dim('note:   iter 1 with web_search runs a real query → expect 8-15s on sonnet, 4-8s on haiku\n'));
      return;
    case 'thinking':
      startSpinner(event.iteration);
      return;
    case 'iteration_complete':
      stopSpinner();
      console.log(
        c.dim(`[iter ${event.iteration}] `) +
        c.dim(`← response in ${(event.elapsed_ms / 1000).toFixed(1)}s`) +
        c.dim(` · ${event.input_tokens} in / ${event.output_tokens} out tokens`) +
        c.dim(` · stop=${event.stop_reason}`)
      );
      return;
    case 'note':
      console.log(c.dim(`[iter ${event.iteration}] `) + c.dim('note: ') + truncate(event.text.split('\n')[0], 100));
      return;
    case 'pause_turn':
      console.log(c.dim(`[iter ${event.iteration}] `) + c.dim('server-side tool paused, resuming…'));
      return;
    case 'tool_call': {
      const color = event.server_side ? c.teal : c.green;
      console.log(
        c.dim(`[iter ${event.iteration}] `) + color('→ ') +
        c.bold(event.name) + c.dim('(' + summarizeInput(event.input) + ')')
      );
      if (event.result !== undefined) {
        console.log('           ' + c.dim('└─ ') + summarizeResult(event.result));
      }
      return;
    }
    case 'tool_result':
      if (Array.isArray(event.result)) {
        console.log('           ' + c.dim(`└─ ${event.result.length} result${event.result.length === 1 ? '' : 's'}`));
        for (const r of event.result.slice(0, 3)) {
          if (r.type === 'web_search_result') {
            console.log('              ' + c.dim('· ') + c.teal(r.title || r.url));
          }
        }
      }
      return;
    case 'final':
      console.log(
        '\n' + c.bold('━━━ Final Answer') +
        c.dim(`  (${event.iteration} iterations · ${(event.elapsed_ms / 1000).toFixed(1)}s · ${event.input_tokens} in / ${event.output_tokens} out tokens)`) +
        '\n'
      );
      console.log(event.answer || c.dim('(no text in response)'));
      console.log();
      return;
    case 'error':
      stopSpinner();
      console.error(c.red('Error: ') + event.message);
      return;
  }
};

runResearchAgent(question, { fast: FAST, researchDir: RESEARCH_DIR, onEvent })
  .catch(err => {
    stopSpinner();
    console.error(c.red('Error: ') + err.message);
    process.exit(1);
  });
