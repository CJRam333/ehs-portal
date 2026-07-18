#!/usr/bin/env bash
# Phase 4 acceptance: build sanity + Playwright E2E for checklist + submit.
set -uo pipefail
fail() { echo "FAIL: $1"; exit 1; }

echo "== Build sanity: frontend compiles =="
( cd frontend && npm install --silent && npm run build ) || fail "frontend build failed"

echo "== E2E: checklist rendering, answering, submit =="
E2E_DIR="$(cd "$(dirname "$0")/../e2e" && pwd)"
REPO_ROOT="$(pwd)" bash "$E2E_DIR/run-e2e.sh" tests/phase4_checklist_submit.spec.ts \
  || fail "phase 4 Playwright tests failed"

echo "PASS: Phase 4 verified (build + E2E)."
exit 0
