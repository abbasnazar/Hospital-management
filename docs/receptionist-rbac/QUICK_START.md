# Quick Start — Receptionist RBAC

## In 60 seconds: try it in the browser

```
1. Start all services:    cd hmis-system && ./start-all.sh
2. Open:                  http://localhost:4200/login
3. Login:                 reception_jane / password
4. Click:                 + Register Patient → fill form → save
5. Click:                 Appointments → book one
6. Try to break:          type /admin/users in URL → redirected away
```

## In 60 seconds: try it on the command line

```bash
# Login as reception_jane and capture JWT
T=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"reception_jane","password":"password"}' \
     | jq -r '.accessToken')

# Allowed
curl -s http://localhost:8080/api/v1/patients     -H "Authorization: Bearer $T" | jq '.totalElements'
curl -s http://localhost:8080/api/v1/appointments -H "Authorization: Bearer $T" | jq '.totalElements'

# Blocked (returns 403)
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/v1/lab/orders -H "Authorization: Bearer $T"
```

## What does reception_jane see vs. an unrestricted user?

|                       | reception_jane     | hospital_admin |
|-----------------------|--------------------|----------------|
| Dashboard             | ✓                  | ✓ |
| Patients list         | ✓                  | ✓ |
| Register Patient      | ✓                  | ✓ |
| Appointments          | ✓                  | ✓ |
| Lab                   | ✗ (sidebar hidden, route blocked, API 403) | ✓ |
| Pharmacy              | ✗                  | ✓ |
| Billing               | ✗                  | ✓ |
| Reports               | ✗                  | ✓ |
| Admin → Users / Roles | ✗                  | ✓ |

## To re-create the same setup in a fresh DB

Run the automated script:

```bash
./docs/receptionist-rbac/test_receptionist.sh
```

This creates a fresh group, role, and user (with a timestamp suffix to avoid uniqueness conflicts) and verifies the full chain in ~3 seconds.
