# Redeploy static build to gh-pages (avoids needing `workflow` OAuth scope).
# Usage: powershell -File scripts/deploy-gh-pages.ps1
# Requires GitHub Pages source: branch gh-pages, folder / (Settings → Pages).
$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

if (Test-Path "package-lock.json") {
  npm ci
} else {
  npm install
}

$env:CORPS_PAGES_BASE = "/yes-man/"
npm run build
npm run test

$stage = Join-Path $env:TEMP ("yes-man-gh-pages-" + [guid]::NewGuid().ToString("n"))
New-Item -ItemType Directory -Path $stage | Out-Null
Copy-Item -Recurse -Force .\dist\* $stage\
New-Item -ItemType File -Path (Join-Path $stage ".nojekyll") -Force | Out-Null
Push-Location $stage
git init -q
git checkout -b gh-pages | Out-Null
git add -A
git -c user.email="pages-deploy@local" -c user.name="pages-deploy" commit -qm "deploy: yes-man"
git remote add origin https://github.com/subtiliorars-sys/yes-man.git
git push -f origin gh-pages
Pop-Location
Remove-Item -Recurse -Force $stage
Write-Host "Deployed https://subtiliorars-sys.github.io/yes-man/"
