# Challenges — extend the demo agent

You've cloned the repo, you have a working agent. Now make it better.

Each challenge teaches one production-grade concept. Pick the ones that interest you — you don't need to do them in order.

---

## 🟢 Beginner

### C1 · Add a third tool

Add a new tool, `getDepartmentFaculty(department)`, that returns the faculty members in a given department.

**What you'll learn:**
- How tool descriptions affect model behavior
- How to register new tools in the schema + handlers

**Bonus:** modify the system prompt so the agent can answer questions like "who teaches AI in CSE?" by chaining `getDepartmentFaculty` with a follow-up.

---

### C2 · Better error messages

Right now, `getStudentCount` returns `{ error: "Unknown department..." }`. Modify it to return structured errors that help the model self-correct.

**Try:**
- Include a `suggestion` field with the closest valid department
- Include a `validValues` array for the model to pick from

Re-run Q3 (`"How many students in Computer Science?"`) and see if the model recovers faster with richer error info.

---

### C3 · Conversation memory

Right now, every request starts fresh. Add session memory using a simple `Map` keyed by session ID.

**Spec:**
- Accept an optional `sessionId` in the `/ask` body
- Store the full `messages` array keyed by sessionId
- On the next request with the same sessionId, load previous messages before appending the new user message

**Test it:** ask "how many in CSE?", then follow up with "what about ME?" — the second request should work without re-specifying context.

---

## 🟡 Intermediate

### C4 · Streaming responses

Instead of returning the whole response at once, stream tokens to the client as they're generated.

**What you'll learn:**
- How to use OpenAI's streaming API
- Server-Sent Events (SSE) from Express
- Why streaming matters for perceived latency

---

### C5 · Cost logging

For every request, log:
- Number of tool calls
- Number of LLM calls
- Tokens in / tokens out
- Estimated cost in rupees (or USD)

Write it to a log file in JSON lines format. At the end of a session, you should be able to see exactly what each request cost.

**Why this matters:** in production, one runaway request can cost ₹10,000. Observability is how you catch it before the bill arrives.

---

### C6 · Rate limiting

Add per-user rate limiting. A single user should not be able to hit `/ask` more than 10 times per minute.

Use `express-rate-limit` or write your own with a simple `Map<userId, timestamps[]>`.

---

### C7 · Cost cap per request

Kill any request that exceeds a token budget (say, 10,000 tokens total).

Track tokens as you go through the loop. Before each LLM call, check: if we've already burned >8,000 tokens, refuse to continue and return what we have.

---

### C8 · Tool permission checks

Add a `permissions` field to each tool schema:

```js
{
  name: 'deleteStudentRecord',
  permissions: ['admin'],  // new field
  ...
}
```

Before executing any tool, check that the current user has the required permission. If not, return an error and let the model explain to the user.

---

## 🔴 Advanced

### C9 · Multi-provider fallback

Today, the agent uses OpenAI. What happens when OpenAI is down?

**Your task:** add support for Anthropic (Claude) as a fallback. If the OpenAI call fails with a 5xx or times out, retry the same request against Anthropic's API.

**Requirements:**
- Identical behavior from the agent's perspective
- Handle the different tool-call format between providers
- Log which provider was actually used

**What you'll learn:** why the "LLM adapter" layer in the architecture diagram exists.

---

### C10 · Eval set

Build a simple evaluation harness.

**Create:** `evals/cases.json` with 10+ test cases:
```json
[
  {
    "id": "basic-count",
    "question": "How many students in CSE?",
    "expectedTool": "getStudentCount",
    "expectedContains": "420"
  },
  ...
]
```

**Create:** `evals/run.js` that:
1. Loops through every case
2. Runs the agent against each
3. Checks expected tool was called
4. Checks expected content is in the answer
5. Prints a pass/fail summary with cost and latency per test

Run it after every change to `agent.js`. **This is what separates toys from products.**

---

### C11 · Retrieval-augmented tool

Add a tool `searchCourseDescriptions(query: string)` that uses vector search (or a simple keyword search) over a bunch of course descriptions.

**Minimal approach:**
- Store course descriptions in a JSON file
- Implement basic keyword/tf-idf search in JS (no vector DB required)
- Register it as a tool

**Fancier approach:**
- Use OpenAI embeddings + cosine similarity
- Store vectors in a local SQLite file with `sqlite-vec`

**What you'll learn:** how RAG fits inside an agent (as one tool, not as a separate system).

---

### C12 · Human-in-the-loop approval

Add a tool `registerStudentForCourse(studentId, courseId)` that requires human approval before executing.

**Spec:**
- When the LLM calls this tool, instead of executing immediately, save the request to a pending queue
- Return a message to the model: "Request pending approval"
- Create a separate endpoint `GET /approvals` that lists pending requests and `POST /approvals/:id/approve` that executes them

**What you'll learn:** why destructive actions in real agents are gated. And how to design around "I need a human's yes" without blocking the whole loop.

---

## Sharing your work

If you build something based on this repo, I'd love to see it.

- Open an issue or PR on this repo
- Tag me on LinkedIn: [Rahul Ladumor](https://linkedin.com/in/rahulladumor)
- Send a link to my site: [rahulladumor.in](https://rahulladumor.in)

Not looking for polish — looking for effort. Broken code with a real attempt beats a polished hello world.

---

---

## 🔴 Research-agent extensions (real tools, higher stakes)

These build on `agent-research.js`, which actually touches the internet and writes to disk. See [docs/05-research-agent.md](./docs/05-research-agent.md) for the full background on how it works.

### R1 · arXiv search tool

Replace `web_search` with a custom tool that hits the arXiv API directly. Better for academic queries — you get structured metadata (authors, abstract, dates, categories) instead of general web snippets.

**Spec:**
- Tool name: `searchArxiv(query, max_results=5)`
- Returns: `[{id, title, authors, abstract, url, published_date}, ...]`
- Use arXiv's free API at `http://export.arxiv.org/api/query`

**What you'll learn:** building custom tools that wrap specific APIs, and how to structure tool output so the model can cite sources correctly.

---

### R2 · `sendEmail` with human approval

Add a tool that drafts an email from research findings. Must require human approval before sending.

**Spec:**
- Tool name: `sendEmail(to, subject, body)`
- Returns: `{ status: 'pending_approval', approval_url: 'http://localhost:3000/approve/<id>' }`
- Add a `GET /approve/:id` endpoint that renders the draft + Approve/Reject buttons
- Only send (via nodemailer or a service) if the user clicks Approve

**What you'll learn:** human-in-the-loop patterns for destructive actions. This is the pattern every real agent touching external communication uses.

---

### R3 · Scheduled recurring research

Turn the one-shot CLI into a daily research bot. Runs your agent at 8am every morning, researches 3 topics you care about, emails you the digest.

**Spec:**
- Use `node-cron` or system `cron`
- Config file `research-schedule.json` with topics and times
- Outputs to `./research/daily/<YYYY-MM-DD>/<topic>.md`

**What you'll learn:** moving from interactive to autonomous. Cost-capping matters a lot more when a bot fires by itself at 3am.

---

### R4 · Research-agent UI in the browser

The research agent currently runs in the browser UI already (we ship this). But take it further: add a "history" panel that shows previous queries, click-to-re-run, and a research notes browser that lets the user read/edit/delete saved `./research/*.md` files.

**What you'll learn:** full-stack agent UX — users don't want to re-ask the same questions; they want continuity.

---

### R5 · Source citation validation

Claude sometimes cites URLs that don't actually back the claim. Add a post-processing step that:

1. Parses the final answer for `[title](url)` citations
2. Runs `web_fetch` on each URL
3. Uses a SECOND Claude call to check: "Does this page actually support the claim made in the citation?"
4. Flags or removes unsupported citations before showing the final answer

**What you'll learn:** hallucination detection via multi-model verification. The "Santa method" applied to source integrity.

---

### R6 · Cost cap per query

Research queries can balloon — one bad prompt = 10 searches + 10 fetches + 50K tokens. Add a hard cap:

- Track `totalInputTokens + totalOutputTokens` across the whole loop
- Before each LLM call, check if the running total is within budget
- If close to the cap, inject a system reminder: "You have X tokens left. Wrap up."
- If over the cap, force `tool_choice: 'none'` and ask for the final answer

**What you'll learn:** self-moderating agents using the API's own signals. This is what production cost management actually looks like.

---

### R7 · Multi-agent pattern

Split the research agent into two: a **planner** (decides what to research) and a **worker** (does the searches + fetches for one topic). The planner calls the worker as a tool for each subtopic, aggregates the results.

**Spec:**
- Planner agent uses `sonnet-4-6`, gets the user's original goal, breaks it into 3–5 research subtopics
- For each subtopic, planner invokes a `runSubagent(topic)` tool
- That tool spins up a fresh research agent instance (with `--fast` / Haiku) focused only on that subtopic
- Planner aggregates sub-answers into a final synthesis

**What you'll learn:** the multi-agent orchestration pattern, sub-agent cost optimization (Haiku for workers, Sonnet for planner), and why single-agent is often the right answer anyway.

---

## The spirit of the thing

Pick one challenge. Finish it. Ship it. Write one paragraph about what you learned. That one finished thing is worth more than twelve half-started ideas.

Start small. One tool. One loop. Real logs.
