---
name: stage-interview
description: Use when drafting or revising a stage document in docs/ (1 problem, 2 PRD, 3 spec). Interviews the person one question at a time, drafts the document from their answers with every statement labelled, and saves the prompt beside it.
---

# stage-interview

Argument: the stage number, `1`, `2` or `3`.

| Stage | Document | Prompt file |
|---|---|---|
| 1 | `docs/01-problem.md` | `docs/01-problem.prompt.md` |
| 2 | `docs/02-prd.md` | `docs/02-prd.prompt.md` |
| 3 | `docs/03-spec.md` | `docs/03-spec.prompt.md` |

## Before the first question

1. Read `docs/README.md` and `AGENTS.md`.
2. Check the gate. If the previous stage's status is not `passed`, say so and
   stop, unless the person explicitly chooses to work ahead; record that choice
   in `docs/decisions.md`.
3. Read the stage document and every earlier stage document.
4. Read the code the stage touches, for the "what the code does today" section.
   Stage 1: pages and data files, to see which user and problem the app assumes.
   Stage 2: routes and pages, to fill the build-against-PRD table.
   Stage 3: fetch calls, forms and types, to fill the code-against-spec table.
5. Tell the person in three lines what the code assumes that the documents do not
   yet support. Those are the first questions worth asking.

Set the status line to `**Status:** drafting`.

## Interviewing

- **One question per message.** Never two.
- **Ask for a case, not a category.** Not "what problems do technicians face?"
  but "tell me about the last meter you could not fix on the first visit".
- **Never supply the answer.** Do not propose a figure, an error code, a user or
  a cost for the person to accept. If they do not know, it becomes
  `[ASSUMED: what would settle it]` and goes in the open assumptions table.
- **Push on vagueness once, then record it.** If an answer stays vague after one
  follow-up, write it down as an assumption and move on.
- **Stop real data.** If an answer contains a real customer, account, meter
  serial, token, premises or coordinates, do not repeat it or write it down. Ask
  for a synthetic stand-in.

## Drafting

- Fill the sections as answers arrive, and show the person what you wrote.
- Label every statement: `[person: name]`, `[observed: when/where]`,
  `[source: document]`, `[code: file]` or `[ASSUMED: …]`.
- Use the person's words for the problem, not product language.
- Do not touch the stress-test log. That belongs to `/stress-test`.

## The prompt file

Append to the stage's `.prompt.md` as you go:

- The date and the stage.
- Each substantial instruction the person gave, verbatim.
- Every draft of a section they rejected, and their reason in one line.

The rejected drafts matter more than the kept one.

## Closing

When every section has content or an explicit assumption, tell the person the
draft is ready for `/stress-test <n>`. Do not change the status to
`stress-testing`; the stress test does that.
