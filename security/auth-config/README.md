# Auth Configuration

This folder centralises environment-agnostic authentication / authorisation policy: realm, roles, JWT issuance parameters, and the RBAC matrix. The auth-service loads these files at startup via mounted ConfigMaps (Kubernetes) or bind-mounts (Docker).
