@echo off
echo Starting Care Portal...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: Docker is not running. Starting without Docker services...
    echo You can start Docker services later with: docker-compose up -d
    echo.
    goto :skip_docker
)

REM Start Docker services
echo Starting Docker services (PostgreSQL, Redis, Monitoring)...
docker-compose up -d postgres redis prometheus grafana
echo Waiting for services to be ready...
timeout /t 10 /nobreak >nul

:skip_docker

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

REM Generate Prisma client
echo Generating Prisma client...
cd backend
npx prisma generate
cd ..

REM Run database migrations
echo Running database migrations...
cd backend
npx prisma migrate deploy
cd ..

REM Seed database
echo Seeding database with initial data...
cd backend
npx prisma db seed
cd ..

REM Start the application
echo.
echo Starting Care Portal...
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:3001
echo API Documentation: http://localhost:3001/api
echo Grafana Dashboard: http://localhost:3002 (admin/admin)
echo.

REM Start both frontend and backend
start "Backend" cmd /k "cd backend && npm run start:dev"
timeout /t 5 /nobreak >nul
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Care Portal is starting...
echo Check the opened terminal windows for logs.
echo Press any key to exit this script (services will continue running)
pause >nul
