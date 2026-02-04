# ==============================
# Variables
# ==============================
$adminUPN = "sarang.gadhiya@sttas.com.au"   # <-- CHANGE THIS
$adminUrl = "https://sustainabletimbertasmania-admin.sharepoint.com"  # <-- CHANGE THIS
$csvPath  = ".\SiteAdminVerification.csv"

$results = @()

# ==============================
# Connect to Admin Center
# ==============================
$url = $adminUrl
. ".\ConCert.ps1"

Write-Host "Retrieving all site collections..." -ForegroundColor Cyan
$sites = Get-PnPTenantSite -IncludeOneDriveSites:$false -Detailed
Write-Host "Found $($sites.Count) sites." -ForegroundColor Green

# ==============================
# Loop through sites
# ==============================
foreach ($site in $sites) {
    Write-Host "Checking $($site.Url)..." -ForegroundColor Yellow

    try {
        # Connect to site
        $url = $site.Url
        . ".\ConCert.ps1"

        # Get site collection admins
        $admins = Get-PnPSiteCollectionAdmin

        $isAdmin = $admins | Where-Object {
            $_.LoginName -match $adminUPN
        }

        $results += [PSCustomObject]@{
            SiteUrl        = $site.Url
            IsSiteAdmin    = if ($isAdmin) { "Yes" } else { "No" }
        }

        if ($isAdmin) {
            Write-Host "✔ User IS Site Admin" -ForegroundColor Green
        }
        else {
            Write-Host "✖ User is NOT Site Admin" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "✖ Error checking $($site.Url): $_" -ForegroundColor Red

        $results += [PSCustomObject]@{
            SiteUrl        = $site.Url
            IsSiteAdmin    = "Error"
        }
    }
}

# ==============================
# Export results
# ==============================
$results | Export-Csv -Path $csvPath -NoTypeInformation

Write-Host "Verification complete." -ForegroundColor Cyan
Write-Host "Results saved to $csvPath" -ForegroundColor Cyan
