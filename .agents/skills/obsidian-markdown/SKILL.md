---
name: obsidian-markdown
description: Creates and edits Obsidian Flavored Markdown with valid frontmatter, wikilinks, embeds, callouts, block references, tags, and Mermaid diagrams. Use for Markdown files in this Obsidian vault. Do not use to change the repository's pedagogical or chapter contracts.
---

# Obsidian Markdown

Apply Obsidian-specific syntax while following the repository's note templates and language rules.

## Core Rules

- Use `[[Note Name]]` for internal vault links and `[label](https://example.com)` for external links.
- Use aliases only when display text improves readability: `[[Note Name|display text]]`.
- Link headings with `[[Note Name#Heading]]` and blocks with `[[Note Name#^block-id]]`.
- Embed notes and assets with `![[target]]`.
- Keep YAML frontmatter at the first line of the file.
- Store tags in frontmatter unless the existing note uses a different established convention.
- Use callouts intentionally:

```markdown
> [!info] Context
> Explanatory context.

> [!tip]- Hint
> Collapsed guidance.

> [!warning]
> Important limitation.
```

- Use fenced code blocks with an explicit language.
- Use Mermaid only when relationships, state transitions, architecture, or data flow are clearer as a diagram.
- Keep Mermaid node labels concise and ensure the diagram parses.
- Preserve existing frontmatter properties, block IDs, embeds, and wiki-link spelling when editing.

## Verification

Before completion:

1. Confirm frontmatter delimiters and YAML syntax.
2. Confirm code fences and callouts are balanced.
3. Confirm new wiki-links refer to existing notes or are intentionally proposed links.
4. Confirm embeds use repository-relative vault paths.
5. Confirm headings and companion files follow repository instructions.

## Boundaries

- Obsidian syntax does not override the repository's content templates.
- Do not create decorative callouts or diagrams that add no explanatory value.
- Do not convert existing wikilinks to Markdown links.
