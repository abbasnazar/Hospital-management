# HMIS — Hospital Management Information System

A cloud-native, microservices-based Hospital Management Information System.

## Architecture at a glance

```
┌───────────────────────────────────────────────────────────────────────┐
│                      PRESENTATION  (Angular 17 SPA)                   │
├───────────────────────────────────────────────────────────────────────┤
│                 API GATEWAY  (Node.js + Express + http-proxy)         │
│       - Routing, JWT validation, Redis rate limiting, CORS            │
├───────────────────────────────────────────────────────────────────────┤
│   APPLICATION SERVICES  (Node.js microservices, per-bounded-context)  │
│   Auth | Patient | Doctor | Lab | Pharmacy | Billing | Reporting      │
├───────────────────────────────────────────────────────────────────────┤
│  INTEGRATION LAYER  (HL7, FHIR, DICOM stubs, payment gateway)         │
├───────────────────────────────────────────────────────────────────────┤
│     DATA LAYER  (MySQL 8, logical schemas per service)                │
│     CACHE / RATE LIMIT (Redis 7)                                      │
├───────────────────────────────────────────────────────────────────────┤
│   SECURITY  (OAuth2 flows, JWT HS256/RS256, RBAC, TOTP MFA)           │
├───────────────────────────────────────────────────────────────────────┤
│   REPORTING  (Power BI-compatible JSON endpoints, MIS dashboards)     │
├───────────────────────────────────────────────────────────────────────┤
│   INFRASTRUCTURE  (Docker Compose, Kubernetes, Terraform AWS/Azure)   │
└───────────────────────────────────────────────────────────────────────┘
```

## Technology stack

| Layer            | Technology                                      |
|------------------|-------------------------------------------------|
| Frontend         | Angular 17, TypeScript, Angular Material        |
| Backend services | **Node.js 20, Express 4, Sequelize 6**          |
| API Gateway      | **Node.js + Express + http-proxy-middleware**   |
| Database         | **MySQL 8 (InnoDB, utf8mb4)**                   |
| Cache / RL store | **Redis 7 (ioredis, rate-limit-redis)**         |
| AuthZ / AuthN    | JWT (jsonwebtoken), bcryptjs, speakeasy (TOTP)  |
| Validation       | Joi                                              |
| Observability    | Winston (JSON logs), `/health`, Prometheus-ready |
| Containers       | Docker (node:20-alpine)                         |
| Orchestration    | Kubernetes (Deployments, HPA, Ingress, StatefulSet for MySQL) |
| IaC              | Terraform (AWS reference)                       |
| Tests            | Jest + Supertest (unit), Newman (API), PyTest (integration/security), Locust (load) |

## Microservices and ports

| Service            | Port | Responsibility                                           |
|--------------------|------|----------------------------------------------------------|
| `api-gateway`      | 8080 | Routing, auth, rate limit, CORS                          |
| `auth-service`     | 8081 | Registration, login, JWT issuance, MFA enrolment         |
| `patient-service`  | 8082 | Patients, demographics, appointments (overlap-safe)      |
| `doctor-service`   | 8083 | Clinical notes (SOAP), diagnoses, discharge summary      |
| `lab-service`      | 8084 | Test catalogue, orders, samples, results                 |
| `pharmacy-service` | 8085 | Medicine master, batches, prescriptions, dispensing      |
| `billing-service`  | 8086 | Invoices, payments, insurance claims                     |
| `reporting-service`| 8087 | Daily MIS, revenue, Power BI JSON endpoints              |

## Repository layout

```
hmis-system/
├── docs/                       # PRD, BRD, SRS, HLD, LLD, architecture, API, deployment
├── services/                   # 7 Node.js microservices (Express + Sequelize + MySQL)
├── gateway/api-gateway/        # Node.js API gateway
├── frontend/angular-app/       # Angular 17 SPA
├── database/                   # MySQL schema + seed data
├── integrations/               # HL7, FHIR, payment adapters
├── security/auth-config/       # Realm, roles, RBAC matrix
├── infrastructure/             # docker-compose, k8s manifests, Terraform
├── tests/                      # api, integration, load, security
└── testing-tools/              # Postman collection, Locust, test runner
```

## Quick start (local)

Pre-requisites: Docker, Docker Compose, Node 20+, npm, Angular CLI.

```bash
cd hmis-system/infrastructure/docker
docker compose up -d --build
```

This brings up MySQL (seeded with schema + demo users on first run), Redis,
all 7 Node.js microservices, the gateway, and the Angular SPA.

Open:
- SPA:      http://localhost:4200  (login: `drrao` / `password`)
- Gateway:  http://localhost:8080
- MySQL:    `localhost:3306` (user `hmis` / pass `hmis`)

## Demo users (all password = `password`)

| Username | Role          |
|----------|---------------|
| admin    | ADMIN         |
| drrao    | DOCTOR        |
| kiran    | NURSE         |
| priya    | RECEPTIONIST  |
| rakesh   | LAB_TECH      |
| sara     | PHARMACIST    |
| meera    | PATIENT       |

## Deployment to Kubernetes

```bash
kubectl apply -f infrastructure/kubernetes/deployment.yaml
kubectl -n hmis get pods,svc,ingress
# Map hmis.local -> ingress IP in /etc/hosts
```

## Security

- **Authentication:** JWT (HS256 for dev, RS256 for prod with rotating keys).
- **Authorization:** RBAC roles (`ADMIN`, `DOCTOR`, `NURSE`, `LAB_TECH`,
  `PHARMACIST`, `RECEPTIONIST`, `PATIENT`) enforced per-endpoint.
- **MFA:** TOTP (RFC 6238) via `speakeasy`.
- **Transport:** HTTPS terminated at ingress/ALB.
- **At rest:** MySQL InnoDB + optional TDE; secrets via K8s Secrets / Vault.
- **Audit:** `auth_audit_log` for login/logout/MFA/privileged actions.

## Testing

```bash
./testing-tools/test_runner.sh
```

Runs Newman (API), PyTest (integration + security), then Locust (50u / 2min).

## Documentation

- [PRD](./docs/PRD/product_requirement_document.md)
- [BRD](./docs/BRD/business_requirement_document.md)
- [SRS](./docs/SRS/software_requirement_specification.md)
- [HLD](./docs/HLD/high_level_design.md)
- [LLD](./docs/LLD/low_level_design.md)
- [Architecture diagrams](./docs/ARCHITECTURE/architecture_diagrams.md)
- [API](./docs/API_DOCS/api_documentation.md)
- [Deployment](./docs/DEPLOYMENT/deployment_guide.md)
