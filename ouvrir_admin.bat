@echo off
title "Groupe Cofina - Console d'Administration & Supervision"
chcp 65001 >nul

cd /d "%~dp0"

echo ==============================================================================
echo    GROUPE COFINA TOGO - CONSOLE D'ADMINISTRATION ET DE SUPERVISION
echo ==============================================================================
echo.
echo Lancement de la console d'administration dans le navigateur...
echo.

set SERVER_HOST=10.228.2.137
if not "%1"=="" set SERVER_HOST=%1

set ADMIN_URL=http://%SERVER_HOST%:4000/?admin^&v=%RANDOM%

where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    start msedge.exe "%ADMIN_URL%" --no-first-run
) else (
    where chrome >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        start chrome.exe "%ADMIN_URL%" --no-first-run
    ) else (
        start %ADMIN_URL%
    )
)

exit
