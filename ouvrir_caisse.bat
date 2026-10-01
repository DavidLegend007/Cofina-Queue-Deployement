@echo off
title "Groupe Cofina - Ouverture du Poste Caissier"
chcp 65001 >nul

cd /d "%~dp0"

echo ==============================================================================
echo    GROUPE COFINA TOGO - ESPACE CAISSIER ET GUICHETIER SECURISE
echo ==============================================================================
echo.

set SERVER_HOST=192.168.1.182
if not "%1"=="" set SERVER_HOST=%1

set CAISSE_URL=http://%SERVER_HOST%:4000/?caisse^&v=%RANDOM%
echo Connexion au serveur : http://%SERVER_HOST%:4000/?caisse...
echo.

where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Lancement en mode fenetre d'application avec Microsoft Edge...
    start msedge.exe --app="%CAISSE_URL%" --no-first-run
) else (
    where chrome >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Lancement en mode fenetre d'application avec Google Chrome...
        start chrome.exe --app="%CAISSE_URL%" --no-first-run
    ) else (
        start %CAISSE_URL%
    )
)

exit
