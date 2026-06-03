# API Documentation — HMIS

**Base URL (via gateway):** `https://api.hmis.local` (local: `http://localhost:8080`)
**Versioning:** URI (`/api/v1/...`)
**Auth:** Bearer JWT in `Authorization` header (issued by `auth-service`)
**Content-Type:** `application/json` (errors use `application/problem+json`)

> Each service additionally exposes OpenAPI at `/v3/api-docs` and Swagger UI at `/swagger-ui.html`.

---

## 1. Authentication — `auth-service`

### 1.1 Login

```
POST /api/v1/auth/login
Content-Type: application/json

{ "username": "drrao", "password": "********" }
```

**200 OK**

```json
{
  "accessToken":  "eyJhbGciOiJSUzI1NiIsInR...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR...",
  "tokenType":    "Bearer",
  "expiresIn":    900,
  "roles":        ["DOCTOR"]
}
```

### 1.2 Refresh

```
POST /api/v1/auth/refresh
{ "refreshToken": "..." }
```

### 1.3 MFA

```
POST /api/v1/auth/mfa/enrol         → { "otpauthUri": "otpauth://totp/..." }
POST /api/v1/auth/mfa/verify        { "code": "123456" }
```

### 1.4 JWK Set

```
GET /.well-known/jwks.json
```

---

## 2. Patient — `patient-service`

### 2.1 Register patient

```
POST /api/v1/patients
```

```json
{
  "firstName": "Meera",
  "lastName":  "Patel",
  "dob":       "1990-05-14",
  "gender":    "F",
  "phone":     "+919812345678",
  "email":     "meera@example.com",
  "address":   "12 Park Lane, Aligarh",
  "bloodGroup":"O+"
}
```

**201 Created**

```json
{ "id": 101, "mrn": "H001-2026-000101" }
```

### 2.2 Get / Update / Delete

```
GET    /api/v1/patients/{id}
PUT    /api/v1/patients/{id}
DELETE /api/v1/patients/{id}
GET    /api/v1/patients?search=meera&page=0&size=20
```

### 2.3 Appointments

```
POST /api/v1/appointments
```

```json
{
  "patientId": 101,
  "doctorId":  22,
  "slotStart": "2026-05-01T10:00:00+05:30",
  "slotEnd":   "2026-05-01T10:20:00+05:30",
  "reason":    "Fever, 3 days"
}
```

```
GET /api/v1/appointments?doctorId=22&date=2026-05-01
```

---

## 3. Clinical — `doctor-service`

```
POST /api/v1/consultations            create a consultation
GET  /api/v1/consultations/{id}
POST /api/v1/diagnoses                { "encounterId":1, "icd10":"R50.9" }
POST /api/v1/treatment-plans
POST /api/v1/clinical-notes           { "encounterId":1, "soap": {...} }
POST /api/v1/discharge-summaries
```

---

## 4. Lab — `lab-service`

```
POST /api/v1/lab/tests                master data (admin)
POST /api/v1/lab/orders               { "patientId":..., "testCode":"CBC" }
POST /api/v1/lab/samples              { "orderId":..., "barcode":"SB-001" }
PUT  /api/v1/lab/samples/{id}/state   { "state":"RECEIVED" }
POST /api/v1/lab/results              { "orderId":..., "value":"12.5", "unit":"g/dL" }
GET  /api/v1/lab/results?patientId=101
```

HL7 ingest is internal (not exposed through gateway); see `integrations/hl7`.

---

## 5. Pharmacy — `pharmacy-service`

```
POST /api/v1/medicines                 medicine master
POST /api/v1/medicine-batches          batch receipt (inventory)
GET  /api/v1/medicines?search=parace&page=0&size=20
POST /api/v1/prescriptions
POST /api/v1/dispenses                 { "prescriptionId":..., "batchId":..., "qty":10 }
GET  /api/v1/pharmacy/stock-alerts     low stock / near-expiry
```

---

## 6. Billing — `billing-service`

```
POST /api/v1/invoices
GET  /api/v1/invoices/{id}
POST /api/v1/payments
POST /api/v1/claims
GET  /api/v1/claims/{id}
```

### 6.1 Create invoice

```json
{
  "patientId": 101,
  "encounterId": 55,
  "items": [
    { "itemType":"CONSULT", "description":"Out-patient consult", "qty":1, "unitPrice":500, "tax":90 },
    { "itemType":"LAB",     "description":"CBC",                 "qty":1, "unitPrice":350, "tax":63 }
  ]
}
```

### 6.2 Record payment

```json
{
  "invoiceId": 9001,
  "method":    "UPI",
  "amount":    1003.00,
  "txnRef":    "UPI/xxxx/abcd"
}
```

---

## 7. Reporting — `reporting-service`

```
GET /api/v1/reports/mis/daily?site=MAIN&date=2026-04-23
GET /api/v1/reports/revenue?from=2026-04-01&to=2026-04-30&groupBy=department
GET /api/v1/reports/powerbi/invoices?$top=1000&$skip=0&$filter=status%20eq%20%27PAID%27
```

---

## 8. Common Response Objects

### 8.1 Problem+JSON

```json
{
  "type":     "https://hmis.example.com/errors/not-found",
  "title":    "Resource not found",
  "status":   404,
  "detail":   "Patient 101 not found",
  "instance": "/api/v1/patients/101",
  "traceId":  "a1b2c3d4..."
}
```

### 8.2 Page envelope

```json
{
  "content":       [ /* items */ ],
  "pageNumber":    0,
  "pageSize":      20,
  "totalElements": 124,
  "totalPages":    7
}
```

## 9. Status Codes (summary)

| Code | Meaning                                       |
|------|-----------------------------------------------|
| 200  | OK                                            |
| 201  | Created (mutating endpoints return `id`)      |
| 202  | Accepted (soft duplicate / async submission)  |
| 204  | No Content                                    |
| 400  | Validation error                              |
| 401  | Unauthenticated / token expired               |
| 403  | Forbidden (RBAC deny)                         |
| 404  | Not found                                     |
| 409  | Conflict (duplicate, overlap, version)        |
| 422  | Unprocessable (business-rule violation)       |
| 429  | Rate-limited                                  |
| 500  | Server error                                  |

## 10. Headers

- `Authorization: Bearer <jwt>` (required for all `/api/*` except login/refresh)
- `Idempotency-Key: <uuid>` (recommended for POST payments, invoices, dispenses)
- `traceparent:` — propagated trace context (W3C)

---

## 11. Prescription Service — `prescription-service`

```
POST /api/v1/prescriptions                  create prescription
GET  /api/v1/prescriptions/{id}             get prescription details
PUT  /api/v1/prescriptions/{id}             modify prescription (before dispensing)
POST /api/v1/prescriptions/{id}/sign        sign/approve prescription
POST /api/v1/prescriptions/{id}/cancel      cancel prescription
POST /api/v1/prescriptions/{id}/notes/add   add clinical notes to prescription
GET  /api/v1/prescriptions/patient/{id}    get patient prescription history
```

**Create Prescription Request**
```json
{
  "encounterId": 55,
  "patientId": 101,
  "items": [
    {
      "medicineId": 5,
      "dose": "500mg",
      "frequency": "Twice daily",
      "durationDays": 5,
      "qty": 10,
      "instructions": "Take with food",
      "clinicalReason": "For fever management"
    }
  ],
  "clinicalNotes": "Patient allergic to sulfa drugs"
}
```

---

## 12. Medical Records Service — `medical-records-service`

```
GET  /api/v1/patients/{id}/complete-record     get full medical history
GET  /api/v1/patients/{id}/allergies           get patient allergies
POST /api/v1/patients/{id}/allergies           add allergy record
GET  /api/v1/patients/{id}/medications         get medication history
GET  /api/v1/patients/{id}/diagnoses           get diagnosis history
GET  /api/v1/patients/{id}/consultations       get consultation history
GET  /api/v1/patients/{id}/documents           get uploaded medical documents
POST /api/v1/patients/{id}/documents           upload medical document (X-ray, ECG, etc.)
GET  /api/v1/patients/{id}/vitals              get vital signs history
```

**Add Allergy Request**
```json
{
  "allergen": "Penicillin",
  "reactionType": "Anaphylaxis",
  "severity": "SEVERE"
}
```

**Upload Document Request**
```json
{
  "type": "XRAY",
  "fileUrl": "s3://hmis-bucket/patient-101/xray-chest-20260525.pdf"
}
```

---

## 13. Clinical Support Service — `clinical-support-service`

```
POST /api/v1/clinical/check-interactions       check drug-drug interactions
POST /api/v1/clinical/check-contraindications  check medicine contraindications
GET  /api/v1/clinical/dosage-guidelines/{drugCode}  get standard dosing guidelines
GET  /api/v1/clinical/audit-trail/{doctorId}  get prescribing audit trail
POST /api/v1/clinical/allergy-alert            check allergy alerts
```

**Check Interactions Request**
```json
{
  "drug1Id": 5,
  "drug2Id": 12
}
```

**Response**
```json
{
  "drug1Id": 5,
  "drug2Id": 12,
  "interactionLevel": "MODERATE",
  "severity": "MEDIUM",
  "description": "Increased risk of GI bleeding. Monitor PT/INR closely.",
  "timestamp": "2026-05-25T10:30:00Z"
}
```

---

## 14. IPD Service (In-Patient Department) — `ipd-service`

```
POST /api/v1/ipd/admissions                    create admission
GET  /api/v1/ipd/admissions/{id}              get admission details
POST /api/v1/ipd/bed-assignment                assign bed to patient
POST /api/v1/ipd/discharges                    discharge patient
GET  /api/v1/ipd/ward/{wardId}/census          get ward occupancy
GET  /api/v1/ipd/wards                         get all wards status
GET  /api/v1/ipd/patients/{patientId}/current-admission  get current admission
```

**Create Admission Request**
```json
{
  "patientId": 101,
  "doctorId": 22,
  "admissionType": "PLANNED",
  "reason": "Appendectomy",
  "expectedStay": 3
}
```

**Assign Bed Request**
```json
{
  "wardId": 1,
  "bedNumber": "ICU-B5",
  "admissionId": 55
}
```

**Discharge Request**
```json
{
  "admissionId": 55,
  "dischargeType": "HOME",
  "dischargeSummary": "Patient recovered well. Continue medications. Follow-up in 2 weeks.",
  "followUpDate": "2026-06-08"
}
```

---

## 15. Notification Service — `notification-service`

```
POST /api/v1/notifications/messages            send doctor-patient message
GET  /api/v1/notifications/messages            get message inbox
POST /api/v1/notifications                     send notification (admin only)
POST /api/v1/notifications/appointment-reminders  schedule appointment reminder
GET  /api/v1/notifications/user                get user notifications
PUT  /api/v1/notifications/{id}/read           mark notification as read
```

**Send Message Request**
```json
{
  "recipientId": 101,
  "subject": "Prescription Ready",
  "body": "Your prescribed antibiotics are ready for pickup at pharmacy.",
  "messageType": "CLINICAL"
}
```

**Appointment Reminder Request**
```json
{
  "appointmentId": 123,
  "patientId": 101,
  "reminderType": "BOTH",
  "hoursBeforeAppointment": 24
}
```

## 11. Rate Limits

Default: **100 rps** per token, burst 200 (configured at gateway). Customisable per role.
