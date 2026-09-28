# Planning Prévisionnel - Déploiement du Système de Gestion de File d'Attente COFINA

**Dates :** Samedi 3 Octobre et Dimanche 4 Octobre
**Lieu :** Agence COFINA
**Objectif :** Installation, configuration réseau, tests matériels/logiciels et formation du personnel pour le nouveau système de gestion de file d'attente.

---

## 📅 Samedi 3 Octobre : Installation & Configuration Matérielle

* **11h00 - 11h30 | Arrivée et Briefing**
  * Rencontre avec le responsable d'agence ou le superviseur.
  * Validation des emplacements physiques (Borne, Serveur, Écran TV).

* **11h30 - 13h30 | Mise en place du Serveur & Réseau**
  * Démarrage et configuration du serveur local Ubuntu (IP : `192.168.1.182`).
  * Vérification de la connectivité réseau (câble Ethernet / WiFi) pour tous les équipements.
  * Lancement de l'application (Backend + Frontend).

* **13h30 - 14h30 | Pause déjeuner**

* **14h30 - 16h00 | Déploiement de la Borne Tactile (Kiosk)**
  * Installation de la borne à l'accueil.
  * Configuration de l'imprimante thermique par défaut sur Windows.
  * Déploiement du script de lancement automatique (`Lancer_Borne_Cofina.bat`) via Microsoft Edge.
  * Tests d'impression silencieuse des tickets.

* **16h00 - 17h30 | Configuration de l'Écran TV (Smart TV TCL)**
  * Fixation/Positionnement de l'écran dans la zone d'attente.
  * Connexion de la TV au réseau local.
  * Affichage de l'interface d'attente en plein écran (module d'affichage).

* **17h30 - 18h00 | Bilan de fin de journée**
  * Validation de la communication de base entre le serveur, la borne et la TV.

---

## 📅 Dimanche 4 Octobre : Tests Logiciels, Audio & Formation

* **10h00 - 11h30 | Configuration des Postes Caissiers/Agents**
  * Paramétrage des raccourcis sur les ordinateurs des caissiers/agents.
  * Test de connexion à l'interface agent via leur navigateur web (Edge/Chrome).

* **11h30 - 13h00 | Tests Globaux & Ajustements Audio**
  * Simulation de flux : Prise de tickets sur la borne -> Affichage sur la TV -> Appel depuis une caisse.
  * **Test spécifique de l'audio** : Vérification stricte que le carillon et l'annonce vocale ("Ticket X au guichet Y") sortent **uniquement** sur les haut-parleurs de la télévision, et non sur les PC des caissiers.

* **13h00 - 14h00 | Pause déjeuner**

* **14h00 - 15h30 | Simulations en Conditions Réelles**
  * Tests de bout en bout (pics d'affluence simulés).
  * Vérification des rappels de tickets ("Recall").
  * Test du panneau d'administration (vue globale des files).

* **15h30 - 17h00 | Prise en main du Personnel**
  * Accompagnement sur les nouveaux postes de travail.

* **17h00 - 17h30 | Clôture et Nettoyage**
  * Nettoyage de la base de données de test (remise à zéro des compteurs pour le lendemain).
  * Signature de la fiche de recette (validation finale du système prêt pour lundi matin).
