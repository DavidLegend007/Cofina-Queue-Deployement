@echo off
title "Installation Raccourci Bureau - COFINA Caisse"
chcp 65001 >nul

echo ==============================================================================
echo    CRÉATION DU RACCOURCI BUREAU WINDOWS 10 - POSTE CAISSIER COFINA
echo ==============================================================================
echo.

set SERVER_HOST=10.228.2.137
if not "%1"=="" set SERVER_HOST=%1

set DESKTOP_DIR=%USERPROFILE%\Desktop
if not exist "%DESKTOP_DIR%" (
    set DESKTOP_DIR=%HOMEDRIVE%%HOMEPATH%\Desktop
)

set SHORTCUT_PATH=%DESKTOP_DIR%\COFINA - Poste Caisse.url

echo [InternetShortcut] > "%SHORTCUT_PATH%"
echo URL=http://%SERVER_HOST%:4000/?agent >> "%SHORTCUT_PATH%"
echo IconIndex=0 >> "%SHORTCUT_PATH%"

echo.
echo ✅ Le raccourci a été créé sur le bureau Windows 10 :
echo    "%SHORTCUT_PATH%"
echo.
echo Les agents peuvent désormais double-cliquer dessus pour ouvrir leur caisse !
echo.
pause
