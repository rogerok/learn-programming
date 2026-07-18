---
name: guided-project
description: Proposes and creates a standalone starter project in which the learner implements an established capability through checked milestones and fading, optional hints. Use when the learner wants to build the behavior. Do not use for a finished sample, chapter, exercise sheet, or submitted-solution review. Always obtain explicit confirmation before writing project files.
---

# Guided Project

Create a functioning starter that the learner extends through dependency-ordered milestones. The learning unit is the observable capability demonstrated by the completed behavior, reasoning, and transfer—not the project directory or GUIDE file.

This workflow is independent: it must not require a chapter, quiz, Anki deck, or complete example project when the topic and prerequisites are otherwise established.

## Supporting Contracts

Apply the relevant rules from:

- `exercise-design` for observable outcomes, meaningful checks, practice progression, and progressive hints;
- `study-note-review` for factual and pedagogical verification;
- `technical-prose-editor` for precise compact instructions;
- `obsidian-markdown` for valid project guidance when Obsidian syntax is used.

Keep `guided-project` responsible for the final result. Do not invoke legacy agents or subagents automatically.

## Inputs and Grounding

1. Identify the target capability, learner's demonstrated prerequisites, language, runtime, and project constraints.
2. Inspect relevant canonical concepts, chapters, exercises, MOCs, terminology, and existing example or guided projects. A note's presence is not evidence that the learner has mastered it.
3. If no chapter exists, establish scope from the request and authoritative sources. Do not create a chapter as a prerequisite.
4. Detect hidden prerequisites. Keep the project within demonstrated scope or name the prerequisite and its evidence requirement in the proposal.
5. Check complete examples for the same learning unit. Use a meaningfully different problem domain from any accessible complete example. If a same-domain complete example is essential, it must remain unavailable until after the learner's corresponding attempt.

## Mandatory Confirmation Gate

This gate applies even when the user directly invokes `/guided-project`.

Before creating or modifying files, installing dependencies, or generating scaffolding, present:

- project title, problem domain, and why it is not a disguised copy of an accessible complete example;
- source notes or authoritative scope;
- the final observable capability and mastery evidence;
- dependency-ordered milestones, each with its learner action, observable behavior, check, and intended amount of guidance;
- proposed destination and storage rationale;
- language, runtime, libraries, and verification commands;
- expected files and the purpose each serves;
- project-local manifest, package manager, lockfile policy, scripts, and only the tool configuration needed for isolation;
- commands for local install, build or typecheck, targeted checks, and run, plus lint only when configured;
- coherent baseline behavior already implemented in the starter;
- behavior intentionally left for the learner.

Then ask an explicit yes/no question in the conversation language asking whether to create this guided project. Wait for an explicit affirmative answer. Invocation, chapter-cycle selection, or confirmation of another path does not authorize writes. Overwriting an existing project requires a separate confirmation naming that path.

## Storage and Package Isolation

Default to the same `learn-programming` Git repository under:

```text
projects/guided/<descriptive-guided-project-name>/
```

The project shares repository history and Obsidian visibility but owns its package boundary. Do not add it to root npm workspaces.

Propose a separate repository only when independent history, deployment, collaboration, or portfolio lifecycle is itself useful. Explain that reason and confirm the external destination explicitly.

Every guided project must be runnable without root-installed dependencies or root tool configuration:

- Node.js or TypeScript: project-local `package.json`, lockfile, `tsconfig`, scripts, and required test/check configuration;
- Go: project-local `go.mod`, `go.sum` when produced, native commands, and tests;
- Rust: project-local `Cargo.toml`, committed `Cargo.lock` for applications, and Cargo tests;
- Python: project-local `pyproject.toml`, selected lockfile, virtual-environment instructions, and tests;
- other ecosystems: equivalent native manifest, dependency lock policy, compiler/runtime, and check configuration.

Never add project libraries or scripts to the repository root. Never rely on root `node_modules`, root TypeScript settings, or root test discovery. Exclude generated output, caches, coverage, environments, and secrets with project-local ignore rules.

## Milestone Design

Use the fewest cumulative milestones that make dependencies and evidence clear. Across the project, preserve this deliberate-practice progression where applicable: predict, explain, modify, implement, diagnose, transfer.

For each milestone:

1. state an observable outcome and why it follows the previous milestone;
2. give a behavior-level contract and exact targeted check command;
3. include a reasoning checkpoint when prediction, explanation, or diagnosis is part of the evidence;
4. ensure checks fail for a plausible missing or incorrect behavior, not for setup or syntax;
5. make the learner change real behavior rather than fill a placeholder;
6. reduce decomposition, named steps, starter code, and hints as capability grows;
7. end with an independent transfer in a different context or representation when transfer is part of the learning unit.

The starter must compile or run and expose meaningful baseline behavior. Leave later capabilities absent by design; do not use empty files, fake handlers, no-op branches, `throw new Error("TODO")`, or other placeholder failures.

## GUIDE.md Contract

`GUIDE.md` must contain only material needed to attempt and verify the work:

- context, prerequisites, target capability, and run/check commands;
- a compact explanation of the functioning starter architecture;
- dependency-ordered milestones with behavior contracts and evidence criteria;
- exact targeted check commands and manual reasoning checkpoints;
- optional collapsed hints that fade across milestones;
- final integration evidence and an independent transfer task.

Use hints in reveal order: concept, relevant structure or boundary, then pseudocode or algorithm shape. Never include complete code. Early milestones may have up to three hints; later implementation and diagnosis milestones should have fewer and less-specific hints; the final transfer has no hint by default. Do not include a reference implementation, answer key, copied expected output that gives away the implementation, or a committed `solution/` directory.

Learner-facing headings and hint prose must follow repository language rules; new Russian guidance should use labels such as `Результат`, `Проверка`, and `Подсказка` rather than English template filler.

## Verification Workflow

1. Install or prepare the toolchain from the project-local manifest and lockfile.
2. Run the baseline entrypoint from the project root and observe its stated behavior.
3. Confirm the starter compiles or typechecks and that targeted learner checks fail only for intentionally absent behavior.
4. In a clean temporary copy with no root dependency access, create a private reference implementation for verification only.
5. Run every targeted and integration check against that implementation. Also run representative plausible incorrect implementations where needed to prove a check is discriminating.
6. Confirm the final transfer check measures the same capability in a new context rather than a copied structure.
7. Remove all temporary implementations and leave only the learner-facing starter and guidance, with no solution or recoverable generated answer.
8. Confirm repository-root build, lint, and test discovery excludes the standalone project.

## Evidence and Completion

Report baseline commands and observed behavior, checks proven to fail and pass for the intended reasons, and the guidance available at each milestone. A learner has not demonstrated mastery merely by opening the project, passing after revealing algorithm-level help, or copying code. Independent completion plus reasoning and transfer evidence support mastery; otherwise recommend a later reduced-guidance attempt.

## Boundaries

- Do not generate a chapter, quiz, Anki export, exercise sheet, complete example, or review of submitted code.
- Do not include any default solution in source, GUIDE, tests, snapshots, history, or a solution directory.
- Do not reveal advanced APIs outside established scope without naming the prerequisite.
- Do not make framework setup the main challenge unless the framework is the capability.
- Do not use milestone, file, or heading count as a quality target.
- Do not claim verification unless baseline behavior and a private temporary reference implementation were exercised in isolation.
