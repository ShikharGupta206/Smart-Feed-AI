@echo off
setlocal
cd /d "%~dp0"
start "SmartFeed API" cmd /k "cd /d "%~dp0backend" && npm install && npm start"
start "SmartFeed React" cmd /k "cd /d "%~dp0frontend" && npm install && npm run dev"
timeout /t 4 /nobreak >nul
start http://localhost:5173
