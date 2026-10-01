#!/usr/bin/env bash
# ==============================================================================
# GROUPE COFINA TOGO — PASSERELLE MOBILE 4G & 5G (CLOUDFLARE TUNNEL LINUX)
# ==============================================================================
# Ce script permet aux clients de scanner le QR Code et de suivre leur ticket
# en temps réel depuis leur smartphone en données mobiles 4G/5G (Togocel, Moov)
# sans avoir besoin d'être connectés au Wi-Fi de l'agence.
# ==============================================================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "=================================================================="
echo "  COFINA TOGO — DÉMARRAGE PASSERELLE 4G & 5G (CLOUDFLARE TUNNEL)"
echo "=================================================================="

# 1. Vérification / Installation de cloudflared sous Linux
if ! command -v cloudflared &> /dev/null && [ ! -f "/usr/local/bin/cloudflared" ]; then
    echo "[INFO] cloudflared absent du serveur. Téléchargement officiel depuis Cloudflare..."
    TMP_BIN="/tmp/cloudflared"
    curl -L --retry 3 https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$TMP_BIN"
    chmod +x "$TMP_BIN"
    if [ "$EUID" -eq 0 ]; then
        mv "$TMP_BIN" /usr/local/bin/cloudflared
    else
        sudo mv "$TMP_BIN" /usr/local/bin/cloudflared
    fi
    echo "[OK] cloudflared installé avec succès dans /usr/local/bin/cloudflared."
fi

CF_CMD="cloudflared"
if [ -f "/usr/local/bin/cloudflared" ]; then
    CF_CMD="/usr/local/bin/cloudflared"
fi

echo "[INFO] Lancement du tunnel HTTPS vers le port local 4000..."
echo "[INFO] Dès que l'adresse https://*.trycloudflare.com apparaîtra, elle sera"
echo "       automatiquement injectée dans les QR Codes de la borne tactile."
echo "------------------------------------------------------------------"

# Lancer cloudflared et capturer l'URL en direct pour alimenter tunnel_url.txt
"$CF_CMD" tunnel --url http://127.0.0.1:4000 --no-autoupdate 2>&1 | while read -r line; do
    echo "$line"
    if echo "$line" | grep -q "https://.*\.trycloudflare\.com"; then
        URL=$(echo "$line" | grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' | head -n 1)
        if [ -n "$URL" ]; then
            echo "$URL" > "$PROJECT_DIR/tunnel_url.txt"
            echo ""
            echo "=================================================================="
            echo "  >>> PASSERELLE 4G/5G ACTIVE : $URL <<<"
            echo "  Les QR codes de la borne basculent automatiquement sur ce lien !"
            echo "=================================================================="
            echo ""
        fi
    fi
done
