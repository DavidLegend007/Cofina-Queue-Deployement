@echo off
REM ==============================================================================
REM SCRIPT DE DÉPLOIEMENT AUTOMATISÉ WINDOWS — SERVEUR EDGE COFINA TOGO
REM ==============================================================================

echo ==================================================================
echo 🚀 DÉPLOIEMENT DU SYSTÈME DE FILE D'ATTENTE COFINA TOGO (V1 EDGE)
echo ==================================================================

echo 📦 1/4 Installation des dependances...
call npm install
call npm --prefix server install

echo 🗄️ 2/4 Preparation de la base de donnees SQLite locale...
call npm --prefix server run prisma:generate
call npm --prefix server run prisma:push

echo 🛠️ 3/4 Compilation Production (Server ^& Frontend)...
call npm --prefix server run build
call npm run build

echo ⚡ 4/4 Demarrage avec PM2...
call npx pm2 start ecosystem.config.js
call npx pm2 save

echo ==================================================================
echo ✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !
echo ==================================================================
echo 📍 Serveur Edge Operationnel :
echo    - Frontend Web : http://localhost:3000
echo    - Backend API  : http://localhost:4000
echo    - Health Check : http://localhost:4000/health
echo ==================================================================
pause
