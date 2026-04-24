# Low-Level Design (LLD) — HMIS

**Version:** 1.0

---

## 1. Purpose

This document specifies internal class design, database schemas, API contracts, and collaboration patterns within each microservice. It complements `docs/HLD/high_level_design.md`.

## 2. Service-Internal Class Design

Common pattern per Node.js service (e.g. `patient-service`):

```
services/patient-service/
├── package.json
├── Dockerfile
├── .env.example
└── src/
   ├── index.js                 # bootstrap (connects to MySQL, starts app)
   ├── app.js                   # Express app factory
   ├── config/index.js          # env parsing via dotenv
   ├── db/sequelize.js          # Sequelize instance (mysql2 dialect)
   ├── models/                  # Sequelize model definitions
   │    ├── Patient.js
   │    ├── Appointment.js
   │    └── index.js            # associations
   ├── services/                # business rules + transactions
   │    ├── patient.service.js
   │    └── appointment.service.js
   ├── controllers/             # HTTP: Joi validation, route wiring
   │    ├── patient.controller.js
   │    └── appointment.controller.js
   ├── middleware/
   │    ├── auth.js             # bearer JWT + X-User-* header propagation
   │    ├── validate.js         # Joi-backed validator
   │    └── errorHandler.js     # RFC 7807 ProblemDetails
   └── utils/
        ├── logger.js           # Winston JSON logs
        └── errors.js           # HttpError factories
```

### 2.1 Class Diagram (textual) — Patient context

```
Patient 1 ── * Appointment
Patient 1 ── * Encounter
Encounter 1 ── * Diagnosis
Encounter 1 ── * Prescription
Encounter 1 ── * LabOrder
```

### 2.2 Responsibility Allocation

- **Controller** — HTTP concerns only: Joi validation, response shaping, status codes.
- **Service** — Business rules, orchestration, `sequelize.transaction()` boundaries.
- **Models (Sequelize)** — Data access, scoped queries, associations.
- **Middleware** — Cross-cutting: auth, validation, error translation.
- **Config** — loaded from `process.env` via `dotenv`, typed at import time.

## 3. Database Design

See `database/schema.sql` for the canonical DDL. Highlights:

### 3.1 Patient DB

```
patient(id PK, mrn UQ, first_name, last_name, dob, gender, phone, email,
        address, emergency_contact, blood_group, created_at, updated_at)
appointment(id PK, patient_id FK, doctor_id, slot_start, slot_end,
            status, reason, created_at)
encounter(id PK, patient_id FK, type, admitted_at, discharged_at, summary)
```

Indexes:
- `patient_last_first_dob_idx` on `(last_name, first_name, dob)` — duplicate detection.
- `appointment_doctor_slot_idx` on `(doctor_id, slot_start)` — overlap check.

### 3.2 Clinical DB

```
diagnosis(id PK, encounter_id FK, icd10, notes, diagnosed_at)
clinical_note(id PK, encounter_id FK, author_id, soap JSONB, signed_at)
treatment_plan(id PK, encounter_id FK, template_id, plan JSONB)
```

### 3.3 Lab DB

```
lab_test(id PK, code UQ, name, loinc, reference_range JSONB)
lab_order(id PK, patient_id, doctor_id, test_id FK, status, ordered_at)
lab_sample(id PK, order_id FK, barcode UQ, state, collected_at)
lab_result(id PK, order_id FK, value, unit, flag, resulted_at)
```

### 3.4 Pharmacy DB

```
medicine(id PK, code UQ, name, generic_name, form, strength, mrp)
medicine_batch(id PK, medicine_id FK, batch_no, expiry, stock_on_hand)
prescription(id PK, patient_id, doctor_id, encounter_id, created_at)
prescription_item(id PK, prescription_id FK, medicine_id FK, dose, frequency, duration_days)
dispense(id PK, prescription_id FK, batch_id FK, qty, dispensed_at)
```

### 3.5 Billing DB

```
invoice(id PK, patient_id, encounter_id, total_amount, status, created_at)
invoice_item(id PK, invoice_id FK, item_type, description, qty, unit_price, tax, total)
payment(id PK, invoice_id FK, method, amount, txn_ref, status, paid_at)
insurance_claim(id PK, invoice_id FK, payer_code, claim_no, status, response JSONB)
```

### 3.6 Auth DB

```
hmis_user(id PK, username UQ, email UQ, password_hash, mfa_secret, status, created_at)
role(id PK, code UQ)
user_role(user_id FK, role_id FK, PK(user_id, role_id))
login_audit(id PK, user_id, ip, user_agent, outcome, at)
```

## 4. API Structure (representative subset)

### 4.1 Patient Service

```
POST   /api/v1/patients                     body: PatientDto          → 201 {id}
GET    /api/v1/patients/{id}                                            → 200 PatientDto
PUT    /api/v1/patients/{id}                body: PatientDto          → 200 PatientDto
DELETE /api/v1/patients/{id}                                            → 204
GET    /api/v1/patients?search=&page=&size=                              → 200 Page<Patient>

POST   /api/v1/appointments                 body: AppointmentDto       → 201 {id}
GET    /api/v1/appointments?doctorId=&date=                              → 200 List<...>
```

### 4.2 Billing Service

```
POST   /api/v1/invoices                     body: InvoiceDto           → 201 {id}
GET    /api/v1/invoices/{id}                                             → 200 InvoiceDto
POST   /api/v1/payments                     body: PaymentDto           → 201 {id}
POST   /api/v1/claims                       body: ClaimDto             → 201 {id}
```

Full API listing: `docs/API_DOCS/api_documentation.md`.

## 5. Key Algorithms

### 5.1 Duplicate Patient Detection

1. Normalise first/last name (lowercase, trim, strip diacritics).
2. Hash `(last, first, dob, phone_last_4)`.
3. Lookup by hash; if match → return 409 with candidate(s).
4. On soft-match (Levenshtein ≤ 2 on surname + DOB equal), return 202 with candidates for front-desk confirmation.

### 5.2 Appointment Overlap Check

```
SELECT 1 FROM appointment
WHERE doctor_id = :d AND status IN ('BOOKED','IN_PROGRESS')
  AND tstzrange(slot_start, slot_end) && tstzrange(:s, :e);
```

If present, reject with 409.

### 5.3 Idempotency

`Idempotency-Key` header stored with request hash + response for 24h in Redis. Replays within TTL return stored response.

## 6. Error Handling

RFC 7807 `application/problem+json`:

```json
{
  "type": "https://hmis.example.com/errors/duplicate-patient",
  "title": "Duplicate patient detected",
  "status": 409,
  "detail": "Patient with same name and DOB exists",
  "instance": "/api/v1/patients",
  "candidates": ["H001-2026-000123"]
}
```

Every service has a `GlobalExceptionHandler` that maps domain exceptions to problem+json.

## 7. Caching Strategy

| Cache                 | Key                                      | TTL   | Invalidation               |
|-----------------------|------------------------------------------|-------|----------------------------|
| Patient search by q   | `patient:search:{hash(q)}:{page}`        | 60s   | write-through on update    |
| Tariff master         | `tariff:{site}:{version}`                | 1h    | version bump on change     |
| DDI lookup            | `ddi:{medA}:{medB}`                      | 24h   | nightly refresh            |
| JWK set               | `jwk:kid:{kid}`                          | 10m   | on rotation                |

## 8. Concurrency & Transactions

- Optimistic locking (`@Version`) on mutable aggregates (patient, invoice, inventory).
- Read-modify-write on inventory uses `SELECT ... FOR UPDATE` within transaction.
- Long-running flows (claim submission) use saga-style compensation, not distributed transactions.

## 9. Observability

- Every request assigned a `traceparent`; propagated to downstream services.
- Structured logs: `{ts, level, service, traceId, spanId, userId, msg, ...ctx}`.
- Prometheus metrics: `http_server_requests_seconds`, custom `hmis_*` counters/histograms.
- Health: `/actuator/health`, readiness via DB + Redis pings.

## 10. Testing Design

- Unit: JUnit 5 + Mockito. Focus on service layer.
- Integration: Testcontainers (MySQL, Redis) + RestAssured.
- Contract: Pact for inter-service contract tests.
- E2E: Playwright for the Angular app.
- Security: OWASP ZAP CI stage + dependency scans (OWASP, Trivy).
