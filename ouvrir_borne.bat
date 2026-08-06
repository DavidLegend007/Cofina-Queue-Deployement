@echo off
REM ==============================================================================
REM COFINA QUEUE — RACCOURCI BORNE TACTILE PLEIN ÉCRAN
REM ==============================================================================

echo 🚀 Lancement de la Borne Tactile...
start msedge --kiosk "http://localhost:3000/?kiosk" --edge-kiosk-type=fullscreen || start chrome --kiosk "http://localhost:3000/?kiosk" || start http://localhost:3000/?kiosk
exit
