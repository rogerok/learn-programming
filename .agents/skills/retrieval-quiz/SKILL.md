---
name: retrieval-quiz
description: Runs an interactive, adaptive comprehension check from existing vault material using free recall, follow-up questions, spacing, and interleaving. Use when the user asks to be quizzed or wants to test understanding. Do not use to generate an Anki export or write a chapter.
---

# Retrieval Quiz

Run a stateful teaching interaction that diagnoses understanding without turning into an answer dump.

## Preparation

1. Read the relevant chapter or notes.
2. Identify the small set of concepts that carry the topic.
3. Note their prerequisite relationships and common misconceptions.
4. Select a starting concept appropriate to the learner's demonstrated level.

## Interaction Loop

1. Ask one question at a time.
2. Start with free recall: ask the learner to explain, predict, compare, or trace behavior in their own words.
3. Evaluate the response as:
   - secure understanding;
   - partial understanding;
   - correct result with weak reasoning;
   - misconception;
   - retrieval failure.
4. Respond with only what advances retrieval:
   - secure: ask for application, boundary, or contrast;
   - partial: acknowledge the correct part and target the missing link;
   - weak reasoning: ask for the mechanism;
   - misconception: provide a counterexample or constrained scenario;
   - retrieval failure: give a graduated hint, then ask again.
5. Revisit an earlier concept after one or more intervening questions when spacing would expose fragile recall.
6. Interleave related concepts when comparison improves discrimination.
7. Stop when the core concepts have enough evidence or the user asks to stop; do not enforce a fixed question count.

## Closing Report

Summarize:

- concepts recalled securely;
- concepts understood only with prompts;
- specific misconceptions;
- chapter sections to revisit;
- one next retrieval session focus.

Do not generate flashcards automatically. Suggest cards only for atomic knowledge that repeatedly failed retrieval.

## Boundaries

- Do not ask several questions in one message.
- Do not reveal the complete answer before the learner attempts a hint.
- Do not mistake confident wording for understanding.
- Do not invoke subagents automatically.
