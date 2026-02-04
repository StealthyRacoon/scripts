# ==============================
# Variables
# ==============================
$adminUPN = "syssg1@sttas.com.au"   # <-- CHANGE THIS
$adminUrl = "https://sustainabletimbertasmania-admin.sharepoint.com"  # <-- CHANGE THIS

# ==============================
# Connect to Admin Center
# ==============================
$url = $adminUrl
. ".\ConCert.ps1"

# ==============================
# Get all site collections
# ==============================
Write-Host "Retrieving all site collections..." -ForegroundColor Cyan

$sites = Get-PnPTenantSite -IncludeOneDriveSites:$false -Detailed

Write-Host "Found $($sites.Count) sites." -ForegroundColor Green

# ==============================
# Loop through sites and add admin
# ==============================
foreach ($site in $sites) {
    try {
        Write-Host "Processing $($site.Url)..." -ForegroundColor Yellow

        # Connect to the site
        $url = $site.Url
        . ".\ConCert.ps1"

        # Add site collection admin
        Add-PnPSiteCollectionAdmin -Owners $adminUPN

        Write-Host "✔ Added $adminUPN as Site Admin on $($site.Url)" -ForegroundColor Green
    }
    catch {
        Write-Host "✖ Failed on $($site.Url): $_" -ForegroundColor Red
    }
}

Write-Host "All sites processed." -ForegroundColor Cyan
