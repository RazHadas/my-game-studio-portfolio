# Helper Script to save Firebase Secrets to GitHub
# Run this by typing: .\save_secrets.ps1

function Set-GitHubSecret {
    param($Name)
    $Value = Read-Host "Enter your $Name"
    if ($Value) {
        Write-Host "Saving $Name to GitHub..." -ForegroundColor Cyan
        echo $Value | gh secret set $Name
    }
}

Write-Host "--- Firebase to GitHub Secret Vault ---" -ForegroundColor Yellow
Write-Host "This will save your keys to your GitHub repo secrets."

Set-GitHubSecret "FIREBASE_API_KEY"
Set-GitHubSecret "FIREBASE_AUTH_DOMAIN"
Set-GitHubSecret "FIREBASE_DATABASE_URL"
Set-GitHubSecret "FIREBASE_PROJECT_ID"
Set-GitHubSecret "FIREBASE_STORAGE_BUCKET"
Set-GitHubSecret "FIREBASE_MESSAGING_SENDER_ID"
Set-GitHubSecret "FIREBASE_APP_ID"

Write-Host "Done! Your secrets are safe in the vault." -ForegroundColor Green
Write-Host "You can check them at: gh secret list"
