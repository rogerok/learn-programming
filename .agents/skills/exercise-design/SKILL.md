---
name: exercise-design
description: Creates or revises programming exercises and runnable checks for an existing chapter or clearly bounded topic. Use when the user asks for exercises, practice tasks, or a mini-project. Do not use to review the learner's submitted solution.
---

# Exercise Design

Create practice that reveals whether the learner can use the material, not merely recognize it.

## Workflow

1. Read the target chapter and identify its explicit learning objectives, examples, terminology, and prerequisites.
2. Convert each important objective into an observable learner action: explain, predict, modify, implement, compare, or diagnose.
3. Select the smallest exercise set that covers the objectives without repetition.
4. Order exercises by cognitive demand:
   - explain or predict one concept;
   - modify an existing pattern;
   - implement behavior from requirements;
   - diagnose a plausible defect;
   - integrate concepts in a bounded challenge.
5. State requirements and observable behavior precisely. Include inputs, outputs, invariants, error cases, and prohibited shortcuts only when relevant.
6. Add deterministic tests or executable checks using the repository's established tools. Every check must fail for a plausible incorrect solution.
7. Add progressive hints in collapsed Obsidian callouts. The first hint should identify the relevant concept; later hints may narrow the implementation strategy.
8. Write or update `exercises.md` next to the chapter. Never overwrite a companion file belonging to a different chapter.
9. Run the provided checks against a temporary reference implementation or otherwise execute the test path before reporting that the tests are valid.

## Exercise Template

````markdown
## Exercise N: Title

**Learning objective:** Observable capability

**Task:** Precise task statement

**Requirements:**

- requirement

**Checks:**

```typescript
// Runnable verification code
```

> [!tip]- Hint 1
> Concept-level guidance.
````

## Boundaries

- Use only concepts introduced by the chapter unless an additional prerequisite is stated explicitly.
- Do not include complete solutions unless the user explicitly requests them.
- Do not test source text, implementation trivia, or incidental formatting.
- Do not invoke subagents automatically.
