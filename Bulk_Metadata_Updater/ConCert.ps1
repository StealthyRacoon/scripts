param ([string]$url)

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
$certPath = $env:CERTPATH
$certPass = ConvertTo-SecureString $env:CERTPASS -AsPlainText -Force



Connect-PnPOnline -Url $url `
    -ClientId $clientId `
    -Tenant $tenant `
    -CertificatePath $certPath `
    -CertificatePassword $certPass

Write-Host "Connected! - Inside the Folder"