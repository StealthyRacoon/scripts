$tenant = "sustainabletimbertasmania.onmicrosoft.com"
$clientId = "2a539f71-673a-41a6-a878-77be10574006"  # App ID from Azure
$certPath = "C:\Users\sarang.gadhiya\PnpAdminCert.pfx"
$certPass = ConvertTo-SecureString "cjayG03s2Church!" -AsPlainText -Force

Connect-PnPOnline -Url https://sustainabletimbertasmania.sharepoint.com/ `
    -ClientId $clientId `
    -Tenant $tenant `
    -CertificatePath $certPath `
    -CertificatePassword $certPass

 
$DocumentLibraries = Get-PnPList | Where-Object {$_.Hidden -eq $false}


 $DocumentLibraries
# $DocumentLibraries | Select Url, Title, DefaultViewURL, ItemCount
