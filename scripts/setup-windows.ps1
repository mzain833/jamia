$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "Preparing Jamia website local development setup..." -ForegroundColor Green

$backendEnv = Join-Path $Root 'backend/.env'
$frontendEnv = Join-Path $Root 'frontend/.env'
if (!(Test-Path $backendEnv)) {
  Copy-Item (Join-Path $Root 'backend/.env.example') $backendEnv
  Write-Host 'Created backend/.env from the example.'
} else { Write-Host 'backend/.env already exists; keeping it unchanged.' }
if (!(Test-Path $frontendEnv)) {
  Copy-Item (Join-Path $Root 'frontend/.env.example') $frontendEnv
  Write-Host 'Created frontend/.env from the example.'
} else { Write-Host 'frontend/.env already exists; keeping it unchanged.' }

Write-Host ''
Write-Host 'Installing backend dependencies...' -ForegroundColor Cyan
Push-Location (Join-Path $Root 'backend')
try { npm install } finally { Pop-Location }
Write-Host ''
Write-Host 'Installing frontend dependencies...' -ForegroundColor Cyan
Push-Location (Join-Path $Root 'frontend')
try { npm install } finally { Pop-Location }
Write-Host ''
Write-Host 'NEXT: edit backend/.env and set MONGO_URI, JWT_SECRET, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD.' -ForegroundColor Yellow
Write-Host 'Then run the seed/admin commands described in START-HERE-ROMAN-URDU.txt.' -ForegroundColor Yellow
Write-Host 'To start both development servers, double-click START-WINDOWS.bat.' -ForegroundColor Green
