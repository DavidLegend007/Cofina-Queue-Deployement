@echo off
chcp 65001 >nul
TITLE Serveur Local COFINA Queue - Mode Dev LAN
cls

REM Fix trailing backslash on directory path to avoid CMD quote escaping bug
set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"

cd /d "%APP_DIR%"

echo ==============================================================================
echo       🚀 COFINA QUEUE — DÉMARRAGE MODE DÉVELOPPEMENT (LAN)
echo ==============================================================================
echo.

REM 1. Nettoyage des ports
echo 🧹  [1/3] Liberation des ports 3000 et 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 :4000"') do (
    taskkill /F /PID %%a >nul 2>&1
)

REM 2. Pare-feu Windows
echo 🛡️  [2/3] Ouverture du Pare-Feu Windows (Ports 3000 et 4000)...
netsh advfirewall firewall delete rule name="Cofina Queue" >nul 2>&1
netsh advfirewall firewall add rule name="Cofina Queue" dir=in action=allow protocol=TCP localport=3000,4000 profile=any >nul 2>&1

REM 3. IP LAN
echo 🌐 [3/3] Adresse IP de ce PC sur le reseau local :
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    echo    👉 IP LAN DETECTEE : http:%%a:3000
)
echo.
echo ⚡ Lancement du Serveur Backend (Port 4000) et Frontend (Port 3000) en Mode Dev...
echo.

start "COFINA Backend Server (Dev)" /D "%APP_DIR%" cmd /k "npm --prefix server run dev"
start "COFINA Frontend Client (Dev)" /D "%APP_DIR%" cmd /k "npm run dev"

echo ✅ Les deux serveurs sont lances dans 2 fenetres séparées !
echo.
pause
