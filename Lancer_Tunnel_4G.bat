@echo off
title "Groupe Cofina - Passerelle Publique 4G (Cloudflare Tunnel)"
chcp 65001 >nul

cd /d "%~dp0"

echo ==============================================================================
echo    GROUPE COFINA TOGO - PASSERELLE PUBLIQUE 4G & WI-FI SECURISEE
echo ==============================================================================
echo.

if not exist "cloudflared.exe" (
    echo [INFO] cloudflared.exe absent. Téléchargement en cours depuis Cloudflare...
    curl -L --retry 3 -o cloudflared.exe https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe
    if not exist "cloudflared.exe" (
        echo [ERREUR] Impossible de télécharger cloudflared.exe. Vérifiez votre connexion Internet.
        pause
        exit /b 1
    )
    echo [OK] cloudflared.exe téléchargé avec succès.
    echo.
)

echo Activation du tunnel pour rendre les QR Codes scannables en 4G...
echo.

cloudflared.exe tunnel --no-autoupdate --url http://localhost:4000
pause
