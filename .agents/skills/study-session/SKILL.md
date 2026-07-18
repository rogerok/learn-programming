---
name: study-session
description: Runs one evidence-based programming study session from cold retrieval through delayed-review scheduling and records the observed learning evidence in src/00-learning. Use when the learner asks to study, continue learning, or work through a topic in a session. Do not use for roadmap design, chapter authoring, a standalone quiz, or processing the review queue.
---

# Study Session

Run an interactive learning loop around one observable objective. Reading is a response to an observed gap, not the default first step.

## Preparation

1. Identify the topic and inspect its vault notes, exercises, and relevant project milestone.
2. Read `src/00-learning/MOC.md` and existing session records for the topic. Do not treat the existence of a note or a prior session as evidence of understanding.
3. If no session record exists for the topic, make this session a baseline assessment. Begin with an unassisted recall or application prompt before teaching.
4. Otherwise, begin with cold retrieval of the most relevant prior objective or evidence marked for review. Do not show notes, answer cues, or the previous explanation first.
5. Ask only one assessment question at a time.

## Session Loop

1. **Cold retrieval:** ask the learner to explain, predict, trace, debug, compare, or produce a small implementation without notes. Record whether the response was independent, required a hint, or failed, plus the response behavior that supports that classification.
2. **One objective:** select exactly one outcome that can be observed in this session, such as “trace the order of these callbacks and justify every step” or “implement the boundary case without a hint.” State it to the learner. Do not use “understand” or “learn” as the objective.
3. **Gap-driven reading:** identify the smallest concept gap exposed by retrieval. Read or direct the learner to only the relevant vault section; then close the material and ask the learner to restate the mechanism.
4. **Practice:** give one bounded task that exercises the objective through explanation, prediction, implementation, debugging, or comparison. Prefer an existing exercise or current guided-project milestone when it fits.
5. **Feedback:** assess observable behavior against the task contract. Preserve productive struggle: start with the smallest useful hint and let the learner retry before adding detail.
6. **Self-explanation:** ask the learner to explain why the result works, name the governing rule or invariant, and identify one boundary or failure mode. Do not write the explanation on the learner's behalf.
7. **Evidence:** record the prompt, learner response or artifact, support used, observed result, and remaining gap. Separate retrieval evidence from application evidence.
8. **Delayed review:** assign the next review date using the evidence rules in `src/00-learning/MOC.md`. Use an ISO date and record the review focus.

## Interaction Rules

- Keep the session interactive; do not emit the entire sequence in one response.
- Ask for an attempt before teaching or hinting.
- If the learner already demonstrates the objective independently, increase the application boundary rather than forcing unnecessary reading.
- If practice exposes a prerequisite gap, narrow the objective and record why; do not silently turn the session into a broad chapter survey.
- For exercise solutions or guided-project milestones, follow the `solution-coach` progressive-hint boundary.

## Recording

After evidence exists, copy `src/00-learning/session-template.md` to a new note in `src/00-learning/sessions/` named `YYYY-MM-DD-topic.md`. Complete only fields supported by the interaction and link the record from `src/00-learning/MOC.md`. Update an existing same-session record instead of creating duplicates.

A record must include:

- mode: `baseline`, `study`, or `review`;
- one observable objective;
- cold-retrieval prompt and observed response;
- any material read because of the observed gap;
- practice artifact or a precise description of the attempt;
- feedback and hint level used;
- learner's self-explanation;
- separate retrieval and application evidence;
- next review date, interval, and focus.

Do not create a completed record before the learner has responded. Leave unknown template fields empty rather than inferring success.

## Boundaries

- Do not infer mastery from confidence, time spent, notes read, or task completion alone.
- Do not calculate or store mastery percentages.
- Do not expose the answer before an attempt.
- Do not fabricate learner responses, artifacts, completed sessions, or review dates.
- Do not expand into a multi-topic curriculum.
- Do not invoke subagents automatically.
