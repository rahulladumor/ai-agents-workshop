# Exercise 1 — Trace the loop

**Time:** 3 minutes · **Mode:** individual · **Medium:** paper or markdown

---

## Setup

You have an agent with exactly two tools:

- `searchDocs(query: string)` — returns matching document snippets
- `sendEmail(to: string, body: string)` — sends an email

The user says:

> "Find our refund policy and email it to priya@example.com."

---

## Your task

On paper, list every step the agent takes. Mark each step clearly.

Use these labels:

| Label | Meaning |
|---|---|
| `LLM #n` | The nth LLM call. State what the LLM decided. |
| `TOOL` | A tool execution. State which tool and what arguments. |
| `FINAL` | The final answer returned to the user. |

---

## Example format

```
LLM #1 → decide: call searchDocs("refund policy")
TOOL   → searchDocs("refund policy") → returns 3 snippets about refunds
LLM #2 → decide: ...
TOOL   → ...
LLM #n → FINAL: "I found the refund policy and emailed it to priya@example.com."
```

Keep going until the loop exits.

---

## Hints (if you're stuck)

- The model has to read the search results before it can write the email.
- "Send the email" requires the model to have both a recipient and content in its context.
- A well-designed agent will confirm success with the user at the end.

---

## Expected answer (no peeking until you try)

<details>
<summary>Click to reveal</summary>

```
LLM #1 → decide: call searchDocs("refund policy")
TOOL   → searchDocs("refund policy") → returns policy text
LLM #2 → decide: call sendEmail("priya@example.com", "<policy text>")
TOOL   → sendEmail(...) → returns { success: true, message_id: "abc" }
LLM #3 → FINAL: "I've emailed our refund policy to priya@example.com."
```

**Total:** 3 LLM calls, 2 tool executions.

Notice:
- The LLM makes a call even at the end — to write the final message.
- The tool results are the model's "observations" — it reads each one before deciding the next step.
- There is no step where the model "remembers" from training — every piece of information it uses came from a tool result in the current conversation.

</details>

---

## Follow-up question

What would happen if `searchDocs` returned **zero results**?

<details>
<summary>Click to reveal</summary>

A well-designed agent would:
1. See the empty result
2. Decide NOT to call `sendEmail` (nothing to send)
3. Either:
   - Call `searchDocs` again with a different query, or
   - Return a final answer saying the policy couldn't be found

A badly-designed agent (weak system prompt) might:
- Email something it made up
- Email an empty body

This is why the system prompt for real agents usually includes a line like:
> "If a tool returns no results, ask the user for clarification. Never invent content."

</details>

---

## Next

→ [Exercise 2: Design your own agent](./02-design-your-agent.md)
