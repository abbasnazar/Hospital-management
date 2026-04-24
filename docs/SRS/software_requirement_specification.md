# Software Requirements Specification (SRS) — HMIS

**Version:** 1.0
**Standard referenced:** IEEE 830 (adapted)

---

## 1. Introduction

### 1.1 Purpose

This SRS defines the functional and non-functional requirements for the HMIS platform, acting as the contract between stakeholders and the engineering team.

### 1.2 Scope

HMIS is a microservice-based system providing patient administration, clinical, laboratory, pharmacy, billing, and reporting services exposed through a gateway to web and mobile clients and to external systems over HL7 v2.x, FHIR R4 and DICOM.

### 1.3 Definitions

- **MRN** — Medical Record Number
- **ADT** — Admission / Discharge / Transfer (HL7 message family)
- **ORU** — Observation Result (HL7)
- **ORM** — Order Message (HL7)
- **PHI** — Protected Health Information
- **DDI** — Drug-Drug Interaction
- **RBAC** — Role-Based Access Control

## 2. Overall Description

### 2.1 Product Perspective

HMIS is a greenfield product. It replaces the registration, LIS and pharmacy inventory systems and integrates with the existing ERP (nightly GL sync) and PACS (DICOM).

### 2.2 User Classes

Seven primary roles: `ADMIN`, `DOCTOR`, `NURSE`, `LAB_TECH`, `PHARMACIST`, `RECEPTIONIST`, `PATIENT`.

### 2.3 Operating Environment

- Backend: Linux containers on Kubernetes (x86_64)
- Frontend: Evergreen browsers (Chrome, Edge, Firefox, Safari, latest 2 versions)
- Mobile: Responsive web only (v1)

### 2.4 Assumptions

- TLS termination at the ingress / gateway.
- MySQL available as a managed service (RDS / Azure DB).
- Redis available as a managed service (ElastiCache / Azure Cache).

## 3. Functional Requirements

Requirements use the pattern `FR-<module>-<n>`.

### 3.1 Patient (FR-P)

| ID    | Requirement                                                                                         |
|-------|-----------------------------------------------------------------------------------------------------|
| FR-P1 | The system shall register a patient capturing demographics, contacts and identifiers.               |
| FR-P2 | The system shall generate a unique MRN automatically at registration.                                |
| FR-P3 | The system shall detect duplicate patients using name, DOB and phone.                                |
| FR-P4 | The system shall support appointment booking across departments and doctors.                         |
| FR-P5 | The system shall maintain a chronological patient history including visits, labs, prescriptions.     |
| FR-P6 | The system shall generate discharge summaries with clinician e-signature.                            |

### 3.2 Clinical (FR-C)

| ID    | Requirement                                                                              |
|-------|------------------------------------------------------------------------------------------|
| FR-C1 | The system shall allow a doctor to capture SOAP consultation notes.                      |
| FR-C2 | The system shall record diagnoses with ICD-10 codes.                                     |
| FR-C3 | The system shall capture treatment plans referencing pathway templates.                  |
| FR-C4 | The system shall allow clinicians to write, edit (within 24h) and sign clinical notes.   |

### 3.3 Lab (FR-L)

| ID    | Requirement                                                                                |
|-------|--------------------------------------------------------------------------------------------|
| FR-L1 | The system shall accept lab orders from clinicians and route to the appropriate section.   |
| FR-L2 | The system shall track samples through states: `COLLECTED`, `RECEIVED`, `IN_PROGRESS`, `RESULTED`, `CANCELLED`. |
| FR-L3 | The system shall accept HL7 ORU messages from analysers and attach results to the order.   |
| FR-L4 | The system shall flag results outside reference ranges and notify the ordering clinician.  |

### 3.4 Pharmacy (FR-Ph)

| ID     | Requirement                                                                          |
|--------|--------------------------------------------------------------------------------------|
| FR-Ph1 | The system shall maintain medicine inventory with batch, lot, expiry and MRP.        |
| FR-Ph2 | The system shall dispense medicines against prescriptions or OTC sales.              |
| FR-Ph3 | The system shall surface DDI alerts using a configured interaction database.         |
| FR-Ph4 | The system shall raise low-stock and near-expiry alerts.                             |

### 3.5 Billing (FR-B)

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| FR-B1 | The system shall generate invoices per encounter or per service group.      |
| FR-B2 | The system shall accept payments via cards, UPI, wallets and cash.          |
| FR-B3 | The system shall submit insurance claims and track their status.            |
| FR-B4 | The system shall support refunds with supervisor override.                  |

### 3.6 Reporting (FR-R)

| ID    | Requirement                                                                 |
|-------|-----------------------------------------------------------------------------|
| FR-R1 | The system shall expose operational and revenue reports via REST endpoints. |
| FR-R2 | The system shall support filtering by date, site, department and payer.     |
| FR-R3 | The system shall expose Power BI–compatible paged endpoints.                |

### 3.7 Auth (FR-A)

| ID    | Requirement                                                                                    |
|-------|------------------------------------------------------------------------------------------------|
| FR-A1 | The system shall issue JWT access tokens signed with RS256.                                    |
| FR-A2 | The system shall support TOTP MFA (RFC 6238) optionally enforced per role.                     |
| FR-A3 | The system shall support role-based access control per the matrix in Appendix A.               |
| FR-A4 | The system shall lock accounts after 5 consecutive failed logins in 10 minutes.                |

## 4. Non-Functional Requirements

### 4.1 Performance

- NFR-PERF-1: API p95 latency ≤ 300 ms under 200 concurrent users per service.
- NFR-PERF-2: Patient search returns within 800 ms for 1M-row table.
- NFR-PERF-3: Reports render (server-side) within 3 seconds for 90-day range.

### 4.2 Scalability

- NFR-SCALE-1: Horizontal scaling of each service to ≥ 10 replicas.
- NFR-SCALE-2: Stateless services (session in Redis).

### 4.3 Availability

- NFR-AV-1: ≥ 99.9% monthly availability.
- NFR-AV-2: RPO ≤ 15 min; RTO ≤ 60 min (production).

### 4.4 Security

- NFR-SEC-1: TLS 1.2+ in transit; AES-256 at rest.
- NFR-SEC-2: All PHI access audited.
- NFR-SEC-3: Secrets in a secret manager (AWS Secrets Manager / Azure Key Vault).
- NFR-SEC-4: Annual pen-test and quarterly vulnerability scans.

### 4.5 Usability

- NFR-UX-1: WCAG 2.1 AA compliance for frontend.
- NFR-UX-2: First meaningful paint ≤ 2 seconds on 4G.

### 4.6 Maintainability & Observability

- NFR-OBS-1: Structured JSON logs, trace-id correlation (OpenTelemetry).
- NFR-OBS-2: Prometheus metrics per service.
- NFR-MAINT-1: ≥ 80% unit-test coverage on service code.

## 5. System Interfaces

### 5.1 External Interfaces

- **HL7 v2.x:** Inbound ORU (results), ADT (registration events), ORM (orders).
- **FHIR R4:** Patient, Appointment, Observation, MedicationRequest resources.
- **DICOM:** Metadata exchange with PACS (C-FIND, worklist).
- **Payment Gateway:** REST (idempotent) — card/UPI/wallet.
- **SMS/Email:** Transactional — OTP, appointment reminders.

### 5.2 Internal Interfaces

- Synchronous: REST over HTTPS between services (via gateway or service mesh).
- Asynchronous: Kafka topics for audit events, HL7 ingest, notifications.

## 6. Performance Requirements

See §4.1. Load targets and capacity planning are in `docs/LLD/low_level_design.md`.

## 7. Appendix A — RBAC Matrix (excerpt)

| Resource                | ADMIN | DOCTOR | NURSE | LAB_TECH | PHARMACIST | RECEPTIONIST | PATIENT |
|-------------------------|:-----:|:------:|:-----:|:--------:|:----------:|:------------:|:-------:|
| Patient (create)        | ✔     |        |       |          |            | ✔            |         |
| Patient (read-own)      |       |        |       |          |            |              | ✔       |
| Patient (read-any)      | ✔     | ✔      | ✔     | ✔        | ✔          | ✔            |         |
| Appointment (create)    | ✔     | ✔      | ✔     |          |            | ✔            | ✔       |
| Consultation (write)    |       | ✔      |       |          |            |              |         |
| Lab Order (create)      |       | ✔      |       |          |            |              |         |
| Lab Result (enter)      |       |        |       | ✔        |            |              |         |
| Prescription (sign)     |       | ✔      |       |          |            |              |         |
| Dispense                |       |        |       |          | ✔          |              |         |
| Invoice (create)        | ✔     |        |       |          |            | ✔            |         |
| Payment (process)       | ✔     |        |       |          |            | ✔            | ✔       |
| Reports (view)          | ✔     | ✔ (own)|       |          |            |              |         |
