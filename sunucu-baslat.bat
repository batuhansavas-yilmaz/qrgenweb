@echo off
cd /d "%~dp0"
start "QrGen Server" cmd /k python -m http.server 8000
timeout /t 1 >nul
start "" "http://localhost:8000"
