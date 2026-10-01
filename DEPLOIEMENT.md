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
│ 3. Sur les PC Caissiers & Conseillers (Guichets 1 à 6) :                    │
│    👉 Double-cliquer sur "ouvrir_agent.bat" (ou "ouvrir_caisse.bat")         │
│       • Ouvre l'espace de travail agent (?agent) en mode application        │
│       • Supporte le paramètre d'IP : ouvrir_agent.bat 192.168.1.182         │
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

## 🌐 CONFIGURATION DE LA PASSERELLE 4G & 5G (CLOUDFLARE TUNNEL)

Pour que les usagers puissent scanner le QR Code de leur ticket avec n'importe quelle connexion mobile (**Togocel 4G/5G, Moov 4G/5G**) sans être connectés au Wi-Fi de l'agence :

### ✨ Fonctionnement 100% Automatique (Sans manipulation de fichier .env)
Le serveur Express intègre désormais la détection dynamique du tunnel. Dès que le tunnel Cloudflare est actif, l'adresse publique HTTPS est transmise en temps réel à la borne tactile sans nécessiter d'édition manuelle de fichiers.

### 🐧 Sur Ubuntu Server (Recommandé en production)
Le tunnel peut être démarré en arrière-plan et persisté au boot :
```bash
# 1. Télécharger cloudflared dans le dossier projet (sans privilèges sudo requis)
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared && chmod +x cloudflared

# 2. Démarrer et persister avec PM2
pm2 start ./lancer_tunnel_4g.sh --name "cofina-tunnel-4g"
pm2 save
```
> **Fiabilité 24h/24** : Le tunnel gère automatiquement les micro-coupures réseau et se reconnecte en 5 secondes en cas de coupure internet.

### 🪟 Sur Windows (Borne Kiosque ou PC de caisse)
- Double-cliquez simplement sur **`Lancer_Tunnel_4G.bat`**.
- La borne détecte instantanément l'ouverture du tunnel et bascule son QR code en mode 4G/5G.

### 📱 Comportement intelligent du QR Code sur la borne
- **Tunnel actif** : Le QR code encode l'URL sécurisée `https://xxxx.trycloudflare.com/?ticket=XXX`.  
  Mention affichée : **« 🌐 Compatible 4G Mobile & Wi-Fi »**.
- **Tunnel inactif** : Le QR code bascule automatiquement sur le Wi-Fi local `http://192.168.1.182:4000/?ticket=XXX`.  
  Mention affichée : **« 📶 Connectez votre téléphone au Wi-Fi de l'agence »**.

---

## 🐧 MÉTHODE 2 : DÉPLOIEMENT UBUNTU SERVER (SERVEUR DÉDIÉ SANS ÉCRAN)

Si l'agence dispose d'un serveur physique sous Ubuntu Server 22.04 ou 24.04 LTS :

### 2.1 Installation automatique
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
- La persistance au redémarrage via `systemd`.

---

## 🌐 TABLEAU DES URLS D'EXPLOITATION EN AGENCE

Remplacer `192.168.1.XXX` par l'IP fixe du Mini-PC serveur d'agence (`192.168.1.182`) :

| Rôle | URL en Agence | Comportement UI |
| :--- | :--- | :--- |
| 🖥️ **Borne Kiosque** | `http://192.168.1.XXX:4000/?kiosk` | Plein écran tactile, sans navbar ni footer |
| 📺 **Écran TV Public** | `http://192.168.1.XXX:4000/?display` | Plein écran, appels sonores et vocaux sans superposition |
| 👨‍💼 **Poste Caissier** | `http://192.168.1.XXX:4000/?agent` | Interface guichet avec bouton de déconnexion rapide |
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
   - Format de papier personnalisé : **Largeur 44 mm utile (rouleau 58 mm)**, **Hauteur 50 mm**.
   - Marges : Définir à **0 mm** ou « Aucune ».
3. **Optimisations intégrées** :
   - Calage à gauche sans décalage auto (`margin: 0`).
   - Impression via **iframe isolée et invisible** (élimine la page grise et les rejets de format).
   - Police fluide responsive pour les numéros longs (ex: `PMR 001`).
   - L'impression papier est optionnelle (bouton "Imprimer mon ticket") pour économiser le papier thermique.

---

## 🔄 MISE À JOUR ET MAINTENANCE

### Mettre à jour le logiciel depuis GitHub :
Les bundles de production (`dist/` et `server/dist/`) étant directement versionnés dans le dépôt, **aucune compilation n'est requise sur le serveur de production** :

```bash
# Se placer dans le répertoire du projet
cd Cofina-Queue-Deployement

# Mettre à jour en 1 commande
git pull origin main && pm2 restart all
```

### Sauvegarde et restauration SQLite :
- Les sauvegardes automatiques sont créées chaque nuit dans `server/backups/`.
- Déclenchement manuel : se connecter à la console Admin (`/?admin`) et cliquer sur **« Sauvegarder la base »**.
- En cas de restauration d'urgence : copier le fichier `.db` de sauvegarde vers `server/prisma/cofina_edge.db`.

---

## 🚨 DÉPANNAGE RAPIDE

### 1. La page affiche "Site inaccessible" (`ERR_CONNECTION_REFUSED`)
- Le serveur Node.js n'est pas démarré.
- Sous Ubuntu : `pm2 status` puis `pm2 restart all`.
- Vérifier que l'URL utilise bien le port **4000** (et non 3000).

### 2. Le QR Code mobile ne s'ouvre pas en 4G/5G
- S'assurer que le tunnel est actif (`pm2 status` doit afficher `cofina-tunnel-4g` en vert `online`).
- Pour le relancer manuellement : `bash lancer_tunnel_4g.sh`.
- Dès son ouverture, le QR code de la borne bascule automatiquement sur l'adresse Cloudflare active.

### 3. Après une coupure de courant
- Le serveur redémarre : PM2 relance automatiquement l'application et le tunnel au boot (`systemd`).
- Les données et tickets de la journée sont intégralement conservés grâce à SQLite en mode WAL.

---

## 📞 CONTACTS SUPPORT & MAINTENANCE

| Rôle | Intervenant | Contact |
| :--- | :--- | :--- |
| **Support Technique & Déploiement** | Équipe Informatique Matrix Industrie | David (GitHub : `DavidLegend007`) |
| **Assistance Opérationnelle Agence** | Support Agence COFINA Togo | **92 68 60 60** |

*© 2026 Groupe COFINA Togo — Guide d'exploitation et de déploiement homologué.*

