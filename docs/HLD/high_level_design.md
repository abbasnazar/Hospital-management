# High-Level Design (HLD) — HMIS

**Version:** 1.0

---

## 1. Architecture Overview

HMIS adopts a **Service-Oriented / Microservices architecture** with a clear separation of concerns across eight layers.

```
┌───────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION (Angular SPA)                       │
├───────────────────────────────────────────────────────────────────────┤
│                 API GATEWAY (Node.js gateway (Express + http-proxy-middleware))                    │
│       - Routing, JWT validation, Rate limiting, CORS                  │
├───────────────────────────────────────────────────────────────────────┤
│   APPLICATION SERVICES (Node.js Express microservices, per-bounded-ctx)   │
│   Patient | Doctor | Lab | Pharmacy | Billing | Reporting | Auth     │
├───────────────────────────────────────────────────────────────────────┤
│  INTEGRATION LAYER (HL7, FHIR, DICOM, Payments, SMS/Email adapters)   │
├───────────────────────────────────────────────────────────────────────┤
│   DATA LAYER (MySQL per service) + CACHE (Redis) + Kafka (evts)  │
├───────────────────────────────────────────────────────────────────────┤
│       SECURITY (OAuth2/JWT, RBAC, MFA, Secrets, Encryption)           │
├───────────────────────────────────────────────────────────────────────┤
│         REPORTING (Power BI endpoints, MV on warehouse replica)       │
├───────────────────────────────────────────────────────────────────────┤
│    INFRASTRUCTURE (Docker, Kubernetes, Terraform, AWS/Azure)          │
└───────────────────────────────────────────────────────────────────────┘
```

## 2. Component Description

### 2.1 Frontend (Angular SPA)

- Angular 17 standalone components.
- Auth via OAuth2 authorization-code + PKCE flow against `auth-service`.
- State via services + RxJS; route-guard + role-guard for RBAC.
- Module-per-bounded-context: `patient`, `clinical`, `lab`, `pharmacy`, `billing`, `reporting`, `admin`.

### 2.2 API Gateway

- Node.js gateway (Express + http-proxy-middleware) with:
  - **Route predicates** per microservice (`/api/patient/**` → patient-service).
  - **JWT filter** for token validation and claims propagation (`X-User-Id`, `X-User-Roles`).
  - **RateLimiter** (Redis-backed).
  - **Global CORS** policy.
  - **OpenAPI aggregation** at `/swagger-ui.html`.

### 2.3 Microservices

Each service follows the same internal architecture:

```
controller  →  service  →  repository  →  database
     ↑
  DTO / mapper
     ↑
  validation (JSR-380)
```

- **auth-service** — login, logout, refresh, MFA enrol/verify, JWK publication.
- **patient-service** — CRUD of patient, appointments, history, discharge.
- **doctor-service** — doctor master, consultations, clinical notes, treatment plans.
- **lab-service** — orders, samples, results, reference ranges, HL7 ORU ingest.
- **pharmacy-service** — medicines, batches, prescriptions, dispense, DDI cache.
- **billing-service** — invoices, payments, refunds, insurance claims.
- **reporting-service** — dashboards, Power BI endpoints, materialised views.

### 2.4 Integration Layer

- **HL7:** Dedicated adapter receiving MLLP / TCP messages and producing Kafka events consumed by services.
- **FHIR:** Thin façade over `patient`, `doctor`, `lab`, `pharmacy` services to map resources.
- **DICOM:** Worklist / C-FIND using `dcm4che` library; images stored in PACS, only metadata in HMIS.
- **Payment:** Pluggable provider interface; at least one implementation (Stripe/Razorpay).

### 2.5 Data Layer

- Each service owns its own schema (within a shared MySQL cluster in small deployments, separate databases in production).
- Redis: session store, RateLimiter tokens, hot caches (patient search, tariff master).
- Kafka (optional, recommended in production): event bus for ADT, orders, results, audit.

### 2.6 Security Layer

- OAuth2 authorization code + PKCE (interactive) and client-credentials (service-to-service).
- RS256 JWTs with rotating keys; JWK set published by `auth-service` at `/.well-known/jwks.json`.
- RBAC enforced at gateway (coarse-grained) and at service route level (fine-grained with `requireRoles` middleware).
- MFA via TOTP; recovery codes stored as hashes.
- All service→service calls authenticated with short-lived client tokens.

### 2.7 Reporting Layer

- Read-only replica of each service DB feeds a reporting schema.
- Materialised views built nightly + on-demand refresh.
- Power BI–compatible endpoints paginate with `$top` / `$skip` / `$filter`.

### 2.8 Infrastructure

- Containers per service; image published to registry.
- Kubernetes deployments with HPA on CPU + request-rate metric.
- Terraform modules for: VPC, EKS/AKS, RDS, ElastiCache, S3/Blob, KMS, ACM.
- Centralised logging via Loki; metrics via Prometheus; tracing via Tempo/Jaeger.

## 3. Technology Stack

See `README.md` §Technology Stack for the full matrix.

| Layer           | Choice                                                   |
|-----------------|----------------------------------------------------------|
| Frontend        | Angular 17 + Angular Material                            |
| Backend         | Node.js 20, Express 4, Sequelize 6 (mysql2)              |
| Gateway         | Node.js + Express + http-proxy-middleware                |
| DB              | MySQL 8 (InnoDB, utf8mb4_0900_ai_ci)                     |
| Cache           | Redis 7 (ioredis, rate-limit-redis)                      |
| Bus             | Apache Kafka 3.6 (optional in dev)                       |
| Auth            | jsonwebtoken (HS256/RS256), bcryptjs, speakeasy (TOTP)   |
| Validation      | Joi                                                      |
| Containers      | Docker 24 (node:20-alpine), Kubernetes 1.29              |
| IaC             | Terraform 1.7                                            |
| Observability   | Winston JSON logs, Prometheus, Grafana, Loki, OpenTelemetry |

## 4. Key Sequence Diagrams (textual)

### 4.1 Login + first API call

```
User → Frontend:           open app
Frontend → auth-service:   /oauth2/authorize (PKCE)
auth-service → Frontend:   auth code
Frontend → auth-service:   /oauth2/token (code + verifier)
auth-service → Frontend:   access+refresh JWT
Frontend → Gateway:        GET /api/patient/123  (Bearer JWT)
Gateway:                   verify JWT (JWK cache)
Gateway → patient-service: proxy + propagate X-User-Id, X-Roles
patient-service:           requireRoles → DB → DTO
patient-service → Gateway → Frontend: 200 JSON
```

### 4.2 Lab result ingest (HL7 ORU)

```
Analyser → HL7 adapter (MLLP):    ORU^R01
HL7 adapter → Kafka "lab.results":event
lab-service consumer:             upsert Result, link Order
lab-service → notification-svc:   critical-value push (if abnormal)
```

## 5. Deployment Topology

- **Non-prod:** Single cluster, single region, shared MySQL, single Redis.
- **Prod:** Multi-AZ cluster, MySQL primary + replica, Redis cluster, Kafka 3-broker, WAF at ingress, CDN for static frontend.
- **DR:** Warm standby in second region; DB logical replication; S3/Blob cross-region replication.

## 6. Capacity & Performance (target)

| Resource            | Target per service pod      |
|---------------------|-----------------------------|
| CPU request / limit | 250m / 1000m                |
| Memory req / limit  | 512Mi / 1Gi                 |
| Replicas (baseline) | 2 (prod), 1 (non-prod)      |
| HPA upper bound     | 10                          |
| p95 latency         | ≤ 300 ms                    |
| Throughput          | ≥ 200 rps / service         |

## 7. Cross-cutting Concerns

- **Idempotency:** Mutating endpoints accept `Idempotency-Key` header.
- **Pagination:** Cursor (`after`) or offset (`page`, `size`) consistently.
- **Versioning:** URI-level `/api/v1/...`.
- **Error model:** RFC 7807 `application/problem+json`.
- **Tracing:** `traceparent` honoured end-to-end.
- **Feature flags:** via environment + LaunchDarkly-compatible adapter.
