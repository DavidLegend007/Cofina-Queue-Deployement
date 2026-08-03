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
    echo "❌ Erreur : Node.js n'est pas installé. Veuillez installer Node.js 18+."
    exit 1
fi

if ! command -v pm2 &> /dev/null; then
    echo "⚠️ PM2 n'est pas installé. Installation globale de PM2..."
    npm install -g pm2
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
pm2 start ecosystem.config.js || pm2 restart ecosystem.config.js
pm2 save

echo "=================================================================="
echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !"
echo "=================================================================="
echo "📍 Serveur Edge Opérationnel :"
echo "   - Frontend Web : http://localhost:3000"
echo "   - Backend API  : http://localhost:4000"
echo "   - Health Check : http://localhost:4000/health"
echo "=================================================================="
