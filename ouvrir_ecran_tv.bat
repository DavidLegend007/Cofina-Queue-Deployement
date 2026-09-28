@echo off
REM ==============================================================================
REM COFINA QUEUE — RACCOURCI ÉCRAN D'AFFICHAGE TV PLEIN ÉCRAN
REM ==============================================================================

echo 🚀 Lancement de l'Écran d'Affichage TV...
start msedge --kiosk "http://192.168.1.182:4000/?display" --edge-kiosk-type=fullscreen || start chrome --kiosk "http://192.168.1.182:4000/?display" || start http://192.168.1.182:4000/?display
exit
