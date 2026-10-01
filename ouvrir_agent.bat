@echo off
title "Groupe Cofina - Ouverture du Poste Agent"
chcp 65001 >nul

cd /d "%~dp0"
call "%~dp0ouvrir_caisse.bat" %*
exit
