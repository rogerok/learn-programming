---
name: review-queue
description: Runs due delayed reviews from learning records in src/00-learning and reschedules them from observed cold-retrieval and application evidence. Use when the learner asks what is due, starts a review, or wants to process the review queue. Do not use for a new-topic study session, roadmap design, or passive note review.
---

# Review Queue

Process delayed reviews without turning them into rereading or a mastery score.

## Build the Queue

1. Read `src/00-learning/MOC.md` and session notes under `src/00-learning/sessions/`.
2. Include records whose `review_due` is today or earlier. Use ISO dates and the current local date.
3. Sort overdue items first by earliest `review_due`; break ties by session date, then topic name. Do not select future items unless the learner explicitly asks to review ahead.
4. If the queue is empty, report the nearest future review date and stop. Do not invent extra work.
5. If records are incomplete or contradictory, state the exact missing field and do not guess the schedule.

## Review Loop

Process one objective at a time:

1. State the topic and objective, but do not show the prior answer, explanation, or notes.
2. Ask one cold-retrieval prompt that tests the recorded review focus through recall, prediction, tracing, debugging, or comparison.
3. After the learner answers, ask for a bounded application when the first prompt did not already require application.
4. Classify each dimension separately and cite observed behavior:
   - retrieval: `independent`, `with-hint`, or `failed`;
   - application: `independent`, `with-hint`, `failed`, or `not-observed`.
5. If either dimension is weak, give the smallest useful hint and allow a retry. Reading is permitted only after the attempt exposes a specific gap; revisit only the relevant section.
6. Ask the learner for a brief self-explanation of the mechanism or correction.
7. Update the existing record with the review prompt, response or artifact, hint level, evidence, remaining gap, and new schedule. Do not overwrite prior evidence; append a dated review entry.
8. Continue to the next due item only after recording the current result, or stop when the learner asks.

## Deterministic Scheduling

Use the schedule defined in `src/00-learning/MOC.md`:

- retrieval failure: review in 1 day;
- retrieval with a hint, application with a hint, failed application, or application not observed: review in 3 days;
- independent retrieval and independent application: move to the next interval in `7, 14, 30` days; use 7 days when there is no prior successful independent review and remain at 30 days after the sequence is exhausted.

When multiple rules apply, use the shortest interval. The schedule follows observed evidence, never a subjective percentage. Record the rule that produced the date.

## Response Structure

```markdown
## Review

- Topic: ...
- Objective: ...
- Due: ...

### Cold Retrieval

[one prompt]
```

After the interaction, report the evidence and next date without describing it as a mastery level.

## Boundaries

- Do not reveal prior answers before retrieval.
- Do not count rereading, recognition, confidence, or elapsed study time as successful retrieval.
- Do not batch several questions into one message.
- Do not fabricate missing records or completed reviews.
- Do not generate flashcards, chapters, or new exercises automatically.
- Do not invoke subagents automatically.
