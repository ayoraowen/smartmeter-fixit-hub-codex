#!/usr/bin/env bash
# Printed into Claude's context at the start of every session, and again after
# /clear and compaction. It must never fail, so errors are ignored.
set +e
cd "${CLAUDE_PROJECT_DIR:-.}" 2>/dev/null

echo "Project rules (full text in AGENTS.md): synthetic data only; every figure sourced or marked ASSUMED; specify before building; save the prompt beside every stage document."
echo "Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"

echo "Stage status (docs/README.md):"
current=""
for f in docs/01-problem.md docs/02-prd.md docs/03-spec.md; do
  status=$(grep -m1 '^\*\*Status:\*\*' "$f" 2>/dev/null | sed 's/^\*\*Status:\*\* *//')
  echo "  $f: ${status:-missing}"
  case "$status" in
    passed*) ;;
    *) [ -z "$current" ] && current="$f" ;;
  esac
done
if [ -n "$current" ]; then
  echo "Current stage: $current. Work on later stages or on features waits until it passes."
else
  echo "All stages passed. Feature work traces to acceptance criteria in docs/03-spec.md."
fi

if grep -q '^VITE_API_BASE_URL=.\+' .env.local 2>/dev/null; then
  echo "VITE_API_BASE_URL is set in .env.local."
else
  echo "VITE_API_BASE_URL is not set in .env.local: pages that fetch data will fail."
fi

exit 0
