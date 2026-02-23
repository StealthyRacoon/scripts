$envFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*#' -or -not $_) { return }
        $name, $value = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable($name, $value)
    }
} else {
    throw ".env file not found"
}


$tenant = $env:TENANT
$clientId = $env:CLIENTID
$ClientSecret = $env:CLIENTSECRET

$FromUser = "spadmin@sttas.com.au"  
$ToUser = "sarang.gadhiya@sttas.com.au"
$Subject = "Test email from Microsoft Graph"
$Body = "Hello from PowerShell via Microsoft Graph!"


# -------------------------
# Get access token
# -------------------------
$tokenResponse = Invoke-RestMethod `
    -Method Post `
    -Uri "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token" `
    -ContentType "application/x-www-form-urlencoded" `
    -Body @{
    client_id     = $ClientId
    scope         = "https://graph.microsoft.com/.default"
    client_secret = $ClientSecret
    grant_type    = "client_credentials"
}

$accessToken = $tokenResponse.access_token

# -------------------------
# Build email payload
# -------------------------
$mailBody = @{
    message         = @{
        subject      = $Subject
        body         = @{
            contentType = "HTML"
            content     = $Body
        }
        toRecipients = @(
            @{
                emailAddress = @{
                    address = $ToUser
                }
            }
        )
    }
    saveToSentItems = $true
} | ConvertTo-Json -Depth 10

# -------------------------
# Send email
# -------------------------
Invoke-RestMethod `
    -Method Post `
    -Uri "https://graph.microsoft.com/v1.0/users/$FromUser/sendMail" `
    -Headers @{
    Authorization  = "Bearer $accessToken"
    "Content-Type" = "application/json"
} `
    -Body $mailBody

Write-Host "Email sent successfully" -ForegroundColor Green
