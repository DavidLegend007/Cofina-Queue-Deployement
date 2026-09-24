#!/usr/bin/env bash
# ==============================================================================
# SCRIPT DE DÉPLOIEMENT AUTOMATISÉ — SERVEUR EDGE COFINA TOGO
# ==============================================================================

set -e

echo "=================================================================="
echo "🚀 DÉPLOIEMENT DU SYSTÈME DE FILE D'ATTENTE COFINA TOGO (V1 EDGE)"
echo "=================================================================="

# 1. Verification de Node.js et PM2
if ! command -v node &> /dev/null; then
    echo "❌ Erreur : Node.js n'est pas installé. Veuillez exécuter 'sudo bash install_ubuntu.sh' pour l'installation complète."
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 n'est pas installé. Installation de PM2..."
    npm install -g pm2 || sudo npm install -g pm2
fi

echo "📦 1/5 Installation des dépendances Frontend & Backend..."
npm install
npm --prefix server install

echo "🗄️ 2/5 Préparation de la base de données SQLite locale..."
npm --prefix server run prisma:generate
npm --prefix server run prisma:push

echo "🛠️ 3/5 Compilation Production (Server & Frontend)..."
npm --prefix server run build
npm run build

echo "⚡ 4/5 Démarrage des processus avec PM2..."
pm2 start ecosystem.config.cjs || pm2 restart ecosystem.config.cjs
pm2 save

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
if [ -z "$LOCAL_IP" ]; then
    LOCAL_IP="localhost"
fi

echo "=================================================================="
echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "=================================================================="
echo "📍 Serveur Edge Opérationnel sur le Réseau :"
echo "   👉 Borne Kiosque    : http://${LOCAL_IP}:3000/?kiosk"
echo "   👉 Écran TV Public  : http://${LOCAL_IP}:3000/?display"
echo "   👉 Espace Caissier  : http://${LOCAL_IP}:3000/?agent"
echo "   👉 Administration   : http://${LOCAL_IP}:3000/?admin"
echo "   👉 Backend API      : http://${LOCAL_IP}:4000/health"
echo "=================================================================="
