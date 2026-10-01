#!/usr/bin/env bash
# ==============================================================================
# GROUPE COFINA TOGO — PASSERELLE 4G & 5G MOBILE (CLOUDFLARE TUNNEL LINUX)
# ==============================================================================
# Ce script permet aux clients de scanner le QR Code et d'accéder à leur ticket
# depuis n'importe quel smartphone avec leur connexion 4G/5G (Togocel, Moov)
# sans avoir besoin d'être sur le Wi-Fi de l'agence.
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "=================================================================="
echo "  COFINA TOGO — ACTIVATION PASSERELLE 4G & 5G (CLOUDFLARE TUNNEL)"
echo "=================================================================="

# 1. Détection du binaire cloudflared
CF_BIN=""

if command -v cloudflared >/dev/null 2>&1; then
    CF_BIN="cloudflared"
elif [ -f "/usr/local/bin/cloudflared" ]; then
    CF_BIN="/usr/local/bin/cloudflared"
elif [ -f "$PROJECT_DIR/cloudflared" ]; then
    CF_BIN="$PROJECT_DIR/cloudflared"
fi

# 2. Téléchargement local si absent (sans aucun besoin de mot de passe root / sudo)
if [ -z "$CF_BIN" ]; then
    echo "[INFO] cloudflared absent. Téléchargement officiel pour Linux en cours..."
    curl -L --retry 3 https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o "$PROJECT_DIR/cloudflared"
    chmod +x "$PROJECT_DIR/cloudflared"
    CF_BIN="$PROJECT_DIR/cloudflared"
    echo "[OK] cloudflared téléchargé avec succès dans le projet."
fi

# S'assurer que le binaire est bien exécutable
chmod +x "$CF_BIN" 2>/dev/null || true

echo "[INFO] Lancement du tunnel sécurisé vers le serveur local (port 4000)..."
echo "[INFO] L'adresse HTTPS générée sera automatiquement injectée dans les QR Codes."
echo "------------------------------------------------------------------"

# 3. Exécution du tunnel et capture automatique de l'URL publique
"$CF_BIN" tunnel --url http://127.0.0.1:4000 --no-autoupdate 2>&1 | while IFS= read -r line; do
    echo "$line"
    # Extraction de l'URL publique Cloudflare
    if echo "$line" | grep -q "trycloudflare.com"; then
        URL=$(echo "$line" | grep -o 'https://[a-zA-Z0-9.-]*\.trycloudflare\.com' | head -n 1)
        if [ -n "$URL" ]; then
            echo "$URL" > "$PROJECT_DIR/tunnel_url.txt"
            echo ""
            echo "=================================================================="
            echo "  >>> PASSERELLE 4G/5G ACTIVE AVEC SUCCÈS ! <<<"
            echo "  Lien public : $URL"
            echo "  Les QR codes de la borne tactile basculent en direct sur la 4G/5G."
            echo "=================================================================="
            echo ""
        fi
    fi
done
