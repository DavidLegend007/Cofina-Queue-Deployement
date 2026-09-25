# 🚀 GUIDE DE DÉPLOIEMENT — SERVEUR EDGE COFINA TOGO

> **Projet** : Système de Gestion de File d'Attente (Cofina Queue System V2 Edge)  
> **Client** : Groupe COFINA Togo (Microfinance — Lomé)  
> **Architecture** : Serveur Edge Local 100% Autonome (Fonctionnement Hors-Ligne Garanti)  
> **Dernière mise à jour** : Septembre 2026

---

## ⚠️ LEÇONS APPRISES (À LIRE EN PREMIER)

Ces points ont causé des problèmes lors du premier déploiement réel. Lisez-les avant de commencer :

| Problème rencontré | Cause | Solution |
|--------------------|-------|----------|
| `npm error: edgesOut` | Bug npm v10+ sur Ubuntu | **Utiliser Yarn** (le script le fait automatiquement) |
| `vitest incompatible` | Vitest v5 exige Node.js 22+ | **Utiliser Node.js 22 LTS** (le script le fait) |
| `ERR_CONNECTION_REFUSED` | Code de serving React mal placé dans `server.ts` | **Corrigé en v2** — serveur sert tout sur port 4000 |
| `git clone: already exists` | Dossier déjà partiellement créé | `rm -rf Cofina-Queue-Deployement` puis recloner |
| `cd` ne trouve pas le dossier | Linux est sensible à la casse | Taper `Cofina` avec **C majuscule** ou utiliser la touche TAB |
| `sudo: authenticate` | Normal — Linux demande le mot de passe sudo | Taper le mot de passe à l'aveugle (rien ne s'affiche à l'écran) |

---

## 📋 1. PRÉREQUIS

- **OS** : Ubuntu Server 22.04 ou 24.04 LTS (fraîchement installé)
- **Réseau** : IP fixe attribuée dans le routeur (ex: `192.168.1.50`)
- **Accès** : Connexion SSH ou écran + clavier sur le serveur
- **Internet** : Nécessaire uniquement pendant l'installation (pas après)

---

## 🚀 2. INSTALLATION EN 5 COMMANDES (APRÈS UBUNTU FRAIS)

C'est la méthode éprouvée. Tapez ces commandes dans l'ordre exact :

```bash
# 1. Cloner le projet depuis GitHub
git clone https://github.com/DavidLegend007/Cofina-Queue-Deployement.git

# 2. Entrer dans le dossier (ATTENTION : C majuscule obligatoire !)
#    Astuce : tapez "cd Cof" puis appuyez sur TAB pour compléter automatiquement
cd Cofina-Queue-Deployement

# 3. Rendre le script d'installation exécutable
chmod +x install_ubuntu.sh

# 4. Lancer l'installation complète (environ 3-5 minutes)
sudo bash install_ubuntu.sh

# 5. Vérifier que tout tourne
pm2 status
```

> **Vous devez voir `online` en vert dans `pm2 status`. C'est terminé !**

---

## ⚙️ 3. CE QUE FAIT LE SCRIPT AUTOMATIQUEMENT

| Étape | Action |
|-------|--------|
| 1/7 | Mise à jour des paquets Ubuntu |
| 2/7 | Installation de **Node.js 22 LTS** (requis par vitest v5) |
| 3/7 | Installation de **Yarn** (contourne le bug `edgesOut` de npm v10) et **PM2** |
| 4/7 | Configuration du pare-feu UFW (ports 22 SSH + 4000 App) |
| 5/7 | Nettoyage + installation propre des dépendances (frontend et backend) |
| 6/7 | Création de la base SQLite + compilation TypeScript + build React |
| 7/7 | Démarrage PM2 + persistance au boot via `systemd` |

---

## 🌐 4. ACCÈS DEPUIS LES POSTES DE L'AGENCE

Une fois le script terminé, il affiche l'IP du serveur. Depuis **n'importe quel PC, téléphone ou tablette** du réseau de l'agence, ouvrez Chrome :

> ⚠️ **Tout passe par le port 4000** — le serveur sert le frontend ET l'API sur ce seul port.

| Poste | URL |
|-------|-----|
| 🖥️ **Borne Tactile Kiosk** | `http://192.168.1.XXX:4000/?kiosk` |
| 📺 **Écran TV Public** | `http://192.168.1.XXX:4000/?display` |
| 👨‍💼 **Poste Caissier** | `http://192.168.1.XXX:4000/?agent` |
| 🔐 **Administration** | `http://192.168.1.XXX:4000/?admin` |
| ✅ **Test Santé Serveur** | `http://192.168.1.XXX:4000/health` |

*Remplacez `XXX` par les derniers chiffres de l'IP affichée à la fin du script ou via `hostname -I`.*

---

## 🖨️ 5. CONFIGURATION DE L'IMPRIMANTE THERMIQUE

- **Modèle** : Xprinter thermique USB
- **Format papier** : 60mm × 40mm
- **Orientation** : Paysage (Landscape)
- **QR Code** : Désactivé
- **Connexion** : USB branché sur le PC de la borne kiosk
- **Configuration** : Définir comme imprimante par défaut dans Windows. Le bouton **Imprimer** dans le kiosk déclenche l'impression automatiquement.

---

## 🔧 6. MISE À JOUR DU LOGICIEL

Quand une nouvelle version est disponible sur GitHub :

```bash
cd Cofina-Queue-Deployement
git reset --hard HEAD
git pull origin main
cd server && yarn build
cd ..
pm2 restart all
```

---

## 🛠️ 7. COMMANDES DE MAINTENANCE COURANTE

```bash
# État des services (doit afficher "online")
pm2 status

# Logs en direct (Ctrl+C pour quitter)
pm2 logs

# Redémarrer l'application
pm2 restart all

# Trouver l'IP du serveur
hostname -I

# Trouver où est installé le projet
pm2 info cofina-queue-server
```

---

## 🚨 8. DÉPANNAGE RAPIDE

### Le site est inaccessible (`ERR_CONNECTION_REFUSED`)
```bash
pm2 status           # Vérifier si le process est "online"
pm2 logs --lines 30  # Chercher l'erreur exacte
pm2 restart all      # Redémarrer
```

### `git pull` refuse avec "local changes"
```bash
git reset --hard HEAD
git pull origin main
```

### Le serveur ne redémarre pas après coupure de courant
```bash
pm2 startup
pm2 save
```

---

## 📞 9. CONTACTS SUPPORT

| Rôle | Contact |
|------|---------|
| Développeur / IT | David (GitHub : DavidLegend007) |
| Assistance agence | 92686060 |
