@echo off
REM ==============================================================================
REM COFINA QUEUE — RACCOURCI ÉCRAN D'AFFICHAGE TV PLEIN ÉCRAN
REM ==============================================================================

set SERVER_HOST=192.168.1.182
if not "%1"=="" set SERVER_HOST=%1

echo 🚀 Lancement de l'Écran d'Affichage TV vers %SERVER_HOST% (Audio + Voix automatiques)...
start msedge --autoplay-policy=no-user-gesture-required --kiosk "http://%SERVER_HOST%:4000/?display&v=%RANDOM%" --edge-kiosk-type=fullscreen || start chrome --autoplay-policy=no-user-gesture-required --kiosk "http://%SERVER_HOST%:4000/?display&v=%RANDOM%" || start http://%SERVER_HOST%:4000/?display^&v=%RANDOM%
exit
