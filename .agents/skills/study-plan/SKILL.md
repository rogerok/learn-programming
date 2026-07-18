---
name: study-plan
description: Builds or revises a source-grounded programming roadmap and dependency-ordered MOC from a learner goal and existing vault resources. Use for curriculum, learning-path, roadmap, prerequisite-sequence, or topic-MOC requests. Do not use to write chapters, exercises, projects, or assess a submitted solution.
---

# Study Plan

Build a roadmap of observable capabilities. The plan coordinates learning units and evidence; it is not a reading list, a calendar, or proof that files have been mastered.

## Workflow

1. Identify the learner's goal, intended application, demonstrated current capabilities, constraints, and the evidence available for prior learning. Treat self-report and existing notes as context, not automatic mastery.
2. Inspect the relevant topic MOCs and only the notes needed to classify available resources. Distinguish:
   - canonical concepts, which hold durable reusable explanations;
   - chapters, which teach bounded capabilities;
   - source tracks, which retain the organization and provenance of a book, course, paper, or documentation set;
   - references, which support lookup rather than progression;
   - exercises, complete examples, guided projects, and learning-session records, which have separate practice or evidence roles.
3. Decompose the goal into the smallest useful learning units. For each unit, state an observable outcome with conditions and success criteria, not a filename or content topic alone.
4. Build the prerequisite graph before assigning order. Include prerequisite capabilities the learner may already possess, and mark the evidence that allows them to be skipped.
5. Consult authoritative sources for current terminology, behavior, APIs, and dependencies. Sources inform the plan; their table of contents does not dictate the canonical sequence.
6. Topologically order the learning units. Group units into phases only when the grouping helps orientation; do not use generic `beginner`, `intermediate`, or `advanced` labels as a substitute for dependencies.
7. Give every learning unit a deliberate-practice path drawn from this progression: predict, explain, modify, implement, diagnose, transfer. Use only the steps needed for that capability, preserve the order, and make later work less scaffolded and more independent.
8. Define mastery evidence for every outcome. Prefer observed behavior such as correct predictions with reasoning, passing executable checks, diagnosis from symptoms, preserving an invariant under modification, or successful transfer to a new context. State a criterion for acceptable evidence; reading, watching, file creation, and Anki review counts are not sufficient alone.
9. Link existing vault artifacts by role and identify genuine gaps without creating the missing chapters, exercises, cards, or projects. Prefer reusing one canonical concept over scheduling duplicate explanations from multiple source tracks.
10. Create or update the topic MOC as a dependency-ordered map. Put prerequisites before dependents, identify optional branches, and separate canonical learning units from source tracks and reference material. Do not flatten all Markdown files into one checklist.
11. Save the roadmap in the appropriate topic folder under repository note and language rules. Include only information needed to choose the next learning unit, practice it, and evaluate evidence; omit empty template sections.
12. Review the graph for hidden prerequisites, cycles, duplicated outcomes, unsupported skip decisions, abrupt changes in scaffolding, and milestones whose evidence would not reveal a plausible misconception.

## Required Plan Content

Use the vault's established structure rather than forcing a fixed template. The finished plan must nevertheless make these items explicit:

- goal, intended use, and assumed starting capabilities;
- dependency-ordered learning units with observable outcomes;
- existing canonical concepts, chapters, source tracks, and references linked by role;
- deliberate-practice steps and how guidance fades;
- mastery evidence and pass criteria;
- optional branches and missing resources;
- authoritative sources used to validate the sequence.

## MOC Rules

- Order by prerequisites, not alphabetically, by source order, or by file creation date.
- A canonical concept may support several learning units; link it without duplicating it.
- Keep source tracks visibly source-specific and separate from the canonical path.
- Keep references available near their point of use without treating lookup as a milestone.
- Attach exercises and projects to the capability they assess, not merely to a neighboring chapter file.
- Mark parallel branches only when neither branch is a prerequisite of the other.

## Boundaries

- Do not provide time estimates unless explicitly requested.
- Do not equate reading, note presence, card review, or plan completion with mastery.
- Do not generate chapter prose, exercise sets, Anki exports, complete examples, guided projects, or session logs.
- Do not reorganize a source track into the canonical path without preserving its provenance.
- Do not add phases, files, or headings to make the plan look comprehensive.
- Do not invoke subagents automatically.
