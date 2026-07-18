---
name: guided-project
description: Proposes and creates a standalone starter mini-project for learning an already studied programming topic through milestones, targeted checks, manual checkpoints, progressive spoiler hints, and reference implementations stored only in GUIDE.md. Use when the user wants to implement the functionality themselves. Always obtain explicit confirmation before writing project files.
---

# Guided Project

Create a working starter mini-project that the learner completes through several ordered milestones. This workflow is independent: it must not require a chapter, quiz, Anki cards, or a complete example project.

## Supporting Skills

Apply the relevant contracts from these repository skills while keeping `guided-project` responsible for the final result:

- `exercise-design`: observable objectives, progressive tasks, and meaningful checks;
- `study-note-review`: factual correctness, prerequisites, difficulty progression, cognitive load, and coverage gaps;
- `technical-prose-editor`: precise, compact explanations without removing necessary scaffolding;
- `obsidian-markdown`: valid collapsed callouts, frontmatter, links, and code fences.

Do not invoke legacy agents automatically. The guided-project workflow must complete with the main agent unless the user explicitly requests delegation.

## Inputs and Grounding

1. Identify the topic, learner level, preferred language, runtime, and any project constraints.
2. Inspect relevant vault notes, exercises, MOCs, and terminology.
3. If no chapter exists, use the clearly stated topic and authoritative sources. Do not generate a chapter as a prerequisite.
4. Detect hidden prerequisites. Keep the project within the learner's demonstrated scope or name the prerequisite in the proposal.

## Mandatory Confirmation Gate

This gate applies even when the user directly invokes `/guided-project`.

Before creating or modifying files, present:

- project title and learning purpose;
- source notes or authoritative topic scope;
- three to six ordered milestones;
- learning objective and observable behavior for each milestone;
- proposed destination and storage rationale;
- language, runtime, libraries, and verification commands;
- expected files;
- project-local manifest, package manager, lockfile, scripts, and toolchain configuration;
- commands for local install, build, lint, targeted checks, and run as applicable;
- baseline behavior already implemented in the starter;
- behavior intentionally left for the learner.

Then ask: **"Create this guided project?"**

Wait for an explicit affirmative answer. Command invocation, selection in a chapter-cycle question, or confirmation of another project does not authorize file writes.

## Storage Policy

Default to the same `learn-programming` Git repository under:

```text
projects/guided/<descriptive-guided-project-name>/
```

The project shares repository history and Obsidian visibility with the vault but remains an independent package or language module. Do not add it to root npm workspaces.

Propose a separate repository only when independent Git history, deployment, collaboration, or portfolio lifecycle is itself valuable. Explain the reason in the proposal and obtain explicit confirmation for the external destination.

## Package Isolation

Every guided project owns its complete tool boundary:

- Node.js or TypeScript: project-local `package.json`, lockfile, `tsconfig`, scripts, lint config, and test config;
- Go: project-local `go.mod`, `go.sum` when produced, native build commands, and tests;
- Rust: project-local `Cargo.toml`, committed `Cargo.lock` for applications, and Cargo tests;
- Python: project-local `pyproject.toml`, selected lockfile, virtual-environment instructions, and tests;
- other languages: the ecosystem's equivalent manifest, lockfile, compiler, formatter, and test configuration.

Do not add project libraries or scripts to the repository root `package.json`. Do not rely on root `node_modules`, root TypeScript settings, or root test discovery. Keep generated outputs, caches, coverage, virtual environments, and secrets out of version control with a project-local `.gitignore`.

## Project Shape

Create a mini-project with three to six cumulative milestones. The starter must compile and expose meaningful baseline behavior; do not use empty files, fake handlers, `throw new Error("TODO")`, or no-op placeholders.

Prefer this layout when the existing stack permits it:

```text
<project>/
├── GUIDE.md
├── package.json | go.mod | Cargo.toml | pyproject.toml
├── <project-local lockfile and tool configs>
├── src/
│   ├── index.ts
│   └── <domain-files>.ts
├── checks/
│   ├── 01-<milestone>.check.ts
│   └── 02-<milestone>.check.ts
└── <project-local test configuration>
```

Adapt filenames and tools for Go, React, backend, CLI, systems, or other language topics. Intentionally failing learner checks must be discoverable only through the project's explicit check command, never through repository-root tooling.

## GUIDE.md Contract

`GUIDE.md` must contain:

1. context, prerequisites, learning objectives, and run commands;
2. a short explanation of the starter architecture;
3. one section per cumulative milestone;
4. the exact targeted check command for each milestone;
5. manual checkpoints for reasoning and design decisions;
6. three progressive collapsed hints;
7. one collapsed reference implementation with explanation;
8. final integration checks and independent extension tasks.

For every milestone, use this reveal order:

````markdown
> [!tip]- Hint 1: Concept
> Point to the relevant mechanism without discussing implementation.

> [!tip]- Hint 2: Structure
> Identify useful state, types, functions, or module boundaries.

> [!tip]- Hint 3: Algorithm
> Give pseudocode or the algorithm shape without complete code.

> [!warning]- Reference implementation
> ```typescript
> // Complete verified implementation for this milestone
> ```
>
> Explain why it works, the invariant it preserves, common mistakes, and relevant trade-offs.
````

The reference implementation must exist only in `GUIDE.md`, not in a committed `solution/` directory.

## Verification Workflow

1. Install or prepare the toolchain from the project-local manifest and lockfile.
2. Implement and run the starter's baseline entrypoint from the project root.
3. Confirm the starter compiles and its baseline behavior works.
4. Confirm each targeted learner check fails for the intended missing behavior rather than setup or syntax errors.
5. Materialize the reference implementation in a clean temporary copy with no access to root-installed dependencies.
6. Install from the project-local manifest and lockfile, then run every targeted check against the complete reference implementation.
7. Fix the guide, checks, manifest, or reference implementation until all checks pass.
8. Remove temporary reference files and leave only the learner-facing starter project plus `GUIDE.md`.
9. Confirm repository-root build, lint, and test commands do not discover the standalone project.

## Boundaries

- Do not generate a chapter, quiz, Anki export, or complete example project.
- Do not place the reference implementation in source files or a solution directory.
- Do not reveal advanced APIs that the source material has not introduced without explaining the prerequisite.
- Do not make framework setup the main difficulty unless the framework is the topic.
- Do not claim the scaffold is verified unless both starter behavior and the temporary reference implementation were exercised.
