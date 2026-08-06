@echo off
TITLE Serveur Local COFINA Queue - Reseau Local LAN
cls

:: Auto-Elevation pour execution en tant qu'Administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ==============================================================================
    echo [INFO] Demande d'elevation des privilèges Administrateur...
    echo ==============================================================================
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

set "APP_DIR=%~dp0"
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"
cd /d "%APP_DIR%"

echo ==============================================================================
echo        COFINA QUEUE -- DEMARRAGE DU SERVEUR CENTRAL LOCAL (LAN)
echo ==============================================================================
echo.

echo [1/4] Liberation des ports 3000 et 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000 :4000"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo [2/4] Configuration Pare-Feu Windows (Ports 3000 et 4000)...
netsh advfirewall firewall delete rule name="Cofina Queue" >nul 2>&1
netsh advfirewall firewall add rule name="Cofina Queue" dir=in action=allow protocol=TCP localport=3000,4000 profile=any >nul 2>&1
powershell -Command "Get-NetConnectionProfile | Set-NetConnectionProfile -NetworkCategory Private" >nul 2>&1

echo [3/4] ADRESSE IP DETECTEE SUR VOTRE RESEAU LOCAL (LAN) :
echo.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    echo    * IP LAN : http:%%a:3000
)
echo.

echo [4/4] Verification et Lancement des Serveurs...
call npm --prefix server run prisma:generate
call npm --prefix server run prisma:push -- --accept-data-loss
call npm --prefix server run build
call npm run build

echo.
echo Lancement du Serveur Backend (Port 4000) et du Frontend Web (Port 3000)...
start "COFINA Serveur Backend (Port 4000)" /D "%APP_DIR%" cmd /k "npm --prefix server start"
start "COFINA Frontend Web (Port 3000)" /D "%APP_DIR%" cmd /k "npm run preview"

echo.
echo ==============================================================================
echo LE SERVEUR CENTRAL EST EN COURS D'EXECUTION !
echo ==============================================================================
echo.
echo ADRESSES POUR CONNECTER LES AUTRES MACHINES DU RESEAU LOCAL :
echo.
echo 1. Connectez la Borne / l'Ecran TV / le PC Caissier au meme reseau Wi-Fi / LAN.
echo 2. Sur l'autre machine, ouvrez Google Chrome ou Microsoft Edge.
echo 3. Saisissez l'adresse de votre ecran :
echo.
echo    - Borne Tactile Ticket : http://[IP_DU_SERVEUR]:3000/?kiosk
echo    - Ecran TV d'Affichage  : http://[IP_DU_SERVEUR]:3000/?display
echo    - Espace Caissier/Caisse: http://[IP_DU_SERVEUR]:3000/?agent
echo    - Superviseur / Admin  : http://[IP_DU_SERVEUR]:3000/?admin
echo.
echo ==============================================================================
echo.
pause
