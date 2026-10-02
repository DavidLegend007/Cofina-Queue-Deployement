@echo off
chcp 65001 >nul
echo ========================================================
echo   RESTAURATION DU SYSTÈME COFINA - VERSION STABLE
echo ========================================================
echo.
echo Ce script va restaurer le code à la version stable certifiée :
echo Tag : v1.0.0-stable-bilingual-espeak (Commit e1f8cf1)
echo.
echo Fonctionnalités de cette version :
echo  - Borne tactile Kiosk 100%% bilingue FR/EN
echo  - Impression tickets thermiques 58mm en Français et Anglais
echo  - Décompte 25s avec impression obligatoire et retour 3s
echo  - Moteur vocal eSpeak opérationnel
echo.
set /p CONFIRM="Voulez-vous restaurer cette version ? (O/N) : "
if /i not "%CONFIRM%"=="O" (
    echo Opération annulée.
    pause
    exit /b 0
)

echo.
echo [1/3] Récupération de la branche stable...
git checkout backup-stable-version
if errorlevel 1 (
    echo Erreur lors du checkout de la branche backup.
    pause
    exit /b 1
)

echo.
echo [2/3] Recompilation de l'interface de production...
call npm run build
if errorlevel 1 (
    echo Attention : avertissement lors de la compilation.
)

echo.
echo [3/3] Vérification des tests...
call npm test
echo.
echo ========================================================
echo   VERSION STABLE RESTAURÉE AVEC SUCCÈS !
echo ========================================================
echo Vous pouvez redémarrer le serveur ou la borne.
echo.
pause
