---
name: anki-cards
description: Creates or updates a sibling anki-cards.txt TSV export containing atomic, durable retrieval prompts from an existing study chapter. Use for Anki, flashcard, or spaced-repetition export requests. Do not use without a chapter, for interactive quizzes, procedures, architecture walkthroughs, or skill practice.
---

# Anki Cards

Create the smallest useful retrieval set for durable knowledge the source actually teaches. Cards support retention; card production and review are not evidence that the learner can perform the learning unit.

## Eligibility Test

A fact is card-worthy only when all are true:

1. it is explicitly supported by the source chapter;
2. it is likely to remain useful beyond the current exercise or project;
3. it can be recalled as one atomic relationship, distinction, invariant, boundary, mechanism, or stable failure cue;
4. one prompt has one expected answer that can be judged without reproducing a broad essay or workflow;
5. retrieving it helps later reasoning and is not better learned only through implementation, diagnosis, or transfer practice.

Canonical concept knowledge taught by the chapter is normally eligible. Source-track details are eligible only when the chapter makes them durable beyond that source's narration. Reference material is eligible only when the chapter establishes that frequent unaided recall is more valuable than lookup.

## Reject by Default

Do not create cards for:

- multi-step procedures, setup sequences, implementation recipes, debugging playbooks, or end-to-end algorithms;
- broad architecture prompts such as designing a system, explaining an entire component tree, or recalling all responsibilities and interactions of several modules;
- project-specific file layouts, arbitrary naming, incidental design decisions, or code that should instead be modified and run;
- prompts that ask for several independent facts, open-ended essays, or `Explain everything about X`;
- transient versions, rarely used flags, exhaustive API lists, and details better kept in reference material;
- exercise answers, guided-project solutions, or code/output that would leak an upcoming attempt;
- facts duplicated by an equivalent existing card.

A narrow architectural invariant or boundary may be eligible only when it passes the atomic eligibility test; split it from the broader architecture narrative. A short code prediction may be eligible only when it tests one durable mechanism and does not substitute for deliberate practice.

## Workflow

1. Read the source chapter and any existing sibling `anki-cards.txt`. Identify the learning unit but select cards from durable knowledge, not from every heading.
2. List candidate facts and apply the eligibility and rejection tests. When in doubt, leave the item in the note, reference, or exercise rather than making a card.
3. Make each prompt self-contained and atomic. Include enough context to disambiguate the mechanism without embedding the answer.
4. Prefer retrieval and discrimination prompts over recognition or yes/no questions. Use a minimal pair or boundary case when it makes one distinction testable.
5. Keep the answer concise and sufficient to judge. Preserve technical terms and syntax exactly; do not add unrelated teaching prose to inflate coverage.
6. Compare candidates semantically with existing cards. Update stale wording or answers rather than appending variants of the same fact.
7. Write the sibling `anki-cards.txt` with literal tab characters separating exactly three columns.
8. Validate headers, column count, empty fields, duplicate or equivalent questions, accidental multiline rows, unsupported facts, and solution leakage.
9. Report rejected candidate categories when that explains why the resulting set is intentionally small or empty. There is no minimum card count.

## Required Format

```text
#separator:tab
#notetype:Basic
#deck:<Topic Name>
#tags column:3
Question text<TAB>Answer text<TAB>tag1::tag2
```

`<TAB>` documents a literal tab character; never write the string `<TAB>` in the export. Learner-facing question and answer text follows the chapter's language; preserve exact language-independent code and technical identifiers.

## Appropriate Card Shapes

Use only when the content remains atomic and durable:

- definition linked to its distinguishing property;
- contrast between two easily confused concepts;
- mechanism-to-effect relationship;
- invariant or usage boundary;
- stable symptom-to-cause cue;
- one-step output or type prediction for a single mechanism.

## Boundaries

- Do not embed cards in Markdown or create them without an existing source chapter.
- Do not use Anki to represent an entire procedure, architecture, implementation, diagnosis, or learning outcome.
- Do not generate broad prompts, template filler, coverage quotas, or a fixed number of cards.
- Do not count deck creation, review streaks, or correct recognition as mastery of an observable programming capability.
- Do not create an interactive quiz, exercise set, chapter, project, or solution review.
- Do not invoke subagents automatically.
