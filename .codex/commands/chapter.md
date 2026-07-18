---
description: "Create or rewrite a study chapter with selectable quiz, cards, and project follow-ups"
argument-hint: "<topic, source, path, language, or scope>"
---

Use the `study-chapter` skill for: $ARGUMENTS

Before starting the workflow, always ask one multi-select question in the conversation language: **Which follow-ups should this chapter cycle include: quiz, Anki cards, example project, or none?** Do not infer or reuse the answer from a previous cycle.

After the user answers, create the chapter and sibling `exercises.md`, verify runnable examples, and generate only the selected follow-ups. If an example project was selected, present its concrete proposal and ask for a separate explicit confirmation before writing project files. Start a selected quiz only after selected artifact work is complete.

Do not invoke subagents automatically. Do not stop after research, drafting, exercises, or review unless the user explicitly requested only that stage.
