@echo off
title "Groupe Cofina - Widget Caissier Flottant"
chcp 65001 >nul

cd /d "%~dp0"

echo ==============================================================================
echo    GROUPE COFINA TOGO - MINI WIDGET CAISSIER FLOTTANT (COMPACT 380x480)
echo ==============================================================================
echo.

set SERVER_HOST=10.228.2.137
if not "%1"=="" set SERVER_HOST=%1

set WIDGET_URL=http://%SERVER_HOST%:4000/?widgetOnly=true^&v=%RANDOM%
echo Connexion au widget caissier : http://%SERVER_HOST%:4000/?widgetOnly=true...
echo.

where msedge >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Lancement en mini-fenêtre avec Microsoft Edge...
    start msedge.exe --app="%WIDGET_URL%" --window-size=380,500 --no-first-run
) else (
    where chrome >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [OK] Lancement en mini-fenêtre avec Google Chrome...
        start chrome.exe --app="%WIDGET_URL%" --window-size=380,500 --no-first-run
    ) else (
        start %WIDGET_URL%
    )
)

exit
