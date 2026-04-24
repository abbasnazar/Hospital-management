#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

SERVICES=(auth patient doctor lab pharmacy billing reporting)

for s in "${SERVICES[@]}"; do
  echo ">>> Building $s-service"
  docker build -t "hmis/$s-service:local" "services/$s-service"
done

echo ">>> Building api-gateway"
docker build -t "hmis/api-gateway:local" "gateway/api-gateway"

echo ">>> Building angular-app"
docker build -t "hmis/angular-app:local" "frontend/angular-app"

echo "All HMIS images built (tag: :local)"
