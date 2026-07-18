---
name: exercise-design
description: Creates or revises deliberate-practice exercises and runnable checks for an existing chapter or explicitly bounded learning unit. Use for exercise-set or practice-task requests. Do not use for guided projects, complete examples, interactive quizzes, or review of a learner's submitted solution.
---

# Exercise Design

Create the smallest practice sequence that produces evidence of an observable capability, rather than recognition of material or completion of a file.

## Inputs and Scope

1. Read the target chapter or the explicitly bounded learning-unit definition, plus only the prerequisites and existing exercises needed to avoid duplication.
2. State the target capability as learner action, conditions, and success criteria. If the source has only topic headings, derive observable outcomes before designing tasks.
3. Identify likely misconceptions and the evidence that would distinguish each from a correct mental model.
4. Use only introduced concepts unless an additional prerequisite is named and linked before the task that needs it.

## Practice Progression

Order practice by these forms, omitting a form only when it cannot produce useful evidence for the learning unit:

1. **Predict:** commit to an output, state transition, type, control-flow result, or failure before execution.
2. **Explain:** justify the prediction using the relevant mechanism, invariant, or dependency—not a paraphrase of the source.
3. **Modify:** change working behavior while preserving stated constraints and existing behavior.
4. **Implement:** build behavior from a contract rather than copying an adjacent example.
5. **Diagnose:** locate and explain a plausible defect from symptoms, evidence, and failing checks, then correct it.
6. **Transfer:** apply the capability in a meaningfully different context, representation, or problem domain.

Do not label tasks merely `easy`, `medium`, or `hard`. Their position is justified by prerequisites, cognitive action, and the amount of remaining scaffolding.

## Exercise Workflow

1. Select the fewest tasks that cover the important outcomes and plausible misconceptions without repeating the same action under different wording.
2. State observable behavior precisely. Include inputs, outputs, invariants, boundaries, error cases, and prohibited shortcuts only when relevant to the outcome.
3. Supply the smallest starter state needed for the task. Early tasks may name the mechanism or relevant code location; later tasks must remove structure, decomposition, and prompts that the learner can now supply independently.
4. Add deterministic executable checks using the repository's established tools when behavior is runnable. Every check must fail for at least one plausible incorrect implementation and must not inspect source text, formatting, private helper names, or incidental structure.
5. For explanation and diagnosis tasks, define an evidence rubric: required claim, supporting observation, and misconception that an incomplete answer would reveal. Do not reduce non-code reasoning to a keyword check.
6. Add optional collapsed hints in progressive reveal order:
   - Hint 1 names the governing concept or question to ask;
   - Hint 2 identifies relevant state, boundary, or relationship;
   - Hint 3 may give pseudocode or a strategy shape, but never complete code.
7. Fade guidance across the sequence. Early predict or modify tasks may offer all three hints; implementation should offer fewer and less specific hints; transfer should have no hint by default. Add a transfer hint only for a prerequisite unrelated to the target capability.
8. Do not include complete solutions, answer keys, snapshot outputs that disclose the answer, or code equivalent to the final implementation unless the user explicitly requests solutions in a separate follow-up.
9. Write or update the exercise artifact associated with the learning unit. Use an existing companion convention when one exists, but never create, split, or rename files merely to increase exercise count.
10. Execute checks against temporary private reference implementations and representative plausible failures. Confirm failures are caused by the assessed behavior rather than setup, syntax, timing, or undeclared dependencies. Remove temporary implementations before completion.
11. Map each task to its outcome and evidence. Remove any task that only rewards reading, recognition, mechanical copying, or template completion.

## Learner-Facing Task Shape

Use only fields that clarify the task; omit empty sections.

````markdown
## Упражнение: <название действия>

**Результат обучения:** <наблюдаемая способность и условия>

**Задание:** <точный контракт поведения>

**Критерий проверки:** <какое наблюдение подтверждает результат>

```typescript
// Минимальная исполняемая проверка, если она уместна
```

> [!tip]- Подсказка 1: концепция
> <направление без реализации>
````

## Mastery Evidence

An exercise attempt is evidence only when the observable check or rubric is satisfied. Record which outcome was demonstrated, under what conditions, and which hints were revealed. A passing copied solution, a revealed answer, or completion after algorithm-level guidance is practice history, not independent mastery. Recommend a later reduced-guidance or transfer attempt when evidence is not independent.

## Boundaries

- Do not write or review the learner's submitted solution; use the solution-review workflow for that request.
- Do not create a standalone guided project, complete example, quiz, chapter, or Anki export.
- Do not use number of tasks, files, headings, or generic difficulty labels as a quality target.
- Do not include default solutions or turn hints into disguised solutions.
- Do not test implementation trivia or introduce unannounced prerequisites.
- Do not invoke subagents automatically.
