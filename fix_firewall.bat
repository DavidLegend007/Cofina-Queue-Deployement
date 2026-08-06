@echo off
REM ==============================================================================
REM COFINA QUEUE — DÉBLOCAGE DU PARE-FEU WINDOWS (POUR RÉSEAU LOCAL)
REM Ce script doit être exécuté en tant qu'Administrateur
REM ==============================================================================

echo 🛡️  Configuration du Pare-Feu Windows pour Cofina Queue...

REM Suppression des anciennes règles éventuelles
netsh advfirewall firewall delete rule name="Cofina Queue" >nul 2>&1

REM Création de la règle pour autoriser les ports 3000 et 4000 sur TOUS les profils (Public, Privé, Domaine)
netsh advfirewall firewall add rule name="Cofina Queue" dir=in action=allow protocol=TCP localport=3000,4000 profile=any

REM Forcer le réseau actuel en "Réseau Privé" (Optionnel mais recommandé)
powershell -Command "Get-NetConnectionProfile | Set-NetConnectionProfile -NetworkCategory Private"

echo ✅ Configuration du pare-feu terminee !
echo Les appareils du reseau local (Borne, TV, Telephone) peuvent desormais se connecter.
pause
