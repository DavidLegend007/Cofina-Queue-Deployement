@echo off
REM ==============================================================================
REM COFINA QUEUE — RACCOURCI ÉCRAN D'AFFICHAGE TV PLEIN ÉCRAN
REM ==============================================================================

set SERVER_HOST=10.228.2.137
if not "%1"=="" set SERVER_HOST=%1

title COFINA - Lancement Ecran TV (%SERVER_HOST%)
color 0A
echo.
echo  ==============================================================
echo    COFINA QUEUE - LANCEMENT DU TELEVISEUR (SON + VOIX ACTIFS)
echo  ==============================================================
echo.
echo  Serveur : http://%SERVER_HOST%:4000/?display
echo.

set TV_URL="http://%SERVER_HOST%:4000/?display&v=%RANDOM%"
set FLAGS=--autoplay-policy=no-user-gesture-required --user-data-dir="%TEMP%\cofina_tv_profile" --no-first-run --kiosk %TV_URL%

REM 1. Tester Microsoft Edge (Chemin standard 64-bit et 32-bit)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    echo  [OK] Lancement avec Microsoft Edge (Mode Kiosk TV)...
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" %FLAGS% --edge-kiosk-type=fullscreen
    goto SUCCESS
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    echo  [OK] Lancement avec Microsoft Edge (Mode Kiosk TV)...
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" %FLAGS% --edge-kiosk-type=fullscreen
    goto SUCCESS
)

REM 2. Tester Google Chrome
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    echo  [OK] Lancement avec Google Chrome (Mode Kiosk TV)...
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" %FLAGS%
    goto SUCCESS
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    echo  [OK] Lancement avec Google Chrome (Mode Kiosk TV)...
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" %FLAGS%
    goto SUCCESS
)

REM 3. Lancement standard par commande start
echo  [INFO] Lancement via le navigateur par defaut...
start msedge %FLAGS% || start chrome %FLAGS% || start http://%SERVER_HOST%:4000/?display

:SUCCESS
echo.
echo  --------------------------------------------------------------
echo  ASTUCE MULTI-ECRAN (Si la TV est branchee en HDMI) :
echo  Si la fenetre s'ouvre sur le PC au lieu de la TV :
echo  Maintenez : [Touche Windows] + [Shift/Maj] + [Fleche Droite]
echo  pour deplacer instantanement l'ecran sur la TV !
echo  --------------------------------------------------------------
echo.
timeout /t 3 >nul
exit

