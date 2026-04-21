# Exercise 2 — Design your own agent

**Time:** 7 minutes · **Mode:** pairs · **Medium:** paper or markdown

This is the main exercise of the workshop. Two teams will present. Critique will be honest.

---

## Your task

Pick **one real campus problem**. Then, in pairs, design an agent to solve it.

You must specify four things:

### 1. Goal — one sentence

Not a feature. Not a description. A **goal** the agent pursues for a user.

- ✓ Good: "Help a student find and register for courses that fit their schedule."
- ✗ Bad: "An agent for academics." (not a goal, a description)
- ✗ Bad: "Respond to student queries." (too vague — chatbot, not agent)

### 2. Three tools — name + one-line description each

Each tool:
- Has a **clear name** (verb-noun format, e.g. `searchCourses`, `checkPrerequisites`)
- Has a **one-line description** of what it does (this description is a prompt — it's how the LLM knows when to use the tool)
- Is a real, callable function (no "thinks about it" or "decides X")

Example:
```
- searchCourses(query: string)
    returns list of courses matching the query, with credits and schedule
- checkPrerequisites(courseId: string)
    returns whether this student has completed the required prerequisites
- registerForCourse(courseId: string)
    enrolls the student in the course; requires approval from advisor
```

### 3. One failure mode — what could go wrong?

Pick ONE realistic failure. Not "what if the database is down" — more specific:

- Model enrolls the student in a course they haven't finished prerequisites for
- Model invents a course that doesn't exist
- Model enrolls the student 10 times by mistake (infinite loop)
- Model picks a course that conflicts with another the student is already in

### 4. One guardrail — how do you defend?

For the failure you picked. Be specific.

- "Require `checkPrerequisites` to return true before `registerForCourse` can execute"
- "Validate that the courseId returned by the model actually exists in our course catalog before registering"
- "Add `MAX_ITERATIONS = 5` and detect repeat tool calls with same args"
- "Route all `registerForCourse` calls through human approval before they execute"

---

## Template

```markdown
## My agent: [short name]

**Goal:**
[one sentence]

**Tools:**
1. `toolName1(arg: type)` — [one-line description]
2. `toolName2(arg: type)` — [one-line description]
3. `toolName3(arg: type)` — [one-line description]

**Failure mode:**
[what could go wrong]

**Guardrail:**
[how you defend against that specific failure]
```

---

## Good ideas if you're stuck

- Course recommendation agent
- Faculty office-hours scheduler
- Library book availability + reservation agent
- Hostel mess menu + feedback agent
- Internship opportunity finder
- Campus event recommender
- Assignment deadline tracker
- Club event proposal + approval agent

**Avoid** (these are bad fits — see [concepts doc](../docs/01-concepts.md)):
- "Give me a chatbot that answers college FAQs" → that's RAG, not an agent
- "Solve my math homework" → deterministic, doesn't need a loop
- "Auto-generate my resume" → one-shot, no tools, no iteration

---

## What the critique will look for

When you present, expect hard questions like:

- "Why is that a tool and not just a database query?"
- "What prevents the LLM from calling `registerForCourse` 50 times in a loop?"
- "Your tool descriptions are vague — would a model reliably know when to call them?"
- "What's the system prompt say? Does it have 'Never invent course IDs' in it?"

**These questions are the point of the exercise.** Designing an agent is mostly about anticipating the failure modes before they happen.

---

## Self-check before presenting

- [ ] Could a student clearly state our goal in one sentence?
- [ ] Are our tool names and descriptions specific enough that a model would know when to use each one?
- [ ] Does our failure mode describe a realistic situation, not a generic "the API breaks"?
- [ ] Does our guardrail actually defend against our specific failure mode?
- [ ] Would this agent be better than a well-written SQL query + a form?

If you answered "no" to the last one — that's a sign the agent isn't the right tool for this problem.

---

## Post-workshop

Once you've designed your agent on paper, you can actually **build it** using the repo's [`agent.js`](../agent.js) as a starting template. See [CHALLENGES.md](../CHALLENGES.md) for extensions.
