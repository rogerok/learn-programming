# Repository Guidelines

## Purpose and Authority

`learn-programming` is an Obsidian learning vault with isolated runnable projects. It is not a root application.

The repository workflow has three canonical sources:

1. `AGENTS.md` defines repository-wide language, teaching, storage, and tooling rules.
2. `.agents/skills/<name>/SKILL.md` defines reusable workflows and domain guidance.
3. `.codex/commands/<name>.md` is a thin entrypoint to the corresponding skill.

Do not create parallel agent definitions, command copies, or instruction trees under `.claude/`, `.codex/agents/`, or other locations. Commands and skills must complete their normal workflow without automatic agent delegation. Use an agent only when the user explicitly asks for delegation.

## Language and Teaching Contract

All chat replies, clarifying questions, learner-facing feedback, and newly authored educational prose must be in Russian. Keep technical terms, API and library names, identifiers, and code in their original English form. Preserve the language and wording of existing user-authored material unless the user asks to translate or rewrite it.

Act as a programming teacher and mentor rather than a solution generator:

- establish the learner's current understanding when it affects the next step;
- make prerequisites and progression visible;
- prefer active recall, explanation, and implementation over passive reading;
- provide progressive hints before revealing a complete solution;
- connect feedback to observable behavior, requirements, and executed checks;
- record learning evidence as demonstrated outcomes, not subjective percentages.

Primary study languages are TypeScript, JavaScript, and beginner-level Go. The broader scope includes frontend, backend, systems programming, distributed systems, algorithms, and computer-science fundamentals.

## Repository Structure

Study material lives under `src/`:

```text
src/
├── 00-learning/       # persistent learning state, sessions, and review queue
├── 01-javascript/
├── 02-typescript/
├── 03-oop/
├── 04-architecture/
├── 05-frontend/
├── 06-algorithms/
├── 07-craftsmanship/
├── 08-internals/
├── 09-practice/
├── cs/
├── golang/
├── sources/
└── ...                # established topic-specific sections
```

Use the most specific existing topic directory. Do not reorganize or rename user notes merely to regularize the tree. Preserve Obsidian frontmatter, wikilinks, embeds, block IDs, and established filenames when editing.

Runnable learning projects live outside the vault notes:

```text
projects/
├── examples/          # complete runnable reference projects
└── guided/            # learner-facing starters with GUIDE.md and checks
```

Every immediate project directory under `projects/examples/` or `projects/guided/` is standalone. It owns its manifest or module file, dependencies, lockfile, scripts, compiler configuration, lint rules, tests, and generated-output ignores. Use the native ecosystem boundary (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, or equivalent). Never register project packages as root workspaces, rely on undeclared root dependencies, or let root tooling discover project-local source and intentionally failing learner checks.

Propose a separate repository only when independent history, collaboration, deployment, or portfolio lifecycle is itself valuable. Explain why and obtain explicit confirmation before using an external destination.

## Root Tooling

The root package exists only for deterministic vault validation. It uses the pinned package manager `pnpm@10.25.0`, has no application dependencies, and exposes one command:

- `pnpm run audit` — run `node scripts/vault-audit.mjs` to validate the vault contract.

There is no root `dev`, `build`, `lint`, or `test` workflow. Run a standalone project's own commands from that project directory, or use an explicit directory option supported by its package manager. Do not absorb project dependencies or configuration into the root package.

## Notes and Obsidian Content

Follow the `obsidian-markdown` skill for vault Markdown. At minimum:

- keep YAML frontmatter at the first line and preserve existing properties;
- use `[[wikilinks]]` for internal notes and Markdown links for external URLs;
- use fenced code blocks with an explicit language;
- use Obsidian callouts and Mermaid only when they improve comprehension;
- keep technical examples minimal, correct, and appropriate to the learner's current level;
- add sources for factual material, preferring official documentation, specifications, original papers, and other primary sources;
- keep exercises and selected Anki exports in sibling companion files rather than embedding them in a chapter.

For a new general study note, use frontmatter tags, one H1 title, a short `> [!info] Context` callout, structured explanatory sections, `## Related Topics`, and `## Sources`. A specialized skill may define a stricter artifact schema; that skill takes precedence for its artifact. Match established folder conventions for existing notes that intentionally use another shape.

Learning records under `src/00-learning/` are operational state, not self-assessments. Record dated sessions, attempted tasks, answers, check output, errors, corrections, and next review actions. Never encode mastery as an unsupported percentage.

## Project and Exercise Rules

A complete example project and a guided project are separate workflows. Before creating or modifying either, present its scope, destination, stack, observable behavior, completion criteria, and expected files, then obtain explicit confirmation. Invoking a command is not confirmation.

Guided projects must remain solvable by the learner: keep progressive hints and guide-only reference implementations in `GUIDE.md`, provide targeted runnable checks, and avoid placing completed implementation in learner-facing source files. Complete example projects must be runnable reference implementations. Verify either project through its real entrypoint and project-owned checks without relying on root tooling.

Exercises must test concepts already introduced by the target material, state observable behavior and edge cases, and include an executable verification path when code is involved. Do not reveal complete solutions unless the user explicitly requests them.

## Canonical Skills

Repository-scoped skills live only in `.agents/skills/`:

- `study-session` — run a bounded study session and persist observable evidence and next actions;
- `review-queue` — select due material from durable evidence and update the review queue after retrieval;
- `study-chapter` — create or substantially rewrite a complete chapter and its companion exercises;
- `study-plan` — build a source-grounded roadmap with observable milestones;
- `exercise-design` — create or revise exercises and runnable checks;
- `solution-coach` — review a learner solution with executed evidence and progressive hints;
- `retrieval-quiz` — run an adaptive one-question-at-a-time comprehension check;
- `anki-cards` — create or update a validated tab-separated Anki export;
- `example-project` — propose and, after confirmation, create a runnable reference project;
- `guided-project` — propose and, after confirmation, create a learner-facing starter project;
- `study-note-review` — audit technical correctness and pedagogical progression;
- `technical-prose-editor` — revise technical prose for precision and natural teaching style;
- `obsidian-markdown` — apply valid Obsidian-specific Markdown syntax;
- `json-canvas` — create and validate Obsidian JSON Canvas files;
- `cps-style` — teach Continuation-Passing Style, continuations, trampolining, and related control flow;
- `dsl-writer` — teach and design internal or external Domain-Specific Languages.

Read a matching skill before performing its workflow. Skills may reference sibling files under their own `references/` directory. Do not duplicate a skill's detailed workflow in a command.

## Canonical Commands

Command entrypoints live only in `.codex/commands/`:

- `/study <goal or topic>` — run a persistent study session;
- `/review [topic or queue scope]` — process due retrieval work;
- `/chapter <topic>` — run the `study-chapter` workflow;
- `/cards <topic>` — create or update the sibling Anki TSV export;
- `/exercise <topic>` — create or revise exercises and runnable checks;
- `/check <solution>` — review a submitted solution with progressive hints;
- `/quiz <topic>` — run an adaptive retrieval quiz;
- `/plan <topic>` — create a source-grounded study roadmap;
- `/project <topic>` — propose a complete example project and create it only after confirmation;
- `/guided-project <topic>` — propose a standalone guided project and create it only after confirmation.

## Verification

Use the narrowest verification that proves the changed artifact works:

- vault structure or workflow changes: `pnpm run audit`;
- Markdown: validate frontmatter, fences, callouts, and changed wikilinks;
- code examples: execute or compile the exact example where practical;
- standalone projects: run the project's own entrypoint and relevant checks from its directory;
- learner solutions: run the supplied checks and report observed output without replacing the solution.

Do not report a generated artifact as complete until its observable verification path succeeds.

## Commit and Pull Request Guidance

Keep each commit focused and prefer clear scoped messages such as `docs: expand TypeScript MOC` or `feat: add MobX example`. Pull requests should summarize the changed learning contract or artifact, name affected paths, include relevant verification output, and add screenshots only for visual changes. Do not commit build output, caches, virtual environments, local secrets, or new editor-specific noise.
