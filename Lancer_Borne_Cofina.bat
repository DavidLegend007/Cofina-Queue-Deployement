@echo off
title "Groupe Cofina - Demarrage Unifie (Serveur Edge et Borne Tactile)"
chcp 65001 >nul
cls

setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ==============================================================================
echo    GROUPE COFINA TOGO - SYSTEME DE GESTION DE FILE D'ATTENTE
echo        SCRIPT UNIFIE : DEMARRAGE SERVEUR EDGE ET BORNE TACTILE
echo ==============================================================================
echo.

REM 1. Verification de Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe ou n'est pas dans le PATH systeme.
    echo Veuillez installer Node.js v18+ LTS pour executer le serveur Cofina.
    pause
    exit /b 1
)

REM 2. Verification et Demarrage du Serveur Edge Local (Port 4000)
echo [1/4] Verification de l'etat du Serveur Edge Local (Port 4000)...
netstat -ano | findstr :4000 | findstr LISTENING >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo       -^> Le serveur n'est pas demarre. Lancement automatique en arriere-plan...
    start /min "Serveur Edge Cofina (Port 4000)" cmd /c "set NODE_ENV=production&& set PORT=4000&& node server/dist/server.js"
    
    echo       -^> En attente de l'initialisation du serveur...
    set RETRIES=0
    :WAIT_SERVER
    powershell -Command "try { $res = Invoke-WebRequest -Uri 'http://localhost:4000/health' -UseBasicParsing -TimeoutSec 1; if ($res.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }" >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        set /a RETRIES+=1
        if !RETRIES! LEQ 8 (
            timeout /t 1 /nobreak >nul
            goto WAIT_SERVER
        )
    )
    echo       [OK] Serveur Edge demarre et operationnel.
) else (
    echo       [OK] Serveur Edge deja actif et en ecoute sur le port 4000.
)
echo.

REM 3. Recuperation de l'adresse IP locale pour les autres postes de l'agence
for /f "usebackq tokens=*" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback|vEthernet|Virtual' -and $_.IPAddress -notmatch '^169\.' } | Select-Object -ExpandProperty IPAddress -First 1)"`) do (
    set LOCAL_IP=%%i
)
if "%LOCAL_IP%"=="" set LOCAL_IP=localhost

REM 4. Option Mode Serveur Seul (si appele avec argument --server-only ou -s)
if /i "%1"=="--server-only" goto SERVER_ONLY_MODE
if /i "%1"=="server" goto SERVER_ONLY_MODE
if /i "%1"=="-s" goto SERVER_ONLY_MODE

REM 5. Fermeture des sessions Edge residuelles pour garantir le mode Kiosk propre
echo [2/4] Preparation de l'affichage tactile...
taskkill /F /IM msedge.exe /T >nul 2>&1
timeout /t 1 /nobreak >nul

REM 6. Lancement de Microsoft Edge en Mode Kiosk Plein Ecran avec Impression Silencieuse
echo [3/4] Demarrage de la Borne Tactile (Mode Kiosk + Xprinter 58mm)...
set KIOSK_URL=http://localhost:4000/?kiosk^&v=%RANDOM%

where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start msedge.exe --kiosk "%KIOSK_URL%" --edge-kiosk-type=fullscreen --kiosk-printing --no-first-run --no-default-browser-check
) else (
    where chrome >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        start chrome.exe --kiosk "%KIOSK_URL%" --kiosk-printing --no-first-run --no-default-browser-check
    ) else (
        start %KIOSK_URL%
    )
)
goto SUMMARY_ALL

:SERVER_ONLY_MODE
echo [INFO] Mode Serveur Seul active : Pas d'ouverture de l'ecran borne.
goto SUMMARY_ALL

:SUMMARY_ALL
REM 7. Bilan et Adresses du reseau local
echo.
echo ==============================================================================
echo    BORNE TACTILE ET SERVEUR EDGE OPERATIONNELS !
echo ==============================================================================
echo.
echo   Adresses reseau disponibles pour les postes de l'agence :
echo     - Borne Tactile   : http://localhost:4000/?kiosk  (ou http://%LOCAL_IP%:4000/?kiosk)
echo     - Postes Caisses  : http://%LOCAL_IP%:4000/?agent
echo     - Ecran TV Public : http://%LOCAL_IP%:4000/?display
echo     - Supervision     : http://%LOCAL_IP%:4000/?admin
echo.
echo   Pour quitter la borne plein ecran : Appuyez sur [Alt] + [F4]
echo ==============================================================================
ping 127.0.0.1 -n 5 >nul 2>&1
exit
