# Terraform — HMIS Infrastructure

Reference IaC for deploying HMIS to **AWS** or **Azure**. Use the variant under `aws/` or `azure/`.

## Pre-requisites

- Terraform 1.7+
- Configured cloud CLI (`aws configure` / `az login`)
- S3 (AWS) or Storage Account (Azure) for remote state backend

## Usage (AWS)

```bash
cd aws
terraform init -backend-config=backends/prod.hcl
terraform workspace new prod
terraform apply -var-file=env/prod.tfvars
```

## Outputs

- `kubeconfig` for EKS/AKS
- DB endpoint, Redis endpoint
- CloudFront / FrontDoor URL for the Angular app

## What's included

| Module              | AWS                    | Azure                     |
|---------------------|------------------------|---------------------------|
| Networking          | VPC, subnets, NAT      | VNet, subnets, NAT GW     |
| Kubernetes          | EKS + node groups      | AKS + node pools          |
| Database            | RDS PostgreSQL (Multi-AZ) | Azure DB for PostgreSQL |
| Cache               | ElastiCache Redis      | Azure Cache for Redis     |
| Object storage      | S3                     | Blob storage              |
| Secrets             | Secrets Manager        | Key Vault                 |
| KMS                 | KMS                    | Key Vault                 |
| TLS                 | ACM + ALB              | App Gateway + Key Vault   |
| Observability       | CW + Managed Grafana   | Log Analytics + Grafana   |
