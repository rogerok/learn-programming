---
name: anki-cards
description: Creates or updates a sibling anki-cards.txt TSV export from an existing study chapter. Use when the user asks for Anki cards, flashcards, or spaced-repetition material. Do not use when no source note exists or for an interactive quiz.
---

# Anki Cards

Create a compact retrieval set from material the chapter actually teaches.

## Workflow

1. Read the source chapter and any existing sibling `anki-cards.txt`.
2. Select durable knowledge worth recalling without reference material: definitions, distinctions, mechanisms, invariants, boundaries, common failure modes, and short code predictions.
3. Exclude material that is better practiced as an implementation exercise, transient trivia, unsupported details, and facts already represented by an equivalent card.
4. Make each card atomic. The question must establish enough context to have one expected answer.
5. Prefer prompts that require retrieval or discrimination over yes/no recognition.
6. Keep answers concise but complete. Preserve technical terms and code syntax exactly.
7. Update existing cards instead of appending duplicates.
8. Write the sibling `anki-cards.txt` using literal tab characters between the three columns.
9. Validate headers, column count, empty fields, duplicate questions, and accidental multiline rows.

## Required Format

```text
#separator:tab
#notetype:Basic
#deck:<Topic Name>
#tags column:3
Question text<TAB>Answer text<TAB>tag1::tag2
```

`<TAB>` above documents a literal tab character; never write the string `<TAB>` in the export.

## Card Selection

Use only when appropriate:

- concept recall;
- mechanism explanation;
- comparison;
- usage boundary;
- error diagnosis;
- short code-output prediction.

There is no fixed card count. Create the smallest set that covers durable chapter knowledge without redundancy.

## Boundaries

- Do not embed cards in the chapter Markdown.
- Do not create cards from parametric knowledge that is absent from the source note.
- Do not generate vague prompts such as "Explain X" when X contains several independent facts.
- Do not invoke subagents automatically.
