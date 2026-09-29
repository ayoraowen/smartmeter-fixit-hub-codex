@AGENTS.md

## Claude Code

The project rules and architecture are in `AGENTS.md`, imported above, so that
Codex and other agents read the same rules. This section is only what is specific
to Claude Code.

### Skills

- `/stage-interview <n>`: drafts stage `n` of `docs/` by interviewing, one
  question at a time.
- `/stress-test <n>`: runs the four critic agents against stage `n` and logs
  their objections.

### Agents

- `advisor`: coaches the person through the current stage. Never edits.
- `stakeholder-critic`, `field-user-critic`, `engineer-critic`, `risk-critic`:
  the stress-test panel. Read-only. Run by `/stress-test`, or on their own.

### Hooks

- Session start prints the rules, the branch, each stage's status and whether
  `VITE_API_BASE_URL` is set.
- After each edit to a `.ts` or `.tsx` file, ESLint runs on that file and reports
  errors. Fix the ones you introduced; fix existing ones in the file when it is
  cheap to.

### Running the app

`.claude/launch.json` starts the dev server on port 8080 for the browser pane.
