@echo off
setlocal enabledelayedexpansion

echo Starting git operations...
echo.

REM Change to the project directory
cd /d "C:\Users\adib tech 1\Downloads\Nowy folder (4)\negoziooo"
if errorlevel 1 (
    echo ERROR: Could not change to project directory
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.

REM Check if git is available
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from https://git-scm.com/
    pause
    exit /b 1
)

echo Git is available
echo.

REM Check git status
echo Checking git status...
git status
if errorlevel 1 (
    echo ERROR: Git status failed
    pause
    exit /b 1
)
echo.

REM Check remote repositories
echo Checking remote repositories...
git remote -v
if errorlevel 1 (
    echo ERROR: Could not check remotes
    pause
    exit /b 1
)
echo.

REM Add all files
echo Adding all files...
git add .
if errorlevel 1 (
    echo ERROR: Git add failed
    pause
    exit /b 1
)
echo Files added successfully
echo.

REM Commit changes
echo Committing changes...
git commit -m "Update pizzeria website with latest changes - %date% %time%"
if errorlevel 1 (
    echo WARNING: Git commit failed (might be no changes to commit)
)
echo.

REM Push to GitHub
echo Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo ERROR: Git push failed
    echo This might be due to:
    echo - Authentication issues
    echo - Network connectivity
    echo - Remote repository access
    pause
    exit /b 1
)

echo.
echo SUCCESS: All changes pushed to GitHub!
echo.
pause
