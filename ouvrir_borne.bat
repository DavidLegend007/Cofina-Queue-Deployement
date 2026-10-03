@echo off
REM ==============================================================================
REM COFINA QUEUE — RACCOURCI BORNE TACTILE PLEIN ÉCRAN
REM ==============================================================================

set SERVER_HOST=10.228.2.137
if not "%1"=="" set SERVER_HOST=%1

echo 🚀 Lancement de la Borne Tactile vers %SERVER_HOST%...
start msedge --kiosk-printing --kiosk "http://%SERVER_HOST%:4000/?kiosk&v=%RANDOM%" --edge-kiosk-type=fullscreen || start chrome --kiosk-printing --kiosk "http://%SERVER_HOST%:4000/?kiosk&v=%RANDOM%" || start http://%SERVER_HOST%:4000/?kiosk^&v=%RANDOM%
exit
