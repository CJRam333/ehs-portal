#!/usr/bin/env bash
# Phase 3 acceptance: build sanity + Playwright E2E for gate + details + resume.
set -uo pipefail
fail() { echo "FAIL: $1"; exit 1; }

echo "== Build sanity: frontend compiles =="
( cd frontend && npm install --silent && npm run build ) || fail "frontend build failed"

echo "== E2E: identity gate + Step 1 details + resume =="
E2E_DIR="$(cd "$(dirname "$0")/../e2e" && pwd)"
REPO_ROOT="$(pwd)" bash "$E2E_DIR/run-e2e.sh" tests/phase3_gate_details.spec.ts \
  || fail "phase 3 Playwright tests failed"

echo "PASS: Phase 3 verified (build + E2E)."
exit 0
