# param ([string]$url)

$tenant = "sustainabletimbertasmania.onmicrosoft.com"
$clientId = "2a539f71-673a-41a6-a878-77be10574006"  # App ID from Azure
$certPath = "C:\Users\sarang.gadhiya\PnpAdminCert.pfx"
$certPass = ConvertTo-SecureString "cjayG03s2Church!" -AsPlainText -Force

# $url = "https://sustainabletimbertasmania.sharepoint.com/teams/AdrianoTestSite/"


function Connect-PnP{

    Connect-PnPOnline -Url "https://sustainabletimbertasmania.sharepoint.com/" `
        -ClientId $clientId `
        -Tenant $tenant `
        -CertificatePath $certPath `
        -CertificatePassword $certPass
    
}

function Connect-Site {
    param (
        [string]$Url
    )
        
    # Write-Host "Connecting to $Url"

    Connect-PnPOnline -Url $Url `
        -ClientId $clientId `
        -Tenant $tenant `
        -CertificatePath $certPath `
        -CertificatePassword $certPass

    Write-Host "Connected to $Url" -ForegroundColor Green
}


function Get-TenantSites {
    Write-Host "Retrieving all site collections..." -ForegroundColor Cyan
    Get-PnPTenantSite -IncludeOneDriveSites:$false -Detailed
    # Write-Host "Found $($sites.Count) sites." -ForegroundColor Green
}

function Get-TenantLibraries {
    Write-Host "Retrieving all site Libraries..." -ForegroundColor Cyan
    $sites = Get-TenantSites
    # Initialize an array to store all libraries
    $allLibraries = @()

    foreach ($site in $sites) {
        # Write-Host "Processing site: $($site.Url)" -ForegroundColor Yellow

        # Connect to the site
        Connect-Site -Url $site.Url

        # Get all document libraries (BaseTemplate 101)
        $libraries = Get-PnPList | Where-Object { $_.BaseTemplate -eq 101 }

        # Add libraries to the main array
        $allLibraries += $libraries
    }

    # Write-Host "Found $($allLibraries.Count) libraries across $($sites.Count) sites." -ForegroundColor Green

    # Return all libraries
    return $allLibraries
    
}

function Export-TenantLibraries {
    param (
        [string]$CsvPath = "TenantLibraries.csv"
    )

    Write-Host "Retrieving all site libraries..." -ForegroundColor Cyan

    # Get all tenant sites (assuming Get-TenantSites is defined)
    $sites = Get-TenantSites

    # Initialize an array to store all libraries
    $allLibraries = @()

    foreach ($site in $sites) {
        # Write-Host "Processing site: $($site.Url)" -ForegroundColor Yellow

        # Connect to the site
        Connect-Site -Url $site.Url

        # Get all document libraries (BaseTemplate 101)
        $libraries = Get-PnPList | Where-Object { 
            $_.BaseTemplate -eq 101 -and # Only document libraries
            # $_.ItemCount -gt 0 -and # Only libraries with items
            $_.Title -notin @("Form Templates", "Site Assets", "Style Library", "Site Pages")  # Exclude system libraries

        } 

        $libraries = $libraries | Select-Object -First 30


        # Add the site URL to each library object
        foreach ($lib in $libraries) {
            $lib | Add-Member -MemberType NoteProperty -Name Site -Value $site.Url -Force
        }

        # Add libraries to the main array
        $allLibraries += $libraries
    }

    Write-Host "Found $($allLibraries.Count) libraries across $($sites.Count) sites." -ForegroundColor Green

    # Select relevant properties to export
    $allLibraries | Select-Object Site, Title, Url, Id, Created, LastItemModifiedDate, ItemCount, Hidden, BaseTemplate |
    Export-Csv -Path $CsvPath -NoTypeInformation -Encoding UTF8

    Write-Host "Libraries exported to $CsvPath" -ForegroundColor Green

    # Return all libraries
    return $allLibraries
}
