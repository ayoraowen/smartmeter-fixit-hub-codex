# Decisions

One row per decision that someone could later reasonably question. Newest last.
A decision that rests on an assumption says so, and names what would settle it.

| ID | Date | Decision | Alternatives rejected | Why | Basis |
|---|---|---|---|---|---|
| D1 | 2026-09-27 | Dev server serves HTTPS only when local certs exist; `DEV_HTTPS=false` forces HTTP | Require certs for everyone; trust a local CA system-wide | A fresh clone crashed without certs; auth uses a Bearer token, so HTTP dev does not break login | [code: vite.config.ts, src/pages/Auth.tsx] |
| D2 | 2026-09-27 | Specify the project stage by stage (problem, PRD, spec) with a stress test gating each stage, before further feature work | Keep building features directly from ideas | The app was built before it was specified; the stress test exposes what the code assumes | [person: project owner] |
| D3 | 2026-09-29 | Build a table editor for simulation results (Scenario, Register, Injected kWh, Start Readings, Stop Readings, Consumption, Remarks) in the create-behaviour form **before stage 1 has passed**, working ahead of the specify-before-building gate. Rows are stored as text lines in the existing `symptoms` field, in the format the detail page already parses. | Wait for stage 3; add a structured `simulation_rows` field to the backend | The owner asked for it now; storing as text needs no backend change and keeps existing behaviours displaying. To be revisited in stage 3: required columns, numeric validation, whether Consumption should be derived, and whether the backend should store rows as structured data. | [person: ayoraowen, project owner] |
