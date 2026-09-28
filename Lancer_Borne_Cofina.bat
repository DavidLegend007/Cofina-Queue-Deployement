@echo off
title Lancement Borne Cofina Edge
echo ===================================================
echo   LANCEMENT DE LA BORNE COFINA EN MODE KIOSK
echo ===================================================
echo.
echo Ce script va fermer Google Chrome et le relancer 
echo en plein ecran avec l'impression silencieuse activee.
echo.
echo Assurez-vous que l'imprimante de tickets est 
echo l'imprimante par defaut sur Windows.
echo.

:: Remplacer l'URL ci-dessous par l'adresse IP du serveur si la borne est sur une autre machine
:: Par exemple : http://192.168.1.100:3000/?module=kiosk
set KIOSK_URL="http://localhost:3000/?module=kiosk"

echo Tentative de fermeture des fenetres Chrome existantes...
taskkill /F /IM chrome.exe /T >nul 2>&1

:: Pause de 2 secondes pour laisser le temps au processus de se terminer
timeout /t 2 /nobreak >nul

echo Demarrage de Chrome...
start chrome.exe --kiosk --kiosk-printing %KIOSK_URL%

echo.
echo Fini !
