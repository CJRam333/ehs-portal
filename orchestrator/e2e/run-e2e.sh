#!/usr/bin/env bash
# run-e2e.sh <spec-file>
# Boots the backend and frontend dev servers, waits for both, runs the given
# Playwright spec, then tears everything down. Exit code = Playwright's.
#
# Env (with defaults):
#   BACKEND_DIR=backend  FRONTEND_DIR=frontend
#   BACKEND_URL=http://localhost:8080/api/checklist-template
#   FRONTEND_URL=http://localhost:5173
# Assumes the frontend dev server proxies /api to the backend.
set -uo pipefail

SPEC="${1:-}"
[ -n "$SPEC" ] || { echo "usage: run-e2e.sh <spec-file>"; exit 2; }

E2E_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(pwd)}"
BACKEND_DIR="${BACKEND_DIR:-$REPO_ROOT/backend}"
FRONTEND_DIR="${FRONTEND_DIR:-$REPO_ROOT/frontend}"
BACKEND_READY_URL="${BACKEND_URL:-http://localhost:8080/api/checklist-template}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

BACK_PID=""; FRONT_PID=""
cleanup() {
  echo "== Tearing down servers =="
  [ -n "$FRONT_PID" ] && kill "$FRONT_PID" 2>/dev/null
  [ -n "$BACK_PID" ]  && kill "$BACK_PID"  2>/dev/null
  # kill any stragglers on the ports
  pkill -f "spring-boot:run" 2>/dev/null || true
  wait 2>/dev/null
}
trap cleanup EXIT

wait_for() {  # wait_for <url> <label> <max_tries>
  local url="$1" label="$2" tries="${3:-40}"
  for i in $(seq 1 "$tries"); do
    if curl -sf "$url" >/dev/null 2>&1; then echo "  $label is up"; return 0; fi
    sleep 3
  done
  echo "FAIL: $label did not become ready ($url)"; return 1
}

echo "== Starting backend =="
( cd "$BACKEND_DIR" && mvn -q -DskipTests spring-boot:run ) &
BACK_PID=$!
wait_for "$BACKEND_READY_URL" "backend" 40 || exit 1

echo "== Starting frontend dev server =="
( cd "$FRONTEND_DIR" && npm run dev -- --host >/dev/null 2>&1 ) &
FRONT_PID=$!
wait_for "$FRONTEND_URL" "frontend" 30 || exit 1

echo "== Ensuring Playwright + browser are installed =="
( cd "$E2E_DIR" && npm install --silent && npx playwright install --with-deps chromium >/dev/null 2>&1 ) \
  || { echo "FAIL: could not install Playwright"; exit 1; }

echo "== Running Playwright spec: $SPEC =="
( cd "$E2E_DIR" && E2E_BASE_URL="$FRONTEND_URL" npx playwright test "$SPEC" )
RC=$?

echo "== Playwright exit code: $RC =="
exit $RC
