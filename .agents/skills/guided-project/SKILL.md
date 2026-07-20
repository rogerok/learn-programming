---
name: guided-project
description: Proposes and creates a standalone starter project in which the learner implements an established capability through checked milestones and adaptive, progressively revealed guidance. Use when the learner wants to build the behavior. Do not use for a finished sample, chapter, exercise sheet, or submitted-solution review. Always obtain explicit confirmation before writing project files.
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

When this skill selects the supported profile or the learner explicitly requests a complete spoiler, its milestone-spoiler rules override the default prohibition on complete code in `exercise-design` and `study-note-review`. The exception applies only to collapsed, per-milestone help; it never permits a completed starter, public solution directory, or solution for the independent transfer.

## Inputs and Grounding

1. Identify the target capability, learner's demonstrated prerequisites, experience with the central library or framework, language, runtime, and project constraints.
2. Inspect relevant canonical concepts, chapters, exercises, MOCs, terminology, and existing example or guided projects. A note's presence is not evidence that the learner has mastered it.
3. If no chapter exists, establish scope from the request and authoritative sources. Do not create a chapter as a prerequisite.
4. Detect hidden prerequisites and unfamiliar APIs. Keep the project within demonstrated scope or introduce the prerequisite immediately before the milestone that needs it, with a direct primary-source link and a small orientation example when syntax is not already established.
5. Check complete examples for the same learning unit. Use a meaningfully different problem domain from any accessible complete example. If a same-domain complete example is essential, it must remain unavailable until after the learner's corresponding attempt.

## Guidance Profile

Choose and name one profile before writing the project:

- **supported** — default when the learner is new to the central library or explicitly asks for detailed implementation help. Name exact files and symbols, explain current starter behavior, break the change into ordered steps, link the relevant primary documentation near the step, and provide an optional final collapsed implementation spoiler for each non-transfer milestone;
- **guided** — use when prerequisites are demonstrated. Name the relevant files and boundaries, provide progressive concept, structure, and pseudocode hints, but omit complete code unless requested;
- **independent** — use for a repeat attempt or demonstrated fluency. Give behavior contracts, checks, and only prerequisite-remediation hints.

Do not infer expertise from vocabulary or from the existence of notes. If evidence is mixed, choose the more supportive profile. Detail must remove navigation and prerequisite friction, not narrate every keystroke or restate tests.

## Mandatory Confirmation Gate

This gate applies even when the user directly invokes `/guided-project`.

Before creating or modifying files, installing dependencies, or generating scaffolding, present:

- project title, problem domain, and why it is not a disguised copy of an accessible complete example;
- source notes or authoritative scope;
- the final observable capability and mastery evidence;
- dependency-ordered milestones, each with its learner action, observable behavior, check, and intended amount of guidance;
- the selected guidance profile, why it matches the learner's evidence, and whether collapsed implementation spoilers will be present;
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

1. state an observable outcome, why it follows the previous milestone, and the small mechanism being learned;
2. name the exact files and public symbols the learner should inspect or edit, plus files that are supporting scaffold and normally remain unchanged;
3. describe what the starter currently does and the concrete behavior the learner must replace or extend;
4. give a behavior-level contract and exact targeted check command;
5. give ordered implementation steps at the selected guidance profile without hiding required parsing, execution, wiring, or error-mapping actions behind vague verbs;
6. include a reasoning checkpoint when prediction, explanation, or diagnosis is part of the evidence;
7. ensure checks fail for a plausible missing or incorrect behavior, not for setup or syntax;
8. make the learner change real behavior rather than fill a placeholder;
9. reduce decomposition, named steps, starter code, and hints as capability grows;
10. end with an independent transfer in a different context or representation when transfer is part of the learning unit.

The starter must compile or run and expose meaningful baseline behavior. Leave later capabilities absent by design; do not use empty files, fake handlers, no-op branches, `throw new Error("TODO")`, or other placeholder failures. Add sparse comments such as `Этап 2: текущая baseline-реализация...` at non-obvious learner seams. Each marker must say what already works and point to the corresponding guide stage; never comment every line or paste the task into source.

## GUIDE.md Contract

`GUIDE.md` must contain enough material to locate, attempt, debug, and verify the work without guessing repository structure:

- context, actual prerequisites, target capability, and run/check commands;
- a starter map that distinguishes working domain code, supporting scaffold, learner edit points, and check files;
- a compact explanation of the functioning starter architecture and data flow;
- dependency-ordered milestones with behavior contracts and evidence criteria;
- for every milestone: `Зачем`, `Где работать`, `Что уже есть`, `Что изменить`, ordered `Шаги реализации`, `Проверка`, and a reasoning checkpoint when it adds evidence;
- direct primary-source links adjacent to the unfamiliar API or mechanism they support, optionally anchored to a relevant example or API section;
- final integration evidence and an independent transfer task.

Do not make prose telegraphic merely to keep it compact. Introduce encoded/decoded values, parser execution, Effect error mapping, Layer wiring, and other consequential intermediate actions explicitly when the learner has not demonstrated them. Avoid tutorial filler, repeated motivation, generic encouragement, and line-by-line narration.

Use collapsed hints in this reveal order:

1. governing concept and the question to ask;
2. relevant file, symbol, state, or boundary;
3. pseudocode, API composition, or algorithm shape;
4. in the supported profile, a complete minimal implementation for that milestone, labeled `Полная реализация — открыть после попытки`.

A complete spoiler must compile, be limited to the milestone's edit surface, and explain two or three non-obvious decisions after the code. It must not silently implement later milestones. Revealing it records supported practice, not independent completion. The final transfer has no implementation spoiler.

Do not include a whole-project reference implementation, answer key outside collapsed milestone spoilers, copied expected output that gives away independent work, or a committed `solution/` directory.

Learner-facing headings and hint prose must follow repository language rules; new Russian guidance should use labels such as `Результат`, `Проверка`, and `Подсказка` rather than English template filler.

## Verification Workflow

1. Install or prepare the toolchain from the project-local manifest and lockfile.
2. Run the baseline entrypoint from the project root and observe its stated behavior.
3. Confirm the starter compiles or typechecks and that targeted learner checks fail only for intentionally absent behavior.
4. In a clean temporary copy with no root dependency access, create a private reference implementation for verification only.
5. Run every targeted and integration check against that implementation. Also run representative plausible incorrect implementations where needed to prove a check is discriminating.
6. Confirm the final transfer check measures the same capability in a new context rather than a copied structure.
7. Remove all temporary implementations. Leave only the learner-facing starter and guidance allowed by the selected profile; ensure no private whole-project solution or recoverable generated answer remains.
8. Confirm repository-root build, lint, and test discovery excludes the standalone project.

## Evidence and Completion

Report baseline commands and observed behavior, checks proven to fail and pass for the intended reasons, the selected guidance profile, and the guidance available at each milestone. A learner has not demonstrated mastery merely by opening the project, passing after revealing algorithm-level help, or copying a complete spoiler. Independent completion plus reasoning and transfer evidence support mastery; otherwise recommend a later reduced-guidance attempt.

## Boundaries

- Do not generate a chapter, quiz, Anki export, exercise sheet, complete example, or review of submitted code.
- Do not include a default solution in source, tests, snapshots, history, or a solution directory. A complete implementation is allowed only in a collapsed, per-milestone spoiler under the supported profile or after an explicit learner request.
- Do not reveal advanced APIs outside established scope without naming the prerequisite.
- Do not make framework setup the main challenge unless the framework is the capability.
- Do not use milestone, file, or heading count as a quality target.
- Do not claim verification unless baseline behavior and a private temporary reference implementation were exercised in isolation.
