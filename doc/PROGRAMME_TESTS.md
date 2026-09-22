# COFINA Queue System V1
## Programme de Tests (End-to-End)

Ce document décrit le protocole de test pour valider la configuration matérielle et logicielle du système de file d'attente avant son déploiement officiel à l'Agence Siège Kodjoviakopé.

---

### Objectif
Vérifier que les 6 postes de traitement (3 Caisses, 2 Opérateurs, 1 Accueil) interagissent parfaitement avec la borne tactile et l'écran TV, en conditions réelles, via le réseau local isolé.

### Prérequis
- [ ] Le Mini-PC (serveur) est allumé.
- [ ] Les serveurs Node.js (Backend) et Vite (Frontend) tournent via PM2.
- [ ] La base de données SQLite a été initialisée avec le bon profil d'agents (`seed.js`).

---

### Phase 1 : Tests Visuels (Frontend)

- [ ] **Interface Borne (Kiosk)** : Vérifier que tous les 12 services sont cliquables et génèrent un ticket au format "Boarding Pass".
- [ ] **Écran TV** : Vérifier que la grille affiche correctement et dynamiquement les postes connectés, au lieu d'une grille figée à 4 caisses.

---

### Phase 2 : Simulation de Parcours Client

1. **Génération d'un ticket**
   - [ ] Prendre un ticket de test depuis l'interface Borne.
   - [ ] Vérifier que le ticket s'imprime virtuellement et s'affiche à l'écran.

2. **Connexion des Agents**
   - [ ] Ouvrir des navigateurs distincts pour simuler 2 agents (ex: *Caisse 1* et *Opérateur 2*).
   - [ ] Vérifier que les profils de `AGT-01` à `AGT-06` se connectent correctement avec leur PIN de test.
   - [ ] Vérifier que les statuts s'affichent en "Caisse Ouverte" (🟢).

3. **Appel et Traitement**
   - [ ] Depuis l'interface *Caisse 1*, cliquer sur **Appeler Suivant**.
   - [ ] **Vérification TV** : S'assurer que le numéro du ticket clignote en rouge sur la bannière de l'Écran TV.
   - [ ] **Vérification Audio** : Confirmer le déclenchement du Carillon (Gong) suivi de l'annonce vocale ("Le ticket X est attendu à la Caisse 1").
   - [ ] Passer le ticket en statut **En traitement**, puis **Terminer**.
   - [ ] Vérifier que les statistiques de la journée se mettent à jour.

---

### Phase 3 : Test du Widget Flottant (Agent)

- [ ] Sur un poste Agent, cliquer sur le bouton de détachement (<kbd>↗</kbd>).
- [ ] Vérifier que l'interface se réduit à une fenêtre pop-up flottante (`360px x 420px`).
- [ ] Faire un appel depuis ce widget réduit pendant qu'une autre fenêtre (ex: Excel) est ouverte en plein écran.

---

### Phase 4 : Résilience et PM2

- [ ] Tuer manuellement le processus de l'application.
- [ ] Confirmer que **PM2** relance automatiquement le système.
- [ ] Vérifier que les tickets en attente ne sont pas perdus (persistance SQLite).

---

> **Critère de succès :** Si l'ensemble de ces tests passe au vert, le système est certifié prêt à être déployé physiquement dans l'agence.
