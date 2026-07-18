---
name: study-note-review
description: Audits an existing programming chapter, canonical concept, source track, reference, exercise set, roadmap, MOC, or learning-project guide for technical and pedagogical defects. Use for review of learning material. Do not use to assess a learner's submitted solution or to create the material.
---

# Study Note Review

Find evidence-backed defects that could teach the wrong model, obstruct deliberate practice, misclassify an artifact, or falsely imply mastery. Review what the learner can understand and demonstrate; do not score presence of template sections.

## Establish the Contract

Before reviewing details:

1. Identify the artifact's intended role: canonical concept, chapter, source track, reference, exercise set, roadmap/MOC, complete example, guided project, Anki export, or learning-session record.
2. State the learning-unit capability, prerequisites, learner context, and observable success criteria supported by the artifact. If these are missing or contradictory, report the concrete impact rather than inventing a new scope.
3. Identify available evidence: executable behavior, checks, rubrics, recorded attempts, source citations, dependency ordering, and hint exposure. File presence, headings, reading completion, and card counts are not mastery evidence.
4. Apply only the passes relevant to the artifact. Missing an irrelevant template section is not a finding.

## Review Passes

### Technical Evidence

- Verify uncertain, version-sensitive, or consequential claims against primary sources.
- Compile or run code examples and actual entrypoints where practical; inspect observed output, types, errors, imports, APIs, and hidden setup assumptions.
- Confirm executable checks fail for plausible incorrect behavior and pass for a verified temporary reference, not merely that test files exist.
- Confirm reasoning rubrics require the mechanism and supporting observation rather than keywords.
- For standalone projects, verify declared dependencies, lockfile and tool isolation, project-local commands, and exclusion from root discovery.
- Mark any claim not exercised or source-verified as unverified; do not infer correctness from polished prose.

### Taxonomy and Dependencies

- Check that the artifact performs its declared role rather than combining incompatible roles.
- Canonical concepts should be durable and reusable; chapters should sequence concepts toward a capability; source tracks should preserve source provenance; references should optimize lookup.
- Check that chapters and plans link existing canonical concepts instead of creating competing definitions, and keep source-specific commentary out of the canonical path.
- Check MOCs and roadmaps are ordered by prerequisites, expose optional parallel branches, and separate canonical learning units from source tracks and references.
- Flag flat file inventories, source-table-of-contents roadmaps presented as canonical order, hidden prerequisites, cycles, and duplicate outcomes.

### Outcomes and Mastery Evidence

- Check that outcomes state an observable action, conditions, and success criteria rather than `understand`, `learn`, `read`, or complete a file.
- Trace each important outcome to evidence capable of revealing a plausible misconception: prediction with reasoning, behavior checks, invariant-preserving modification, diagnosis from symptoms, or independent transfer.
- Distinguish supported, guided, and independent performance. A solution revealed, algorithm-level hint used, copied example, passing recognition prompt, or completed reading is practice history—not independent mastery.
- Check evidence claims match what was actually observed and do not overgeneralize from one narrow check.

### Deliberate Practice and Scaffolding

- Check practice follows the applicable progression: predict, explain, modify, implement, diagnose, transfer.
- Check requirements, inputs, outputs, invariants, boundaries, and error behavior are precise only where relevant to the target capability.
- Verify hints reveal progressively from concept to structure to pseudocode without complete code, and that guidance fades across later tasks.
- Check final transfer changes context or representation while preserving the mechanism; renamed variables or copied decomposition are not transfer.
- Flag default solutions, answer leakage, mechanical copying, passive reading as practice, generic difficulty labels, repetition without a new cognitive action, and checks tied to source text or incidental structure.

### Explanations and Examples

- Check prerequisites precede use and explanations connect intuition to precise mechanism without unexplained jumps.
- Identify cognitive overload, misleading analogies, unexplained jargon, and framework noise that hides the concept.
- Check examples expose observable behavior and important boundaries.
- When a complete example accompanies a guided project or implementation exercise, verify it uses a meaningfully different domain or remained unavailable until after the attempt. Check the analogy states both structural correspondence and limits.
- Do not require more examples or files when existing evidence is sufficient.

### Anki Selection

- Verify every card is source-supported, atomic, durable, self-contained, and has one judgeable expected answer.
- Reject broad procedure, architecture, implementation, debugging-playbook, project-layout, transient-trivia, and solution-leaking cards.
- Allow a narrow invariant, boundary, or one-mechanism prediction only when it remains atomic and useful beyond the immediate task.
- Check semantic duplicates and TSV validity. Do not treat deck coverage or review performance as capability mastery.

### Vault Integration

- Validate frontmatter, language consistency, wiki-links, callouts, sources, placement, and companion relationships that the artifact actually uses.
- Check affected MOC links preserve taxonomy and dependency order.
- Identify unnecessary duplication with canonical notes, but do not demand a companion artifact solely because a convention permits one.

## Severity

Classify findings by learner impact:

- `critical`: factual error, broken runnable example, invalid assessment contract, solution leakage that defeats the attempt, or unsafe project isolation;
- `important`: prerequisite or dependency gap, misleading explanation, unmeasured core outcome, non-discriminating check, abrupt scaffolding, or unsupported mastery claim;
- `minor`: localized clarity, navigation, or maintenance defect with limited effect on taught behavior.

Do not derive severity from number of missing headings, files, cards, exercises, or generic difficulty labels.

## Output

List findings first, ordered by severity. Every finding must include file and line evidence, learner impact, the violated outcome or artifact role, and a concrete correction. Then report:

- commands and scenarios actually run, with observed result;
- primary sources consulted for disputed claims;
- outcomes and evidence paths checked;
- claims or paths left unverified.

If there are no findings, state that explicitly and name the technical, evidence, taxonomy, and pedagogy checks performed. Do not include generic praise.

## Boundaries

- Remain read-only unless the user explicitly asks for fixes.
- Do not review or grade a learner's submitted implementation; use the solution-review workflow.
- Do not create missing chapters, exercises, cards, plans, projects, or templates during review.
- Do not report preferences, absent optional sections, file counts, or template conformance as defects without learner impact.
- Do not claim code, pedagogy, or mastery is correct without appropriate evidence.
- Do not invoke subagents automatically.
