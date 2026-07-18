#!/usr/bin/env bash
# Phase 0 acceptance: project scaffold exists and builds.
# Exit 0 = pass, non-zero = fail. Keep tests strict and independent.
set -uo pipefail

fail() { echo "FAIL: $1"; exit 1; }

echo "== Checking directory structure =="
[ -d backend ]  || fail "backend/ missing"
[ -d frontend ] || fail "frontend/ missing"
[ -f README.md ] || fail "README.md missing"
[ ! -f docker-compose.yml ] || fail "docker-compose.yml should NOT exist (MySQL is external)"

echo "== Checking backend is a Maven project =="
[ -f backend/pom.xml ] || fail "backend/pom.xml missing"
grep -qi "spring-boot" backend/pom.xml || fail "spring-boot not in pom.xml"
grep -qi "mysql" backend/pom.xml || fail "mysql connector not in pom.xml"
grep -qi "flyway" backend/pom.xml || fail "flyway not in pom.xml"

echo "== Checking application config points at MySQL =="
CFG=$(find backend -name "application.y*ml" | head -1)
[ -n "$CFG" ] || fail "no application.yml found"
grep -qi "mysql" "$CFG" || fail "datasource is not MySQL"

echo "== Building backend =="
( cd backend && mvn -q -DskipTests package ) || fail "backend build failed"

echo "== Checking frontend is a Vite project =="
[ -f frontend/package.json ] || fail "frontend/package.json missing"
grep -qi "vite" frontend/package.json || fail "vite not in package.json"

echo "== Installing frontend deps =="
( cd frontend && npm install --silent ) || fail "npm install failed"

echo "PASS: Phase 0 scaffold verified."
exit 0
