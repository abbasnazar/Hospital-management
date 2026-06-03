#!/bin/bash

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES=(
  "gateway/api-gateway"
  "services/auth-service"
  "services/patient-service"
  "services/doctor-service"
  "services/lab-service"
  "services/pharmacy-service"
  "services/billing-service"
  "services/reporting-service"
  "services/ipd-service"
  "services/frontdesk-service"
)
FRONTEND="frontend/angular-app"
PID_FILE="$PROJECT_ROOT/.pids"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cleanup() {
  echo -e "\n${YELLOW}Stopping all services...${NC}"
  if [ -f "$PID_FILE" ]; then
    while read pid; do
      kill $pid 2>/dev/null || true
    done < "$PID_FILE"
    rm "$PID_FILE"
  fi
  echo -e "${GREEN}All services stopped${NC}"
}

trap cleanup EXIT

# Clear old PIDs
rm -f "$PID_FILE"

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs"

echo -e "${GREEN}Installing dependencies...${NC}"

# Install all service dependencies
for service in "${SERVICES[@]}"; do
  echo -e "${YELLOW}Installing $service...${NC}"
  cd "$PROJECT_ROOT/$service"
  npm install --silent
done

# Install frontend dependencies
echo -e "${YELLOW}Installing frontend...${NC}"
cd "$PROJECT_ROOT/$FRONTEND"
npm install --silent

echo -e "${GREEN}Starting all services...${NC}"

# Start all backend services
for service in "${SERVICES[@]}"; do
  SERVICE_NAME=$(basename "$service")
  echo -e "${YELLOW}Starting $SERVICE_NAME on background...${NC}"
  cd "$PROJECT_ROOT/$service"
  npm run dev > "$PROJECT_ROOT/logs/${SERVICE_NAME}.log" 2>&1 &
  echo $! >> "$PID_FILE"
done

# Start frontend
echo -e "${YELLOW}Starting Angular frontend...${NC}"
cd "$PROJECT_ROOT/$FRONTEND"
npm start > "$PROJECT_ROOT/logs/frontend.log" 2>&1 &
echo $! >> "$PID_FILE"

echo -e "${GREEN}✓ All services started!${NC}"
echo -e "${YELLOW}Logs location: $PROJECT_ROOT/logs/${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""
echo "Access points:"
echo "  Frontend: http://localhost:4200"
echo "  API Gateway: http://localhost:8080"
echo "  Login: drrao / password"
echo ""

# Keep script running
wait
