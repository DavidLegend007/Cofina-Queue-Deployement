@echo off
REM ==============================================================================
REM COFINA QUEUE — RACCOURCI BORNE TACTILE PLEIN ÉCRAN
REM ==============================================================================

echo 🚀 Lancement de la Borne Tactile...
start msedge --kiosk-printing --kiosk "http://192.168.1.182:4000/?kiosk" --edge-kiosk-type=fullscreen || start chrome --kiosk-printing --kiosk "http://192.168.1.182:4000/?kiosk" || start http://192.168.1.182:4000/?kiosk
exit
