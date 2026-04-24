# Architecture Diagrams — HMIS

All diagrams are expressed in Mermaid for tooling portability.

## 1. C4 — Context

```mermaid
C4Context
    title HMIS — System Context
    Enterprise_Boundary(h, "Hospital") {
        Person(patient, "Patient", "Uses self-service portal")
        Person(clinician, "Clinician", "Doctor / Nurse / Lab Tech / Pharmacist")
        Person(admin, "Administrator", "Hospital admin / billing")
        System(hmis, "HMIS", "Hospital Management Information System")
        System_Ext(pacs, "PACS", "Radiology image store")
        System_Ext(erp, "ERP", "Finance / HR")
        System_Ext(pay, "Payment Gateway", "Cards / UPI / Wallet")
        System_Ext(ins, "Insurance", "Payer")
        System_Ext(analyser, "Lab Analyser", "HL7 v2.x device")
    }
    Rel(patient, hmis, "HTTPS")
    Rel(clinician, hmis, "HTTPS")
    Rel(admin, hmis, "HTTPS")
    Rel(hmis, pacs, "DICOM C-FIND / worklist")
    Rel(hmis, erp, "Nightly batch (SFTP / REST)")
    Rel(hmis, pay, "REST / HTTPS")
    Rel(hmis, ins, "REST / EDI")
    Rel(analyser, hmis, "HL7 MLLP")
```

## 2. C4 — Container

```mermaid
C4Container
    title HMIS — Container View
    Container_Boundary(c, "HMIS") {
        Container(spa, "Angular SPA", "Angular 17")
        Container(gw,  "API Gateway", "Node.js gateway (Express + http-proxy-middleware)")
        Container(auth,"Auth Service", "Node.js Express")
        Container(pat, "Patient Service", "Node.js Express")
        Container(doc, "Doctor Service", "Node.js Express")
        Container(lab, "Lab Service", "Node.js Express")
        Container(phr, "Pharmacy Service", "Node.js Express")
        Container(bil, "Billing Service", "Node.js Express")
        Container(rep, "Reporting Service", "Node.js Express")
        ContainerDb(pg, "MySQL", "RDBMS")
        ContainerDb(rd, "Redis", "Cache / Rate limit")
        Container(kf, "Kafka", "Event bus")
    }
    Rel(spa, gw, "HTTPS/JSON")
    Rel(gw, auth, "HTTPS/JSON")
    Rel(gw, pat, "HTTPS/JSON")
    Rel(gw, doc, "HTTPS/JSON")
    Rel(gw, lab, "HTTPS/JSON")
    Rel(gw, phr, "HTTPS/JSON")
    Rel(gw, bil, "HTTPS/JSON")
    Rel(gw, rep, "HTTPS/JSON")
    Rel(pat, pg, "Sequelize (mysql2)")
    Rel(doc, pg, "Sequelize (mysql2)")
    Rel(lab, pg, "Sequelize (mysql2)")
    Rel(phr, pg, "Sequelize (mysql2)")
    Rel(bil, pg, "Sequelize (mysql2)")
    Rel(rep, pg, "Sequelize (mysql2) (read replica)")
    Rel(auth, rd, "sessions / revocations")
    Rel(gw, rd, "rate limiter")
    Rel(lab, kf, "HL7 events")
    Rel(bil, kf, "invoice events")
```

## 3. Deployment (Kubernetes)

```mermaid
flowchart LR
  subgraph K8s Cluster
    subgraph ingress
      ING[Ingress Controller]
    end
    subgraph gw-ns[gateway]
      GW[api-gateway Deployment]
    end
    subgraph svc-ns[services]
      AUTH[auth-service]
      PAT[patient-service]
      DOC[doctor-service]
      LAB[lab-service]
      PHR[pharmacy-service]
      BIL[billing-service]
      REP[reporting-service]
    end
    subgraph data
      PG[(MySQL)]
      RD[(Redis)]
      KF[(Kafka)]
    end
  end
  USER((User)) --> ING --> GW
  GW --> AUTH & PAT & DOC & LAB & PHR & BIL & REP
  AUTH --> PG
  PAT  --> PG
  DOC  --> PG
  LAB  --> PG
  PHR  --> PG
  BIL  --> PG
  REP  --> PG
  AUTH --> RD
  GW   --> RD
  LAB  --> KF
  BIL  --> KF
```

## 4. Data Flow — Appointment Booking

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant SPA as Angular SPA
  participant GW as API Gateway
  participant A as auth-service
  participant P as patient-service
  U->>SPA: Select doctor + slot
  SPA->>GW: POST /api/v1/appointments (JWT)
  GW->>GW: verify JWT (JWK cache)
  GW->>P: forward + X-User-Id, X-Roles
  P->>P: overlap check (tstzrange &&)
  P->>P: persist Appointment
  P-->>GW: 201 {id}
  GW-->>SPA: 201
  SPA-->>U: show confirmation
```

## 5. HL7 Result Ingest

```mermaid
sequenceDiagram
  participant AN as Analyser
  participant HL7 as HL7 Adapter (MLLP)
  participant KF as Kafka "lab.results"
  participant LS as lab-service
  participant N as notification
  AN->>HL7: ORU^R01
  HL7->>HL7: parse + validate
  HL7->>KF: publish LabResultEvent
  LS->>KF: consume
  LS->>LS: upsert Result
  LS-->>N: critical value?
```

## 6. Security Flow — OAuth2 + PKCE

```mermaid
sequenceDiagram
  participant UA as User Agent
  participant AS as auth-service
  participant RS as Resource (patient-service)
  UA->>AS: /oauth2/authorize?response_type=code&code_challenge=...
  AS-->>UA: redirect with code
  UA->>AS: /oauth2/token (code + verifier)
  AS-->>UA: {access_token, refresh_token}
  UA->>RS: GET /api/v1/patients/123 (Bearer)
  RS->>AS: GET /.well-known/jwks.json (cached)
  RS-->>UA: 200 JSON
```

## 7. Logical Data Model (ER overview)

```mermaid
erDiagram
  PATIENT ||--o{ APPOINTMENT : has
  PATIENT ||--o{ ENCOUNTER : has
  ENCOUNTER ||--o{ DIAGNOSIS : records
  ENCOUNTER ||--o{ PRESCRIPTION : produces
  ENCOUNTER ||--o{ LAB_ORDER : orders
  LAB_ORDER ||--|{ LAB_SAMPLE : tracks
  LAB_ORDER ||--o{ LAB_RESULT : yields
  PRESCRIPTION ||--|{ PRESCRIPTION_ITEM : contains
  PRESCRIPTION_ITEM }o--|| MEDICINE : refers
  MEDICINE ||--o{ MEDICINE_BATCH : stocked_as
  ENCOUNTER ||--o{ INVOICE : billed_as
  INVOICE ||--|{ INVOICE_ITEM : contains
  INVOICE ||--o{ PAYMENT : settled_by
```
