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
   - project-local manifest, package manager, lockfile, scripts, and toolchain configuration;
   - commands for local install, build, lint, test, and run as applicable;
3. Ask the user: **"Create this example project?"**
4. Wait for an explicit affirmative answer.

Reading and proposing are allowed before confirmation. Writing files, installing dependencies, generating scaffolding, and modifying configuration are prohibited before confirmation. A previous confirmation for a different project or chapter cycle does not carry over.

## Implementation Workflow

After confirmation:

1. Create a self-contained project under `projects/examples/<descriptive-name>/`.
2. Give the project its own dependency and tool boundary. Use `package.json` plus a project-local lockfile for Node.js, `go.mod` for Go, `Cargo.toml` for Rust, `pyproject.toml` plus the selected lockfile for Python, or the ecosystem's equivalent.
3. Keep dependencies, scripts, compiler settings, lint configuration, test configuration, and runtime commands inside the project. Do not add the project to root npm workspaces and do not add its libraries to the root `package.json`.
4. Reuse conceptual and naming conventions from the vault, but choose project-local tool versions that fit the topic. Add only dependencies that serve the learning objective or required runtime behavior.
5. Keep the project small enough that every file serves a named learning objective.
6. Implement real behavior. Do not ship stubs, placeholder handlers, fake data paths, or unfinished TODOs.
7. Include concise run instructions and extension tasks. Explain architecture decisions that expose the studied concept; do not narrate obvious code.
8. Add project-local tests for observable behavior. Root build, lint, and test commands must not discover or execute the project.
9. Install and run commands from the project root. Exercise the actual entrypoint, typecheck or compile, lint when configured, and run the project-local tests.
10. Verify portability in a clean temporary copy that has no access to the repository root's installed dependencies. Install from the project-local manifest and lockfile, then repeat the core checks.
11. Remove temporary verification files and report created files, observed commands and output, and how each major part maps to the studied topic.

## Learning Constraints

- Prefer a focused reference project over a large showcase application.
- Keep framework and infrastructure noise below the concept being studied.
- Reuse terminology from the chapter.
- Include one or more extension tasks that require the learner to modify behavior independently.
- Do not invoke subagents automatically.

## Package Isolation

- Treat repository membership and package membership as separate boundaries: the project shares Git history with the vault but owns its dependencies and commands.
- Commit the ecosystem lockfile when that ecosystem normally commits one.
- Never rely on undeclared dependencies resolved from the repository root.
- Keep generated outputs, caches, coverage, virtual environments, and local secrets out of version control through a project-local `.gitignore`.
- A different language is not a special case: use that language's native module and test tooling entirely inside the project directory.

## Boundaries

- Do not create a project for a topic that has no source note or clearly established learning scope; propose the missing prerequisite instead.
- Do not treat command invocation itself as confirmation.
- Do not overwrite an existing project without a separate explicit confirmation naming the affected path.
- Do not claim the project works unless its entrypoint was exercised.
