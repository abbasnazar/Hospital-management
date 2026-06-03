@echo off
REM Windows batch script to start all HMIS services

setlocal enabledelayedexpansion

set PROJECT_ROOT=%~dp0
set PID_FILE=%PROJECT_ROOT%.pids

REM Create logs directory
if not exist "%PROJECT_ROOT%logs" mkdir "%PROJECT_ROOT%logs"

echo.
echo ========================================
echo   HMIS - Starting All Services
echo ========================================
echo.

echo [INFO] Installing dependencies...
echo.

REM Install gateway
echo [INFO] Installing API Gateway...
cd /d "%PROJECT_ROOT%gateway\api-gateway"
call npm install --silent

REM Install auth service
echo [INFO] Installing Auth Service...
cd /d "%PROJECT_ROOT%services\auth-service"
call npm install --silent

REM Install patient service
echo [INFO] Installing Patient Service...
cd /d "%PROJECT_ROOT%services\patient-service"
call npm install --silent

REM Install doctor service
echo [INFO] Installing Doctor Service...
cd /d "%PROJECT_ROOT%services\doctor-service"
call npm install --silent

REM Install lab service
echo [INFO] Installing Lab Service...
cd /d "%PROJECT_ROOT%services\lab-service"
call npm install --silent

REM Install pharmacy service
echo [INFO] Installing Pharmacy Service...
cd /d "%PROJECT_ROOT%services\pharmacy-service"
call npm install --silent

REM Install billing service
echo [INFO] Installing Billing Service...
cd /d "%PROJECT_ROOT%services\billing-service"
call npm install --silent

REM Install reporting service
echo [INFO] Installing Reporting Service...
cd /d "%PROJECT_ROOT%services\reporting-service"
call npm install --silent

REM Install IPD service
echo [INFO] Installing IPD Service...
cd /d "%PROJECT_ROOT%services\ipd-service"
call npm install --silent

REM Install Front Desk service
echo [INFO] Installing Front Desk Service...
cd /d "%PROJECT_ROOT%services\frontdesk-service"
call npm install --silent

REM Install frontend
echo [INFO] Installing Frontend...
cd /d "%PROJECT_ROOT%frontend\angular-app"
call npm install --silent

echo.
echo [SUCCESS] Dependencies installed!
echo [INFO] Starting all services...
echo.

REM Start API Gateway
cd /d "%PROJECT_ROOT%gateway\api-gateway"
start "HMIS - API Gateway" cmd /k "npm run dev"

REM Start Auth Service
cd /d "%PROJECT_ROOT%services\auth-service"
start "HMIS - Auth Service" cmd /k "npm run dev"

REM Start Patient Service
cd /d "%PROJECT_ROOT%services\patient-service"
start "HMIS - Patient Service" cmd /k "npm run dev"

REM Start Doctor Service
cd /d "%PROJECT_ROOT%services\doctor-service"
start "HMIS - Doctor Service" cmd /k "npm run dev"

REM Start Lab Service
cd /d "%PROJECT_ROOT%services\lab-service"
start "HMIS - Lab Service" cmd /k "npm run dev"

REM Start Pharmacy Service
cd /d "%PROJECT_ROOT%services\pharmacy-service"
start "HMIS - Pharmacy Service" cmd /k "npm run dev"

REM Start Billing Service
cd /d "%PROJECT_ROOT%services\billing-service"
start "HMIS - Billing Service" cmd /k "npm run dev"

REM Start Reporting Service
cd /d "%PROJECT_ROOT%services\reporting-service"
start "HMIS - Reporting Service" cmd /k "npm run dev"

REM Start IPD Service
cd /d "%PROJECT_ROOT%services\ipd-service"
start "HMIS - IPD Service" cmd /k "npm run dev"

REM Start Front Desk Service
cd /d "%PROJECT_ROOT%services\frontdesk-service"
start "HMIS - Front Desk Service" cmd /k "npm run dev"

REM Start Frontend
cd /d "%PROJECT_ROOT%frontend\angular-app"
start "HMIS - Frontend" cmd /k "npm start"

echo.
echo ========================================
echo   [SUCCESS] All services started!
echo ========================================
echo.
echo Access points:
echo   Frontend: http://localhost:4200
echo   API Gateway: http://localhost:8080
echo   Login: drrao / password
echo.
echo Each service is running in its own window.
echo Close any window to stop that service.
echo.
pause
