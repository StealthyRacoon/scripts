$tenant   = "sustainabletimbertasmania.onmicrosoft.com"
$clientId = "2a539f71-673a-41a6-a878-77be10574006"  # App ID from Azure
$certPath = "C:\Users\sarang.gadhiya\PnpAdminCert.pfx"
$certPass = ConvertTo-SecureString "cjayG03s2Church!" -AsPlainText -Force

Connect-PnPOnline -Url https://sustainabletimbertasmania.sharepoint.com `
    -ClientId $clientId `
    -Tenant $tenant `
    -CertificatePath $certPath `
    -CertificatePassword $certPass

# $sites = Get-PnPTenantSite -IncludeOneDriveSites:$false | Where-Object { $_.Status -eq "Active" }


# the results only record the owners of a group, not all individual that may have read, write or full control permissions not included in the owners group.

# Load site list
$sites = Import-Csv "Sites.csv"
$results = @()

foreach ($site in $sites) {
    try {
        # Connect silently with certificate
        Connect-PnPOnline -Url $site.SiteUrl -ClientId $clientId -Tenant $tenant `
            -CertificatePath $certPath -CertificatePassword $certPass

        # Get Owners group
        $ownersGroup = Get-PnPGroup -AssociatedOwnerGroup

        # Collect members
        foreach ($user in $ownersGroup.Users) {
            $results += [PSCustomObject]@{
                SiteUrl   = $site.SiteUrl
                GroupName = $ownersGroup.Title
                OwnerName = $user.Title
                LoginName = $user.LoginName
                Email     = $user.Email
            }
        }
    }
    catch {
        Write-Host "Failed to process $($site.SiteUrl): $_"
    }
}

# Export consolidated report
$results | Export-Csv "AllSiteOwners.csv" -NoTypeInformation
