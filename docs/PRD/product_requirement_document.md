# Product Requirements Document (PRD) — HMIS

**Product:** Hospital Management Information System
**Version:** 1.0
**Status:** Approved for Build
**Owner:** Product Management

---

## 1. Product Vision

Deliver a modular, cloud-native HMIS that unifies patient, clinical, laboratory, radiology, pharmacy, billing and reporting workflows into a single system of record — enabling hospitals to improve clinical outcomes, operational efficiency, and revenue integrity while meeting regulatory standards (HIPAA, HL7/FHIR, DICOM).

### Vision Statement

> "One platform, every hospital workflow — connected, compliant, and clinician-first."

### Product Principles

1. **Clinician-first UX** — Every screen is designed to reduce clicks, not add them.
2. **Interoperability by default** — HL7 / FHIR / DICOM are first-class citizens.
3. **Security and privacy are non-negotiable** — Data minimisation and audit by design.
4. **Cloud-agnostic** — Runs on AWS, Azure, or on-prem Kubernetes.
5. **API-first** — Every capability is a documented REST API.

## 2. User Personas

### 2.1 Dr. Anita Rao — Consulting Physician (DOCTOR)

- Reviews patient history in under 15 seconds.
- Orders lab tests, prescribes medication, writes clinical notes.
- Key pain today: switching between 3 systems to see a single patient view.

### 2.2 Nurse Kiran — Ward Nurse (NURSE)

- Updates vitals, administers medication, tracks discharge readiness.
- Needs mobile-friendly screens at the bedside.

### 2.3 Priya — Front-desk Receptionist (RECEPTIONIST)

- Registers walk-in patients, schedules appointments, collects co-pay.
- Needs one-screen registration with smart duplicate detection.

### 2.4 Rakesh — Lab Technician (LAB_TECH)

- Receives orders, tracks samples, enters results.
- Needs barcode-driven sample tracking and HL7 ORU outbound messaging.

### 2.5 Sara — Pharmacist (PHARMACIST)

- Dispenses prescriptions, manages stock, flags interactions.
- Needs real-time inventory and expiry alerts.

### 2.6 Amit — Billing Executive (ADMIN/BILLING)

- Generates invoices, processes payments, files insurance claims.
- Needs payer-aware pricing and claim status tracking.

### 2.7 Meera — Patient (PATIENT)

- Books appointments, views reports, pays bills.
- Needs a clean self-service portal and secure access to records.

### 2.8 Ravi — Hospital Administrator (ADMIN)

- Monitors KPIs: occupancy, revenue, patient flow, SLA.
- Needs real-time dashboards and drill-down reports.

## 3. Product Features

### 3.1 Patient Management

- Patient registration with MRN generation and KYC capture
- Appointment booking (walk-in, scheduled, tele-consult)
- Longitudinal patient history (visits, diagnoses, medications, allergies)
- Discharge summary generation with e-signature

### 3.2 Clinical Services

- Doctor consultation workbench (SOAP notes)
- Diagnosis records (ICD-10 coded)
- Treatment plan with care-pathway templates
- Clinical notes with voice-to-text support (optional)

### 3.3 Laboratory (LIS)

- Lab test order entry and approval
- Barcoded sample collection & tracking
- Results entry (manual + analyser integration via HL7)
- Critical-value alerts to ordering clinician

### 3.4 Radiology (RIS)

- Imaging order + modality worklist
- DICOM metadata capture
- Report dispatch; linking to PACS

### 3.5 Pharmacy

- Medicine master, batch + expiry inventory
- Prescription fulfilment with DDI check
- OTC and Rx billing

### 3.6 Billing

- Invoice generation (consolidated and split)
- Payment gateway integration (cards, UPI, wallets)
- Insurance pre-auth and claim submission (basic)

### 3.7 Reporting & Analytics

- Operational MIS (registrations, discharges, OT, LOS)
- Revenue (department, payer, physician mix)
- Power BI–compatible paged API
- Exportable CSV/Excel/PDF

### 3.8 Cross-cutting

- Single sign-on with MFA
- Role-based access control
- Audit log viewer
- Configurable masters (departments, procedures, tariffs)

## 4. Success Metrics

| Metric                                          | Target                 |
| ----------------------------------------------- | ---------------------- |
| Patient registration median time                | ≤ 90 seconds           |
| Doctor consultation note save latency (p95)     | ≤ 800 ms               |
| Lab result turnaround (LIS ingest → clinician)  | ≤ 5 minutes            |
| API availability (per month)                    | ≥ 99.9%                |
| Auth success rate                               | ≥ 99.95%               |
| User satisfaction (CSAT)                        | ≥ 4.4 / 5              |
| Reduction in duplicate MRNs (vs. legacy)        | ≥ 70%                  |
| Claim first-pass acceptance                     | ≥ 90%                  |

## 5. Out of Scope (v1.0)

- Full EMR templating engine (basic templates only in v1)
- DICOM image rendering (thumbnail only)
- Tele-medicine video (integrations with 3rd-party providers only)
- Full ERP (HR/Payroll) modules

## 6. Release Milestones

| Milestone | Scope                                                     | Target Quarter |
| --------- | --------------------------------------------------------- | -------------- |
| M1 (MVP)  | Patient + Appointments + Billing + Auth                   | Q1             |
| M2        | Clinical + LIS + Pharmacy                                 | Q2             |
| M3        | Reporting, RIS, HL7 ADT/ORM/ORU, insurance                | Q3             |
| M4 (GA)   | MFA, audit viewer, Terraform IaC, HA, k8s production      | Q4             |

## 7. Assumptions & Dependencies

- Hospital provides PACS for DICOM image storage.
- Payment gateway credentials provisioned by the hospital's finance team.
- Internet connectivity ≥ 20 Mbps per site for cloud deployment.
