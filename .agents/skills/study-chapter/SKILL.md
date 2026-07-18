---
name: study-chapter
description: Creates or substantially rewrites a complete programming study chapter in this Obsidian vault, with sibling exercises and optional follow-up quiz, Anki cards, complete example project, or guided project. Use for requests to write a chapter, lesson, or comprehensive topic note. Do not use for a roadmap or solution review.
---

# Study Chapter

Create a complete, source-grounded study chapter that teaches the topic and leaves the vault in a reviewable state.

## Inputs

Identify:

- topic and requested scope;
- target language and learner level;
- destination path;
- provided source material;
- requested writing profile, if any.

Follow the repository language and placement rules. If a new note has no requested language and no existing note establishes one, ask the single required language question before writing.

## Required Cycle Question

Before starting every chapter workflow, ask one multi-select question in the conversation language:

**Which follow-ups should this chapter cycle include: quiz, Anki cards, complete example project, guided project, or none?**

Always ask this question, even if the command invocation appears to imply an answer. Record the selection for the current chapter cycle only; never reuse it for a later cycle.

Selecting either project type authorizes only its later proposal. The `example-project` or `guided-project` skill must still present its concrete scope and obtain a separate explicit confirmation before creating or modifying project files.

## Workflow

1. Inspect the relevant topic folder, existing notes, MOCs, and likely prerequisites. Reuse the vault's established naming and linking conventions.
2. Define a narrow chapter scope. Record exclusions internally so the chapter does not grow into a survey of adjacent topics.
3. Gather authoritative sources. Prefer specifications, official documentation, original papers, and primary project documentation. Use secondary sources only to improve explanation.
4. Draft the chapter using the repository chapter template. Introduce each prerequisite before relying on it. Move from intuition to precise mechanics, then to edge cases and application.
5. Use a small set of examples throughout the chapter. Explain their intent and behavior rather than narrating every line.
6. Create `exercises.md` next to the chapter. Exercises must progress from explanation and prediction to modification, implementation, and diagnosis. Do not include complete solutions unless the user explicitly requests them.
7. If Anki cards were selected, create `anki-cards.txt` next to the chapter using the repository TSV contract. Include only durable, atomic knowledge suitable for retrieval practice.
8. Verify every runnable code example with the narrowest appropriate compiler, runtime, or test command. Correct the artifact before reporting completion.
9. Perform one technical review and one pedagogical review. Fix factual errors, unsupported claims, prerequisite gaps, abrupt difficulty jumps, misleading analogies, duplicate material, and exercises that do not match the chapter.
10. Check frontmatter, Obsidian links, callouts, companion filenames, source links, and any generated Anki file's column counts.
11. Run selected follow-ups in this order: generate Anki cards during artifact creation; after the chapter works, process a complete example-project proposal and its confirmation gate; then process a guided-project proposal and its independent confirmation gate; after selected artifact work is complete, start the retrieval quiz with one question.

## Boundaries

- Do not create an intermediate research brief unless the user explicitly asks for one.
- Do not invoke subagents automatically.
- Do not embed exercises or Anki cards in the chapter body.
- Do not invent source claims or mark unverified code as runnable.
- Do not add adjacent topics merely to make the chapter appear comprehensive.

- Do not generate cards, start a quiz, or propose either project type when that follow-up was not selected for the current cycle.
- Do not treat selection of either project follow-up as confirmation to write project files.

## Completion Report

Report:

- files created or changed;
- chapter scope;
- code examples actually verified and commands used;
- remaining uncertainty, if any.
