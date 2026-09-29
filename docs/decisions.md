# Decisions

One row per decision that someone could later reasonably question. Newest last.
A decision that rests on an assumption says so, and names what would settle it.

| ID | Date | Decision | Alternatives rejected | Why | Basis |
|---|---|---|---|---|---|
| D1 | 2026-09-27 | Dev server serves HTTPS only when local certs exist; `DEV_HTTPS=false` forces HTTP | Require certs for everyone; trust a local CA system-wide | A fresh clone crashed without certs; auth uses a Bearer token, so HTTP dev does not break login | [code: vite.config.ts, src/pages/Auth.tsx] |
| D2 | 2026-09-27 | Specify the project stage by stage (problem, PRD, spec) with a stress test gating each stage, before further feature work | Keep building features directly from ideas | The app was built before it was specified; the stress test exposes what the code assumes | [person: project owner] |
