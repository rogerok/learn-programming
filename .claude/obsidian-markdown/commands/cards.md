---
description: "Generate Anki-ready flashcards for a topic or chapter"
allowed-tools: Read, Write, Glob, Grep
---

Generate Anki flashcards for: $ARGUMENTS

## Instructions

1. Find the relevant chapter or notes in `src/` for this topic
2. If no notes exist, tell the user (in Russian) and suggest creating a chapter first
3. Extract the key concepts that should be memorized
4. Create Q&A flashcards in this format:

```markdown
## Anki Cards

> [!tip] Flashcard
> **Q:** question text
> **A:** concise answer

> [!tip] Flashcard
> **Q:** question text
> **A:** concise answer
```

5. Aim for 8-15 cards per chapter
6. Card types to include:
   - Definition cards (what is X?)
   - Comparison cards (X vs Y?)
   - Code output cards (what does this code return?)
   - Concept application cards (when would you use X?)
   - Common pitfall cards (what's wrong with this code?)
7. If the chapter already has an Anki Cards section, update it with new cards (don't duplicate)
8. Report the count of cards created (in Russian)
