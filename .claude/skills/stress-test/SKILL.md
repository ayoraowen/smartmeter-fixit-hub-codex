---
name: stress-test
description: Use when a stage document in docs/ (1 problem, 2 PRD, 3 spec) is drafted and needs to be challenged before it passes. Runs the four critic agents in parallel, logs their objections in the document, and walks the person through resolving them.
---

# stress-test

Argument: the stage number, `1`, `2` or `3`, which maps to `docs/01-problem.md`,
`docs/02-prd.md` or `docs/03-spec.md`.

## 1. Check it is ready

Read the document. If a section is empty with no assumption recorded, say which
and stop: a critic attacking an empty section wastes a round. Otherwise set the
status line to `**Status:** stress-testing`.

## 2. Run the panel

Launch these four agents **in parallel, in one message**, each given the document
path, the stage number, and this instruction: attack it from your lens only;
return objections in your output format; do not suggest wording.

- `stakeholder-critic`
- `field-user-critic`
- `engineer-critic`
- `risk-critic`

They work independently on purpose. Do not pass one critic's output to another.

## 3. Log the objections

- Merge duplicates, keeping the stronger wording and naming every critic that
  raised it.
- Number them in the order of the log, continuing from any earlier round:
  `ST-1`, `ST-2`, and so on.
- Keep the critic's severity. You may raise a severity, never lower one.
- Append each one to the document's stress-test log table with the resolution
  `open`.

## 4. Walk through them

Present the `blocking` objections first, **one at a time**. For each, the person
chooses one of three:

- **Revise:** they give the change; you edit the document; the resolution becomes
  `revised: <what changed>`.
- **Accept as risk:** the resolution becomes `accepted as risk: <why>`, and the
  risk goes into the open assumptions table.
- **Reject the objection:** the resolution becomes `rejected: <their reason>`. A
  rejection needs a reason that cites evidence, not a preference.

Never answer an objection on the person's behalf, and never soften one to make it
easier to close. Then offer the `major` objections the same way. `minor` ones may
stay `open`.

## 5. Gate

- Any `blocking` objection still `open`: the status stays `stress-testing`.
- Otherwise: set `**Status:** passed YYYY-MM-DD` with today's date, add a row to
  `docs/decisions.md` recording the pass and any risks accepted, and tell the
  person which stage is next.

If revisions were substantial, offer one more round before passing. A second
round that finds nothing new is a good sign; one that finds new blocking
objections means the first round's revisions opened new holes.
