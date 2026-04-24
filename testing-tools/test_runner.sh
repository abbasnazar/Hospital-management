#!/usr/bin/env bash
# =============================================================================
# HMIS — Test Runner
#
# Runs:
#   1. API tests            (Newman against Postman collection)
#   2. Integration tests    (PyTest against a running stack)
#   3. Security tests       (PyTest — auth and RBAC)
#   4. Load tests           (Locust, headless)
#
# Usage:
#   ./testing-tools/test_runner.sh              # full suite
#   HMIS_SKIP_LOAD=1 ./testing-tools/test_runner.sh  # skip load
# =============================================================================
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${HMIS_HOST:-http://localhost:8080}"

echo "==================================================================="
echo " HMIS — automated test suite"
echo " Host:   $HOST"
echo " Root:   $ROOT"
echo "==================================================================="

# -----------------------------------------------------------------------------
# 1) API Tests — Newman
# -----------------------------------------------------------------------------
if command -v newman >/dev/null 2>&1; then
  echo ""
  echo "--> Running API tests with Newman..."
  newman run "$ROOT/testing-tools/postman_collection.json" \
    --env-var "baseUrl=$HOST" \
    --reporters cli,json \
    --reporter-json-export "$ROOT/testing-tools/newman-report.json" || {
      echo "Newman reported failures (see newman-report.json)"; exit 1;
    }
else
  echo "!! newman not installed — skipping API tests. Install with: npm i -g newman"
fi

# -----------------------------------------------------------------------------
# 2) Integration + Security Tests — PyTest
# -----------------------------------------------------------------------------
if command -v pytest >/dev/null 2>&1; then
  echo ""
  echo "--> Running integration tests..."
  HMIS_HOST="$HOST" pytest -q "$ROOT/tests/integration-tests"

  echo ""
  echo "--> Running security tests..."
  HMIS_HOST="$HOST" pytest -q "$ROOT/tests/security-tests"
else
  echo "!! pytest not installed — skipping integration/security tests."
  echo "   Install with: pip install -r $ROOT/tests/requirements.txt"
fi

# -----------------------------------------------------------------------------
# 3) Load Tests — Locust
# -----------------------------------------------------------------------------
if [[ "${HMIS_SKIP_LOAD:-0}" != "1" ]]; then
  if command -v locust >/dev/null 2>&1; then
    echo ""
    echo "--> Running load tests (50 users, 2 min)..."
    locust -f "$ROOT/testing-tools/locust_load_test.py" \
           --headless -u 50 -r 10 -t 2m \
           --host "$HOST" \
           --csv "$ROOT/testing-tools/locust-report" || true
  else
    echo "!! locust not installed — skipping load tests. Install with: pip install locust"
  fi
else
  echo "-- HMIS_SKIP_LOAD=1 — skipping load tests."
fi

echo ""
echo "==================================================================="
echo " All tests completed."
echo "==================================================================="
