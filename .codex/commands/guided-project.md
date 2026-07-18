---
description: "Propose and create a starter mini-project with milestones, checks, spoiler hints, and verified reference implementations"
argument-hint: "<topic, note path, project idea, learner level, or constraints>"
---

Use the `guided-project` skill for: $ARGUMENTS

This command is standalone. Do not create a chapter, quiz, Anki cards, or complete example project.

First inspect relevant learning material and apply the `exercise-design`, `study-note-review`, `technical-prose-editor`, and `obsidian-markdown` contracts. Present a proposal with three to six milestones, objectives, destination, stack, baseline behavior, learner work, checks, and expected files. Then ask: **"Create this guided project?"**

Do not create or modify project files, install dependencies, generate scaffolding, or alter configuration until the user explicitly confirms. Invoking `/guided-project` is not confirmation.

After confirmation, create a working starter project and `GUIDE.md`. Keep the full reference implementations only in collapsed guide callouts. Verify them in a temporary location, remove the temporary files, and leave the learner-facing starter in the repository. Do not invoke subagents automatically.
