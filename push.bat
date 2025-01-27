@echo off
cd /d "%~dp0"  REM Change directory to the script location (Project Root)
echo 🚀 Checking for changes in your project...

REM Check if there are any changes
git status | findstr /C:"Changes not staged for commit" /C:"Untracked files" >nul
if %errorlevel% neq 0 (
    echo ✅ No changes detected. Exiting...
    exit /b
)

REM Staging all changes
git add .
echo ✅ Staged all changes.

REM Generating a commit message with date & time
for /f "tokens=2 delims==" %%i in ('"wmic os get localdatetime /value"') do set datetime=%%i
set commit_msg="Auto commit - %datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%"
git commit -m %commit_msg%
echo ✅ Changes committed: %commit_msg%

REM Pushing to GitHub
git push origin main
echo 🚀 Pushed successfully to GitHub!

exit
