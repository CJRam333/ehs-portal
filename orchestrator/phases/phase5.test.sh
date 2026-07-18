#!/usr/bin/env bash
# Phase 5 acceptance: full build, README completeness, and full-journey E2E (incl mobile).
set -uo pipefail
fail() { echo "FAIL: $1"; exit 1; }

echo "== Backend packages, frontend builds =="
( cd backend && mvn -q -DskipTests package ) || fail "backend package failed"
( cd frontend && npm install --silent && npm run build ) || fail "frontend build failed"

echo "== README completeness =="
grep -qi "mysql"       README.md || fail "README missing MySQL setup"
grep -qi "npm run dev" README.md || fail "README missing frontend run step"
grep -qiE "qr|scan"    README.md || fail "README missing QR/scan note"

echo "== E2E: full journey + abandon/resume + mobile viewport =="
E2E_DIR="$(cd "$(dirname "$0")/../e2e" && pwd)"
REPO_ROOT="$(pwd)" bash "$E2E_DIR/run-e2e.sh" tests/phase5_full_journey.spec.ts \
  || fail "phase 5 Playwright tests failed"

echo "PASS: Phase 5 verified (build + README + full E2E)."
exit 0
