---
name: study-chapter
description: Creates or substantially rewrites one source-grounded programming chapter for an established learning unit in this Obsidian vault. Use for requests to teach a bounded topic in chapter form. Do not use for roadmaps, source-by-source notes, reference pages, exercise-only work, projects, or solution review.
---

# Study Chapter

Create a chapter that helps the learner acquire an observable capability. A chapter is a teaching sequence and a durable artifact; it is not itself the unit of learning, evidence of mastery, a source track, or a reference page.

## Inputs

Identify:

- the capability the learner should demonstrate, including conditions and success criteria;
- target language, learner context, and demonstrated prerequisites;
- destination and the artifact's role in the local topic structure;
- provided sources and existing canonical concepts, source tracks, references, exercises, and projects;
- requested writing profile, if any.

Follow repository language and placement rules. If a new note has no requested language and no existing note establishes one, ask the single required language question before writing.

## CS:APP Chapter Rule

Apply this rule only to chapters under `src/cs/computer-system/`:

- write all programming examples in Zig and explain every Zig construct that is unfamiliar at the learner's stated level;
- scaffold formulas and quantitative reasoning in plain language, defining symbols and intermediate steps;
- preserve the exact technical meaning: add an intuitive explanation alongside necessary mathematics rather than simplifying or replacing a formula when doing so would distort the claim.

## Required Cycle Question

Before every chapter workflow, ask one multi-select question in the conversation language: which follow-ups should this chapter cycle include—exercises, quiz, Anki cards, complete example project, guided project, or none?

Always ask, even when invocation appears to imply an answer. Record the selection only for the current chapter cycle. Selecting a project authorizes only a later proposal; `example-project` and `guided-project` retain separate explicit confirmation gates before any project write, install, or scaffold action.

## Artifact Taxonomy

Classify material before drafting and preserve these boundaries:

- **Learning unit:** an observable capability plus prerequisites, deliberate practice, success criteria, and evidence. It may span several files.
- **Canonical concept:** the vault's durable explanation of one reusable concept. Link or refine it instead of copying competing definitions into multiple chapters.
- **Chapter:** a dependency-aware teaching sequence that combines concepts toward one bounded capability.
- **Source track:** notes that follow a particular book, course, paper, or documentation sequence and preserve provenance. It may point to canonical concepts but does not become the canonical organization by default.
- **Reference material:** lookup-oriented facts, APIs, syntax, tables, or troubleshooting details. Link it at the point of need; do not force it into the chapter's teaching sequence.
- **Exercise set:** deliberate practice and checks, owned by `exercise-design`.
- **Complete example:** a finished analogical application, owned by `example-project`.
- **Guided project:** learner implementation with fading support, owned by `guided-project`.
- **Learning session:** a time-bounded attempt that selects the next practice step and records evidence; it does not replace durable content.
- **MOC:** a dependency-ordered map of learning units and artifacts, not a flat inventory of files.

## Workflow

1. Inspect the topic folder, relevant MOCs, and only the notes needed to establish prerequisites, terminology, duplication, and artifact roles. Existing files prove availability, not mastery.
2. Define one learning unit as a capability statement: given what conditions, the learner can do what, to what observable standard. Name exclusions and prerequisite capabilities.
3. Classify candidate material using the taxonomy above. Keep source-specific commentary in source tracks and lookup detail in references; reuse canonical concept notes rather than creating parallel explanations.
4. Gather authoritative sources. Prefer specifications, official documentation, original papers, and primary project documentation; use secondary sources to improve explanation, not to replace authority.
5. Draft a dependency-aware teaching sequence. Move from a motivating problem through intuition and precise mechanics to boundaries and application. Every substantial section must advance the stated capability; omit template sections that do not.
6. Use a small number of verified examples. Ask the learner to predict important behavior before explaining it, and connect each example to a later observable action. Do not present reading completion or code recognition as mastery.
7. State what evidence would support the outcome—for example, an accurate prediction with reasoning, a modification that preserves an invariant, or a diagnosis supported by a failing check. Do not claim mastery inside the chapter.
8. When exercises were selected, apply `exercise-design` after the chapter is coherent. Practice must progress through predict, explain, modify, implement, diagnose, and transfer as the learning unit warrants; do not add an exercise merely to produce a companion file.
9. When Anki was selected, apply `anki-cards` only to atomic, durable knowledge actually taught. Procedures, architecture walkthroughs, and broad prompts remain practice rather than cards.
10. Verify every runnable example with the narrowest appropriate compiler, runtime, or targeted command. Correct the artifact before reporting completion.
11. Review technical accuracy and pedagogy against the capability and evidence, not against template section presence. Fix unsupported claims, prerequisite gaps, abrupt jumps, misleading analogies, redundant material, and checks that would not distinguish plausible misconceptions.
12. Update an affected MOC only when needed for navigation. Order learning units by prerequisites and show canonical, source-track, reference, practice, and project links by role rather than mixing them into one undifferentiated list.
13. Process selected follow-ups only after the chapter works. If both project types are selected, the complete example must use a meaningfully different problem domain from the guided project or remain unavailable until after the learner's attempt. Run each project's independent proposal and confirmation gate. Start a selected retrieval quiz only after artifact work is complete.

## Boundaries

- Do not create an intermediate research brief unless explicitly requested.
- Do not invoke subagents automatically.
- Do not embed a full exercise set, Anki export, complete project, or guided-project solution in the chapter.
- Do not generate an unselected follow-up or treat follow-up selection as project confirmation.
- Do not make a new chapter when a canonical concept or reference update is the actual request.
- Do not mirror a source's table of contents unless the artifact is explicitly a source track.
- Do not reward file count, reading completion, generic difficulty labels, or filled headings.
- Do not invent source claims, mark unverified code as runnable, or mark the learning unit mastered without observed evidence.

## Completion Report

Report:

- artifacts created or changed and each artifact's taxonomy role;
- the learning-unit capability, prerequisites, and evidence expected;
- examples actually verified and commands used;
- MOC ordering changes, if any;
- remaining uncertainty, if any.
