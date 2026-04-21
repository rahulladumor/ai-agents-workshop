# 04 · Production reality

How agents fail. How real teams defend. What to actually build.

---

## How agents fail (ranked by what I see most)

1. **Hallucination** — model invents facts or tool names
2. **Tool misuse** — wrong args, wrong tool, wrong order
3. **Cost explosion** — loop without a cap
4. **Latency** — 5 tool calls × 2s each = unusable
5. **Non-determinism** — same input, different output across runs
6. **Provider outage** — OpenAI / Anthropic down
7. **Data leak** — PII in logs or model responses

Every one of these has happened on a real system. They are predictable, not exceptional.

---

## Defenses — mapped to failures

| Failure | Defense |
|---|---|
| Hallucination | strict system prompt, output schema, post-response validation |
| Tool misuse | JSON schema validation on args, permission checks, dry-run mode |
| Cost explosion | `MAX_ITERATIONS`, per-user daily cost cap, smaller routing models |
| Latency | parallel tool calls, streaming, smaller models, caching |
| Non-determinism | pin model version (`gpt-4o-mini-2024-07-18`, not `gpt-4o-mini`), eval set |
| Provider outage | multi-provider fallback, health checks, degraded-mode responses |
| Data leak | PII scrubbing on input, output filtering, audit log retention policy |

Each defense goes at a specific point in the loop. That's why the loop diagram matters operationally, not just educationally.

---

## Human in the loop — when to require approval

**Always require a human approval for:**
- Anything touching money
- Outbound communication (email, SMS, public posts)
- Destructive DB operations (`DELETE`, `UPDATE`)
- Regulated actions (health, legal, finance)

**The rule:**

> If a mistake costs more than the engineering time to add an approval step — add the approval step.

Default to approval gates early. You can always remove them later. Adding them after an incident is always more expensive — in time and in trust.

---

## Evaluation — the discipline that separates toys from products

An **eval set** is 50–200 input / expected-output pairs. Run it on every deploy. Measure:

- Accuracy — did the agent do the right thing?
- Tool correctness — did it call the right tool with the right args?
- Cost per run
- Latency per run

**Without evals, you're guessing.** This is the single biggest operational gap in agent teams today. Teams that do evals ship agents. Teams that don't, ship demos.

---

## Hallucination — a live demonstration

The workshop demo includes a moment where we weaken the tool description and watch the model stop calling the tool. Try it yourself:

1. Run the agent and verify Q1 works (see [README](../README.md))
2. In `agent.js`, find this line in the `getStudentCount` tool schema:
   ```js
   description:
     'Returns the number of students enrolled in a department for the current semester. ' +
     'Use this whenever the user asks for student counts. Never guess.',
   ```
3. Change it to:
   ```js
   description: 'Returns a number.',
   ```
4. Restart the server. Run Q1 again.
5. Watch what happens. Often the model will stop calling the tool and either invent a number or refuse.

**Lesson:** the tool description is a prompt. Weak description → broken agent. Tool descriptions are the highest-leverage prompt you'll write in an agentic system.

Restore the description when you're done.

---

## The one sentence to remember

> The LLM is the unreliable part.
> The system around it is what makes the agent reliable.

If this workshop has done its job, that sentence now means something specific to you.

---

## Next

→ [exercises/01-trace-the-loop.md](../exercises/01-trace-the-loop.md) — warm-up exercise
→ [exercises/02-design-your-agent.md](../exercises/02-design-your-agent.md) — design exercise
→ [CHALLENGES.md](../CHALLENGES.md) — extend the demo agent
