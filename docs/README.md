# How this project is specified

Every change to this project starts from a document that has survived a stress
test. The documents are short. The stress test is what makes them worth reading.

## The pipeline

| Stage | Document | Passes when |
|---|---|---|
| 1. Problem | [`01-problem.md`](01-problem.md) | The problem is observed, owned by one primary user, and has a cost someone would pay to remove |
| 2. PRD | [`02-prd.md`](02-prd.md) | Every requirement traces to the problem, success is measurable, and out of scope is firm enough to say no to a good idea |
| 3. Spec | [`03-spec.md`](03-spec.md) | Two developers would build the same thing from it, and every acceptance criterion can become a test |
| 4. Build | code + tests | Each acceptance criterion in the spec has a test that was written from the spec, not from the code |

Decisions made along the way go in [`decisions.md`](decisions.md).

A stage does not start until the one before it has passed. A stage that is later
found to be wrong goes back to `drafting`, and so does every stage after it.

## Status

Each stage document carries one status line near the top:

```
**Status:** not started | drafting | stress-testing | passed YYYY-MM-DD
```

The session-start hook reads these lines and tells Claude which stage is current.
Keep the line exactly in that form.

## How a stage is worked

1. **Interview.** Run `/stage-interview <n>`. Claude asks one question at a time
   and drafts the document from your answers. The `advisor` agent can coach you
   while you draft; it never writes.
2. **Stress test.** Run `/stress-test <n>`. Four critic agents attack the draft
   independently: a Kenya Power stakeholder, a field user, an engineer, and a
   risk reviewer. Their objections are logged in the document.
3. **Answer.** You answer, revise or explicitly accept each objection as a risk.
   Claude does not answer them for you.
4. **Gate.** The stage passes when no `blocking` objection is open.

## Three rules for every document

- **Label every statement.** `[person: name]`, `[observed: when/where]`,
  `[source: document]`, `[code: file]`, or `[ASSUMED: what would settle it]`.
  There is no sixth kind.
- **Synthetic data only.** No real customer, account, meter serial, token,
  premises or coordinates, ever. See `AGENTS.md`.
- **Save the prompt beside the output.** `01-problem.md` has `01-problem.prompt.md`
  next to it, holding the prompts used and any drafts you rejected, with a line on
  why. The rejected drafts show what you were deciding.

## The code already exists

This project was built before it was specified. Each stage document therefore has
a section on what the code does today. The gap between that section and the rest
of the document is the improvement backlog.
