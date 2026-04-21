// agent.js  --  minimum-viable AI agent for the workshop demo
//                uses the Anthropic SDK + Claude Haiku 4.5
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(express.json());

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5';
const MAX_ITERATIONS = 5;

// ---------------------------------------------------------------
// Tools -- this is what the LLM sees. The description IS a prompt.
// ---------------------------------------------------------------
const tools = [
  {
    name: 'getStudentCount',
    description:
      'Returns the number of students enrolled in a department for the current semester. ' +
      'Use this whenever the user asks for student counts. Never guess.',
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
    description:
      'Returns the list of courses offered by a department this semester. ' +
      'Use this when the user asks about courses or subjects. Never guess.',
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
// ---------------------------------------------------------------
async function runAgent(userMessage) {
  const system =
    'You are a campus assistant for engineering students. ' +
    'When the user asks about student counts or courses, you MUST call the matching tool. ' +
    'Never invent numbers or facts. If a tool returns an error, explain it plainly.';

  const messages = [{ role: 'user', content: userMessage }];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system,
      tools,
      messages
    });

    // Append assistant turn (preserve the full content block list)
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
    return { answer: textBlock?.text ?? '', iterations: i + 1 };
  }

  return {
    answer: 'Agent stopped: iteration limit reached.',
    iterations: MAX_ITERATIONS
  };
}

// ---------------------------------------------------------------
// HTTP endpoint -- thin wrapper around runAgent()
// ---------------------------------------------------------------
app.post('/ask', async (req, res) => {
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: 'question required' });
  try {
    const result = await runAgent(question);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () =>
  console.log('Agent running on http://localhost:3000')
);
