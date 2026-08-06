@echo off
TITLE Configuration Pare-Feu Windows - COFINA Queue
cls

:: Auto-Elevation pour execution en tant qu'Administrateur
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ==============================================================================
    echo [INFO] Demande d'elevation des privilèges Administrateur...
    echo ==============================================================================
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

echo ==============================================================================
echo        COFINA QUEUE -- DEBLOCAGE DU PARE-FEU WINDOWS (POUR RESEAU LOCAL)
echo ==============================================================================
echo.

echo [1/3] Suppression des anciennes regles pare-feu...
netsh advfirewall firewall delete rule name="Cofina Queue" >nul 2>&1
netsh advfirewall firewall delete rule name="Node.js JavaScript Runtime" >nul 2>&1

echo [2/3] Ajout de la regle d'autorisation pour les Ports 3000 et 4000...
netsh advfirewall firewall add rule name="Cofina Queue" dir=in action=allow protocol=TCP localport=3000,4000 profile=any

echo [3/3] Passage du reseau en mode Privé pour autoriser les echanges LAN...
powershell -Command "Get-NetConnectionProfile | Set-NetConnectionProfile -NetworkCategory Private" >nul 2>&1

echo.
echo ==============================================================================
echo OK : Le Pare-Feu Windows est dorenavant configure !
echo Les autres appareils du reseau local (Bornes, TV, Caisses) peuvent se connecter.
echo ==============================================================================
echo.
pause
