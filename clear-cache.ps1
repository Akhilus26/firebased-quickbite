# Clear all caches for Expo/Metro bundler
Write-Host "Clearing Expo and Metro caches..." -ForegroundColor Yellow

# Clear Metro bundler cache
if (Test-Path ".\.expo") {
    Remove-Item -Recurse -Force ".\.expo"
    Write-Host "Cleared .expo directory" -ForegroundColor Green
}

# Clear watchman cache (if installed)
if (Get-Command watchman -ErrorAction SilentlyContinue) {
    watchman watch-del-all
    Write-Host "Cleared watchman cache" -ForegroundColor Green
}

# Clear npm cache
npm cache clean --force
Write-Host "Cleared npm cache" -ForegroundColor Green

Write-Host "`nAll caches cleared! Now run: npx expo start --clear" -ForegroundColor Cyan
