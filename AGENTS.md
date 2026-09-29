# Smartmeter Fixit Hub

A troubleshooting hub for smart energy meters: a directory of meter models, their
known behaviours, error codes, step-by-step guides and a community section. This
repository is the frontend only; the API is a separate backend.

## The rules

1. **Synthetic data only.** Nothing real from Kenya Power or its customers enters
   this repository: no customer names, account numbers, meter serial numbers,
   token numbers, premises, coordinates, credentials or production extracts. Not
   in code, seed data, tests, documents, prompts or commit messages. If you find
   any, stop and say so without repeating the value.
2. **Every figure is sourced or marked `ASSUMED`.** A threshold, error code, meter
   behaviour, tariff or process step comes from a named source (a vendor manual, a
   named person, an observed case) or is written `[ASSUMED: what would settle it]`.
   Never invent one and present it as fact.
3. **Specify before building.** Feature work traces to an acceptance criterion in
   `docs/03-spec.md`. Chores and bug fixes are exempt but say so in the commit.
   The process is in `docs/README.md`.
4. **Save the prompt beside the output.** Each stage document in `docs/` has a
   `.prompt.md` beside it, holding the prompts used and the drafts rejected.

## Commands

```bash
npm install
npm run dev      # http://localhost:8080 (https if certs/ exists; DEV_HTTPS=false forces http)
npm run lint     # ESLint; the baseline has existing errors, do not add new ones
npm run build
```

There is no test runner yet. Adding one is part of the build stage.

## Local configuration

`.env.local` (gitignored) holds:

- `VITE_API_BASE_URL`: the backend. Without it, every page that fetches data fails.
- `DEV_HTTPS=false`: optional, forces the dev server to plain HTTP.

## Architecture

- Vite, React 18, TypeScript, Tailwind, shadcn-ui. Deployed to Render as a static
  site (`render.yaml`).
- Routing uses `HashRouter` in `src/App.tsx`. Add routes above the `*` catch-all.
  Create pages sit behind `ProtectedRoute`.
- Auth: the backend returns a token on login, stored as `localStorage.authToken`,
  and sent as `Authorization: Bearer <token>`. Cookie-based auth was tried and
  abandoned; the commented-out `credentials: "include"` lines are its remains.
- API base URL comes from `src/config/api.ts`. Never hardcode a host.
- `src/data/*` is the original `localStorage` mock layer from before the backend
  existed. It is being replaced by API calls; do not extend it.
- `src/components/ui/` is generated shadcn code. Regenerate it; do not hand-edit it.

## Resources

| Resource | Routes | Pages |
|---|---|---|
| Meters | `/directory`, `/directory/:id`, `/directory/create` | `Directory`, `MeterDetail`, `CreateMeter` |
| Behaviours | `/behaviors`, `/behaviors/:id`, `/behaviors/create` | `MeterBehaviors`, `BehaviorDetail`, `CreateBehavior` |
| Guides | `/guides`, `/guides/:id`, `/guides/create` | `Guides`, `GuideDetail`, `CreateGuide` |
| Error codes | `/error-codes` | `ErrorCodes` (static data in the page) |
| Community | `/community` | `Community` |

## Working style

- Ask one question at a time when something is unclear.
- Work on a branch, never directly on `main`.
- Report what actually ran. "It works" means you ran it and saw it work.
