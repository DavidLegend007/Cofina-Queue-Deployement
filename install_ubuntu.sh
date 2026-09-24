#!/usr/bin/env bash
# ==============================================================================
# INSTALLATION COMPLÈTE EN 1 CLIC — UBUNTU SERVER (COFINA QUEUE V1 EDGE)
# Supporte : Ubuntu Server 20.04 / 22.04 / 24.04 LTS
# ==============================================================================

set -e

# Vérification des droits administrateur
if [ "$EUID" -ne 0 ]; then
  echo "❌ Veuillez exécuter ce script avec les droits sudo :"
  echo "   sudo bash install_ubuntu.sh"
  exit 1
fi

REAL_USER=${SUDO_USER:-$USER}
USER_HOME=$(eval echo "~$REAL_USER")

echo "=================================================================="
echo "🚀 INSTALLATION AUTOMATIQUE — SERVEUR EDGE COFINA TOGO"
echo "=================================================================="
echo "Utilisateur cible : $REAL_USER"
echo "Dossier personnel : $USER_HOME"
echo "------------------------------------------------------------------"

# 1. Mise à jour du système & paquets de base
echo "📦 1/7 Mise à jour des dépôts Ubuntu & installation des utilitaires..."
apt-get update -y
apt-get install -y curl wget git build-essential ufw net-tools

# 2. Installation de Node.js 20.x LTS (NodeSource)
if ! command -v node &> /dev/null; then
  echo "🟢 2/7 Installation de Node.js 20.x LTS..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
else
  echo "✓ Node.js est déjà installé ($(node -v))"
fi

# 3. Installation de PM2
echo "⚡ 3/7 Installation globale de PM2..."
npm install -g pm2

# 4. Configuration du Pare-feu UFW
echo "🛡️ 4/7 Configuration des règles du pare-feu (UFW)..."
ufw allow 22/tcp comment 'SSH' || true
ufw allow 3000/tcp comment 'Cofina Frontend' || true
ufw allow 4000/tcp comment 'Cofina Backend API' || true
ufw --force enable || true

# 5. Installation des dépendances applicatives
echo "📦 5/7 Installation des dépendances Frontend & Backend..."
cd "$(dirname "$0")"

# Permissions
chown -R "$REAL_USER:$REAL_USER" .

# Exécution en tant qu'utilisateur réel
su - "$REAL_USER" -c "cd $(pwd) && npm install"
su - "$REAL_USER" -c "cd $(pwd) && npm --prefix server install"

# 6. Base de données & compilation
echo "🗄️ 6/7 Génération de la base SQLite locale et compilation..."
su - "$REAL_USER" -c "cd $(pwd) && npm --prefix server run prisma:generate"
su - "$REAL_USER" -c "cd $(pwd) && npm --prefix server run prisma:push"
su - "$REAL_USER" -c "cd $(pwd) && npm --prefix server run build"
su - "$REAL_USER" -c "cd $(pwd) && npm run build"

# 7. Démarrage des processus PM2 avec persistance au démarrage de la machine
echo "🚀 7/7 Démarrage automatique PM2 et persistance au boot..."
su - "$REAL_USER" -c "cd $(pwd) && pm2 start ecosystem.config.cjs"
su - "$REAL_USER" -c "cd $(pwd) && pm2 save"

# Configuration PM2 au démarrage du système (systemd)
env PATH=$PATH:/usr/bin pm2 startup systemd -u "$REAL_USER" --hp "$USER_HOME" || true

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="192.168.1.50"
fi

echo "=================================================================="
echo "🎉 INSTALLATION TERMINÉE AVEC SUCCÈS !"
echo "=================================================================="
echo "Le serveur redémarrera automatiquement même après une coupure d'électricité."
echo ""
echo "📍 ACCÈS DEPUIS LES POSTES DE L'AGENCE :"
echo "   👉 Borne Tactile   : http://${LOCAL_IP}:3000/?kiosk"
echo "   👉 Écran TV Public : http://${LOCAL_IP}:3000/?display"
echo "   👉 Postes Caisses  : http://${LOCAL_IP}:3000/?agent"
echo "   👉 Administration  : http://${LOCAL_IP}:3000/?admin"
echo "   👉 API & Health    : http://${LOCAL_IP}:4000/health"
echo "=================================================================="
