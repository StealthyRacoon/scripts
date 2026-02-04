$tenant = "sustainabletimbertasmania.onmicrosoft.com"
$clientId = "2a539f71-673a-41a6-a878-77be10574006"  # App ID from Azure
$certPath = "C:\Users\sarang.gadhiya\PnpAdminCert.pfx"
$certPass = ConvertTo-SecureString "cjayG03s2Church!" -AsPlainText -Force
$url = "https://sustainabletimbertasmania-admin.sharepoint.com"

Connect-PnPOnline -Url $url `
    -ClientId $clientId `
    -Tenant $tenant `
    -CertificatePath $certPath `
    -CertificatePassword $certPass

    
Write-Host "Retrieving all site collections..." -ForegroundColor Cyan
$sites = Get-PnPTenantSite -IncludeOneDriveSites:$false -Detailed
Write-Host "Found $($sites.Count) sites." -ForegroundColor Green