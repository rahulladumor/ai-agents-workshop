// agent.js  --  minimum-viable AI agent for the workshop demo
import express from 'express';
import OpenAI from 'openai';

const app = express();
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = 'gpt-4o-mini';
const MAX_ITERATIONS = 5;

// ---------------------------------------------------------------
// Tools — this is what the LLM sees. The description IS a prompt.
// ---------------------------------------------------------------
const toolSchemas = [
  {
    type: 'function',
    function: {
      name: 'getStudentCount',
      description:
        'Returns the number of students enrolled in a department for the current semester. ' +
        'Use this whenever the user asks for student counts. Never guess.',
      parameters: {
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
  },
  {
    type: 'function',
    function: {
      name: 'listCourses',
      description:
        'Returns the list of courses offered by a department this semester. ' +
        'Use this when the user asks about courses or subjects. Never guess.',
      parameters: {
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
  }
];

// ---------------------------------------------------------------
// Tool handlers — real code, returns structured data or structured errors.
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
// The Agent Loop — this IS the agent. Everything else is plumbing.
// ---------------------------------------------------------------
async function runAgent(userMessage) {
  const messages = [
    {
      role: 'system',
      content:
        'You are a campus assistant for engineering students. ' +
        'When the user asks about student counts or courses, you MUST call the matching tool. ' +
        'Never invent numbers or facts. If a tool returns an error, explain it plainly.'
    },
    { role: 'user', content: userMessage }
  ];

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const resp = await openai.chat.completions.create({
      model: MODEL,
      messages,
      tools: toolSchemas
    });

    const msg = resp.choices[0].message;
    messages.push(msg);

    if (msg.tool_calls?.length) {
      console.log(
        `[iter ${i + 1}] → tools: ` +
        msg.tool_calls.map(c => c.function.name).join(', ')
      );
      for (const call of msg.tool_calls) {
        const handler = toolHandlers[call.function.name];
        let result;
        try {
          const args = JSON.parse(call.function.arguments);
          result = handler
            ? handler(args)
            : { error: `Unknown tool: ${call.function.name}` };
        } catch (err) {
          result = { error: `Tool failed: ${err.message}` };
        }
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result)
        });
      }
      continue;
    }

    console.log(`[iter ${i + 1}] → final answer`);
    return { answer: msg.content, iterations: i + 1 };
  }

  return {
    answer: 'Agent stopped: iteration limit reached.',
    iterations: MAX_ITERATIONS
  };
}

// ---------------------------------------------------------------
// HTTP endpoint — thin wrapper around runAgent()
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
