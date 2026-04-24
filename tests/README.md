# HMIS — Tests

Layered test suite.

| Layer                   | Tool    | Path                        |
|-------------------------|---------|-----------------------------|
| API contract            | Newman  | `../testing-tools/postman_collection.json` |
| Integration             | PyTest  | `integration-tests/`        |
| Security / auth / RBAC  | PyTest  | `security-tests/`           |
| Load                    | Locust  | `../testing-tools/locust_load_test.py`     |

## Setup

```bash
pip install -r requirements.txt
npm install -g newman
```

## Run

```bash
# Full suite via orchestrator
../testing-tools/test_runner.sh

# Or individually:
HMIS_HOST=http://localhost:8080 pytest integration-tests security-tests
```

## Environment

The tests assume a running stack reachable at `HMIS_HOST` (default `http://localhost:8080`)
with the seed data from `database/seed_data.sql` loaded.
