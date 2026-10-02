#!/bin/bash
# ========================================================
#   RESTAURATION DU SYSTÈME COFINA - VERSION STABLE (UBUNTU)
# ========================================================

echo "========================================================"
echo "  RESTAURATION DU SYSTÈME COFINA - VERSION STABLE"
echo "========================================================"
echo ""
echo "Ce script restaure le code à la version stable certifiée :"
echo "Tag : v1.0.0-stable-bilingual-espeak (Commit e1f8cf1)"
echo ""
read -p "Voulez-vous restaurer cette version ? (o/n) : " CONFIRM
if [[ "$CONFIRM" != "o" && "$CONFIRM" != "O" ]]; then
    echo "Opération annulée."
    exit 0
fi

echo ""
echo "[1/3] Récupération de la branche stable..."
git checkout backup-stable-version || exit 1

echo ""
echo "[2/3] Recompilation du frontend de production..."
npm run build

echo ""
echo "[3/3] Vérification des tests..."
npm test

echo ""
echo "========================================================"
echo "  VERSION STABLE RESTAURÉE AVEC SUCCÈS !"
echo "========================================================"
echo "Redémarrez le service avec : pm2 restart cofina-queue-server"
echo ""
