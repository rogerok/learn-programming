---
description: "Interactive comprehension check: I explain, you probe gaps"
allowed-tools: Read, Glob, Grep
---

Quiz me on: $ARGUMENTS

## Instructions

This is a spaced-repetition learning interaction. All communication in Russian.

1. Find the relevant chapter or notes in `src/` for this topic
2. Start by asking the user to explain a core concept from the topic in their own words
3. Based on their explanation:
   - If correct — acknowledge and ask a deeper follow-up question
   - If partially correct — point out what's right, then ask a targeted question about the gap
   - If incorrect — don't give the answer; rephrase the question with a hint or analogy
4. Cover 3-5 key concepts from the topic
5. At the end, summarize:
   - What the user understands well
   - What needs more work (with pointers to specific chapter sections)
   - Suggest re-reading specific sections if needed

## Style

- Conversational, not exam-like
- Questions should require explanation, not one-word answers
- Use "why" and "how" questions, not "what is" recall
- If the user is stuck, provide a concrete scenario: "imagine you need to..."
- Build each question on the previous answer to create a natural flow
