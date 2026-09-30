@echo off
title "Groupe Cofina - Ouverture du Poste Caissier"
chcp 65001 >nul

cd /d "%~dp0"

echo ==============================================================================
echo    GROUPE COFINA TOGO - ESPACE CAISSIER ET GUICHETIER SECURISE
echo ==============================================================================
echo.
echo Lancement de la session caissier dans le navigateur...
echo.

set SERVER_HOST=192.168.1.182
if not "%1"=="" set SERVER_HOST=%1

set CAISSE_URL=http://%SERVER_HOST%:4000/?agent^&v=%RANDOM%

where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start msedge.exe "%CAISSE_URL%" --no-first-run
) else (
    where chrome >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        start chrome.exe "%CAISSE_URL%" --no-first-run
    ) else (
        start %CAISSE_URL%
    )
)

exit
