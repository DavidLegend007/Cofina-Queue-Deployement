# NOTE TECHNIQUE — COFINA Queue System V1
### À l'attention du Responsable IT — Agence Siège Kodjoviakopé

---

> **Référence** : COFINA-IT-QSYSv1-2026 &nbsp;|&nbsp; **Date** : Septembre 2026 &nbsp;|&nbsp; **Prestataire** : Matrix Industrie  
> **Périmètre** : Agence Siège Kodjoviakopé — Lomé, Togo &nbsp;|&nbsp; **Statut** : ✅ En Production  
> **Confidentialité** : Usage Interne — Direction IT

---

## 📋 SOMMAIRE

1. [Architecture & Stack Technique](#1-architecture--stack-technique)
2. [Interactions avec le Réseau — Ce qui entre, ce qui sort](#2-interactions-avec-le-réseau--ce-qui-entre-ce-qui-sort)
3. [Sécurité & Contrôle d'Accès (RBAC)](#3-sécurité--contrôle-daccès-rbac)
4. [Base de Données & Sauvegardes](#4-base-de-données--sauvegardes)
5. [Exploitation & Maintenance](#5-exploitation--maintenance)
6. [Contacts & Escalade](#6-contacts--escalade)

---

## 1. Architecture & Stack Technique

### Stack

| Couche | Technologie | Version |
|---|---|---|
| Frontend | React + Vite | React 18 / Vite 5 |
| Backend | Node.js + Express + Socket.io | Node 18+ / Socket.io 4.7 |
| Base de données | SQLite via Prisma ORM | Prisma 5.20 |
| Auth | JWT + bcryptjs | JWT 9.0 / bcryptjs 2.4 |
| Process Manager | PM2 (démarrage auto au boot) | PM2 5.x |

### Ce que nous demandons au réseau COFINA

> ⚠️ **Demande formelle au Responsable IT** : Nous avons besoin d'**un seul port libre** sur le switch réseau existant de l'agence pour y connecter notre propre switch dédié au système de file d'attente.

**Schéma de raccordement physique :**

```
RÉSEAU EXISTANT COFINA (Agence Siège Kodjoviakopé)
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Routeur / Box Internet COFINA                             │
│         │                                                  │
│  ┌──────▼────────────────────┐                             │
│  │  Switch Principal COFINA  │  ← Réseau bancaire Amplitude│
│  │  (switch existant)        │                             │
│  └───────────────┬───────────┘                             │
│                  │                                         │
│            1 port libre                                    │
│         (demandé à la DSI)                                 │
│                  │                                         │
└──────────────────┼─────────────────────────────────────────┘
                   │  Câble RJ45 (fourni par Matrix Industrie)
         ┌─────────▼──────────────────────────────────┐
         │  SWITCH MATRIX INDUSTRIE (16 ports)         │
         │  Réseau dédié File d'Attente                │
         │                                             │
         │  ┌──────────┐  Accès : http://<IP>:3000     │
         │  │Mini-PC   │──────────────────────────     │
         │  │Serveur   │  (IP fixe attribuée par COFINA)│
         │  └──────────┘                               │
         │  ┌──────────┐  → Borne d'accueil (kiosk)   │
         │  │Tablette  │                               │
         │  └──────────┘                               │
         │  ┌──────────┐  → Écran TV salle d'attente   │
         │  │Boîtier TV│                               │
         │  └──────────┘                               │
         │  ┌──────────┐  → Poste Caisse 1             │
         │  │ PC Caisse│  → Poste Caisse 2             │
         │  │ & Opérat.│  → Poste Caisse 3             │
         │  └──────────┘  → Poste Opérateur 1          │
         │                → Poste Opérateur 2          │
         │                → Poste Accueil              │
         └─────────────────────────────────────────────┘
```

### Récapitulatif de notre demande réseau

| Ce que nous demandons | Détail |
|---|---|
| **1 port libre** sur le switch COFINA | Pour y raccorder notre switch dédié |
| **1 adresse IP fixe** dans votre plage LAN | Pour le Mini-PC serveur (ex. `192.168.1.XXX`) |
| **Accès LAN uniquement** (ports 3000 et 4000) | Aucun accès internet nécessaire |
| **Pas d'accès au réseau Amplitude** | Notre switch est isolé du réseau bancaire |

### Ce que nous fournissons

| Équipement | Fourni par |
|---|---|
| Mini-PC serveur | Matrix Industrie |
| Switch 16 ports dédié | Matrix Industrie |
| Câbles RJ45 de raccordement | Matrix Industrie |
| Boîtier HDMI pour l'écran TV | Matrix Industrie |
| Tablette borne d'accueil + support | Matrix Industrie |

> **Note sécurité** : Notre switch est **physiquement séparé** du réseau bancaire. Seule la liaison `switch COFINA → switch Matrix` relie les deux réseaux, et elle est **unidirectionnelle dans l'usage** : les postes caissiers accèdent à l'URL du serveur file d'attente, mais notre système n'accède jamais au réseau Amplitude ni aux ressources bancaires.

### Réseau logique (flux de données)

```
[Borne Tactile]  ──┐
[Caisse 1]       ──┤  HTTP/WebSocket (LAN)   ┌─────────────────────┐
[Caisse 2]       ──┼────────────────────────▶│  Mini-PC Serveur     │
[Caisse 3]       ──┤                          │  Port 3000 : UI      │
[Opérateur 1]    ──┤                          │  Port 4000 : API/WS  │
[Opérateur 2]    ──┤                          │  SQLite local        │
[Poste Accueil]  ──┘                          └─────────────────────┘
[Écran TV]       ◀────── WebSocket temps réel 
```


**Ports à ouvrir sur le LAN uniquement** — aucun accès internet requis :

| Port | Usage |
|---|---|
| 3000 | Interface Web (frontend React) |
| 4000 | API REST + WebSocket Socket.io |

### URLs par poste (IP à remplacer par l'IP fixe du Mini-PC)

| Poste | URL |
|---|---|
| Borne Tactile | `http://<IP>:3000/?kiosk=true` — plein écran Chrome |
| Écran TV | `http://<IP>:3000/?display=true` — plein écran |
| Poste Caissier | `http://<IP>:3000/` |
| Widget Bureau | `http://<IP>:3000/?widgetOnly=true` |
| Health Check | `http://<IP>:4000/health` |

---

## 2. Interactions avec le Réseau — Ce qui entre, ce qui sort

> **Principe** : Le système applique le **moindre privilège réseau**. Il n'accède jamais à Amplitude, à l'Active Directory ni à aucune base de données bancaire. Son empreinte réseau est minimale.

### Tableau des flux

| Flux | Direction | Obligatoire | Données transportées |
|---|---|---|---|
| Borne / Caisses → Serveur | LAN → LAN | ✅ Oui | Code service, horodatage ticket |
| Serveur → Écran TV | LAN → LAN | ✅ Oui | Numéro ticket appelé, caisse cible |
| Serveur → API Centrale Groupe | **LAN → Internet** | ❌ Optionnel | Archive JSON anonymisée |

> Le flux internet est **désactivé par défaut** à l'Agence Siège. Il ne s'active que si la variable `CENTRAL_CLOUD_URL` est renseignée dans `server/.env`.

### Ce que le système n'accède PAS

| Ressource | Accès |
|---|---|
| Serveurs Amplitude Core Banking | ❌ Aucun |
| Active Directory / LDAP | ❌ Aucun |
| Base de données clients | ❌ Aucun |
| Partages réseau / NAS | ❌ Aucun |

### Données stockées — registre de confidentialité

Le système **ne collecte aucune donnée personnelle client**. Seules ces données opérationnelles sont conservées :

| Donnée | Sensibilité |
|---|---|
| Numéro de ticket (`A-042`) | 🟢 Non sensible |
| Code service (`D` = Dépôt) | 🟢 Non sensible |
| Horodatage et durée de traitement | 🟢 Non sensible |
| Nom du caissier | 🟡 Interne agence |
| Nom du client, numéro de compte, montant | ❌ Non collecté |

### Règles pare-feu recommandées

```
# ENTRANT vers le Mini-PC
ACCEPT  TCP  <LAN agence>  →  <IP Mini-PC>:3000
ACCEPT  TCP  <LAN agence>  →  <IP Mini-PC>:4000
DROP    TCP  0.0.0.0/0     →  <IP Mini-PC>          # Bloquer tout accès externe

# SORTANT depuis le Mini-PC
ACCEPT  TCP  <IP Mini-PC>  →  <API Centrale>:443    # Si sync activée
DROP    TCP  <IP Mini-PC>  →  0.0.0.0/0             # Bloquer tout le reste
```

> ⚠️ **Recommandation** : Placer le Mini-PC dans un VLAN dédié, isolé du réseau bancaire et du Wi-Fi visiteurs.

---

## 3. Sécurité & Contrôle d'Accès (RBAC)

### Hachage des mots de passe

Tous les codes PIN et mots de passe sont **hachés avec bcryptjs** (salt rounds = 10) avant stockage. Aucun mot de passe n'est jamais stocké en clair.

### Hiérarchie des rôles

| Rôle | Permissions |
|---|---|
| `AGENT` | Connexion, appel de tickets, rappels, clôture |
| `ADMIN` | Tout Agent + Archivage, réinitialisation, sauvegardes, supervision sync |

### Endpoints protégés (JWT + rôle ADMIN obligatoire)

| Route | Action |
|---|---|
| `POST /api/tickets/weekly-archive` | Archivage hebdomadaire |
| `POST /api/tickets/reset-all` | Réinitialisation de la file |
| `GET/POST /api/backup/*` | Gestion des sauvegardes |
| `POST /api/sync/trigger` | Forcer une synchronisation |

---

## 4. Base de Données & Sauvegardes

**Fichier physique** : `server/cofina_edge.db` (SQLite)

### Tables principales

| Table | Contenu |
|---|---|
| `Ticket` | Tickets de la semaine en cours |
| `WeeklyArchive` | Archives hebdomadaires (JSON) |
| `Agent` | Comptes caissiers avec hash mot de passe et rôle |
| `SyncOutbox` | File d'attente de synchronisation cloud (si activée) |

### Sauvegardes automatiques

- **Quotidienne à minuit** + **au démarrage du serveur**
- Format : `cofina_edge_backup_YYYY-MM-DD_HH-mm-ss.db`
- Emplacement : `server/backups/`
- **Rotation automatique** : suppression des sauvegardes de plus de 14 jours
- **Sauvegarde manuelle** : bouton 1-clic dans la console Admin

### Procédure de restauration d'urgence

```bash
pm2 stop cofina-server
cp server/backups/cofina_edge_backup_YYYY-MM-DD_*.db server/cofina_edge.db
pm2 start cofina-server
```

> ⚠️ Exporter régulièrement les sauvegardes sur clé USB ou disque réseau externe.

---

## 5. Exploitation & Maintenance

### Commandes PM2 quotidiennes

```bash
pm2 status                    # État du serveur
pm2 logs cofina-server        # Logs en temps réel
pm2 restart cofina-server     # Redémarrage
pm2 stop cofina-server        # Arrêt
```

### Health Check

```
GET http://<IP>:4000/health
→ { "status": "OK", "activeTickets": 12 }
```

### Procédure de clôture hebdomadaire (Samedi 14h)

Réalisée par le Responsable d'Agence (rôle ADMIN) :
1. Se connecter sur `http://<IP>:3000/` → onglet **Administration**
2. Cliquer **"Archiver la semaine"** → confirmer
3. Cliquer **"Exporter CSV"** → envoyer au Data Analyste

### Mise à jour du système

```bash
git pull origin main
npm install && npm --prefix server install
npm run build
pm2 restart cofina-server
```

### Fichiers critiques à ne pas supprimer

| Fichier | Rôle |
|---|---|
| `server/cofina_edge.db` | **Base de données principale** |
| `server/backups/` | Sauvegardes automatiques |
| `ecosystem.config.cjs` | Configuration PM2 |
| `server/src/auth.ts` | Module authentification RBAC |
| `server/src/backupService.ts` | Service de sauvegarde |

---

## 6. Contacts & Escalade

| Niveau | Responsable | Action |
|---|---|---|
| **Niveau 1** | Responsable d'Agence (ADMIN) | Console Admin locale — gestion courante |
| **Niveau 2** | Chef IT COFINA Togo | `pm2 logs cofina-server` → diagnostic |
| **Niveau 3** | Matrix Industrie — Support | Intervention technique |

### Procédure d'escalade rapide

1. **File bloquée / ticket coincé** → Console Admin → bouton "Réinitialiser"
2. **Serveur ne répond plus** → `pm2 restart cofina-server`
3. **Base corrompue** → Restauration depuis backup (voir §4)
4. **Problème persistant** → Envoyer les logs : `pm2 logs cofina-server > logs_incident.txt`

---

*Document rédigé par **Matrix Industrie** pour le **Groupe COFINA Togo** — Agence Siège Kodjoviakopé.*  
*© 2026 — Tous droits réservés. Usage Interne DSI.*
