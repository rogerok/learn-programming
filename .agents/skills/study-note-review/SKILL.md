---
name: study-note-review
description: Audits an existing programming study note, chapter, exercise set, or roadmap for technical correctness and pedagogical quality. Use when the user asks to review learning material. Do not use to review a learner's submitted exercise solution.
---

# Study Note Review

Find actionable defects that could teach the learner the wrong thing or obstruct progression.

## Review Passes

### Technical

- Verify factual claims against primary sources when the claim is version-sensitive or uncertain.
- Compile or run code examples where practical.
- Check outputs, imports, types, error behavior, deprecated APIs, and hidden setup assumptions.
- Confirm exercises and tests match the behavior they claim to assess.

### Pedagogical

- Check that prerequisites appear before use.
- Check that explanations move from intuition to mechanism without skipping reasoning steps.
- Identify cognitive overload, misleading analogies, unexplained jargon, and abrupt abstraction jumps.
- Check that examples expose the core idea rather than framework noise.
- Check that exercises cover the chapter's important learning objectives.
- Check that retrieval cards contain atomic, durable knowledge.

### Vault Integration

- Validate frontmatter, language consistency, wiki-links, companion files, callouts, sources, and placement.
- Identify unnecessary duplication with existing notes.

## Severity

Classify findings as:

- `critical`: factual error, broken example, or exercise with an invalid contract;
- `important`: prerequisite gap, misleading explanation, or missing core practice;
- `minor`: clarity or maintenance improvement that does not change the taught behavior.

## Output

List findings first, ordered by severity. Each finding must include file and line evidence, learner impact, and a concrete correction. Then report commands actually run and any unverified claims. If there are no findings, state that explicitly and name the checks performed.

## Boundaries

- Remain read-only unless the user explicitly asks for fixes.
- Do not report generic praise or style preferences as findings.
- Do not claim code is correct without an appropriate check.
- Do not invoke subagents automatically.
