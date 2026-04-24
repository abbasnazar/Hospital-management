# Deployment Guide — HMIS

**Version:** 1.0

---

## 1. Environments

| Env         | Purpose                     | Example namespace   |
|-------------|-----------------------------|---------------------|
| dev         | Integration of active work  | `hmis-dev`          |
| test        | QA & automated tests        | `hmis-test`         |
| staging     | UAT, pre-prod mirror        | `hmis-staging`      |
| production  | Live                        | `hmis-prod`         |

Configuration differences are handled via:
- Node profiles via `NODE_ENV` + per-env dotenv files
- Kubernetes `ConfigMap` + `Secret`
- Terraform workspaces per environment

## 2. Local Development (Docker Compose)

```bash
cd hmis-system/infrastructure/docker
docker compose up --build
```

Ports:

- Frontend (Angular): `4200`
- API Gateway: `8080`
- Auth / Patient / Doctor / Lab / Pharmacy / Billing / Reporting: `8081–8087`
- MySQL: `5432`
- Redis: `6379`

Health checks: every service at `/actuator/health`.

## 3. Building Images

```bash
# From each service directory:
mvn -q -DskipTests package
docker build -t hmis/patient-service:$(git rev-parse --short HEAD) .
```

A `Makefile`-style one-liner is provided in `infrastructure/docker/build-all.sh`.

## 4. Kubernetes Deployment

```bash
kubectl create namespace hmis-prod
kubectl apply -f infrastructure/kubernetes/deployment.yaml -n hmis-prod
```

Recommended add-ons:

- **NGINX Ingress** or AWS ALB Ingress Controller
- **cert-manager** for TLS via Let's Encrypt / ACM
- **metrics-server** + **Prometheus stack** (kube-prometheus-stack)
- **Loki** for logs
- **OpenTelemetry Collector** + Tempo/Jaeger for traces

### 4.1 Secrets

Secrets are injected via Kubernetes Secrets sourced from AWS Secrets Manager / Azure Key Vault using External Secrets Operator.

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: patient-db-secret
spec:
  refreshInterval: 1h
  secretStoreRef:
    kind: ClusterSecretStore
    name: aws-secrets
  target:
    name: patient-db-secret
  data:
    - secretKey: url
      remoteRef: { key: hmis/prod/patient-db, property: url }
    - secretKey: username
      remoteRef: { key: hmis/prod/patient-db, property: username }
    - secretKey: password
      remoteRef: { key: hmis/prod/patient-db, property: password }
```

### 4.2 HPA

All services ship a HorizontalPodAutoscaler targeting 70% CPU, min 2, max 10 replicas.

### 4.3 Rolling Updates

Default strategy `RollingUpdate` with `maxUnavailable=0`, `maxSurge=1`. Readiness probe gates traffic until `/actuator/health/readiness` is `UP`.

## 5. Cloud IaC

### 5.1 AWS (Terraform)

Modules under `infrastructure/terraform/aws/`:

- `vpc` — 3-AZ VPC
- `eks` — EKS cluster + node groups
- `rds-mysql` — Multi-AZ MySQL
- `elasticache-redis`
- `s3-static` — for Angular build
- `kms`, `acm`, `iam-roles`, `alb`, `secrets`, `observability`

```bash
cd infrastructure/terraform/aws
terraform init -backend-config=backends/prod.hcl
terraform workspace new prod
terraform apply -var-file=env/prod.tfvars
```

### 5.2 Azure

Azure variant under `infrastructure/terraform/azure/` with: Resource Group, AKS, Azure DB for MySQL, Azure Cache for Redis, Key Vault, App Gateway, Log Analytics.

## 6. Database Operations

### 6.1 Migrations

Umzug (Sequelize migrations) migrations are packaged inside each service under `src/main/resources/db/migration`.

```bash
mvn -pl services/patient-service flyway:migrate
```

### 6.2 Backups

- **MySQL:** point-in-time recovery via binlog (daily full snapshots, 7-day retention dev/test, 35-day prod).
- **Redis:** RDB snapshots every 15 min; AOF every 1s (prod).
- Cross-region replication of snapshot bucket.

## 7. Observability

- **Metrics:** `/actuator/prometheus` scraped by Prometheus.
- **Logs:** `stdout` JSON shipped by Fluent Bit → Loki.
- **Traces:** OpenTelemetry Java agent side-car / `-javaagent` sends to OTel collector → Tempo.

Dashboards (Grafana): `HMIS / Overview`, `HMIS / Service Latency`, `HMIS / DB`, `HMIS / Gateway`.

Alerts (Alertmanager):

- Service `up == 0` for 2m
- p95 latency > 500ms for 5m
- 5xx error ratio > 2% for 5m
- Pod crash loop

## 8. Security Hardening

- Network policies: deny-all by default, allow intra-namespace + egress to DB/Redis/Kafka.
- Pod Security: `restricted` profile.
- Images: distroless base, non-root user, read-only root FS.
- Image signing: cosign + policy admission (`kyverno`/`gatekeeper`).
- Runtime: Falco or Aqua/NeuVector as DaemonSet.
- WAF at the ALB / App Gateway layer.

## 9. CI/CD

Pipeline stages (GitHub Actions template under `.github/workflows` — not included here):

1. Lint + unit tests
2. Build image, Trivy scan, Cosign sign
3. Integration tests (Testcontainers)
4. Deploy to dev via ArgoCD
5. Smoke tests + Newman API suite
6. Promote to test → staging → prod (manual gate)

## 10. Runbooks

Stored under `docs/DEPLOYMENT/runbooks/` (to be authored):

- Restart a service
- Rotate JWT signing key
- Failover MySQL primary
- Restore Redis from snapshot
- HL7 adapter flood mitigation
- Certificate rotation

## 11. Rollback

```bash
kubectl -n hmis-prod rollout undo deployment/patient-service
```

Combined with Umzug (Sequelize migrations): down-migrations or forward-fix preferred — never edit applied migrations.

## 12. DR

- Cross-region standby VPC/cluster (cold or warm)
- MySQL logical replication (binlog / DMS)
- Redis snapshots replicated via S3 cross-region replication
- DNS failover via Route53 / Traffic Manager

Target RPO ≤ 15 min, RTO ≤ 60 min.
