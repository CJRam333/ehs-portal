#!/usr/bin/env bash
# Phase 2 acceptance: REST API works end-to-end (identify -> create -> details -> checklist -> submit).
# Boots the backend, hits the endpoints with curl, checks responses.
set -uo pipefail

fail() { echo "FAIL: $1"; kill "${APP_PID:-0}" 2>/dev/null; exit 1; }

BASE="http://localhost:8080/api"

echo "== Booting backend =="
( cd backend && mvn -q -DskipTests spring-boot:run ) &
APP_PID=$!

echo "== Waiting for app to be ready =="
for i in $(seq 1 30); do
  if curl -sf "$BASE/checklist-template" >/dev/null 2>&1; then
    echo "  app is up"; break
  fi
  sleep 3
  [ "$i" = "30" ] && fail "app did not become ready in time"
done

echo "== 1. checklist-template returns items =="
TPL=$(curl -sf "$BASE/checklist-template") || fail "checklist-template failed"
echo "$TPL" | grep -q "PPE_01" || fail "template missing PPE_01"
echo "$TPL" | grep -q "RISK_14" || fail "template missing RISK_14"

echo "== 2. identify (new user) returns resume:false =="
ID=$(curl -sf -X POST "$BASE/identify" -H 'Content-Type: application/json' \
  -d '{"name":"Asha R","employeeId":"E9001","designation":"Technician"}') || fail "identify failed"
echo "$ID" | grep -q '"resume":false' || fail "expected resume:false for new user"

echo "== 3. create report =="
REP=$(curl -sf -X POST "$BASE/reports" -H 'Content-Type: application/json' \
  -d '{"name":"Asha R","employeeId":"E9001","designation":"Technician"}') || fail "create report failed"
RID=$(echo "$REP" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
[ -n "$RID" ] || fail "no report id returned"
echo "  report id = $RID"

echo "== 4. save details =="
curl -sf -X PUT "$BASE/reports/$RID/details" -H 'Content-Type: application/json' \
  -d '{"reportType":"NEAR_MISS","shift":"A","reporterCategory":"STAFF","severity":"LOW","location":"Bay 3","eventDate":"2026-07-16","eventTime":"09:30:00","reportDescription":"Loose cable"}' \
  >/dev/null || fail "save details failed"

echo "== 5. save checklist answers =="
curl -sf -X PUT "$BASE/reports/$RID/checklist" -H 'Content-Type: application/json' \
  -d '[{"itemCode":"PPE_01","answer":"YES"},{"itemCode":"RISK_09","answer":"NO"}]' \
  >/dev/null || fail "save checklist failed"

echo "== 6. identify again -> should resume the DRAFT =="
ID2=$(curl -sf -X POST "$BASE/identify" -H 'Content-Type: application/json' \
  -d '{"name":"Asha R","employeeId":"E9001","designation":"Technician"}') || fail "identify(2) failed"
echo "$ID2" | grep -q '"resume":true' || fail "expected resume:true for returning user with draft"

echo "== 7. submit =="
SUB=$(curl -sf -X POST "$BASE/reports/$RID/submit") || fail "submit failed"
echo "$SUB" | grep -q '"status":"SUBMITTED"' || fail "status not SUBMITTED after submit"

echo "== 8. after submit, identify -> resume:false (no open draft) =="
ID3=$(curl -sf -X POST "$BASE/identify" -H 'Content-Type: application/json' \
  -d '{"name":"Asha R","employeeId":"E9001","designation":"Technician"}') || fail "identify(3) failed"
echo "$ID3" | grep -q '"resume":false' || fail "expected resume:false after submit"

kill "$APP_PID" 2>/dev/null
echo "PASS: Phase 2 API verified end-to-end."
exit 0
