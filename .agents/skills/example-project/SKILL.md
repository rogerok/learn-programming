---
name: example-project
description: Designs and creates a small runnable example project that applies an already studied programming topic. Use when the user asks for a sample project, reference implementation, or topic-based mini-project. Always present the proposed project and obtain explicit confirmation before creating or modifying project files.
---

# Example Project

Turn an already studied topic into a small runnable project whose behavior demonstrates the topic's core ideas.

## Mandatory Confirmation Gate

This gate applies even when the user explicitly invokes the skill or `/project` command.

Before creating or modifying any project file:

1. Read the relevant chapter, exercises, and related vault notes.
2. Prepare a compact proposal containing:
   - project title and purpose;
   - learning objectives connected to named chapter concepts;
   - proposed destination path;
   - language, runtime, and libraries;
   - observable behavior and completion criteria;
   - files expected to be created or changed.
3. Ask the user: **"Create this example project?"**
4. Wait for an explicit affirmative answer.

Reading and proposing are allowed before confirmation. Writing files, installing dependencies, generating scaffolding, and modifying configuration are prohibited before confirmation. A previous confirmation for a different project or chapter cycle does not carry over.

## Implementation Workflow

After confirmation:

1. Reuse the repository's existing runtime, dependencies, naming, and test conventions. Add dependencies only when the learning objective requires them.
2. Place a cross-topic mini-project under `src/09-practice/<descriptive-name>/`. Place a tightly chapter-specific example next to that topic only when this matches the existing structure better.
3. Keep the project small enough that every file serves a named learning objective.
4. Implement real behavior. Do not ship stubs, placeholder handlers, fake data paths, or unfinished TODOs.
5. Include concise run instructions and extension tasks. Explain architecture decisions that expose the studied concept; do not narrate obvious code.
6. Add tests only for new observable behavior that is not already covered by an existing project test path.
7. Run the project through its actual entrypoint and exercise the core behavior. Also run the narrowest relevant typecheck or tests.
8. Report created files, observed commands and output, and how each major part maps to the studied topic.

## Learning Constraints

- Prefer a focused reference project over a large showcase application.
- Keep framework and infrastructure noise below the concept being studied.
- Reuse terminology from the chapter.
- Include one or more extension tasks that require the learner to modify behavior independently.
- Do not invoke subagents automatically.

## Boundaries

- Do not create a project for a topic that has no source note or clearly established learning scope; propose the missing prerequisite instead.
- Do not treat command invocation itself as confirmation.
- Do not overwrite an existing project without a separate explicit confirmation naming the affected path.
- Do not claim the project works unless its entrypoint was exercised.
