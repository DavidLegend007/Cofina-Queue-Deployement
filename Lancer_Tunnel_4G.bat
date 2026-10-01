@echo off
title "Groupe Cofina - Passerelle Publique 4G/5G (Cloudflare Tunnel)"
chcp 65001 >nul

cd /d "%~dp0"

echo ==============================================================================
echo    GROUPE COFINA TOGO - PASSERELLE PUBLIQUE 4G & 5G SECURISEE
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

echo [INFO] Activation du tunnel Cloudflare vers le port local 4000...
echo [INFO] Les QR Codes basculent automatiquement sur la 4G/5G dès que le lien apparait.
echo.

cloudflared.exe tunnel --no-autoupdate --url http://127.0.0.1:4000
pause
