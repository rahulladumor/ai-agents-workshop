# 05 · Research Agent — real tools, real network, real artifacts

The campus agent (`agent.js`) is the teaching primitive — clean loop, in-memory tools, perfect for learning mechanics. The **research agent** (`agent-research.js`) is what the pattern looks like when it actually does work: it searches the real internet, reads real web pages, and writes findings to your disk.

```bash
node --env-file=.env agent-research.js "What are the top open-source AI agent frameworks in 2026?"
```

Output:

```
━━━ Research Agent ━━━
model:  claude-sonnet-4-6
goal:   What are the top open-source AI agent frameworks in 2026?

[iter 1] ⠋ thinking… 7.3s
[iter 1] ← response in 9.8s · 4,823 in / 612 out tokens · stop=tool_use
[iter 1] → web_search({"query":"open-source AI agent frameworks 2026"})
[iter 2] → web_fetch({"url":"https://github.com/..."})
[iter 3] → saveNote({"filename":"agent-frameworks-2026.md","content":"..."})
           └─ saved ./research/agent-frameworks-2026.md (2,341 bytes)

━━━ Final Answer  (3 iterations · 18.3s · 12,451 in / 1,847 out tokens)

Top open-source agent frameworks as of early 2026...
[real markdown content with real URLs]
```

---

## What's different from the campus agent

| | Campus agent | Research agent |
|---|---|---|
| File | `agent.js` | `agent-research.js` |
| Runtime | Express server on :3000 | CLI (one-shot) |
| Model | `claude-haiku-4-5` | `claude-sonnet-4-6` (or `--fast` for Haiku) |
| Tools | 2 synthetic (in-memory lookup) | 5 real (web + filesystem) |
| Touches the outside world? | No | Yes — real HTTP, real disk writes |
| Iteration cap | 5 | 20 |
| UI | Yes, at `localhost:3000` → **Research Agent** tab | Also yes (SSE streams to same UI) |
| Typical cost per query | ~₹0.02 | ~₹10–25 |
| Typical duration | 1–2 seconds | 8–30 seconds |

---

## The 5 tools

### 1. `web_search` — Anthropic-hosted

Searches the real web. You declare it in the tool list as:

```js
{ type: 'web_search_20260209', name: 'web_search', allowed_callers: ['direct'] }
```

No handler on your side — Anthropic runs the search on its infrastructure, returns results in the response. The `allowed_callers: ['direct']` flag is required for Haiku (it disables "programmatic tool calling," which Haiku doesn't support; Sonnet and Opus do).

Cost: ~$0.01 per search on top of the model tokens. Not free.

### 2. `web_fetch` — Anthropic-hosted

Reads a specific URL. Same declaration pattern as `web_search`. Anthropic fetches the page, parses it, and passes content back to the model.

### 3. `saveNote` — client-side

Writes a markdown file to `./research/`. Defined entirely in `lib/research.js`:

```js
{
  name: 'saveNote',
  description: 'Save research findings to a markdown file...',
  input_schema: {
    type: 'object',
    properties: {
      filename: { type: 'string', description: 'Filename ending in .md' },
      content:  { type: 'string', description: 'Markdown content' }
    },
    required: ['filename', 'content']
  }
}
```

Critical safety detail in the handler:

```js
const safe = path.basename(String(filename || ''));
if (!safe.endsWith('.md')) return { error: 'Filename must end in .md' };
if (safe === '' || safe === '.' || safe === '..') return { error: 'Invalid filename' };
```

Every write gets `path.basename()`'d — no path traversal. No way for the model to write outside `./research/`, even if it tried. Treat LLM tool arguments like form submissions from a stranger.

### 4. `listNotes` — client-side

Returns `{ count, files: [{filename, size_bytes, modified}] }` for everything in `./research/`. Lets the agent check what it's saved before.

### 5. `readNote` — client-side

Reads a previously-saved note. Returns `{ filename, content }` or `{ error: "..." }`. Errors as data, not exceptions, so the model can self-correct.

---

## The loop behaves slightly differently with server-side tools

With only client-side tools (like the campus agent), the loop is straightforward:

```
LLM → tool_use → your code runs tool → tool_result → LLM → answer
```

With server-side tools (`web_search`, `web_fetch`), the response from one `messages.create()` call can contain a MIXED sequence of content blocks:

```
Assistant content: [
  { type: "text",                    text: "Let me search for that..." },
  { type: "server_tool_use",         name: "web_search", input: {...} },
  { type: "web_search_tool_result",  content: [...] },
  { type: "text",                    text: "### Results\n1. ..." },
  { type: "server_tool_use",         name: "web_fetch", input: {...} },
  { type: "web_fetch_tool_result",   content: [...] },
  { type: "text",                    text: "Based on the page..." }
]
```

The server ran its own internal loop — searched, filtered, fetched, integrated — and handed you a single response with everything interleaved. Your code gets `stop_reason: "end_turn"` but the usage field shows a much higher token count than you'd expect from one iteration. For example: **1 iteration but 63,000 input tokens** means Anthropic ran ~5–10 internal steps on your behalf.

**Gotcha we hit and fixed:** don't do `resp.content.find(b => b.type === 'text')` — that only returns the first text block. With server-side tools, the real answer is split across multiple text blocks interleaved with server tool use. Use:

```js
const answer = resp.content
  .filter(b => b.type === 'text')
  .map(b => b.text)
  .join('\n\n')
  .trim();
```

This is a real production bug that took a live demo to catch. Now `lib/research.js` handles it correctly.

---

## The `pause_turn` stop reason

Server-side tools have their own internal iteration cap (default 10). If the server-side loop needs more than 10 steps, the API returns `stop_reason: "pause_turn"` and you need to continue the conversation by re-sending (the server picks up where it left off).

In `lib/research.js`:

```js
if (resp.stop_reason === 'pause_turn') {
  onEvent({ type: 'pause_turn', iteration: i + 1 });
  continue;  // just loop again, nothing else to do
}
```

Do NOT add an extra user message like "continue." The API detects the trailing `server_tool_use` block and resumes automatically.

---

## Cost profile

Each research query typically costs:

| Component | Approx cost per query |
|---|---|
| Sonnet 4.6 input tokens (~15–25K with web results) | $0.05–0.08 |
| Sonnet 4.6 output tokens (~2–4K for a good answer) | $0.03–0.06 |
| web_search calls (3–5 per query) | $0.03–0.05 |
| web_fetch calls (free on top of model tokens) | $0.00 |
| **Total** | **~$0.10–0.20** per query |

Which is **~₹10–25 per query**. Fine for a live demo (3 queries = ₹75). Not fine to leave unmonitored in prod without caps.

With `--fast` (Haiku 4.5), costs drop roughly 3×, so ~₹3–8 per query.

---

## The library split

`agent-research.js` is a thin CLI wrapper. The actual loop lives in `lib/research.js`, which:

- Exports `runResearchAgent(question, { fast, researchDir, apiKey, onEvent })`
- Emits events via `onEvent({ type, ...details })` so the caller decides how to render
- Has zero `console.log` statements (that's a library, not an application)

Both the CLI (`agent-research.js`) and the HTTP server (`agent.js`) consume it:

```js
// CLI: ANSI spinner + colored terminal output
import { runResearchAgent } from './lib/research.js';
await runResearchAgent(question, { onEvent: (e) => prettyTerminalLog(e) });

// Server: Server-Sent Events for the browser UI
app.get('/stream-research', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  await runResearchAgent(req.query.q, {
    onEvent: (e) => res.write(`data: ${JSON.stringify(e)}\n\n`)
  });
});
```

Both run the exact same logic. The only difference is where the events go.

---

## In the workshop

Use the research agent as the closing moment — after you've built the campus agent live and students see the loop click, switch to the browser's **Research Agent** tab and ask:

> *"What's happening with Claude Haiku 4.5 this week?"*

Students see real search results appear as clickable cards, real pages being fetched, a real final answer rendered in markdown. Same loop. Same UI. Real tools. That's the thesis of the workshop, landed in 30 seconds.

---

## Extending it

See [CHALLENGES.md](../CHALLENGES.md) for ideas. A few research-specific ones:

- Add a `sendEmail` tool (with human approval) so the agent can actually share findings
- Add a `scheduleCron` tool so it becomes a recurring research bot
- Add a `tweetThread` tool that drafts (but doesn't post) Twitter threads from the research
- Swap `web_search` for a custom tool that hits arXiv directly — better for academic queries
- Add rate limits per tool (the agent shouldn't be able to fire 50 searches on a single query)

---

## Next

→ [CHALLENGES.md](../CHALLENGES.md) — extend this agent
→ Back to [README](../README.md)
