###############################################################################
# HMIS — Terraform root module (AWS reference).
# This is a slim, reviewable reference. For multi-environment, split into
# modules under ./modules/ and per-env workspaces.
###############################################################################

terraform {
  required_version = ">= 1.7.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.50"
    }
  }
}

provider "aws" {
  region = var.region
}

variable "region"     { type = string  default = "ap-south-1" }
variable "env"        { type = string  default = "dev" }
variable "project"    { type = string  default = "hmis" }
variable "vpc_cidr"   { type = string  default = "10.60.0.0/16" }
variable "cluster_name" { type = string default = "hmis-eks" }

locals {
  tags = {
    Project     = var.project
    Environment = var.env
    ManagedBy   = "terraform"
  }
}

# --- VPC ---------------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags                 = merge(local.tags, { Name = "${var.project}-${var.env}-vpc" })
}

# NOTE: subnets, IGW, NAT, route tables, EKS cluster, node groups, RDS, ElastiCache,
# Secrets Manager, KMS and ALB are intentionally elided from this file. Use the
# terraform-aws-modules community modules or HashiCorp examples, e.g.:
#   module "vpc" { source = "terraform-aws-modules/vpc/aws"   version = "~> 5.0" ... }
#   module "eks" { source = "terraform-aws-modules/eks/aws"   version = "~> 20.0" ... }
#   module "rds" { source = "terraform-aws-modules/rds/aws"   version = "~> 6.0" ... }

output "vpc_id" {
  value = aws_vpc.main.id
}
