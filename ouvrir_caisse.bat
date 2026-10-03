@echo off
title "Groupe Cofina - Ouverture du Poste Agent (Guichet / Caisse)"
chcp 65001 >nul

cd /d "%~dp0"

echo ==============================================================================
echo    GROUPE COFINA TOGO - ESPACE AGENT (CAISSES, GUICHETS, CONSEIL, ACCUEIL)
echo ==============================================================================
echo.

set SERVER_HOST=10.228.2.137
if not "%1"=="" set SERVER_HOST=%1

set AGENT_URL=http://%SERVER_HOST%:4000/?agent^&v=%RANDOM%
echo Connexion au serveur : http://%SERVER_HOST%:4000/?agent...
echo.

where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Lancement en mode fenetre d'application avec Microsoft Edge...
    start msedge.exe --app="%AGENT_URL%" --no-first-run
) else (
    where chrome >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Lancement en mode fenetre d'application avec Google Chrome...
        start chrome.exe --app="%AGENT_URL%" --no-first-run
    ) else (
        start %AGENT_URL%
    )
)

exit
