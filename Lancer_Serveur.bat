@echo off
title "Groupe Cofina - Synchronisation Serveur Edge et Borne"
chcp 65001 >nul

cd /d "%~dp0"

echo ==============================================================================
echo    GROUPE COFINA TOGO - SCRIPT UNIFIE
echo    Le serveur et la borne tactile sont desormais synchronises et geres
echo    par un SEUL ET UNIQUE script : Lancer_Borne_Cofina.bat
echo ==============================================================================
echo.
echo Lancement automatique du script unique master...
echo.

call "%~dp0Lancer_Borne_Cofina.bat" %*
exit /b %ERRORLEVEL%
