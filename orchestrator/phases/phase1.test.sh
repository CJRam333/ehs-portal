#!/usr/bin/env bash
# Phase 1 acceptance: Flyway migration applied, both tables exist in MySQL.
# Requires a reachable MySQL 8 and env vars: DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS.
set -uo pipefail

fail() { echo "FAIL: $1"; exit 1; }

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-ehs}"
DB_USER="${DB_USER:-ehs}"
DB_PASS="${DB_PASS:-ehs}"

echo "== Checking migration file exists =="
MIG=$(find backend -path "*db/migration/V1*init*.sql" | head -1)
[ -n "$MIG" ] || fail "V1__init.sql migration not found"
grep -qi "create table" "$MIG" || fail "migration has no CREATE TABLE"

echo "== Booting app to apply Flyway (background, 60s budget) =="
( cd backend && mvn -q -DskipTests spring-boot:run ) &
APP_PID=$!
# Give it time to start and run migrations, then stop it.
sleep 45
kill "$APP_PID" 2>/dev/null
wait "$APP_PID" 2>/dev/null

echo "== Verifying tables exist in MySQL =="
command -v mysql >/dev/null || fail "mysql client not installed (needed for verification)"

check_table() {
  local t="$1"
  local n
  n=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -N -B \
        -e "SELECT COUNT(*) FROM information_schema.tables \
            WHERE table_schema='$DB_NAME' AND table_name='$t';" 2>/dev/null)
  [ "$n" = "1" ] || fail "table '$t' not found in schema '$DB_NAME'"
  echo "  ok: table $t exists"
}

check_table "report"
check_table "checklist_item"

echo "== Verifying flyway_schema_history recorded V1 =="
V=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASS" -N -B \
      -e "SELECT COUNT(*) FROM $DB_NAME.flyway_schema_history WHERE version='1';" 2>/dev/null)
[ "$V" = "1" ] || fail "Flyway did not record migration version 1"

echo "PASS: Phase 1 database schema verified."
exit 0
