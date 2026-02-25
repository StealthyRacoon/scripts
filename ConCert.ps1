# param ([string]$url)

$envFile = Join-Path $PSScriptRoot ".env"

if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*#' -or -not $_) { return }
        $name, $value = $_ -split '=', 2
        [System.Environment]::SetEnvironmentVariable($name, $value)
    }
}
else {
    throw ".env file not found"
}


$TenantId = $env:TENANT
$clientId = $env:CLIENTID
$certPath = $env:CERTPATH
$certPass = ConvertTo-SecureString $env:CERTPASS -AsPlainText -Force
$TenantUrl = $env:TENANTURL
$TenantAdminUrl = $env:TENANTADMIN
$Thumbprint = $env:THUMBPRINT


function Connect-PnP {

    Connect-PnPOnline -Url $TenantUrl `
        -ClientId $clientId `
        -Tenant $TenantId `
        -CertificatePath $certPath `
        -CertificatePassword $certPass
    
}

function Connect-Site {
    param (
        [string]$Url
    )

    Connect-PnPOnline -Url $Url `
        -ClientId $clientId `
        -Tenant $TenantId `
        -CertificatePath $certPath `
        -CertificatePassword $certPass

    Write-Host "Connected to $Url" -ForegroundColor Green
}


function Get-TenantSites {
    Write-Host "Retrieving all site collections..." -ForegroundColor Cyan
    Get-PnPTenantSite -IncludeOneDriveSites:$false -Detailed |
    Where-Object {
        $_.Url -notmatch "/_catalogs/" -and
        $_.Url -notmatch "-my.sharepoint.com" -and
        $_.Template -ne "SPSPERS"
    }
    # Write-Host "Found $($sites.Count) sites." -ForegroundColor Green
}

function Get-TenantLibraries {
    Write-Host "Retrieving all site Libraries..." -ForegroundColor Cyan
    $sites = Get-TenantSites
    
    
    $allLibraries = @()

    foreach ($site in $sites) {

        Connect-Site -Url $site.Url
        $libraries = Get-PnPList | Where-Object { $_.BaseTemplate -eq 101 -and -not $_.Hidden }
        $allLibraries += $libraries
    }

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
            $_.BaseTemplate -eq 101 -and -not $_.Hidden -and 
            $_.ItemCount -gt 0 -and 
            $_.Title -notin @("Form Templates", "Site Assets", "Style Library", "Site Pages")  
        } 

        # $libraries = $libraries | Select-Object -First 30


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


# function Connect-SPO {
    
#     $spoUrl = $env:TENANTADMIN
#     if (-not $spoUrl) {
#         throw "TENANTURL not found in environment. Set it to your admin center URL (e.g., https://<tenant>-admin.sharepoint.com)."
#     }

   
#     try {
#         if ($adminUpn -and $adminPwd) {
#             # Use credentialed auth
#             $secPwd = ConvertTo-SecureString $adminPwd -AsPlainText -Force
#             $cred = New-Object System.Management.Automation.PSCredential ($adminUpn, $secPwd)

#             Connect-SPOService -Url $spoUrl -Credential $cred
#         }
#         else {
#             # Interactive prompt
#             Connect-SPOService -Url $spoUrl
#         }

#         # Simple connectivity test
#         $null = Get-SPOSite -Limit 1 -ErrorAction Stop
#         Write-Host "Connected to SPO Admin: $spoUrl" -ForegroundColor Green
#         return
#     }
#     catch {
#         if ($i -lt $RetryCount) {
#             throw "Connect-SPO failed after $($RetryCount+1) attempts. $($_.Exception.Message)"
#         }
#     }
    
# }

function Connect-SPO {
    
    Connect-SPOService `
        -Url $TenantAdminUrl`
}

function Disconnect-SPO {
    try {
        Disconnect-SPOService
        Write-Host "Disconnected from SPO." -ForegroundColor Green
    }
    catch { }
}

function Connect-Graph {
    Connect-MgGraph -TenantId $TenantId -ClientId $ClientId -CertificateThumbprint $Thumbprint
    Write-Host "Connected to graph." -ForegroundColor Green
}