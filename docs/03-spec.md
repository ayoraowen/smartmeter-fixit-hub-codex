# 03 · Specification

**Status:** not started

Starts only when `02-prd.md` has passed. Label every statement:
`[person: name]`, `[observed: when/where]`, `[source: document]`, `[code: file]`
or `[ASSUMED: what would settle it]`.

## Data model

Each entity, its fields, types and constraints. Mark each field as measured,
described, or derived. Every field costs the user time; say why each one exists.

## API contract

Endpoints the frontend depends on: method, path, request, response, errors, auth.

## Authentication and roles

Who can read, create, edit and delete what.

## Screens and flows

Each flow from the PRD scenarios, step by step, including the unhappy paths.

## Acceptance criteria

Given / When / Then. Each ID traces to a PRD requirement and becomes a test.

| ID | Requirement | Given | When | Then |
|---|---|---|---|---|

## Failure modes

No signal, slow network, expired token, empty results, malformed data, duplicate
submissions, a guide that is wrong.

## Non-functional

Phone screens, bright light, load time on a slow connection, accessibility.

## The current code against this spec

| Area | Code today | Spec | Change needed |
|---|---|---|---|

## Open assumptions

| ID | Assumption | What would settle it | Owner |
|---|---|---|---|

## Stress-test log

| ID | Severity | Critic | Objection | Resolution |
|---|---|---|---|---|
