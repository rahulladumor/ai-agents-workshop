# AI Agents Workshop — Complete Slide Brief

Everything you need to build a 16-slide deck for a 2-hour technical workshop with Masters students and faculty. For each slide you get:

1. **Slide content** — exactly what goes on the slide
2. **What to say** — speaker narrative, plain English (with demo callbacks / transitions)
3. **AI image prompt** — for Ideogram, DALL-E 3, or similar tools that render text
4. **Background-only prompt** — use this if your AI tool can't do text well, then overlay text in PowerPoint
5. **Layout notes** — where things go on the slide

---

## 🎯 The narrative arc (one page, memorize this)

```
BEFORE DEMO (~55 min)              THE DEMO (~35 min)            AFTER DEMO (~30 min)
────────────────────────           ──────────────────           ─────────────────────
S1  Title — the hook               S12 Demo intro               S14 Failures + defenses
S2  Who I am                       S13 Watch points                 (callback to break-the-agent)
S3  Outcomes                           ↓                         S15 Your turn — exercise
S4  Definition (anchor)            [LIVE CODE, 35 min,          S16 Close — mental model
S5  What it's NOT                  visual UI, 4 test Qs,            + callback + goodbye
S6  THE LOOP (whiteboard!)         break-the-agent moment]
S7  Chatbot vs Agent
S8  Use cases (seed research)
S9  Right vs wrong tool
S10 Inside the loop (6 steps)
S11 Architecture (zoom to box)
```

**Key narrative promises kept:**

- Slide 3 promises "watch it build live." Demo delivers.
- Slide 6 (the loop) and Slide 10 (6 steps) preview exactly what the demo will show.
- Slide 8 ("what agents do") seeds row 3, Research — paid off at demo end when you show the Research Agent tab.
- Slide 13 (watch points) is a pre-flight for the demo. Slide 14 (failures) is the post-flight.
- Slide 16 (close) calls back to the break-the-agent moment — the deepest lesson gets the final word.

**Timing target per section:**

| Block | Slides | Duration |
|---|---|---|
| Opening + framing | 1–3 | 8 min |
| Foundations | 4–7 | 18 min |
| Use cases + context | 8–9 | 10 min |
| How it works | 10–11 | 14 min |
| LIVE DEMO | 12–13 | 35 min |
| Production reality | 14 | 12 min |
| Exercise | 15 | 15 min |
| Close + Q&A | 16 | 8 min |
| **Total** | | **120 min** |

---

## Important realism note before you start

**AI image tools struggle with lots of text.** Here's what works and what doesn't:

| Slide type | Full-slide AI generation | Use PPT native |
|---|---|---|
| Hero / title / statement / close | ✅ Works (use Ideogram) | Optional |
| Simple bullet lists (≤5 items, ≤8 words each) | ⚠ Maybe (text often mangled) | ✅ Recommended |
| Tables, code, diagrams | ❌ Never reliable | ✅ Required |

**Recommended strategy:** generate atmospheric backgrounds with AI, build text/tables/diagrams in PowerPoint using the design system below. That's what the NotebookLM slides you shared actually did — the backgrounds are AI, the content is typeset on top.

---

## Design system (paste once into each prompt)

**Visual style preamble** — prepend to every image prompt:

```
Dark editorial illustration, deep navy near-black background (#0B0D10 to #1A2138),
teal cyan accent (#00D9B2), warm amber secondary (#FFAA5A), muted red for warnings (#FF5C7A).
Professional technology magazine aesthetic. Sharp geometric shapes, thin clean lines,
generous negative space. Style references: Anthropic / Linear / Stripe marketing illustrations.
16:9 aspect ratio. Semi-flat, not 3D render.

NOT photorealistic. NOT glowing brains. NOT circuit boards. NOT robots.
NOT purple or pink gradients. NOT generic AI stock imagery. NOT stock photo people.
NOT cluttered. NOT decorative clipart.
```

**PowerPoint text styling** — when you add text on top of AI backgrounds:

| Element | Font | Size | Color |
|---|---|---|---|
| Slide title | Inter Bold | 32 pt | `#E6E6E6` |
| Body text | Inter Regular | 20 pt | `#E6E6E6` |
| Code / diagrams | Menlo / Monaco | 16–18 pt | `#E6E6E6` |
| Eyebrow labels | Menlo Bold UPPERCASE | 12 pt | `#00D9B2` |
| Muted captions | Inter | 14 pt | `#8A8F98` |
| Accent color | — | — | `#00D9B2` (teal) |
| Warning color | — | — | `#FFAA5A` (amber) |

**Tool recommendations:**

- **Ideogram 2.0** (https://ideogram.ai) — best for slides with embedded text. Can reliably render short phrases, titles, numbers.
- **DALL-E 3** (via ChatGPT Plus) — decent text rendering, great at following detailed prompts.
- **Midjourney** — gorgeous backgrounds, poor at text. Use for background-only prompts.
- **Flux Pro** (via Fal.ai / Replicate) — balanced, good at both.

---

# SLIDE 1 — Title

## Slide content

```
Eyebrow:    A 2-HOUR WORKSHOP
Title:      Building AI Agents
Subtitle:   What they are, how they work, and why most of them fail in production.
Byline:     RAHUL LADUMOR · Solo AWS + AI consultant · rahulladumor.in
Footnote:   We are going to build, break, and understand AI agents —
            the way you deal with them in production, not the way LinkedIn explains them.
```

## What to say

Walk on stage, wait for the room to quiet, then open with the hook:

> *"Hands up — how many of you used ChatGPT this week? [wait]. Keep your hand up if you've actually built something with it. [most drop]. For the next two hours we're going to build. My name is Rahul. We're going to break this paradigm apart and put it back together, properly."*

## AI image prompt (full slide with text)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy near-black background. Centered composition.

Top of slide in small teal cyan monospaced uppercase letterspaced text: "A 2-HOUR WORKSHOP"

Large bold sans-serif white title: "Building AI Agents"

Below title in medium gray: "What they are, how they work, and why most of them fail in production."

Bottom of slide in small muted gray: "RAHUL LADUMOR — rahulladumor.in"

Right side of slide: abstract geometric illustration of a single elegant infinity loop
drawn with thin teal cyan lines, subtle blueprint grid fading into background,
fine architectural linework, extending off the right edge.
```

## Background-only prompt (if using PPT for text)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy near-black background. Right half of composition: abstract geometric illustration
of a single elegant infinity loop drawn with thin teal cyan lines, subtle blueprint grid
fading into background, architectural linework extending off right edge. Left half: generous
empty negative space for text overlay. Minimalist, sophisticated, no text in image.
```

## Layout in PowerPoint

- Background: AI image (or solid `#0B0D10`)
- Top-left, 0.5" margin: `A 2-HOUR WORKSHOP` — Menlo Bold 12pt, teal `#00D9B2`, letterspaced
- Center-left, 2" from top: `Building AI Agents` — Inter Bold 60pt, white `#E6E6E6`
- Below title: subtitle — Inter Regular 24pt, muted `#8A8F98`
- Bottom-left, 0.5" from bottom: byline — Menlo Regular 14pt, muted

---

# SLIDE 2 — Who I am

## Slide content

```
Title:         Who I am

Left column (photo or abstract avatar):
               RAHUL LADUMOR
               Cloud + AI architect
               Surat, India

Right column (4 bullets):
               • 8+ years in cloud + AI
                 PHP → Node/Lambda → ECS/EKS → CTO → Architect

               • Solo consultant today
                 AWS + AI + production systems

               • Currently shipping:
                 – agent-based procurement platform
                 – AI FinOps startup (InfraCure)
                 – AI-first personal tools

               • What I bring to this session:
                 scars from real systems, not slides from docs
```

## What to say

60–90 seconds max. Don't read the bullets.

> *"Eight years building production systems. I was a CTO at an AI SaaS, now I consult solo on AWS and AI. What I'm going to share today comes from things that broke in production, not from documentation. If you leave still unclear about the difference between a chatbot and an agent, I've failed. That's the bar for today."*

## AI image prompt (full slide — if no real photo available)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy near-black slide. Upper-left: bold white title text "Who I am".

Left column: abstract editorial illustration representing an architect/engineer —
thin teal cyan topographic contour lines suggesting a map or blueprint, radiating from
a central node, on deep navy background. Sophisticated, architectural.

Right column: four horizontal rows of short text, each row a different teal-cyan monospaced heading
followed by a gray subtitle. Row 1 heading: "8+ years in cloud + AI". Row 2: "Solo consultant today".
Row 3: "Currently shipping three projects". Row 4: "Scars from real systems".

Style: editorial magazine about-the-author page, minimalist, clean typography.
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy near-black slide with a subtle abstract illustration filling the left third:
thin teal cyan topographic contour lines radiating from a central point, suggesting a
map or architectural blueprint. Faint grid underlay. Right two-thirds: empty negative
space for text. No text in image. Editorial, sophisticated.
```

## Layout in PowerPoint

- Title top-left: `Who I am` — Inter Bold 32pt
- Left 30%: real photo OR AI-generated abstract portrait block, with name + role text underneath in Menlo
- Right 65%: four bullet blocks, Inter 20pt, each with teal bold header and gray body

---

# SLIDE 3 — What you'll walk out with

## Slide content

```
Title:       What you'll walk out with

Body:        By the end of the next two hours, you should be able to:

             1. Explain what an agent is — without confusing it with a chatbot.
             2. Walk through the agent loop, step by step.
             3. Read a production agent architecture and spot weak points.
             4. Watch a working agent built live in ~150 lines of Node.js.
             5. Name 5 ways agents fail in production — and how real teams defend.

Footnote:    All code is on GitHub. Clone it, break it, extend it.
             If we don't hit any of the above, interrupt me.
```

## What to say

> *"Five things. By hour two, you should be able to do all five. The fourth one is where the workshop turns — about 50 minutes in, I'll stop talking, open my editor, and build an agent in front of you. That's the moment everything clicks. If we don't hit any one of these, interrupt me. I mean it."*

## AI image prompt (full slide with text)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Upper-left: bold white "What you'll walk out with".

Center: five numbered rows, each row a large teal cyan number (01 02 03 04 05)
followed by a short white phrase. The numbers are monospaced and prominent.
Row texts: "01 Explain what an agent is", "02 Walk through the loop",
"03 Read a production architecture", "04 Build a working agent in 150 lines",
"05 Name 5 ways agents fail".

Bottom-left small gray: "If we don't hit any of these, interrupt me."

Between the numbers: thin horizontal teal lines as dividers. Clean, editorial, minimal.
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with a faint vertical progression on the right side:
five thin teal cyan horizontal bars of increasing length, stacked vertically,
suggesting progression or milestones. Subtle, decorative, most of the slide
is empty negative space for text. No text in image.
```

## Layout in PowerPoint

- Title top-left: Inter Bold 32pt
- Body area: 5 numbered rows
  - Number: Menlo Bold 28pt, teal `#00D9B2`
  - Text: Inter Regular 22pt, white
- Bottom: footnote in muted `#8A8F98`, Inter Italic 14pt

---

# SLIDE 4 — The Definition (statement slide)

## Slide content

```
[Large centered text]

    An AI agent is a system
    that pursues a goal
    by running a loop
    in which an LLM decides,
    at each step,
    what action to take next.

[Footnote, small and muted]

    Goal. Loop. Decisions at each step.
    Miss one — it's not an agent.
```

## What to say

Read it slowly. Pause. Then:

> *"Memorize this. I'm going to come back to it three more times in this session. Every bad 'agent' I've reviewed in client work fails one of these three parts — goal, loop, or runtime decision-making. Lose one, it's not an agent, whatever the vendor calls it."*

## AI image prompt (full slide with text)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy near-black slide. Center composition.

Large centered bold white sans-serif text across six lines:
Line 1: "An AI agent is a system"
Line 2: "that pursues a goal"
Line 3: "by running a loop"
Line 4: "in which an LLM decides,"
Line 5: "at each step,"
Line 6: "what action to take next."

Small left-vertical teal accent bar next to the text block.

Bottom-center, smaller muted gray text: "Goal. Loop. Decisions at each step. Miss one — it's not an agent."

Background: extremely subtle geometric pattern of thin intersecting lines, barely visible,
adding depth without distraction. The text must be the primary element.
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy near-black slide with an extremely subtle background: thin intersecting teal
cyan lines forming a very faint geometric pattern, barely visible. Most of the slide is
pure empty space for large centered text overlay. No text in image.
```

## Layout in PowerPoint

- Entire slide: centered text block, 6 lines
- Each line: Inter Bold 40pt, white `#E6E6E6`, line-height 1.4
- Left of text block: vertical teal bar, 6pt wide
- Bottom 15% of slide: footnote in Menlo Regular 14pt, muted

---

# SLIDE 5 — What an agent is NOT

## Slide content

```
Title:       What an agent is NOT

Body:        These get called 'agents' but aren't, under the definition above:

             ✗  An LLM call                — no loop
             ✗  A chatbot                  — no action, no tools
             ✗  A Zapier / n8n workflow    — decisions are hard-coded by a human
             ✗  A RAG system               — no tool use beyond search
             ✗  LLM + one tool call        — no iteration

Callout:     Dividing line:
             hard-coded path        →  automation
             LLM decides at runtime →  agent
```

## What to say

> *"90% of products marketing themselves as agents are automations with an LLM stapled on the front. That's fine — it's just not what we're talking about today. The dividing line is who decides what happens next. Hard-coded paths? That's automation. The LLM decides at runtime? That's an agent."*

Then ask the room:

> *"Name me one product you've seen call itself an agent lately."*

Take 2–3 answers. Judge each against the dividing line publicly. Usually hilarious.

**Transition to next slide:** *"None of the things on this slide are what we're going to build today. We're going to build a real one — one that makes its own decisions. That starts with one picture."*

## AI image prompt (full slide with text)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Upper-left: bold white title "What an agent is NOT".

Center-left: five horizontal rows. Each row starts with a thin amber red "✗" symbol,
followed by a short monospaced label, followed by a gray em-dash and reason:
Row 1: "✗ An LLM call — no loop"
Row 2: "✗ A chatbot — no action, no tools"
Row 3: "✗ A Zapier workflow — hard-coded"
Row 4: "✗ A RAG system — no tools beyond search"
Row 5: "✗ LLM + one tool call — no iteration"

Bottom: horizontal teal line divider. Below, bold teal callout text:
"Hard-coded path → automation. LLM decides at runtime → agent."

Clean editorial, not cluttered.
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with 5 parallel horizontal lines on the left side, each with a small
amber red X near its start, suggesting rejection or exclusion. Right side: empty space.
Bottom-third: a single horizontal teal cyan accent line. Minimal, clean, editorial.
No text in image.
```

## Layout in PowerPoint

- Title top-left: Inter Bold 32pt
- Body list: 5 rows, each Menlo Regular 18pt
  - `✗` in amber `#FFAA5A`
  - Main text in white
  - Reason after em-dash in muted `#8A8F98`
- Divider line
- Callout at bottom: Inter Bold 20pt, teal `#00D9B2`

---

# SLIDE 6 — The Loop (the picture that matters)

## Slide content

```
Title:       The loop — the whole workshop in one picture

Diagram:
             Goal
              ↓
         ┌── LOOP ────────────────────┐
         │                            │
         │   LLM call                 │
         │      ↓                     │
         │   Tool needed?             │
         │      │                     │
         │      ├── yes → Execute ────┤
         │      │          ↓          │
         │      │        Observe      │
         │      │          ↓          │
         │      │   (append result)   │
         │      │                     │
         │      └── no → Return       │
         │                            │
         └────────────────────────────┘

Footnote:    Four parts: goal, LLM call, tool execution, observation.
             Everything else — memory, planning, multi-agent — is a variation.
```

## What to say

**This is the most important slide of the workshop.** Do NOT just point at it. Walk to the whiteboard and draw it live. Takes 90 seconds.

> *"The slide is reference. Watch me build it instead."*

Draw: `Goal → LLM call → Tool? → yes → Execute → Observe → back to LLM → no → Return`. While you draw, say:

> *"Four parts. Goal. LLM. Tools. The loop that connects them. When the LLM decides it doesn't need a tool, it answers and the loop exits. That's all. Every agent — Cursor, Claude Code, Intercom Fin, the one I'm about to build in front of you — is this shape, scaled up. Memory is a variation. Multi-agent is a variation. Planning is a variation. This is the primitive."*

Then erase. Ask a student to come up and draw it from memory. They'll mess up. Correct gently. Everyone in the room remembers this for a month — drawings stick, slides don't.

**Transition:** *"We'll come back to this picture six times today. Starting now — let me show you how it differs from what you already know: a chatbot."*

## AI image prompt (full slide with diagram)

**Warning:** AI tools cannot reliably render ASCII diagrams. For this slide, use PowerPoint's native shape tools or build the diagram in Figma/Excalidraw and import as an image. Background prompt below.

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with a very subtle background: thin teal cyan curves flowing in a
circular pattern, extremely faded and blurred, suggesting continuous motion without
being specific. Most of the slide is empty negative space for a diagram overlay.
No text in image, no specific diagram.
```

## Alternative: generate the diagram as a standalone image, overlay on background

Use this prompt if your AI tool is reasonably good at diagrams (Ideogram 2.0, DALL-E 3):

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Top-left: bold white title "The loop — the whole workshop in one picture".

Center: a clean architectural flowchart diagram. From top: a rounded rectangle labeled "Goal"
with an arrow pointing down to a large rounded rectangle labeled "LLM call". From LLM,
an arrow to a diamond decision shape labeled "Tool needed?". From diamond "yes" branch:
arrow right to a rectangle labeled "Execute tool", then down to "Observe result", then
curved arrow back to "LLM call" (forming the loop). From diamond "no" branch: arrow down
to "Return answer". All shapes have teal cyan borders, dark interior, thin clean white text.
Flowchart style, minimal, blueprint-like.

Bottom, smaller muted text: "Four parts: goal, LLM call, tool execution, observation. Everything else is a variation."
```

## Layout in PowerPoint

- Title top-left: Inter Bold 32pt
- Diagram: either imported from Figma/Excalidraw/Mermaid, or built with PPT shapes
- Shape colors: borders teal `#00D9B2` 2pt, fill `#161A1F`, text white
- Connectors: teal arrows
- Footnote below diagram: Inter Regular 16pt, muted

---

# SLIDE 7 — Chatbot vs Agent

## Slide content

```
Title:       Chatbot vs Agent — know the difference

Table:
                          CHATBOT              AGENT
             ─────────────────────────────────────────────
             Input         text                 goal
             Output        text                 action + result
             Loop          single turn          iterative
             Tools         none                 many
             State         conversation         conversation + world
             Memory        optional             required (eventually)

Callout:     A chatbot tells you the weather.
             An agent books the cab because the weather is bad.
```

## What to say

Walk through the table quickly. Then **pause for 3 seconds** on the cab line. Then:

> *"If you remember one thing from this slide — remember the cab line. A chatbot tells you what's true about the world. An agent changes the world. That's the shift."*

## AI image prompt (full slide with table)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Upper-left: bold white title "Chatbot vs Agent — know the difference".

Center: a clean two-column comparison table with header row. Left column header in muted gray:
"CHATBOT". Right column header in teal cyan: "AGENT". Six comparison rows below, each row
with a row-label on the far left in small gray monospaced text (Input, Output, Loop, Tools,
State, Memory), then left column value, then right column value. Thin horizontal dividers
between rows, thin vertical dividers between columns. Monospaced font throughout the table.

Bottom of slide: two lines of italic white text, centered:
"A chatbot tells you the weather."
"An agent books the cab because the weather is bad."

Style: editorial data table, clean, technical magazine layout.
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with a very faint two-column grid pattern suggesting a comparison table.
Vertical line down the center in teal cyan, very subtle. Thin horizontal divider lines.
Most of slide is empty. No text in image.
```

## Layout in PowerPoint

- Title top-left: Inter Bold 32pt
- Table: PowerPoint native table, 3 columns × 7 rows (header + 6 data)
  - Header: teal `#00D9B2` text, bold Menlo 14pt
  - Row labels: muted gray, Menlo 14pt
  - Cell content: white, Menlo 14pt
  - Borders: thin `#232832`
- Bottom callout: Inter Italic 22pt, centered, white

---

# SLIDE 8 — What agents do in production

## Slide content

```
Title:       What agents are actually doing in production

Table:
             Category       Example                What it does
             ────────────────────────────────────────────────────────────
             Coding         Cursor, Claude Code    edit repo, run tests, fix bugs
             Support        Intercom Fin, Sierra   answer + refund / escalate
             Research       Deep Research          search, synthesize reports
             Operations     Invoice agents         OCR + match + route
             DevOps         Incident triage        read logs, summarize alerts
             Long-form      Devin, bg Claude       run for hours → deliver PR

Callout:     Raise your hand if you've used Cursor or Copilot.
             You've already been an agent user. Now you know the pattern.
```

## What to say

Pick TWO examples and tell a 60-second story for each. Recommend:

- **Cursor / Claude Code** — most students will have used it. "When you ask Cursor to refactor a function, it reads the file, edits it, runs your tests, reads the failures, fixes again. That's the loop. Now you've seen the pattern."
- **Intercom Fin** — non-technical-friendly. "Your next Flipkart support chat is probably an agent. Reads docs, checks your order, issues refund if allowed, escalates otherwise."

Then ask the room:

> *"Raise your hand if you've used Cursor, Claude Code, or Copilot. [most will]. You've already been an agent user — you just didn't know the pattern."*

**Seed the closing reveal:** *"See row 3 — Research? We're going to build a tiny version of that at the end of this session, after we build the simpler one. Same loop. Real web search. Real fetch. Works today, on your laptop."*

## AI image prompt (full slide with table)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Top: bold white title "What agents are actually doing in production".

Center: a clean three-column table. Headers in teal cyan monospaced uppercase:
"CATEGORY", "EXAMPLE", "WHAT IT DOES". Six rows of content below, monospaced gray text:
Row 1: Coding | Cursor, Claude Code | edit repo, run tests, fix bugs
Row 2: Support | Intercom Fin, Sierra | answer + refund / escalate
Row 3: Research | Deep Research | search, synthesize reports
Row 4: Operations | Invoice agents | OCR + match + route
Row 5: DevOps | Incident triage | read logs, summarize alerts
Row 6: Long-form | Devin, bg Claude | run for hours → deliver PR

Thin horizontal dividers between rows. No borders, just subtle lines. Editorial style.

Bottom of slide: small white italic text: "Raise your hand if you've used Cursor or Copilot. You've already been an agent user."
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with six horizontal thin teal cyan lines evenly spaced,
suggesting table rows. No text in image. Minimal.
```

## Layout in PowerPoint

- Title top-left: Inter Bold 32pt
- Native PPT table, 3 cols × 7 rows
  - Headers: Menlo Bold 14pt uppercase, teal
  - Content: Menlo Regular 16pt, white/gray
- Bottom callout: Inter Italic 18pt, muted

---

# SLIDE 9 — When right / when wrong

## Slide content

```
Title:       When an agent is the right tool (and when it isn't)

Two columns:
             USE AN AGENT when:              DON'T when:
             ──────────────────              ──────────────────
             ✓ path isn't known ahead        ✗ deterministic task
             ✓ real tools/actions needed     ✗ one mistake = big money
             ✓ loop bounded (≤10 steps)      ✗ 100+ steps needed
             ✓ failure recoverable           ✗ pure Q&A → use RAG

Callout:     Most expensive mistake I see in this field:
             using an agent when a SQL query would have done the job.
```

## What to say

> *"I turn down about one in three agent-build requests I get as a consultant. Not because agents are bad — because what the client actually needs is a cron job and three hours of engineering. Before you say yes to an agent project, run it through these filters. If it fails any one of them, it's probably the wrong tool."*

Then challenge the room:

> *"Think of a project idea you've had in the last month that involves 'AI' or 'automation'. Run it through these four filters silently. Would an agent actually be the right tool?"*

30-second silent think. Take two hands. Discuss publicly.

## AI image prompt (full slide with two columns)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Upper-left: bold white title "When an agent is the right tool (and when it isn't)".

Split center composition into two columns divided by a thin vertical teal line.

Left column: monospaced header in teal cyan "USE AN AGENT when:". Below, four lines each
starting with a teal cyan checkmark "✓" followed by short white text:
"✓ path isn't known ahead"
"✓ real tools/actions needed"
"✓ loop bounded (≤10 steps)"
"✓ failure recoverable"

Right column: monospaced header in muted amber "DON'T when:". Below, four lines each
starting with an amber red X "✗":
"✗ deterministic task"
"✗ one mistake = big money"
"✗ 100+ steps needed"
"✗ pure Q&A → use RAG"

Bottom of slide: small italic muted text:
"Most expensive mistake: using an agent when a SQL query would have done the job."
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with a thin vertical teal cyan line down the center dividing the canvas
into two halves. Left half: four thin teal horizontal lines. Right half: four thin amber
horizontal lines. Minimal, symmetric. No text in image.
```

## Layout in PowerPoint

- Title: Inter Bold 32pt
- Two columns with vertical divider
  - Left header: Menlo Bold 16pt, teal
  - Left bullets: Inter Regular 20pt, `✓` in teal, text in white
  - Right header: Menlo Bold 16pt, amber
  - Right bullets: Inter Regular 20pt, `✗` in amber, text in white
- Bottom callout: Inter Italic 18pt, muted centered

---

# SLIDE 10 — Inside the loop (step by step)

## Slide content

```
Title:       Inside the loop — what actually happens

Steps:
             1. user goal           →  "How many students in CSE?"
             2. context assembled   →  system prompt + tools + goal
             3. LLM call #1         →  returns: call getStudentCount(CSE)
             4. validate + execute  →  query DB → 420
             5. observe             →  append result to history
             6. LLM call #2         →  "There are 420 students in CSE."

Footnote:    Total: 2 model calls · 1 tool run · ~2 seconds.
             The LLM decides. Your code acts. That separation is what gives you control.
```

## What to say

Walk through at ~60 seconds per step. Don't rush. These six lines are exactly what the agent we're about to build will execute in a few minutes — this is the demo script in miniature.

The key line to plant after step 6:

> *"The LLM decides. Your code acts. That separation is the whole thing."*

Then scale up mentally:

> *"Now imagine the task needed four tool calls instead of one. How many LLM calls total? [they'll answer: 5]. Right. And that's where cost and latency get interesting."*

**Transition to architecture:** *"You now know what one agent run looks like. But in production it doesn't run alone — it sits inside a system. One more slide and then we're in the editor."*

## AI image prompt (full slide with numbered steps)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Top: bold white title "Inside the loop — what actually happens".

Center: six numbered rows. Each row has a large teal cyan monospaced number on the left
(01–06), followed by a monospaced white label, followed by a teal arrow "→", followed by
a gray example:
"01  user goal           →  How many students in CSE?"
"02  context assembled   →  system + tools + goal"
"03  LLM call #1         →  call getStudentCount(CSE)"
"04  validate + execute  →  query DB → 420"
"05  observe             →  append result to history"
"06  LLM call #2         →  There are 420 students in CSE."

Between rows: thin horizontal teal dividers. Typography-forward, clean, editorial.

Bottom of slide: small muted text:
"Total: 2 model calls · 1 tool run · ~2 seconds."
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with six thin horizontal teal cyan lines evenly spaced, suggesting steps.
To the left of each line: a very small teal numeric marker. No text in image. Minimal.
```

## Layout in PowerPoint

- Title: Inter Bold 32pt
- 6 rows, each:
  - Number: Menlo Bold 22pt, teal
  - Label: Menlo Regular 18pt, white
  - Arrow: teal
  - Example: Menlo Regular 18pt, muted
- Bottom footer: Inter 16pt, muted centered

---

# SLIDE 11 — Production architecture

## Slide content

```
Title:       What a real agent system looks like

Diagram:
             ┌─────────────────────┐
             │      UI / API       │
             └──────────┬──────────┘
                        ↓
             ┌─────────────────────┐
             │   Orchestrator      │  ← the actual 'agent'
             └──────────┬──────────┘
                        │
             ┌──────────┼──────────────────────┐
             ↓          ↓          ↓           ↓
        [LLM adapter] [Tools]  [Memory]  [Guardrails]
                        │
                        ↓
             ┌─────────────────────┐
             │  Backend: DB, APIs  │
             └─────────────────────┘

Footnote:    Every box on this diagram exists because something failed in production.
             None of it is theoretical.
```

## What to say

Walk left-to-right, one sentence per box. Key line to plant:

> *"Every box on this diagram exists because something failed in production. None of it is theoretical. I've personally watched each one of these get added after an incident."*

**Point at the Orchestrator box.** Say:

> *"This box right here — the orchestrator — is the part we're about to build. The other boxes are for later. What we're going to type in the next 30 minutes is a minimal version of this one box. Enough to show you every part of the loop. Then I'll break it live, and we'll see exactly why each of the other boxes exists."*

Close this slide with the transition:

> *"Enough talk. Let's build one in front of you."*

## AI image prompt (full slide with diagram)

**Warning:** Complex diagrams are unreliable in AI image tools. Build this diagram natively in PowerPoint using shape tools, or in Figma / Excalidraw, then import.

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with a very faint architectural blueprint grid covering the slide.
Subtle teal cyan crosshairs at intersections. No text in image, no specific diagram.
Provides a technical-architectural mood.
```

## Layout in PowerPoint

Build with native PPT shapes:

- 5 rounded rectangles (UI, Orchestrator, LLM adapter, Tools, Memory, Guardrails, Backend)
- All with teal `#00D9B2` 2pt border, `#161A1F` fill, white text
- Connectors: teal arrows
- Title: Inter Bold 32pt
- Callout on right side of Orchestrator box: `← the actual 'agent'` in teal italic
- Footer: Inter Regular 16pt, muted centered

---

# SLIDE 12 — Demo intro

## Slide content

```
Title:       Demo — one file, no framework, real tool calls

Specs:
             Endpoint:     POST /ask
             Model:        claude-haiku-4-5
             Tools:        getStudentCount, listCourses
             Framework:    none — just Express + Anthropic SDK
             Lines:        under 150

Goal:        Minimum viable agent.
             Small enough to fit in your head.
             Large enough to show every part of the loop.

Callout:     Also: a live-updating browser UI at localhost:3000 that visualizes
             each iteration of the loop as it runs.
```

## What to say

> *"The next 30 minutes I'm going to type — not paste — a working AI agent in front of you. No frameworks. No LangChain. No hidden magic. Every line is something you could explain to a junior engineer. Watch what goes in and, more importantly, what doesn't."*

Then switch to your terminal + editor. Don't come back to slides for 30 minutes.

## AI image prompt (full slide with text)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Upper-left: bold white "Demo — one file, no framework, real tool calls".

Center: a stylized representation of a code editor window on dark background. Thin
horizontal teal cyan bars suggesting code lines without literal code text. To the right
of the editor window: a list of specs in monospaced white text:
"Endpoint: POST /ask"
"Model: claude-haiku-4-5"
"Tools: 2 (getStudentCount, listCourses)"
"Framework: none"
"Lines: under 150"

Small teal cyan callout at bottom: "live browser UI at localhost:3000".
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with a stylized editor window in the center-left, rendered as a dark
rounded rectangle with three dots in upper-left corner and thin teal cyan horizontal
lines suggesting code without literal text. Right side empty. No text in image.
```

## Layout in PowerPoint

- Title: Inter Bold 32pt
- Editor mockup image (from AI or stock vector): centered
- Specs list right of mockup, Menlo 16pt
- Bottom callout: Inter 14pt, teal centered

---

# SLIDE 13 — Four things to watch while I code

## Slide content

```
Title:       Four things to watch while I code

Points:
             1. The tool description is the highest-leverage prompt you'll write.
                The model decides based on those sentences.

             2. Structured errors, not exceptions.
                The model reads errors and self-corrects.

             3. The for-loop IS the agent.
                Everything else is plumbing.

             4. Two LLM calls per simple request.
                One decides. One answers.
```

## What to say

Show this for 30 seconds, then switch to editor.

> *"Four things I'll point to as we build. Each one will show up at a specific moment — I'll say 'watch this' when it happens. If you leave today remembering just #1, the tool description thing, the workshop was worth your time. That one changes how you think about agents forever."*

**Keep these handy during the demo — call them out when they happen:**

| Watch point | Demo moment |
|---|---|
| 1. Tool description = prompt | When writing the tool schema (Segment B) — point to the description field |
| 2. Structured errors | When writing the tool handler (Segment C) — point to the `return { error: ... }` |
| 3. The for-loop IS the agent | When writing runAgent's `for` loop (Segment D) |
| 4. Two LLM calls per request | When Q1 runs (Segment F) — point to the `[iter 1]` / `[iter 2]` log lines |

**Bonus callback in Segment G (break-the-agent):** remind them: *"Remember watch-point #1? Watch what happens when I weaken the description."* Pay it off.

## AI image prompt (full slide with text)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Upper-left: bold white "Four things to watch while I code".

Center: four large numbered sections arranged vertically. Each section has a large teal
cyan number on the left (01, 02, 03, 04) and two lines of text on the right:
"01 The tool description IS a prompt." with subtitle "The model decides based on those sentences."
"02 Structured errors, not exceptions." with subtitle "The model reads errors and self-corrects."
"03 The for-loop IS the agent." with subtitle "Everything else is plumbing."
"04 Two LLM calls per simple request." with subtitle "One decides. One answers."

Between sections: thin teal horizontal dividers. Editorial clean layout.
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with four large faded teal cyan numerals (01, 02, 03, 04) stacked
vertically on the left edge, very low opacity, almost decorative. Right side: empty
space for text overlay. No text in image beyond the faded numerals.
```

## Layout in PowerPoint

- Title: Inter Bold 32pt
- 4 numbered sections, each:
  - Big number: Menlo Bold 36pt, teal
  - Heading: Inter Bold 22pt, white
  - Subtitle: Inter Regular 16pt, muted

---

# SLIDE 14 — How agents fail · how we defend

## Slide content

```
Title:       How agents fail (and how real teams defend)

Table:
             FAILURE              DEFENSE
             ─────────            ─────────
             Hallucination   →    strict prompt, output schema, validation
             Tool misuse     →    arg validation, permission checks
             Cost explosion  →    iteration caps, smaller routing models
             Latency         →    parallel tools, streaming, caching
             Provider outage →    multi-provider fallback
             Data leak       →    PII scrubbing (in + out + logs)

Callout:     Every one of these has happened on a system I've worked on.

Key line:    The LLM is the unreliable part.
             The system around it is what makes the agent reliable.
```

## What to say

**Open by referencing the break-the-agent moment from the demo:**

> *"You just saw failure #1 in the demo. When I weakened the tool description, the agent hallucinated a number. That wasn't a bug — that's the default behavior when the system around the model is weak. Now let me show you the other five failures real teams defend against every day."*

Don't read the entire table. Walk through the 6 failures in 10 seconds each, max. Then pick ONE you've personally seen and tell a 45-second story. For example:

> *"Cost explosion — a client of mine had an agent hit a loop between two tools that kept disagreeing. 4,000 iterations before their cost cap kicked in. $380 bill for one user session. Now every agent I build has MAX_ITERATIONS = 5. Every single one. You saw that same MAX_ITERATIONS in the code I just typed — that's why."*

Then land the key line and **pause for 5 seconds:**

> *"The LLM is the unreliable part. The system around it is what makes the agent reliable."*

**The entire workshop is this one sentence.** Don't rush it.

## AI image prompt (full slide with table)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Upper-left: bold white title "How agents fail (and how real teams defend)".

Center: a two-column table. Left column header in amber red monospaced uppercase: "FAILURE".
Right column header in teal cyan monospaced uppercase: "DEFENSE". Six rows below, each row
connected by a thin teal arrow "→" between columns:
"Hallucination → strict prompt, output schema, validation"
"Tool misuse → arg validation, permission checks"
"Cost explosion → iteration caps, smaller routing models"
"Latency → parallel tools, streaming, caching"
"Provider outage → multi-provider fallback"
"Data leak → PII scrubbing (in + out + logs)"

Monospaced font throughout. Thin horizontal dividers between rows.

Bottom of slide: two lines of centered italic text, white:
"The LLM is the unreliable part."
"The system around it is what makes the agent reliable."
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with two vertical columns of six horizontal bars each. Left column bars
in amber red. Right column bars in teal cyan. Thin arrows connecting matching pairs
across the middle. Balanced, technical, data-viz aesthetic. No text in image.
```

## Layout in PowerPoint

- Title: Inter Bold 32pt
- Native table 2 cols × 7 rows
  - Headers: Menlo Bold 14pt — amber for "FAILURE", teal for "DEFENSE"
  - Rows: Menlo Regular 16pt, white
  - Arrow `→` between cells in teal
- Bottom 20% of slide: 2 lines
  - Inter Italic 22pt, white, centered
  - 8pt gap between lines

---

# SLIDE 15 — Your turn

## Slide content

```
Title:       Your turn — design an agent in 10 minutes

Instructions:
             Pick one real campus problem. In pairs:

             1. Goal          (one sentence)
             2. Three tools   (name + one-line description each)
             3. One failure mode  (what could go wrong?)
             4. One guardrail     (how do you defend?)

Format:      10 minutes to work. Two teams present. I critique both — honestly.

Reminder:    Not every problem needs an agent. If your idea can be solved with
             a cron job + a SQL query, say so. That's a correct answer.
```

## What to say

> *"Ten minutes. Pair up with whoever's next to you. Pick something you see on this campus. I'll walk around. At the end, two teams present, I critique publicly — not to embarrass anyone, because honest feedback is the only kind that actually teaches."*

**Seed their thinking with 4 concrete examples:**

- Course registration helper (tools: `listCoursesIOfferedThisSem`, `checkPrerequisites`, `registerCourse`)
- Library book finder + reserver (tools: `searchLibrary`, `checkAvailability`, `reserveBook`)
- Mess menu feedback bot (tools: `getTodayMenu`, `submitComplaint`, `escalateRepeatedComplaint`)
- Internship finder (tools: `searchInternships`, `matchToProfile`, `saveToFavorites`)

> *"Or — and this is also a correct answer — sometimes the honest conclusion is 'this doesn't need an agent. A simple form + SQL query solves it.' If that's what you land on, that's the right call. Say so in your presentation."*

Then walk around. Listen. Help stuck pairs by asking: *"What's the loop?"* or *"Where does the LLM get its information?"*

**When the 10 minutes are up, pick ONE strong design and ONE weaker one to present.** The critique of the weaker one is where the real learning happens — do it kindly, but name the specific problem (vague tool description, missing failure mode, agent when a cron would do).

## AI image prompt (full slide with text)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Upper-left: bold white "Your turn — design an agent in 10 minutes".

Center: four numbered checklist items with large teal squares to the left of each:
"☐ 1. Goal (one sentence)"
"☐ 2. Three tools (name + description)"
"☐ 3. One failure mode"
"☐ 4. One guardrail"

Right side: an abstract illustration of two linked hexagonal or square blocks,
suggesting pair collaboration, in teal cyan outline on dark background.

Bottom: small muted italic text: "10 minutes. Two teams present. Honest critique."
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with an abstract illustration on the right side: two overlapping
rounded squares in teal cyan outline, suggesting pair collaboration. Left side: empty
space for text. Minimal. No text in image.
```

## Layout in PowerPoint

- Title: Inter Bold 32pt
- 4 numbered items, each:
  - Checkbox shape in teal
  - Number + label: Inter Bold 22pt
  - Subtitle: Inter Regular 16pt, muted
- Bottom: Inter Italic 16pt, muted

---

# SLIDE 16 — Close

## Slide content

```
Title:       What I want you to remember on Monday

Primary statement:
             An AI agent is a LOOP.

             At each step, an LLM decides:
                • call a tool, or
                • answer the user.

             The LLM is the unreliable part.
             The system around it is what makes it work.

Takeaways:
             1. Agent = loop with tools. Not a chatbot. Not magic.
             2. The LLM decides. Your code acts.
             3. Tool descriptions are the highest-leverage prompt you'll ever write.
             4. Every failure mode is your job — not the model's.
             5. Start small. One tool. One loop. Real logs.

Footer:      Thank you.
             Questions, feedback, follow-ups — welcome.
             I answer every real question.

             rahulladumor.in · @rahulladumor
```

## What to say

**This is the one slide you should rehearse most.** The whole workshop lands or doesn't land in the last 90 seconds.

Read the top block slowly, one line at a time, with real pauses between them:

> *"An AI agent is a LOOP." [pause]*
>
> *"At each step, an LLM decides:"*
> *"Call a tool — or answer the user." [pause]*
>
> *"The LLM is the unreliable part."*
> *"The system around it is what makes it work." [5 seconds of silence]*

Then the five takeaways in the same calm tone. Don't rush. Don't apologize. Don't fill the silence.

**Callback to the break-the-agent moment** — this is the payoff:

> *"Remember when I weakened one tool description and the agent hallucinated? That's the whole workshop in 30 seconds. The LLM's behavior changed because the system around it changed. You control that system. That's the power and the responsibility — every failure mode is your job, not the model's."*

End with:

> *"Thank you. The repo link is here — [point to the slide] — rahulladumor.in points to everything, the slides, the code, my contact. Stick around. The best conversations at these sessions happen after the slides stop."*

## AI image prompt (full slide with text)

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide. Upper-left: small teal monospaced eyebrow "WHAT TO REMEMBER ON MONDAY".

Center: bold white large text:
"An AI agent is a LOOP."

Below in smaller white: "At each step, an LLM decides: call a tool, or answer the user."

Below in muted italic teal: "The LLM is the unreliable part. The system around it is what makes it work."

Right side: abstract elegant infinity loop motif reprised from slide 1, but rendered cleaner and more resolved — a sense of completion.

Bottom of slide in small teal monospaced: "rahulladumor.in · @rahulladumor"
```

## Background-only prompt

```
[PASTE DESIGN SYSTEM PREAMBLE]

Dark navy slide with an elegant abstract infinity loop drawn with thin teal cyan lines
on the right side, slightly more resolved and complete than a similar motif might appear
on an opening slide. Left two-thirds: empty negative space for text. Sense of quiet
completion. No text in image.
```

## Layout in PowerPoint

- Eyebrow top-left: Menlo Bold 12pt uppercase, teal, letterspaced
- Primary statement block, centered:
  - "An AI agent is a LOOP." — Inter Bold 48pt, white
  - Gap
  - "At each step..." — Inter Regular 24pt, white, centered
  - Gap
  - "The LLM is the unreliable part..." — Inter Italic 20pt, teal, centered
- 5 takeaways below, Inter Regular 18pt
- Footer: Menlo 14pt, teal

---

# Practical workflow — how to actually produce these slides

## Step 1 — Generate backgrounds first (1–2 hours)

Go through all 16 background-only prompts. Save each image as `bg-01.png` through `bg-16.png`. Use Ideogram 2.0 or Midjourney.

## Step 2 — Build slide master in PowerPoint (30 min)

- Slide size 16:9
- Background fill: `#0B0D10`
- Create a text master with Inter + Menlo fonts
- Define color swatches: `#00D9B2`, `#FFAA5A`, `#FF5C7A`, `#E6E6E6`, `#8A8F98`, `#232832`

## Step 3 — Populate each slide (2–3 hours)

For each slide:
1. Import the AI background as full-bleed image
2. Add title text overlay using master styles
3. Add body content (bullets, table, diagram) using native PPT tools
4. Check contrast from back-of-room view

## Step 4 — Build the three diagrams natively (1 hour)

Slides 6 (loop), 11 (architecture), and possibly 10 (steps flow) need real diagrams. Build them in:

- **PowerPoint shapes** (easiest for 6 and 11)
- **Excalidraw** (https://excalidraw.com) — exports as PNG with transparent background, match the dark theme via `Menu → Change theme → Dark` then export
- **Figma** — overkill but powerful
- **Mermaid Chart** (https://mermaidchart.com) — good for flowcharts, export as PNG

## Step 5 — Speaker rehearsal (1 hour)

Do one full pass through the deck reading the "What to say" sections aloud. Time yourself. If you're over 100 minutes on slides alone, you've got no room for the live demo. Cut words, not slides.

---

# What to do if the AI tools produce garbage text

Common failure modes and fixes:

| Problem | Fix |
|---|---|
| Text comes out gibberish | Use Ideogram 2.0 specifically — it's the best at text |
| Text is mangled but shapes are good | Use as background, add text in PPT |
| Colors drift to purple / pink | Add "NOT purple gradient. NOT pink. Only teal cyan and dark navy." to prompt |
| Looks cartoonish or 3D | Add "Flat 2D editorial illustration. NOT 3D render." |
| Cluttered / too busy | Add "Extremely minimal. Mostly empty negative space." |
| Generic AI stock aesthetic | Add "NOT generic AI stock imagery. NOT corporate clipart. Style: Linear or Stripe marketing illustration." |

---

# Final sanity checks

Before you deliver:

- [ ] Every slide reads from 8 feet away (back of a classroom)
- [ ] No typos in on-slide text
- [ ] Fonts are embedded or replaced with universal alternatives (Inter → system sans; Menlo → Courier New on non-Mac systems)
- [ ] Diagram slides (6, 11) tested on the actual projector — thin lines sometimes disappear
- [ ] Speaker notes view works (Presenter Mode on Keynote / PowerPoint)
- [ ] Timer or clock visible to you during delivery
- [ ] Printed cheat sheet with one-line summary per slide on your podium

---

# Bonus: rapid-fire spoken version (for last-minute prep)

If you only have 10 minutes to mentally prepare, memorize this one-line-per-slide mental model:

1. **Title** — set the hook: "for two hours we build, break, understand"
2. **About me** — earn trust: "scars from real systems"
3. **Outcomes** — make promises: "five things, interrupt me if we miss any"
4. **Definition** — deliver the core idea: "goal, loop, decisions"
5. **NOT an agent** — kill the confusion: "hard-coded is automation"
6. **The loop** — draw on whiteboard, student draws from memory
7. **Chatbot vs Agent** — land the cab line
8. **Use cases** — tell Cursor + Intercom Fin stories
9. **Right/Wrong tool** — "1 in 3 agent requests I turn down"
10. **Inside the loop** — walk through 6 steps slowly
11. **Architecture** — "every box is because something failed"
12. **Demo intro** — switch to editor, don't come back for 30 min
13. **Watch points** — plant these 4, call out when they happen
14. **Failures/defenses** — tell ONE war story, land the key line
15. **Exercise** — 10 min, pair up, two present, honest critique
16. **Close** — slow, quiet, thank you

That's the whole workshop in 16 sentences.
