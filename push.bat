@echo off
cd /d "%~dp0"
git add .
git commit -m "Auto commit - %date% %time%"
git push origin main
echo 🚀 Changes pushed successfully!
pause
