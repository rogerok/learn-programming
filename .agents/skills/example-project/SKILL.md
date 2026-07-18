---
name: example-project
description: Proposes and creates a small, fully implemented, runnable example that demonstrates an established programming concept in an analogical domain. Use for sample-project, reference-implementation, or complete-example requests. Do not use when the learner should implement the behavior, for exercise sets, or as a solution to a guided project. Always obtain explicit confirmation before writing project files.
---

# Example Project

Create a complete project whose observable behavior makes an established concept inspectable. The project is a worked analogy and reference artifact, not mastery evidence and not a guided-project solution.

## Analogy and Availability Policy

Before proposing a project, determine whether a guided project or implementation exercise assesses the same learning unit.

- Prefer a problem domain meaningfully different from the learner's guided project while preserving the same underlying mechanism or invariant.
- State the structural correspondence between the studied concept and the new domain, and state where the analogy stops.
- Different names over identical control flow, data shape, and decomposition are not a different domain.
- A same-domain complete example may be created only after evidence that the learner attempted the corresponding implementation. If that evidence is unavailable, do not reveal, write, scaffold, or install the example; propose a distinct domain or defer it.
- Never expose a complete example as the answer key, reference implementation, test fixture, or hidden branch of a guided project.

## Mandatory Confirmation Gate

This gate applies even when the user invokes the skill or `/project` command directly.

Before creating or modifying any project file, installing dependencies, or generating scaffolding:

1. Read the canonical concept or chapter that establishes scope, plus only the related exercises, MOC entries, and projects needed to avoid duplication or solution leakage.
2. Prepare a compact proposal containing:
   - project title, purpose, and problem domain;
   - established learning-unit capability and named source concepts;
   - analogy mapping and its limits;
   - relation to any guided project or exercise, including distinct-domain or post-attempt evidence;
   - proposed destination path;
   - language, runtime, and necessary libraries;
   - observable runtime behavior and completion checks;
   - expected files and the purpose each serves;
   - project-local manifest, package manager, lockfile policy, scripts, and required tool configuration;
   - commands for local install, build or typecheck, project-local tests, and run, plus lint only when configured.
3. Ask an explicit yes/no question in the conversation language asking whether to create this example project.
4. Wait for an explicit affirmative answer.

Reading and proposing are allowed before confirmation. Invocation, chapter-cycle selection, or confirmation of another project does not authorize writes. Overwriting an existing project requires separate confirmation naming the affected path.

## Implementation Workflow

After confirmation:

1. Create a self-contained project under `projects/examples/<descriptive-name>/` unless the confirmed proposal names another isolated destination.
2. Give it a project-local dependency and tool boundary: `package.json` and lockfile for Node.js, `go.mod` for Go, `Cargo.toml` and application lockfile for Rust, `pyproject.toml` and selected lockfile for Python, or the ecosystem equivalent.
3. Keep dependencies, scripts, compiler/runtime settings, and test configuration inside the project. Do not add it to root npm workspaces or add its libraries and scripts to the root manifest.
4. Implement complete real behavior. Do not ship learner gaps, stubs, fake paths, placeholder data, unfinished TODOs, or intentionally failing checks.
5. Keep every file and dependency tied to the observable demonstration, isolation, or verification. Do not expand the project to look comprehensive.
6. Make the concept visible in behavior and architecture without distorting production semantics. Use concise comments or run instructions only where they explain the mechanism, analogy, invariant, or trade-off; do not narrate obvious code.
7. Add project-local behavior tests that would fail for plausible misunderstandings of the concept. Tests must not reward source text, private names, formatting, or incidental decomposition.
8. Include concise instructions for install, run, and verification. Observation questions may ask the learner to predict or explain behavior, but do not turn the complete example into a milestone guide or exercise set.
9. Install and run commands from the project root. Exercise the actual entrypoint, compile or typecheck, run project-local tests, and lint only when configured.
10. Verify portability in a clean temporary copy with no access to repository-root dependencies. Install from the project-local manifest and lockfile and repeat core checks.
11. Remove temporary verification artifacts and report observed commands, behavior, and how each major part maps to the established concept and analogical domain.

## Package Isolation

- Repository membership and package membership are separate: the example shares Git history with the vault but owns dependencies and commands.
- Commit the ecosystem lockfile when that ecosystem normally commits one.
- Never rely on undeclared dependencies, root `node_modules`, root compiler settings, or root test discovery.
- Keep generated output, caches, coverage, virtual environments, and secrets out of version control using project-local ignore rules.
- Confirm repository-root build, lint, and test commands do not discover the standalone project.

## Evidence

The project's entrypoint and tests prove only that the example behaves as claimed. They do not prove the learner can reproduce, diagnose, or transfer the capability. Learner mastery requires independent evidence elsewhere; do not convert viewing, running, or reading the example into a completed milestone.

## Boundaries

- Do not create an example without a canonical source note, chapter, or otherwise clearly established learning scope.
- Do not create a guided starter, exercise set, chapter, quiz, Anki export, or submitted-solution review.
- Do not include ordered learner implementation milestones, fading hints, or intentionally missing behavior.
- Do not create or reveal a same-domain solution before the learner's attempt.
- Do not treat invocation, another project's confirmation, file count, or a successful build alone as authorization or mastery.
- Do not invoke subagents automatically.
- Do not claim the project works unless its isolated entrypoint and behavior checks were exercised.
