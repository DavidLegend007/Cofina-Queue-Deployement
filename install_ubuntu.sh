#!/usr/bin/env bash
# ==============================================================================
# INSTALLATION COMPLÈTE EN 1 CLIC — UBUNTU SERVER (COFINA QUEUE V2 EDGE)
# Supporte : Ubuntu Server 20.04 / 22.04 / 24.04 LTS
# Fix : npm v10 edgesOut bug → utilise yarn pour les installations
# ==============================================================================

set -euo pipefail

# Vérification des droits administrateur
if [ "$EUID" -ne 0 ]; then
  echo "Veuillez executer ce script avec les droits sudo :"
  echo "   sudo bash install_ubuntu.sh"
  exit 1
fi

REAL_USER=${SUDO_USER:-$USER}
USER_HOME=$(eval echo "~$REAL_USER")
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=================================================================="
echo "INSTALLATION AUTOMATIQUE — SERVEUR EDGE COFINA TOGO"
echo "=================================================================="
echo "Utilisateur : $REAL_USER | Projet : $PROJECT_DIR"
echo "------------------------------------------------------------------"

# 1. Mise a jour du systeme
echo "[1/7] Mise a jour des depots Ubuntu..."
apt-get update -y -qq
apt-get install -y -qq curl wget git build-essential ufw net-tools

# 2. Node.js 20.x LTS
echo "[2/7] Verification de Node.js 20.x LTS..."
if node --version 2>/dev/null | grep -q "^v20"; then
  echo "   OK : Node.js $(node --version) deja installe."
else
  echo "   Installation de Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - >/dev/null 2>&1
  apt-get install -y -qq nodejs
  echo "   OK : Node.js $(node --version) installe."
fi

# 3. Yarn + PM2 (yarn evite le bug edgesOut de npm v10+)
echo "[3/7] Installation de Yarn et PM2..."
npm install -g yarn pm2 --quiet 2>/dev/null || true
echo "   OK : Yarn $(yarn --version) | PM2 $(pm2 --version)"

# 4. Pare-feu UFW
echo "[4/7] Configuration du pare-feu (UFW)..."
ufw allow 22/tcp   comment 'SSH'            >/dev/null 2>&1 || true
ufw allow 4000/tcp comment 'Cofina App'     >/dev/null 2>&1 || true
ufw --force enable >/dev/null 2>&1 || true
echo "   OK : Ports 22 (SSH) et 4000 (App) ouverts."

# 5. Nettoyage complet + installation avec Yarn
echo "[5/7] Nettoyage et installation des dependances via Yarn..."
chown -R "$REAL_USER:$REAL_USER" "$PROJECT_DIR"

# Frontend
rm -f "$PROJECT_DIR/package-lock.json"
rm -rf "$PROJECT_DIR/node_modules"
su - "$REAL_USER" -c "cd '$PROJECT_DIR' && yarn install --silent"
echo "   OK : Frontend installe."

# Backend
rm -f "$PROJECT_DIR/server/package-lock.json"
rm -rf "$PROJECT_DIR/server/node_modules"
su - "$REAL_USER" -c "cd '$PROJECT_DIR/server' && yarn install --silent"
echo "   OK : Backend installe."

# 6. Base de donnees + compilation
echo "[6/7] Base de donnees SQLite & compilation..."

# Cree server/.env si absent
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
  if [ -f "$PROJECT_DIR/server/.env.example" ]; then
    cp "$PROJECT_DIR/server/.env.example" "$PROJECT_DIR/server/.env"
  else
    printf "NODE_ENV=production\nPORT=4000\nJWT_SECRET=cofina_change_me\nADMIN_PASSWORD=cofinaAdmin2026!\nAGENT_PASSWORD=cofina2026\nDATABASE_URL=file:./data/cofina.db\n" > "$PROJECT_DIR/server/.env"
  fi
  chown "$REAL_USER:$REAL_USER" "$PROJECT_DIR/server/.env"
fi

mkdir -p "$PROJECT_DIR/server/data"
chown -R "$REAL_USER:$REAL_USER" "$PROJECT_DIR/server/data"

su - "$REAL_USER" -c "cd '$PROJECT_DIR/server' && yarn prisma:generate 2>&1 | tail -2"
su - "$REAL_USER" -c "cd '$PROJECT_DIR/server' && yarn prisma:push 2>&1 | tail -3"
echo "   OK : Base de donnees prete."

su - "$REAL_USER" -c "cd '$PROJECT_DIR/server' && yarn build 2>&1 | tail -3"
echo "   OK : Backend compile."

su - "$REAL_USER" -c "cd '$PROJECT_DIR' && yarn build 2>&1 | tail -3"
echo "   OK : Frontend compile."

# 7. Demarrage PM2
echo "[7/7] Demarrage PM2 et persistance au boot..."
su - "$REAL_USER" -c "pm2 delete all 2>/dev/null || true"
su - "$REAL_USER" -c "cd '$PROJECT_DIR' && pm2 start ecosystem.config.cjs"
su - "$REAL_USER" -c "pm2 save"

PM2_STARTUP=$(su - "$REAL_USER" -c "pm2 startup systemd -u $REAL_USER --hp $USER_HOME 2>/dev/null" | grep "^sudo" || true)
if [ -n "$PM2_STARTUP" ]; then
  eval "$PM2_STARTUP" || true
fi

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "192.168.1.50")

echo ""
echo "=================================================================="
echo "INSTALLATION TERMINEE AVEC SUCCES !"
echo "=================================================================="
echo "  Borne Tactile  : http://${LOCAL_IP}:4000/?kiosk"
echo "  Ecran TV       : http://${LOCAL_IP}:4000/?display"
echo "  Caissiers      : http://${LOCAL_IP}:4000/?agent"
echo "  Administration : http://${LOCAL_IP}:4000/?admin"
echo "  Health Check   : http://${LOCAL_IP}:4000/health"
echo ""
echo "COMMANDES UTILES :"
echo "  pm2 status       → Etat des services"
echo "  pm2 logs         → Logs en direct"
echo "  pm2 restart all  → Redemarrer l'application"
echo "=================================================================="

