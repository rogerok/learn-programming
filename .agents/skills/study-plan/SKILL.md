---
name: study-plan
description: Builds a source-grounded programming study roadmap from the learner's goal and existing vault knowledge. Use for requests for a curriculum, learning path, roadmap, or prerequisite sequence. Do not use to write the full chapter or assess a submitted solution.
---

# Study Plan

Build a practical roadmap whose milestones demonstrate capability rather than content consumption.

## Workflow

1. Identify the learner's goal, intended application, current level, and any explicit constraints.
2. Inspect relevant vault notes and MOCs. Treat existing material as evidence of available study resources, not proof that the learner has mastered it.
3. Determine prerequisites and dependencies between subtopics.
4. Consult authoritative sources for the topic's current terminology, APIs, and recommended sequence.
5. Organize the roadmap into a small number of phases. Each phase must have a concrete learning outcome and a reason for its position.
6. Include active practice in every phase. Prefer explanation, prediction, implementation, debugging, and comparison over passive reading.
7. Define observable milestones such as "explain X without notes", "implement Y", or "diagnose Z".
8. Add links to existing vault notes and identify missing notes without creating them.
9. Save the roadmap in the most appropriate topic folder, following the repository note template and language rules.
10. Review the sequence for hidden prerequisites, duplicate coverage, and phases that are too broad.

## Output Structure

```markdown
---
tags: [topic, study-plan]
---

# Study Plan: Topic

> [!info] Context
> Goal, intended use, and assumed starting point.

## Prerequisites

## Roadmap

### Phase: Name

- Concepts
- Practice
- Milestone

## Related Topics

## Sources
```

## Boundaries

- Do not provide time estimates unless the user explicitly asks for them.
- Do not equate reading a note with mastering its contents.
- Do not generate full chapter content.
- Do not invoke subagents automatically.
