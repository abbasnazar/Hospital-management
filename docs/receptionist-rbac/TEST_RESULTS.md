# Receptionist RBAC — Test Results

Captured: 2026-05-25

## Section 1 — Automated end-to-end test

Source: [test_receptionist.sh](./test_receptionist.sh)

```
===========================================
RECEPTIONIST RBAC FLOW - END-TO-END TEST
===========================================

[Step 1] Hospital Admin login...
  ✓ Logged in as hospital_admin (token len: 732)

[Step 2] Fetching available functionalities...
  ✓ patients.view=2 patients.create=3 appointments.view=4 appointments.create=5 dashboard.view=1

[Step 3] Creating GROUP 'Junior Receptionist'...
  ✓ Group id=21, functionalities:
    - dashboard.view (View Dashboard)
    - patients.view (View Patients)
    - patients.create (Register Patient)
    - appointments.view (View Appointments)
    - appointments.create (Book Appointment)

[Step 4] Creating ROLE 'Receptionist'...
  ✓ Role id=22, name=Receptionist 1779694243
  Groups: Junior Receptionist 1779694243

[Step 5] Creating USER 'reception_jane_1779694243'...
  ✓ User id=37

[Step 6] Logging in as reception_jane_1779694243...
  ✓ System roles: []
  ✓ Effective funcs: ["dashboard.view","patients.view","patients.create","appointments.view","appointments.create"]

[Step 7] Assertions...
  ✓ has dashboard.view
  ✓ has patients.view
  ✓ has patients.create
  ✓ has appointments.view
  ✓ has appointments.create
  ✓ correctly denied lab.view
  ✓ correctly denied pharmacy.view
  ✓ correctly denied billing.view
  ✓ correctly denied reports.view
  ✓ correctly denied admin.users

🎉 ALL CHECKS PASSED
```

## Section 2 — Live API access verification

The auth-only test above proves the JWT contains the right `funcs`. This section proves the downstream microservices honor those funcs end-to-end through the API gateway.

```
[API 1] GET /api/v1/patients
{
  "total": 5,
  "names": [
    "Test PatientByJane",
    "John Doe",
    "Aarav Khan"
  ]
}

[API 2] POST /api/v1/patients (create new patient)
{
  "id": 7,
  "mrn": "MRN000007",
  "firstName": "Demo",
  "lastName": "DocCreated"
}

[API 3] GET /api/v1/appointments
{
  "total": 6
}

[API 4] GET /api/v1/lab/orders (must be 403)
  HTTP 403

[API 5] GET /api/v1/reports/mis/daily (must be 403)
  HTTP 403
```

## Section 3 — Summary matrix

| # | Check                                                             | Expected | Actual | Result |
|---|-------------------------------------------------------------------|---------|--------|--------|
| 1 | hospital_admin login                                              | 200 + ADMIN role | 200 + ADMIN | ✓ |
| 2 | List 15 base functionalities                                      | 15 items | 15 items | ✓ |
| 3 | Create group "Junior Receptionist"                                | 201 + 5 funcs | 201 + 5 funcs | ✓ |
| 4 | Create role "Receptionist"                                        | 201 + 1 group | 201 + 1 group | ✓ |
| 5 | Create user reception_jane                                        | 201 + role assigned | 201 + role assigned | ✓ |
| 6 | reception_jane login returns 5 funcs                              | 5 funcs   | 5 funcs | ✓ |
| 7 | reception_jane GET /patients                                      | 200 + list | 200 + 5 patients | ✓ |
| 8 | reception_jane POST /patients                                     | 201 + new patient | 201, MRN000007 | ✓ |
| 9 | reception_jane GET /appointments                                  | 200 + list | 200 + 6 appts | ✓ |
| 10 | reception_jane GET /lab/orders                                   | 403       | 403 | ✓ |
| 11 | reception_jane GET /reports/mis/daily                            | 403       | 403 | ✓ |
| 12 | Sidebar shows only Dashboard/Patients/Appointments (manual UI check) | only 3 links | only 3 links | ✓ |
| 13 | Direct-URL `/admin/users` redirects to dashboard (manual UI check) | redirect | redirect | ✓ |

**All 13 checks passed.**
