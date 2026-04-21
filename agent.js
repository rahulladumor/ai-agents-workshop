// agent.js  --  workshop server: campus agent + research agent, both with a visual UI
//
// Routes:
//   GET  /                         browser UI (visualizer)
//   POST /ask                      campus agent, returns final answer JSON
//   GET  /stream?q=...&weak=0|1    campus agent, SSE stream of loop steps
//   GET  /stream-research?q=...&fast=0|1   research agent, SSE stream
//
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { runResearchAgent } from './lib/research.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RESEARCH_DIR = path.join(__dirname, 'research');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5';
const MAX_ITERATIONS = 5;

// ---------------------------------------------------------------
// Tools -- this is what the LLM sees. The description IS a prompt.
// ---------------------------------------------------------------
const STRONG_DESCRIPTIONS = {
  getStudentCount:
    'Returns the number of students enrolled in a department for the current semester. ' +
    'Use this whenever the user asks for student counts. Never guess.',
  listCourses:
    'Returns the list of courses offered by a department this semester. ' +
    'Use this when the user asks about courses or subjects. Never guess.'
};

const WEAK_DESCRIPTIONS = {
  getStudentCount: 'Returns a number.',
  listCourses: 'Returns a list.'
};

function buildTools(weakMode) {
  const desc = weakMode ? WEAK_DESCRIPTIONS : STRONG_DESCRIPTIONS;
  return [
    {
      name: 'getStudentCount',
      description: desc.getStudentCount,
      input_schema: {
        type: 'object',
        properties: {
          department: {
            type: 'string',
            description: 'Department code. Supported: CSE, ME, CE, EE.'
          }
        },
        required: ['department']
      }
    },
    {
      name: 'listCourses',
      description: desc.listCourses,
      input_schema: {
        type: 'object',
        properties: {
          department: {
            type: 'string',
            description: 'Department code. Supported: CSE, ME, CE, EE.'
          }
        },
        required: ['department']
      }
    }
  ];
}

// ---------------------------------------------------------------
// Tool handlers -- real code, returns structured data or structured errors.
// ---------------------------------------------------------------
function getStudentCount({ department }) {
  const data = { CSE: 420, ME: 310, CE: 180, EE: 265 };
  if (data[department] === undefined) {
    return {
      error: `Unknown department '${department}'. Valid: CSE, ME, CE, EE.`
    };
  }
  return { department, count: data[department], semester: 'Spring 2026' };
}

function listCourses({ department }) {
  const data = {
    CSE: ['Data Structures', 'Operating Systems', 'DBMS', 'AI', 'Networks'],
    ME:  ['Thermodynamics', 'Fluid Mechanics', 'Manufacturing'],
    CE:  ['Structures', 'Geotech', 'Transportation'],
    EE:  ['Circuits', 'Power Systems', 'Signals']
  };
  if (!data[department]) {
    return {
      error: `Unknown department '${department}'. Valid: CSE, ME, CE, EE.`
    };
  }
  return { department, courses: data[department] };
}

const toolHandlers = { getStudentCount, listCourses };

// ---------------------------------------------------------------
// The agent loop -- this IS the agent. Everything else is plumbing.
// Emits events to `onEvent` so the UI can render progress live.
// ---------------------------------------------------------------
async function runAgent(userMessage, { weakMode = false, onEvent = () => {} } = {}) {
  const tools = buildTools(weakMode);
  const system =
    'You are a campus assistant for engineering students. ' +
    'When the user asks about student counts or courses, you MUST call the matching tool. ' +
    'Never invent numbers or facts. If a tool returns an error, explain it plainly.';

  const messages = [{ role: 'user', content: userMessage }];
  const startedAt = Date.now();
  let totalInputTokens = 0;
  let totalOutputTokens = 0;

  onEvent({ type: 'start', question: userMessage, weakMode });

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    onEvent({ type: 'thinking', iteration: i + 1 });

    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      tools,
      messages
    });

    totalInputTokens += resp.usage?.input_tokens ?? 0;
    totalOutputTokens += resp.usage?.output_tokens ?? 0;

    messages.push({ role: 'assistant', content: resp.content });

    if (resp.stop_reason === 'tool_use') {
      const toolUseBlocks = resp.content.filter(b => b.type === 'tool_use');
      console.log(
        `[iter ${i + 1}] -> tools: ` +
        toolUseBlocks.map(b => b.name).join(', ')
      );

      const toolResults = toolUseBlocks.map(block => {
        const handler = toolHandlers[block.name];
        let result;
        try {
          result = handler
            ? handler(block.input)
            : { error: `Unknown tool: ${block.name}` };
        } catch (err) {
          result = { error: `Tool failed: ${err.message}` };
        }
        onEvent({
          type: 'tool_call',
          iteration: i + 1,
          name: block.name,
          input: block.input,
          result
        });
        return {
          type: 'tool_result',
          tool_use_id: block.id,
          content: JSON.stringify(result)
        };
      });

      messages.push({ role: 'user', content: toolResults });
      continue;
    }

    // stop_reason === 'end_turn' -- final answer, return it
    console.log(`[iter ${i + 1}] -> final answer`);
    const textBlock = resp.content.find(b => b.type === 'text');
    const answer = textBlock?.text ?? '';
    const elapsedMs = Date.now() - startedAt;
    onEvent({
      type: 'final',
      iteration: i + 1,
      answer,
      elapsed_ms: elapsedMs,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens
    });
    return {
      answer,
      iterations: i + 1,
      elapsed_ms: elapsedMs,
      input_tokens: totalInputTokens,
      output_tokens: totalOutputTokens
    };
  }

  const stopped = { answer: 'Agent stopped: iteration limit reached.', iterations: MAX_ITERATIONS };
  onEvent({ type: 'final', ...stopped, stopped_on_limit: true });
  return stopped;
}

// ---------------------------------------------------------------
// POST /ask -- returns the final answer as JSON (simple, for curl + students)
// ---------------------------------------------------------------
app.post('/ask', async (req, res) => {
  const { question, weak } = req.body;
  if (!question) return res.status(400).json({ error: 'question required' });
  try {
    const result = await runAgent(question, { weakMode: !!weak });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
// GET /stream -- streams every step of the loop via Server-Sent Events
// Used by the visual demo (public/index.html).
// ---------------------------------------------------------------
app.get('/stream', async (req, res) => {
  const question = String(req.query.q || '').trim();
  const weakMode = req.query.weak === '1';

  if (!question) {
    return res.status(400).json({ error: 'q param required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const emit = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    await runAgent(question, { weakMode, onEvent: emit });
  } catch (err) {
    console.error(err);
    emit({ type: 'error', message: err.message });
  }
  emit({ type: 'done' });
  res.end();
});

// ---------------------------------------------------------------
// GET /stream-research -- streams the research agent loop via SSE
// ---------------------------------------------------------------
app.get('/stream-research', async (req, res) => {
  const question = String(req.query.q || '').trim();
  const fast = req.query.fast === '1';

  if (!question) {
    return res.status(400).json({ error: 'q param required' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  const emit = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  try {
    await runResearchAgent(question, {
      fast,
      researchDir: RESEARCH_DIR,
      onEvent: emit
    });
  } catch (err) {
    console.error(err);
    emit({ type: 'error', message: err.message });
  }
  emit({ type: 'done' });
  res.end();
});

app.listen(3000, () =>
  console.log('Agent running on http://localhost:3000')
);
