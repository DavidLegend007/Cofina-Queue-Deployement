@echo off
REM ==============================================================================
REM COFINA QUEUE — RACCOURCI ÉCRAN D'AFFICHAGE TV PLEIN ÉCRAN
REM ==============================================================================

echo 🚀 Lancement de l'Écran d'Affichage TV...
start msedge --kiosk "http://localhost:3000/?display" --edge-kiosk-type=fullscreen || start chrome --kiosk "http://localhost:3000/?display" || start http://localhost:3000/?display
exit
