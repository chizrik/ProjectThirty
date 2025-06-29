@echo off
echo 🐳 Starting 30-Day Challenge App with Docker...

REM Build and run with docker-compose
docker-compose up --build

echo 🚀 App should be running at http://localhost:3000
pause
