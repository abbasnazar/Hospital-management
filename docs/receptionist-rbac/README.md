# Receptionist RBAC — End-to-End Flow

This document captures the complete flow for a **Hospital Admin** to create a permission group, attach it to a role, and assign that role to a Receptionist user — using only the application UI and APIs (no database edits or code changes required at runtime).

---

## Concept

```
SUPERADMIN
  └─ creates organization "City General Hospital"
  └─ creates Hospital Admin user (assigned to that org)
        │
        ▼
HOSPITAL ADMIN (logged in, scoped to their org)
  ├─ Step A: Group   "Junior Receptionist"
  │            └─ functionalities: patients.view, patients.create,
  │                                appointments.view, appointments.create, dashboard.view
  ├─ Step B: Role    "Receptionist"
  │            └─ groups: [Junior Receptionist]
  └─ Step C: User    reception_jane
               └─ role: Receptionist
                        │
                        ▼
RECEPTIONIST (reception_jane)
  Effective permissions = union of all functionalities from all groups
                          across all assigned roles
  → can register patients, book appointments, see dashboard
  → cannot see lab, pharmacy, billing, reports, admin pages
```

The same "Junior Receptionist" group can be re-used in multiple roles (e.g. a *Senior Receptionist* role that contains *Junior Receptionist* + *Billing* groups).

---

## Test users

| Username           | Password   | Role               | Used for                            |
|--------------------|------------|--------------------|--------------------------------------|
| `superadmin`       | `password` | SUPERADMIN         | Manage categories & admin accounts   |
| `hospital_admin`   | `password` | ADMIN              | Manage groups, roles, users          |
| `reception_jane`   | `password` | (custom) Receptionist | Receptionist test user             |

The custom-perm-role users (like `reception_jane`) have **empty `roles` array** and a populated `funcs` array in their JWT — access is driven by functionalities, not legacy role strings.

---

## Step-by-step: Admin creates Receptionist (UI)

### Prerequisites
- Backend running (`./start-all.sh` or services on 8080-8087)
- Frontend running (`npm start` in `frontend/angular-app/` on port 4200)

### 1. Login as Hospital Admin
1. Open <http://localhost:4200/login>
2. Username: `hospital_admin`, password: `password`
3. You land on the Dashboard. Sidebar shows the **Admin** section.

### 2. Create the Group
1. Sidebar → **Admin → Groups**
2. Click **+ New Group**
3. Fill in:
   - Name: `Junior Receptionist`
   - Description: `Patient registration + appointment booking`
4. **Tick** the 5 checkboxes:
   - ✅ View Dashboard (`dashboard.view`)
   - ✅ View Patients (`patients.view`)
   - ✅ Register Patient (`patients.create`)
   - ✅ View Appointments (`appointments.view`)
   - ✅ Book Appointment (`appointments.create`)
5. Click **Create Group**. The group appears in the list with its 5 blue badges.

### 3. Create the Role
1. Sidebar → **Admin → Roles**
2. Click **+ New Role**
3. Fill in:
   - Code: `RECEPTIONIST`
   - Name: `Receptionist`
   - Description: `Front desk staff`
4. **Tick** the *Junior Receptionist* group checkbox.
5. Click **Create Role**. The role appears with its green group badge.

### 4. Create the User
1. Sidebar → **Admin → Users**
2. Click **+ Create User**
3. Fill in:
   - Username: `reception_jane`
   - Email: `jane@hospital.local`
   - Password: `password`
   - Assign Role: `Receptionist (RECEPTIONIST)`
4. Click **Create User**. The user appears in the table.

### 5. Verify as Receptionist
1. Click **Logout** (bottom-left).
2. Login as `reception_jane` / `password`.
3. **Dashboard** shows:
   - Total Patients
   - Appointments Today
   - Upcoming Appointments
   - List of today's & upcoming appointments with doctor names
   - Quick actions: *+ Register Patient*, *Book Appointment*, *View All Patients*
4. Sidebar contains **only** Dashboard, Patients, Appointments.
5. Direct-URL test: typing `/lab` or `/reports` in the address bar redirects back to dashboard (route guard blocked).

---

## Step-by-step: Admin creates Receptionist (API only)

For automation / scripts. Run after `./start-all.sh` is up.

```bash
BASE="http://localhost:8080/api/v1/auth"

# 1. Login as Hospital Admin
TOKEN=$(curl -s -X POST $BASE/login \
  -H "Content-Type: application/json" \
  -d '{"username":"hospital_admin","password":"password"}' | jq -r '.accessToken')

# 2. Fetch functionality IDs
FUNCS=$(curl -s $BASE/admin/functionalities -H "Authorization: Bearer $TOKEN")
IDS=$(echo $FUNCS | jq '[.[] | select(.code | IN("dashboard.view","patients.view","patients.create","appointments.view","appointments.create")) | .id]')

# 3. Create group
GROUP_ID=$(curl -s -X POST $BASE/admin/groups \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"name\":\"Junior Receptionist\",\"description\":\"Patient + appt booking\",\"functionalityIds\":$IDS}" \
  | jq '.id')

# 4. Create role with that group
ROLE_ID=$(curl -s -X POST $BASE/admin/roles \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"code\":\"RECEPTIONIST\",\"name\":\"Receptionist\",\"groupIds\":[$GROUP_ID]}" \
  | jq '.id')

# 5. Create user with that role
curl -s -X POST $BASE/admin/users \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d "{\"username\":\"reception_jane\",\"email\":\"jane@hospital.local\",\"password\":\"password\",\"permRoleId\":$ROLE_ID}"

# 6. Verify the new user's effective permissions
curl -s -X POST $BASE/login \
  -H "Content-Type: application/json" \
  -d '{"username":"reception_jane","password":"password"}' | jq '{roles, funcs}'
```

Expected output of step 6:
```json
{
  "roles": [],
  "funcs": [
    "dashboard.view",
    "patients.view",
    "patients.create",
    "appointments.view",
    "appointments.create"
  ]
}
```

---

## Test results

The end-to-end automated test (`test_receptionist.sh` in this folder) verifies the entire flow. See [TEST_RESULTS.md](./TEST_RESULTS.md) for the full captured run.

**Summary:**

| # | Check | Result |
|---|-------|--------|
| 1 | Hospital Admin login                                              | ✓ |
| 2 | Fetch 15 base functionalities                                     | ✓ |
| 3 | Create group "Junior Receptionist" with 5 functionalities         | ✓ |
| 4 | Create role "Receptionist" with the group                         | ✓ |
| 5 | Create user `reception_jane` with that role                       | ✓ |
| 6 | reception_jane login returns correct `funcs` array                | ✓ |
| 7 | reception_jane can GET `/patients`                                | ✓ |
| 8 | reception_jane can POST `/patients` (register a new patient)      | ✓ |
| 9 | reception_jane can GET `/appointments`                            | ✓ |
| 10 | reception_jane gets HTTP 403 on `/lab/orders`                    | ✓ |
| 11 | reception_jane gets HTTP 403 on `/reports/mis/daily`             | ✓ |

---

## Files touched to support this flow

### Frontend
| Path | Change |
|---|---|
| `frontend/angular-app/src/app/dashboard/dashboard.component.ts` | Added receptionist dashboard with `totalPatients`, `apptsToday`, `apptsUpcoming`, and "Today's & Upcoming Appointments" table with doctor names. Made detection func-based (`isReceptionist()`) so custom-perm-role users also see it. |
| `frontend/angular-app/src/app/app.routes.ts` | `/patients`, `/patients/new`, `/appointments` now use `requireRolesOrFuncs(roles, funcs)` so custom-perm-role users pass the guard. |
| `frontend/angular-app/src/app/core/guards/role.guard.ts` | Added `requireRolesOrFuncs(roles, funcs)` factory. |
| `frontend/angular-app/src/app/app.component.ts` | Sidebar Patients/Appointments links also show when `auth.hasFunc('patients.view' | 'appointments.view')`. |

### Backend
| Path | Change |
|---|---|
| `services/patient-service/src/middleware/auth.js` | `authRequired` now extracts `funcs` from JWT. `requireRoles(...)` falls back to checking funcs via a `ROLE_FUNCS` map, so custom-perm-role users with equivalent funcs are accepted. |
| `gateway/api-gateway/src/jwt.js` | Gateway now reads `funcs` from the JWT and propagates them downstream via the `X-User-Funcs` header alongside `X-User-Roles`. |

---

## How the permission chain works at runtime

```
Browser (reception_jane)
   │  Bearer <jwt with funcs=["patients.view","patients.create",…]>
   ▼
API Gateway (8080)
   │  Verifies JWT → sets X-User-Roles / X-User-Funcs headers
   ▼
Patient Service (8082)
   │  authRequired: parses JWT (or X-User-* headers) into req.user
   │  requireRoles('ADMIN','RECEPTIONIST'):
   │    1. req.user.roles is [] → no system-role match
   │    2. Falls back to ROLE_FUNCS map:
   │         RECEPTIONIST → ["patients.create",…]
   │       req.user.funcs contains "patients.create" → ✓ allow
   ▼
Controller handler runs → returns data
```

This design lets the platform keep its legacy role names in code while allowing admins to grant equivalent access through the functionalities UI without code changes.
