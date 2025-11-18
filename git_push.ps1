# PowerShell script to push changes to GitHub
Write-Host "Starting git operations..." -ForegroundColor Green

# Change to the project directory
$projectPath = "C:\Users\adib tech 1\Downloads\Nowy folder (4)\negoziooo"
Set-Location $projectPath
Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow

# Check if git is available
try {
    $gitVersion = git --version
    Write-Host "Git is available: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git from https://git-scm.com/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check git status
Write-Host "`nChecking git status..." -ForegroundColor Cyan
try {
    git status
    Write-Host "Git status completed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git status failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check remote repositories
Write-Host "`nChecking remote repositories..." -ForegroundColor Cyan
try {
    git remote -v
    Write-Host "Remote check completed successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Could not check remotes" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Add all files
Write-Host "`nAdding all files..." -ForegroundColor Cyan
try {
    git add .
    Write-Host "Files added successfully" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git add failed" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Commit changes
Write-Host "`nCommitting changes..." -ForegroundColor Cyan
$commitMessage = "Update pizzeria website with latest changes - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
try {
    git commit -m $commitMessage
    Write-Host "Commit completed successfully" -ForegroundColor Green
} catch {
    Write-Host "WARNING: Git commit failed (might be no changes to commit)" -ForegroundColor Yellow
}

# Push to GitHub
Write-Host "`nPushing to GitHub..." -ForegroundColor Cyan
try {
    git push origin main
    Write-Host "`nSUCCESS: All changes pushed to GitHub!" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git push failed" -ForegroundColor Red
    Write-Host "This might be due to:" -ForegroundColor Red
    Write-Host "- Authentication issues" -ForegroundColor Red
    Write-Host "- Network connectivity" -ForegroundColor Red
    Write-Host "- Remote repository access" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "`nOperation completed!" -ForegroundColor Green
Read-Host "Press Enter to exit"
