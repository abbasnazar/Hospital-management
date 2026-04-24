# Business Requirements Document (BRD) — HMIS

**Version:** 1.0
**Confidentiality:** Internal

---

## 1. Executive Summary

The hospital currently runs on disparate point solutions (legacy registration, separate LIS, spreadsheet-based pharmacy). This leads to duplicate data entry, revenue leakage, slow patient turnaround, and inability to report consistently. The HMIS programme will replace these systems with a unified, cloud-native platform delivered in four quarterly milestones.

## 2. Business Objectives

| # | Objective                                                                                 | Measure                                   |
|---|-------------------------------------------------------------------------------------------|-------------------------------------------|
| B1| Reduce patient registration time                                                          | Median ≤ 90s (from ~4 min)                |
| B2| Increase claim first-pass acceptance                                                      | ≥ 90% (from ~72%)                         |
| B3| Reduce revenue leakage from missed charge capture                                         | ≥ 5% recovery in year 1                   |
| B4| Improve bed occupancy reporting cadence                                                   | Real-time (from daily)                    |
| B5| Achieve HIPAA-aligned audit trail                                                         | 100% PHI access logged                    |
| B6| Interoperability readiness                                                                | HL7 ADT/ORM/ORU, FHIR R4 APIs live        |

## 3. Stakeholders

| Stakeholder                 | Interest                                          | Influence |
|-----------------------------|---------------------------------------------------|-----------|
| Chief Medical Officer       | Patient safety, clinical workflows                | High      |
| Chief Financial Officer     | Revenue integrity, payer relations                | High      |
| Chief Information Officer   | Architecture, security, costs                     | High      |
| Head of Nursing             | Ward workflows, medication administration         | High      |
| Head of Laboratory          | LIS, HL7 analyser integration                     | Medium    |
| Head of Pharmacy            | Inventory, e-prescriptions                        | Medium    |
| Front-office Manager        | Registration, appointments                        | Medium    |
| Compliance Officer          | HIPAA, data retention, audit                      | High      |
| Patients                    | Self-service, transparency                        | Medium    |

## 4. Scope

### 4.1 In Scope

- All core modules listed in the PRD (§3).
- Integration with one payment gateway and one SMS/email provider.
- Data migration from legacy registration DB (one-time ETL).
- Training for 200 users across 7 roles.
- Production deployment on primary cloud + DR in a second region.

### 4.2 Out of Scope

- Replacement of ERP (HR, Finance GL) — integration only via nightly batch.
- Full tele-medicine platform — white-labelled third-party integration only.
- Medical device integration beyond HL7 v2.x analysers.
- Customised reports not derivable from the documented data warehouse.

## 5. Business Rules

### 5.1 Patient

- BR-P1: MRN is unique for the hospital group; format `H{site}-{YYYY}-{6-digit-seq}`.
- BR-P2: Duplicate detection MUST run on first-name + last-name + DOB + phone before insert.
- BR-P3: Minor patients (<18y) MUST have a guardian linked before any clinical action.

### 5.2 Appointments

- BR-A1: A doctor cannot have overlapping appointment slots.
- BR-A2: Appointments can be booked up to 60 days in advance.
- BR-A3: Cancellations within 2 hours of slot require front-office override.

### 5.3 Clinical

- BR-C1: Only a user with role `DOCTOR` can sign a discharge summary.
- BR-C2: Every prescription MUST be linked to a diagnosis (ICD-10).
- BR-C3: Controlled substances require a second-factor confirmation at prescription time.

### 5.4 Lab

- BR-L1: A sample cannot be accepted in the lab without an approved order.
- BR-L2: Critical results MUST notify the ordering clinician within 5 minutes.

### 5.5 Pharmacy

- BR-Ph1: Dispensing cannot proceed if batch stock ≤ 0 or expiry < today.
- BR-Ph2: DDI alerts must be acknowledged before override.

### 5.6 Billing

- BR-B1: An invoice MUST include all charges accrued in the encounter.
- BR-B2: Refunds require supervisor approval above ₹5,000.
- BR-B3: Insurance claims MUST have pre-auth for admissions > ₹50,000.

### 5.7 Access & Audit

- BR-S1: Break-the-glass access requires justification and is logged immutably.
- BR-S2: All PHI read/write operations are logged with user, timestamp, IP, and correlation ID.

## 6. Constraints

- **Regulatory:** HIPAA, local data-localisation mandates.
- **Budget:** Capex-light; prefer OpEx / cloud pay-as-you-go.
- **Timeline:** MVP in 12 weeks, GA in 12 months.
- **Skills:** In-house team has Node.js + Angular; limited Go/Elixir exposure.

## 7. Risks & Mitigations

| Risk                                                  | Likelihood | Impact | Mitigation                                                         |
|-------------------------------------------------------|------------|--------|--------------------------------------------------------------------|
| Data migration quality (legacy dirty data)            | High       | High   | Dry-run ETL + reconciliation reports; golden dataset               |
| Change resistance from senior clinicians              | Medium     | High   | Clinician champions, shadow mode, phased rollout                   |
| HL7 analyser variance across vendors                  | High       | Medium | Vendor test harness; per-analyser mapping configs                  |
| Cloud cost over-run                                   | Medium     | Medium | Budget alerts, right-sizing, autoscaling policies                  |
| Security breach / PHI exposure                        | Low        | Critical| MFA, KMS-backed encryption, quarterly pen tests                    |

## 8. Acceptance Criteria (business)

- All 7 roles can perform their end-to-end workflow in UAT.
- Claims submitted for 1 week achieve ≥ 85% first-pass acceptance in UAT.
- MIS dashboards render within 3 seconds for 90-day ranges.
