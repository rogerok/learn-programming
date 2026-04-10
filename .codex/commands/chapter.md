---
description: "Create a study chapter on a topic. Runs ONE step at a time — you control the pace."
allowed-tools: Read, Write, Glob, Grep, Bash, WebSearch, WebFetch, Task
---

Create a study chapter for the topic: $ARGUMENTS

Style Profiles

If the user specifies a profile, follow it.
If the user does not specify a profile, use `compact` by default.

Profile: compact

- Write for a motivated reader who prefers density over hand-holding.
- Keep the prose tight and information-rich.
- Minimize repetition, scene-setting, and motivational framing.
- Use fewer examples, but make each example carry real explanatory weight.
- Prefer shorter sections and sharper transitions.
- Keep callouts sparse.
- Use summaries only when they materially improve retention.
- Assume the reader is willing to stop and think.
- Do not over-explain obvious intermediate steps.
- Keep the chapter intellectually demanding, but readable.

Profile: pedagogical

- Write for a reader who benefits from slower buildup and more scaffolding.
- Spend more time on intuition before formalization.
- Use more intermediate examples and bridge sentences.
- Surface likely confusions explicitly and resolve them.
- Break larger ideas into smaller chunks.
- Use more comprehension-oriented phrasing and more explicit takeaways.
- Include more hints in exercises.
- Keep the text encouraging, but still precise.
- Avoid abrupt jumps in abstraction.
- Make transitions and prerequisites especially visible.

Profile Selection Rule

- If the chapter is conceptual, abstract, or mathematically loaded, prefer `pedagogical` unless the user asks for density.
- If the chapter is technical, narrow in scope, or intended as a serious study note, prefer `compact`.
- If rewriting a source text, preserve the source’s difficulty level, then shift toward the selected profile.

Profile Guardrails

- `compact` must not become dry, cryptic, or telegraphic.
- `pedagogical` must not become bloated, repetitive, or patronizing.
- In both profiles, clarity is more important than stylistic flourish.

Chapter Writing Contract

Goal:

- Create a full study chapter for the vault on the requested topic.
- The chapter must teach, not just summarize.
- The result must be useful as a standalone learning note and as a future revision resource.

Language:

- Match the language requested by the user.
- If extending an existing note, match that note’s language.
- If creating a new note from scratch and language is not specified, ask once whether to write in Russian or English.
- Keep technical terms, API names, and library names in English.

Source Policy:

- If source materials are provided, treat them as the primary semantic source.
- If adapting a chapter from a book or article, preserve the core ideas, sequence, and intent, but rewrite for clarity and pedagogy.
- Do not mechanically imitate the wording of the source.
- Do not use previously generated notes as the main source of meaning unless explicitly asked.

Teaching Requirements:

- Start by making the topic legible: what it is, why it matters, where it is used.
- Build from simple intuition to precise formulation.
- Prefer a small number of strong examples over many weak ones.
- Explain code through intent and shape, not by narrating every line.
- Include active practice, not only exposition.
- End major sections with a short takeaway.
- Add Anki-ready cards for durable recall.

Chapter Structure:

- Frontmatter with tags.
- Title.
- Context callout.
- Overview.
- Deep Dive.
- Exercises.
- Anki Cards.
- Related Topics.
- Sources.

Example Strategy:

- Examples must fit the learner’s level and the chapter’s scope.
- Prefer examples that demonstrate the chapter’s core idea with minimal noise.
- Reuse the same small set of examples across the chapter when possible.
- If a library or framework is used, it should clarify the topic rather than overshadow it.

Exercises:

- Exercises must check understanding of the chapter’s main ideas.
- Order them from basic to more compositional or integrative.
- If test snippets are included, use vitest.
- Prefer exercises that force the learner to transform or explain code, not just copy a pattern.

Writing Style:

- Write in clear, dense, readable prose.
- Prefer concrete statements over generic commentary.
- Avoid filler, empty transitions, and repeated restatements of the same idea.
- Avoid AI-sounding rhetoric, fake emphasis, and canned oppositions like “это не ..., а ...” unless they carry real explanatory value.
- Do not stretch a simple idea across multiple paragraphs.
- Keep the tone calm, precise, and teacherly.

Editorial Pass:

- After drafting, do a second pass as an editor.
- Remove weak sentences that add no new information.
- Compress repeated ideas.
- Replace vague phrasing with concrete wording.
- Smooth transitions between sections.
- Check that each section earns its place.
- Check that the chapter still matches the declared scope.

Output Rules:

- Follow the vault’s formatting rules.
- Use Obsidian links where helpful.
- Use callouts intentionally, not excessively.
- Use mermaid only when it genuinely improves understanding.
- If creating a full study chapter, include embedded Anki cards and create a sibling anki-cards.txt export file.

Behavior:

- If a critical ambiguity affects scope, language, or placement, ask one short clarifying question.
- Otherwise proceed without unnecessary pauses.

## Important: step-by-step mode

Do NOT run all steps automatically. Execute ONLY Step 1 now.
After completing each step, stop and ask the user (in Russian) whether to proceed to the next step.

## Step 1: Research (agent: researcher)

Use the `researcher` agent to gather sources and create a research brief.
Then stop and show the brief to the user. Ask: "Продолжить к написанию главы?"

## Step 2: Write (agent: author)

Use the `author` agent to write the chapter based on the research brief.
Then stop and show the result. Ask: "Добавить упражнения?"

## Step 3: Exercises (agent: exercise-author)

Use the `exercise-author` agent to create exercises with tests.
Then stop. Ask: "Сгенерировать Anki-карточки?"

## Step 4: Anki cards

Generate flashcards for the chapter (no separate agent needed — do it inline).
Then stop. Ask: "Запустить ревью (код + методика)?"

## Step 5: Review (agents: reviewer + methodist)

Use `reviewer` to check code, then `methodist` to check pedagogy.
Report findings and fix issues.

The user can stop at any step, skip steps, or jump to a specific step.
Always respect the user's choice.
