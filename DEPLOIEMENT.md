# 🚀 GUIDE DE DÉPLOIEMENT TOTAL — SERVEUR EDGE COFINA TOGO

> **Projet** : Système de Gestion de File d'Attente (Cofina Queue System V1 Edge)  
> **Client** : Groupe COFINA Togo (Microfinance — Lomé)  
> **Architecture** : Serveur Edge Local 100% Autonome (Fonctionnement Hors-Ligne Garanti)

---

## 📋 1. PRÉREQUIS SYSTÈME (SERVEUR EDGE D'AGENCE)

Le Serveur Edge d'agence est un Mini-PC (Intel NUC ou serveur sous Linux Ubuntu / Windows 10-11 Pro) installé dans la baie réseau de l'agence.

- **Système d'Exploitation recommandé** : Ubuntu Server 22.04 LTS (ou Windows 10/11 Pro)
- **Node.js** : Version 18.x ou 20.x LTS ([nodejs.org](https://nodejs.org))
- **Git** : Installé
- **PM2 Process Manager** : Installé globalement via `npm install -g pm2`
- **Réseau Local (LAN)** : Attribution d'une **IP fixe** au serveur Edge (ex: `192.168.1.50`) dans le routeur/switch de l'agence.

---

## 🛠️ 2. INSTALLATION AUTOMATIQUE SUR UBUNTU SERVER (EN 1 CLIC)

Si votre serveur tourne sous **Ubuntu Server (20.04, 22.04 ou 24.04 LTS)**, un script automatisé configure tout de A à Z (Node.js 20, PM2, Pare-feu, Base de données SQLite, Compilation et Démarrage persistant au boot) :

### Méthode Rapide :
```bash
# 1. Se placer dans le dossier du projet
cd /opt/Cofina-Queue-Deployement # (ou le dossier où vous avez copié le projet)

# 2. Rendre le script exécutable et le lancer avec sudo
sudo chmod +x install_ubuntu.sh
sudo bash install_ubuntu.sh
```

Le script installe automatiquement :
- Les dépendances système (`curl`, `build-essential`, `ufw`, `git`)
- **Node.js 20.x LTS** officiel
- **PM2** configuré avec `systemd` pour redémarrage automatique après coupure de courant
- Les règles du pare-feu (`UFW` autorisant ports 22, 3000, 4000)
- La base de données **SQLite locale** (`prisma:push`)
- Le build production optimisé du frontend et du backend

---

## 🛠️ 3. DÉPLOIEMENT MANUEL ÉTAPE PAR ÉTAPE (ALTERNATIVE)

### Étape 1 : Cloner ou Transférer le Répertoire

**Option A — Via Git :**
```bash
cd /opt
git clone <URL_DU_DEPOT_GIT> Cofina
cd Cofina
```

**Option B — Depuis votre PC Windows vers le serveur Ubuntu via SCP :**
```powershell
# Depuis le terminal PowerShell de votre PC Windows :
scp -r d:\Cofina-Queue-Deployement utilisateur@IP_DU_SERVEUR_UBUNTU:/home/utilisateur/
```

Puis installez les dépendances :
```bash
npm install
npm --prefix server install
```

---

### Étape 2 : Initialiser la Base de Données SQLite Locale

La base SQLite `cofina_edge.db` conserve les tickets et les profils caissiers localement en agence.

```bash
# 1. Générer le client Prisma
npm --prefix server run prisma:generate

# 2. Synchroniser le schéma Prisma dans SQLite
npm --prefix server run prisma:push
```

---

### Étape 3 : Compiler les Applications (Build Production)

```bash
# 1. Compiler le serveur backend Node.js / TypeScript
npm --prefix server run build

# 2. Compiler l'application Frontend React Vite
npm run build
```

---

### Étape 4 : Lancer les Services avec PM2 (Redémarrage Automatique)

PM2 garantit que l'application **redémarre automatiquement après une coupure d'électricité**.

```bash
# 1. Lancer le frontend et le backend avec PM2
pm2 start ecosystem.config.cjs

# 2. Sauvegarder la liste des processus PM2
pm2 save

# 3. Activer le démarrage automatique au boot du système
pm2 startup
```

---

## 🖥️ 3. CONFIGURATION DES POSTES CLIENTS D'AGENCE

Une fois le serveur démarré sur l'IP locale (exemple : `http://192.168.1.50`), configurez les écrans de l'agence :

### A. Borne Tactile Auto-Service (Entrée Agence)
1. Ouvrir le navigateur Chrome/Edge en **mode Kiosque (Plein écran)** sur l'adresse :
   `http://192.168.1.50:3000`
2. Sélectionner le module **Borne Kiosque**.
3. Raccorder l'imprimante thermique USB (ESC/POS 80mm/58mm).

### B. Écran TV Public (Salle d'Attente)
1. Ouvrir le navigateur sur l'adresse :
   `http://192.168.1.50:3000`
2. Sélectionner le module **Écran TV Public**.
3. Cliquer une fois sur la page pour débloquer l'audio de la synthèse vocale (`SpeechSynthesis`).
4. Mettre en plein écran (`F11`).

### C. Guichets Caissiers (Caisse 1 à Caisse 4)
1. Sur les PC des caissiers, ouvrir :
   `http://192.168.1.50:3000`
2. Sélectionner le module **Poste Caissier** (ou activer le widget flottant).
3. Sélectionner le numéro du guichet attribué (Caisse 1, 2, 3 ou 4).

---

## 📊 4. SUPERVISION & DASHBOARD METABASE (OPTIONNEL DOCKER)

Si l'agence dispose de Docker sur le serveur Edge :

```bash
# Démarrer la stack PostgreSQL + Metabase BI + Uptime Kuma
docker compose up -d
```

- **Metabase Dashboard BI** : `http://192.168.1.50:3001`
- **Uptime Kuma Supervision** : `http://192.168.1.50:3002`

---

## ⚡ 5. COMMANDES DE MAINTENANCE COURANTE

```bash
# Vérer l'état des services PM2
pm2 status

# Consulter les logs du serveur en direct
pm2 logs cofina-queue-server

# Redémarrer l'application
pm2 restart all

# Exporter manuellement les données au format CSV
# Disponible dans l'interface Admin > Exporter CSV
```
