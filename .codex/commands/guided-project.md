---
description: "Propose and create a starter project with adaptive implementation guidance, behavioral checks, and verified milestone spoilers"
argument-hint: "<topic, note path, project idea, learner level, or constraints>"
---

Use the `guided-project` skill for: $ARGUMENTS

This command is standalone. Do not create a chapter, quiz, Anki cards, or complete example project.

First inspect relevant learning material and apply the `exercise-design`, `study-note-review`, `technical-prose-editor`, and `obsidian-markdown` contracts. Present the fewest dependency-ordered milestones that make the capability and evidence clear. The proposal must name objectives, destination, stack, baseline behavior, exact learner edit surfaces, checks, expected files, and one guidance profile from the skill: `supported`, `guided`, or `independent`. State whether collapsed complete milestone spoilers will be included. Then ask: **"Create this guided project?"**

Do not create or modify project files, install dependencies, generate scaffolding, or alter configuration until the user explicitly confirms. Invoking `/guided-project` is not confirmation.

After confirmation, create a working starter project and `GUIDE.md`. The guide must say where to work, what the starter already does, what changes, how to verify it, and which supporting files normally stay untouched. In the `supported` profile, include a final collapsed `Полная реализация — открыть после попытки` callout for each non-transfer milestone; keep each spoiler limited to that milestone and verify it against the checks. Keep the whole-project reference implementation only in a temporary location, remove it after verification, and never commit a solution directory or a transfer solution. Do not invoke subagents automatically.
