# 🚀 GUIDE DE DÉPLOIEMENT & EXPLOITATION — SERVEUR EDGE COFINA TOGO

> **Projet** : Système de Gestion de File d'Attente (Cofina Queue System V2 Edge & 4G)  
> **Client** : Groupe COFINA Togo (Microfinance — Lomé)  
> **Architecture** : Serveur Edge Local 100% Autonome (Fonctionnement Hors-Ligne Garanti) + Passerelle Publique 4G  
> **Dernière mise à jour** : 30 Septembre 2026

---

## ⚠️ LEÇONS APPRISES & RÈGLES CRITIQUES D'EXPLOITATION

Ces points issus de retours terrain doivent être impérativement respectés :

| Point Critique | Explication & Règle d'or | Solution Validée |
| :--- | :--- | :--- |
| **Port d'écoute unifié** | En production, le serveur Express sert le frontend React ET l'API REST sur **un seul port : 4000**. Ne pas chercher à ouvrir le port 3000 (réservé au dev). | Toutes les URLs d'agence pointent vers le port `4000`. |
| **Bannière de navigation** | Par défaut en production, **la barre de navigation supérieure est masquée** sur la borne, les caisses, l'admin et l'écran TV pour éviter les fausses manipulations. | Mode démo activable avec `?demo=true` ou `?nav=true`. |
| **Passerelle 4G optionnelle** | Si les clients scannent le QR Code depuis leur connexion mobile 4G/5G (sans le Wi-Fi agence), le tunnel Cloudflare doit être actif. | Lancer `Lancer_Tunnel_4G.bat` et renseigner `PUBLIC_URL` dans `.env`. |
| **Version Node.js** | Vitest v5 et les modules modernes exigent **Node.js 22 LTS ou supérieur**. | Vérifier avec `node -v` (>= 22.0.0). |
| **Format Papier Xprinter** | L'imprimante thermique USB Xprinter 58mm utilise un format compact paysage. | Format : **58mm × 50mm**, orientation **Paysage (Landscape)**. |

---

## 🖥️ MÉTHODE 1 : EXPLOITATION WINDOWS (MINI-PC EDGE EN AGENCE)

Cette méthode est la plus simple et la plus courante pour les agences équipées d'un Mini-PC sous **Windows 10 / Windows 11**.

### 1.1 Prérequis Windows
- **Node.js 22 LTS** installé (avec npm).
- Navigateur **Google Chrome** ou **Microsoft Edge** installé.
- Imprimante thermique **Xprinter 58mm USB** installée et configurée comme imprimante par défaut.
- IP fixe attribuée au Mini-PC sur le routeur de l'agence (ex: `192.168.1.50`).

### 1.2 Installation initiale (Une seule fois)
Ouvrir un terminal PowerShell ou Invite de commandes dans le dossier du projet :

```powershell
# 1. Installer les dépendances du frontend et du backend
npm install
npm --prefix server install

# 2. Initialiser la base de données locale SQLite
npm --prefix server run prisma:generate
npm --prefix server run prisma:push

# 3. Compiler le frontend pour la production
npm run build
```

### 1.3 Démarrage quotidien en agence (Le matin)

L'exploitation est automatisée via des scripts `.bat` prêts à l'emploi :

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                   SÉQUENCE DE DÉMARRAGE QUOTIDIEN EN AGENCE                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Sur le Mini-PC Edge (Serveur) :                                          │
│    👉 Double-cliquer sur "Lancer_Borne_Cofina.bat"                          │
│       • Vérifie et compile le projet si nécessaire                          │
│       • Démarre automatiquement le serveur Node.js sur le port 4000         │
│       • Ouvre la borne tactile en plein écran sécurisé (Kiosk Mode)         │
│                                                                             │
│ 2. [Optionnel] Pour permettre le scan du QR Code en 4G par les clients :   │
│    👉 Double-cliquer sur "Lancer_Tunnel_4G.bat"                             │
│       • Ouvre le tunnel Cloudflare chiffré en HTTPS                         │
│       • Les téléphones clients scannent sans avoir besoin du Wi-Fi agence   │
│                                                                             │
│ 3. Sur les PC Caissiers (Caisses 1 à 3 & Opérateurs 4 à 6) :               │
│    👉 Double-cliquer sur "ouvrir_caisse.bat"                                │
│       • Ouvre l'espace de travail caissier dédié sans navbar                │
│       • Supporte le paramètre d'IP : ouvrir_caisse.bat 192.168.1.50         │
│                                                                             │
│ 4. Sur l'Écran TV de la salle d'attente (connecté en HDMI ou boîtier) :     │
│    👉 Double-cliquer sur "ouvrir_ecran_tv.bat"                              │
│       • Ouvre l'affichage des appels avec le son activé                     │
│                                                                             │
│ 5. Sur le PC du Superviseur / Responsable d'agence :                       │
│    👉 Double-cliquer sur "ouvrir_admin.bat"                                 │
│       • Ouvre la console d'administration et de supervision                 │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🌐 CONFIGURATION DE LA PASSERELLE 4G (CLOUDFLARE TUNNEL)

Pour que les usagers puissent scanner le QR Code de leur ticket avec n'importe quelle connexion mobile (Togocel 4G, Moov 4G) sans être connectés au Wi-Fi de l'agence :

### Étape 1 : Démarrer le tunnel
Double-cliquez sur **`Lancer_Tunnel_4G.bat`**. La console s'ouvre et affiche une URL de type :
```
https://xxxx-xxxx-xxxx.trycloudflare.com
```

### Étape 2 : Configurer le fichier `.env`
Ouvrez le fichier `.env` à la racine et collez l'URL obtenue :
```ini
VITE_SERVER_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
VITE_AGENCY_NAME=Agence Siège Kodjoviakopé (Lomé)
PUBLIC_URL=https://xxxx-xxxx-xxxx.trycloudflare.com
VITE_PUBLIC_URL=https://xxxx-xxxx-xxxx.trycloudflare.com
```

Faites de même dans `server/.env`.

### Étape 3 : Résultat automatique sur la borne
Dès que `PUBLIC_URL` est renseigné, le serveur bascule automatiquement l'URL du QR Code :
- Le QR Code affiché sur la borne tactile pointera sur `https://xxxx-xxxx-xxxx.trycloudflare.com/ticket?q=XXX`.
- Le message sous le QR Code affiche : **« Scannez avec votre téléphone (Wi-Fi ou 4G) »**.
- Si le tunnel est fermé, le QR Code repasse automatiquement en mode LAN local `http://192.168.x.x:4000/ticket?q=XXX`.

---

## 🐧 MÉTHODE 2 : DÉPLOIEMENT UBUNTU SERVER (SERVEUR DÉDIÉ SANS ÉCRAN)

Si l'agence dispose d'un serveur physique sous Ubuntu Server 22.04 ou 24.04 LTS :

### 2.1 Installation automatique en 5 commandes
```bash
# 1. Cloner le dépôt officiel
git clone https://github.com/DavidLegend007/Cofina-Queue-Deployement.git

# 2. Accéder au dossier (C majuscule obligatoire)
cd Cofina-Queue-Deployement

# 3. Rendre le script exécutable
chmod +x install_ubuntu.sh

# 4. Lancer l'installation automatisée
sudo bash install_ubuntu.sh

# 5. Contrôler le statut des services
pm2 status
```

Le script `install_ubuntu.sh` configure automatiquement :
- Node.js 22 LTS, Yarn, PM2.
- Le pare-feu UFW (ports 22 SSH et 4000 applicatif).
- La compilation de production et la persistance au redémarrage via `systemd`.

---

## 🌐 TABLEAU DES URLS D'EXPLOITATION EN AGENCE

Remplacer `192.168.1.XXX` par l'IP fixe du Mini-PC serveur d'agence :

| Rôle | URL en Agence | Comportement UI |
| :--- | :--- | :--- |
| 🖥️ **Borne Kiosque** | `http://192.168.1.XXX:4000/?kiosk` | Plein écran tactile, sans navbar ni footer |
| 📺 **Écran TV Public** | `http://192.168.1.XXX:4000/?display` | Plein écran, appels sonores et vocaux |
| 👨‍💼 **Poste Caissier** | `http://192.168.1.XXX:4000/?agent` | Interface guichet sans navbar |
| 🔐 **Console Superviseur** | `http://192.168.1.XXX:4000/?admin` | Tableau de bord de supervision |
| 📱 **Widget Caissier Décollé** | `http://192.168.1.XXX:4000/?widgetOnly=true` | Fenêtre pop-out compacte 360x420px |
| 🎯 **Mode Démo / Formation** | `http://192.168.1.XXX:4000/?demo=true` | Navigation complète visible avec sélecteur de modules |
| 💚 **Vérification Santé** | `http://192.168.1.XXX:4000/health` | Réponse JSON 200 `{"status":"UP"}` |
| 📡 **Infos Réseau & QR** | `http://192.168.1.XXX:4000/api/network-info` | Détection IP LAN & statut passerelle 4G |

---

## 🖨️ CALIBRAGE IMPRIMANTE THERMIQUE XPRINTER 58MM

1. **Branchement** : Connecter le câble USB de l'imprimante sur le Mini-PC de la borne.
2. **Propriétés de l'imprimante sous Windows** :
   - Nom de l'imprimante : `POS-58` ou `Xprinter 58`.
   - Définir comme **imprimante par défaut**.
   - Format de papier personnalisé : **Largeur 58 mm**, **Hauteur 50 mm**.
   - Orientation : **Paysage (Landscape)**.
   - Marges : Définir à **0 mm** ou « Aucune ».
3. **Comportement du bouton dans l'application** :
   - L'impression est **volontaire** (clic sur le bouton "Imprimer mon ticket").
   - La commande de massicotage papier native ESC/POS (`\x1DV\x41\x00`) est transmise en fin d'impression.

---

## 🔄 MISE À JOUR ET MAINTENANCE

### Mettre à jour le logiciel depuis GitHub :
```bash
# Se placer dans le répertoire du projet
cd Cofina-Queue-Deployement

# Récupérer les dernières mises à jour
git pull origin main

# Recompiler si nécessaire
npm run build
npm --prefix server run build

# Redémarrer les services
# Sous Windows : Relancer Lancer_Borne_Cofina.bat
# Sous Ubuntu  : pm2 restart all
```

### Sauvegarde et restauration SQLite :
- Les sauvegardes automatiques sont créées chaque nuit dans `server/backups/`.
- Pour déclencher une sauvegarde manuelle instantanée : se connecter à la console Admin (`/?admin`) et cliquer sur **« Sauvegarder la base »**.
- En cas de restauration d'urgence : copier le fichier `.db` de sauvegarde vers `server/prisma/cofina_edge.db`.

---

## 🚨 DÉPANNAGE RAPIDE

### 1. La page affiche "Site inaccessible" (`ERR_CONNECTION_REFUSED`)
- Le serveur Node.js n'est pas démarré.
- Sous Windows : Exécuter `Lancer_Borne_Cofina.bat`.
- Vérifier que l'URL utilise bien le port **4000** (et non 3000).

### 2. Le QR Code ne s'ouvre pas sur le téléphone du client en 4G
- Vérifier que `Lancer_Tunnel_4G.bat` est bien en cours d'exécution.
- Vérifier que l'adresse `https://xxx.trycloudflare.com` générée par le tunnel est bien renseignée dans les variables `PUBLIC_URL` et `VITE_PUBLIC_URL` du fichier `.env`.
- Relancer le serveur pour recharger le fichier `.env`.

### 3. La barre de navigation s'affiche alors qu'elle ne devrait pas
- Vérifier que l'URL ne contient pas `?demo=true` ou `?nav=true`.
- Utiliser les raccourcis préconfigurés (`ouvrir_caisse.bat`, `ouvrir_borne.bat`, `ouvrir_ecran_tv.bat`, `ouvrir_admin.bat`).

### 4. Après une coupure de courant
- Le Mini-PC redémarre : double-cliquer simplement sur `Lancer_Borne_Cofina.bat`.
- Les tickets de la journée sont intégralement conservés grâce à SQLite WAL.

---

## 📞 CONTACTS SUPPORT & MAINTENANCE

| Rôle | Intervenant | Contact |
| :--- | :--- | :--- |
| **Support Technique & Déploiement** | Équipe Informatique Matrix Industrie | David (GitHub : `DavidLegend007`) |
| **Assistance Opérationnelle Agence** | Support Agence COFINA Togo | **92 68 60 60** |

*© 2026 Groupe COFINA Togo — Guide d'exploitation et de déploiement homologué.*
