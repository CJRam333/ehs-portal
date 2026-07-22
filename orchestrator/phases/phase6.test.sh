#!/usr/bin/env bash
# Phase 6 acceptance: V2 migration exists+applied, removed columns gone,
# new schema present, frontend builds, and Playwright behaviour passes.
set -uo pipefail
fail() { echo "FAIL: $1"; exit 1; }

DB_HOST="${DB_HOST:-127.0.0.1}"; DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-ehs}"; DB_USER="${DB_USER:-ehs}"; DB_PASS="${DB_PASS:-ehs}"

echo "== V2 migration file exists and does not edit V1 =="
V2=$(find backend -path "*db/migration/V2*.sql" | head -1)
[ -n "$V2" ] || fail "V2 migration file not found"
# guard: V1 must be untouched (still present)
find backend -path "*db/migration/V1*init*.sql" | grep -q . || fail "V1 migration missing (must not be deleted)"

echo "== Backend + frontend build =="
( cd backend && mvn -q -DskipTests package ) || fail "backend build failed"
( cd frontend && npm install --silent && npm run build ) || fail "frontend build failed"

echo "== Built frontend copied into backend static =="
[ -f backend/src/main/resources/static/index.html ] || fail "frontend not bundled into backend static"

echo "== Boot to apply V2 (60s budget) =="
( cd backend && mvn -q -DskipTests spring-boot:run ) &
APP_PID=$!
sleep 45
kill "$APP_PID" 2>/dev/null; wait "$APP_PID" 2>/dev/null

echo "== Verify schema changes in MySQL =="
command -v mysql >/dev/null || fail "mysql client not installed"
q() { mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -N -B -e "$1" 2>/dev/null; }

col_exists() { # col_exists <table> <column>  -> prints 1/0
  q "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='$DB_NAME' AND table_name='$1' AND column_name='$2';"
}
tbl_exists() {
  q "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME' AND table_name='$1';"
}

[ "$(tbl_exists report_type)" = "1" ] || fail "report_type table not created"
[ "$(col_exists report person_kind)" = "1" ] || fail "person_kind column not added"
[ "$(col_exists report non_employee_type)" = "1" ] || fail "non_employee_type column not added"
[ "$(col_exists report hod_comments)" = "0" ] || fail "hod_comments column should be dropped"
[ "$(col_exists report reporter_name)" = "0" ] || fail "reporter_name column should be dropped"
[ "$(col_exists report report_type)" = "0" ] || fail "old report_type column should be dropped"

echo "== V2 recorded by Flyway =="
[ "$(q "SELECT COUNT(*) FROM $DB_NAME.flyway_schema_history WHERE version='2';")" = "1" ] \
  || fail "Flyway did not record migration version 2"

echo "== E2E: phase 6 behaviour =="
E2E_DIR="$(cd "$(dirname "$0")/../e2e" && pwd)"
REPO_ROOT="$(pwd)" bash "$E2E_DIR/run-e2e.sh" tests/phase6_changes.spec.ts \
  || fail "phase 6 Playwright tests failed"

echo "PASS: Phase 6 verified (schema V2 + build + E2E)."
exit 0
