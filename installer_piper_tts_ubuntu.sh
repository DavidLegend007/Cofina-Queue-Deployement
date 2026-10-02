#!/bin/bash
# ==============================================================================
# INSTALLATEUR AUTOMATIQUE PIPER TTS & VOIX NATURELLE SIWIS HD — COFINA TOGO
# ==============================================================================
# Ce script installe le moteur vocal neuronal Piper TTS et la voix française
# Siwis Medium sur votre serveur Ubuntu.
#
# Usage :
#   chmod +x installer_piper_tts_ubuntu.sh
#   sudo ./installer_piper_tts_ubuntu.sh
# ==============================================================================

set -e

echo "=============================================================================="
echo "  INSTALLATION DU MOTEUR VOCAL PIPER TTS (VOIX HD NATURELLE) — COFINA TOGO"
echo "=============================================================================="
echo ""

# Vérification des droits root
if [ "$EUID" -ne 0 ]; then
  echo "❌ Ce script doit être exécuté avec les privilèges root (sudo)."
  echo "Exécutez : sudo ./installer_piper_tts_ubuntu.sh"
  exit 1
fi

# 1. Vérification des outils nécessaires
echo "[1/5] Vérification des prérequis système (wget, tar)..."
apt-get update -qq
apt-get install -y -qq wget tar ca-certificates curl

# 2. Téléchargement et installation de Piper Linux x86_64
echo ""
echo "[2/5] Téléchargement du binaire autonome Piper TTS..."
TMP_DIR=$(mktemp -d)
cd "$TMP_DIR"

PIPER_URL="https://github.com/rhasspy/piper/releases/download/v1.2.0/piper_linux_x86_64.tar.gz"
wget -q --show-progress "$PIPER_URL" -O piper.tar.gz

echo "Extraction vers /opt/piper..."
mkdir -p /opt/piper
tar -xzf piper.tar.gz -C /opt/

# Création d'un wrapper propre dans /usr/local/bin/piper
cat << 'EOF' > /usr/local/bin/piper
#!/bin/bash
export LD_LIBRARY_PATH="/opt/piper:$LD_LIBRARY_PATH"
exec /opt/piper/piper "$@"
EOF
chmod +x /usr/local/bin/piper
chmod +x /opt/piper/piper

echo "✅ Piper binaire installé avec succès dans /usr/local/bin/piper"

# 3. Téléchargement du modèle de voix féminine française Siwis Medium
echo ""
echo "[3/5] Téléchargement du modèle vocal IA Siwis HD (fr_FR-siwis-medium)..."
VOICES_DIR="/opt/piper-voices"
mkdir -p "$VOICES_DIR"
cd "$VOICES_DIR"

SIWIS_ONNX_URL="https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx"
SIWIS_JSON_URL="https://huggingface.co/rhasspy/piper-voices/resolve/main/fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx.json"

if [ ! -f "$VOICES_DIR/fr_FR-siwis-medium.onnx" ] || [ ! -s "$VOICES_DIR/fr_FR-siwis-medium.onnx" ]; then
  echo "Téléchargement du modèle ONNX (~60 Mo)..."
  wget -q --show-progress "$SIWIS_ONNX_URL" -O fr_FR-siwis-medium.onnx
else
  echo "Le modèle ONNX existe déjà dans $VOICES_DIR."
fi

if [ ! -f "$VOICES_DIR/fr_FR-siwis-medium.onnx.json" ]; then
  echo "Téléchargement du fichier de configuration JSON..."
  wget -q "$SIWIS_JSON_URL" -O fr_FR-siwis-medium.onnx.json
else
  echo "Le fichier de configuration JSON existe déjà."
fi

chmod 644 "$VOICES_DIR"/fr_FR-siwis-medium.*

# 4. Test de synthèse audio
echo ""
echo "[4/5] Test de génération d'une annonce vocale de test..."
TEST_WAV="/tmp/test_piper_cofina.wav"
rm -f "$TEST_WAV"

echo "Ticket R, 0 0 3. Veuillez vous présenter à la caisse 1. Merci." | /usr/local/bin/piper \
  --model "$VOICES_DIR/fr_FR-siwis-medium.onnx" \
  --output_file "$TEST_WAV"

if [ -s "$TEST_WAV" ]; then
  WAV_SIZE=$(du -h "$TEST_WAV" | cut -f1)
  echo "✅ Synthèse vocale réussie ! Fichier audio généré : $TEST_WAV ($WAV_SIZE)"
else
  echo "⚠️ Attention : Le fichier de test semble vide. Vérifiez l'installation de Piper."
fi

# Nettoyage
rm -rf "$TMP_DIR"

# 5. Redémarrage du serveur Node.js / PM2 si présent
echo ""
echo "[5/5] Recompilation du serveur TypeScript Cofina..."
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [ -d "$SCRIPT_DIR/server" ]; then
  cd "$SCRIPT_DIR/server"
  if command -v npm &> /dev/null; then
    npm run build || true
  fi
fi

if command -v pm2 &> /dev/null; then
  echo "Redémarrage de l'instance PM2..."
  pm2 restart cofina-queue-server || pm2 restart all || true
fi

echo ""
echo "=============================================================================="
echo "  🎉 PIPER TTS EST INSTALLÉ ET ACTIVÉ POUR COFINA TOGO !"
echo "=============================================================================="
echo "Modèle actif : $VOICES_DIR/fr_FR-siwis-medium.onnx"
echo "Binaire      : /usr/local/bin/piper"
echo ""
echo "Désormais, les appels de tickets sur l'écran TV utiliseront la voix féminine"
echo "naturelle haute définition Siwis."
echo ""
echo "En cas de défaillance, le système basculera automatiquement sur eSpeak sans"
echo "interrompre le service."
echo "=============================================================================="
