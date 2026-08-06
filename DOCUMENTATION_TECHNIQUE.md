# 📘 COFINA QUEUE SYSTEM — Manuel & Architecture Technique (Serveurs Edge Hors-Ligne)

> **Client** : Groupe COFINA Togo (Microfinance — Agence Pilote Siège Kodjoviakopé & Agences de Lomé)  
> **Auteur / Prestataire** : Matrix Industrie  
> **Architecture** : Serveur Edge Local 100% Autonome (Fonctionnement garanti Hors-Ligne / Sans Internet)

---

## 1. Contexte Métier & Principes Directeurs

Le système est spécialement conçu pour le secteur de la microfinance en Afrique de l'Ouest (Lomé, Togo). Il prend en compte les contraintes d'infrastructures locales, notamment **les coupures fréquentes de connexion internet**.

### 🌟 Principes Clés
1. **Autonomie 100% Hors-Ligne** : L'ensemble de la file d'attente (Borne, Écran TV, Postes Caissiers) fonctionne en réseau local interne (LAN / Switch / Wi-Fi local). **Aucune connexion internet n'est requise.**
2. **Zéro Barrière Digitale & Priorité QR Code** : Dès la sélection du service sur la borne tactile, le **QR Code Mobile** est présenté comme moyen principal. L'impression thermique papier reste disponible en option secondaire.
3. **Annonce Audio d'Appel au Guichet** :
   - *Sur la Borne* : Confirmation visuelle immédiate (sans synthèse vocale vocale sur borne).
   - *Au Guichet (Écran TV)* : Carillon Gong sonorisé bi-tonal + Synthèse vocale de passage (*"Ticket A-008, veuillez passer à la Caisse 1"*).
4. **12 Services Officiels COFINA Togo (avec 12 Icônes Uniques)** :
   - **D** : Dépôt (💵 Banknote)
   - **R** : Retrait (👛 Wallet)
   - **TN** : Transfert national (📤 Send)
   - **TI** : Transfert international (🌐 Globe)
   - **O** : Ouverture de compte (👤 UserPlus)
   - **RC** : Remise de chèque (📑 FileCheck)
   - **V** : Virement (🔄 ArrowRightLeft)
   - **DR** : Demande de Relevé (📄 FileText)
   - **CM** : COFINA Mobile+ (📱 Smartphone)
   - **C** : Crédit (💳 CreditCard)
   - **PC** : Parler à un conseiller (🎧 Headphones)
   - **PMR** : Mobilité Réduite (♿ Accessibility - Prioritaire)

5. **Suivi du Temps de Traitement (`startedAt` $\rightarrow$ `completedAt`)** :
   - Traçabilité précise de la durée de chaque opération en caisse (début de prise en charge `IN_PROGRESS` et clôture `COMPLETED`).
   - Calcul et exportation CSV des métriques de temps d'attente et de temps de service.

5. **Attribution Automatique Intelligente (Auto-Assign)** :
   - Statut en ligne/hors ligne pour chaque caissier (bouton "Caisse Ouverte" / "Caisse Fermée").
   - Les tickets générés sont instantanément assignés à une caisse libre et annoncés à l'écran, sans aucune intervention manuelle.
   - S'il n'y a pas de caisse libre, ils sont mis en file d'attente classique.

---

## 2. Architecture Réseau Local (Agence Edge)

```mermaid
graph TD
    subgraph Réseau Local Intérieur de l'Agence (SANS INTERNET REQUIRED)
        Kiosk[🖥️ Borne Tactile Auto-Service] -->|Socket.io / HTTP Local| EdgeServer[💻 Mini-PC Serveur Edge Local Node.js]
        Agent1[👨🏽‍💼 Poste Caisse 1] -->|Socket.io / HTTP Local| EdgeServer
        Agent2[👩🏽‍💼 Poste Caisse 2] -->|Socket.io / HTTP Local| EdgeServer
        Agent3[👨🏿‍💼 Poste Caisse 3] -->|Socket.io / HTTP Local| EdgeServer
        Agent4[👨🏽‍💼 Poste Caisse 4] -->|Socket.io / HTTP Local| EdgeServer
        Widget[📱 Widget Bureau Indépendant] -->|Socket.io LAN| EdgeServer
        Display[📺 Écran TV d'Accueil + Audio] <--|WebSocket Local| EdgeServer
        EdgeServer --> LocalDB[(🗄️ Base de Données Locale SQLite Prisma)]
    end

    subgraph Consolidation Analyste Data (Mensuelle)
        LocalDB -->|Export CSV / Sync Différée| DataAnalyst[📈 Data Analyste — Rapport Groupe DG]
    end
```

---

## 3. Description des Modules

### 3.1 🖥️ Borne Tactile Kiosque (`KioskModule.jsx`)
- Interface géante à 4 boutons.
- Affichage immédiat du **QR Code Mobile** en moyen principal.
- Impression thermique ESC/POS optionnelle en 1 clic.
- Auto-reset après décompte dynamique.

### 3.2 📺 Écran TV Public & Audio (`DisplayModule.jsx`)
- Grille en direct des 4 Caisses (Caisse 1 à Caisse 4).
- Bannière d'appel clignotante avec carillon sonore et synthèse vocale Web Audio API / SpeechSynthesis.

### 3.3 👨🏽‍💼 Station Caissier & Widget Flottant Bureau (`AgentModule.jsx` & `FloatingTellerWidget.jsx`)
- Statut de la caisse : **Caisse Ouverte (🟢)** ou **Caisse Fermée (🔴)**.
- Contrôle d'appel complet : **Suivant**, **En traitement**, **Rappeler**, **Absent (No-Show)**, **Terminer**.
- **Widget Bureau Indépendant** : Réservé à l'Agent. Bouton détachable (<kbd>↗</kbd>) pour garder le contrôle de la file d'attente dans une petite fenêtre flottante compacte (`360px x 420px`), même lorsque le navigateur principal est réduit ou que le caissier travaille sur son logiciel métier (*Amplitude Core Banking*, *Excel*).
- URL dédiée autonome : `http://<IP_SERVEUR>:3000/?widgetOnly=true`.

### 3.4 👤 Page Profil Agent (`ProfilePage.jsx`)
- Visualisation & Édition : Nom, Titre/Rôle, Guichet par défaut.
- Photo de Profil / Emoji avatar fallback.
- Statistiques & KPIs : Clients servis, temps moyen de traitement, taux de présence.
- Système de Badges : Récompenses automatiques (*Rapide*, *Performant*, *Senior*, *Excellence*, *Fiable*).

---

## 4. Stratégie de Consolidation Multi-Agences

Puisque chaque agence dispose de son propre **Serveur Edge Local autonome**, la consolidation globale pour la Direction Générale s'effectue selon deux modes :

1. **Extraction Mensuelle par le Data Analyste (Mode Déconnecté)** : Les bases locales de chaque agence sont exportées mensuellement au format CSV depuis le panneau Administration.
2. **Synchronisation Différée Automatique (Si ligne disponible)** : En cas de présence d'un accès internet intermittent, le serveur Edge transmet automatiquement les archives quotidiennes au serveur central sans perturber le fonctionnement de l'agence.
