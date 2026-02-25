<#
.SYNOPSIS
Checks if PnP.PowerShell and Microsoft.Graph modules exist. Installs if missing.
Shows progress with Write-Host.

.NOTES
- Safe to run without admin; falls back to -Scope CurrentUser.
- Uses PSGallery and installs NuGet provider if needed.
#>

# Ensure errors stop execution where appropriate
$ErrorActionPreference = 'Stop'

function Test-IsAdmin {
    try {
        $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
        $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
        return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    } catch {
        return $false
    }
}

function Ensure-NuGetProvider {
    try {
        if (-not (Get-PackageProvider -Name NuGet -ListAvailable -ErrorAction SilentlyContinue)) {
            Write-Host "NuGet provider not found. Installing..." -ForegroundColor Yellow
            Install-PackageProvider -Name NuGet -Force -Scope CurrentUser | Out-Null
            Write-Host "NuGet provider installed." -ForegroundColor Green
        } else {
            Write-Host "NuGet provider already available." -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "Failed to ensure NuGet provider: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Ensure-PSGalleryTrusted {
    try {
        $repo = Get-PSRepository -Name 'PSGallery' -ErrorAction SilentlyContinue
        if (-not $repo) {
            Write-Host "PSGallery not registered. Registering PSGallery..." -ForegroundColor Yellow
            Register-PSRepository -Default
            $repo = Get-PSRepository -Name 'PSGallery'
        }
        if ($repo.InstallationPolicy -ne 'Trusted') {
            Write-Host "PSGallery not trusted. Setting InstallationPolicy=Trusted..." -ForegroundColor Yellow
            Set-PSRepository -Name 'PSGallery' -InstallationPolicy Trusted
        } else {
            Write-Host "PSGallery already trusted." -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "Failed to ensure PSGallery trust: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

function Ensure-Module {
    param(
        [Parameter(Mandatory)]
        [string]$Name,

        [string]$MinimumVersion
    )

    Write-Host "=== Checking module: $Name ===" -ForegroundColor Cyan
    $installed = Get-Module -ListAvailable -Name $Name -ErrorAction SilentlyContinue |
                 Sort-Object Version -Descending | Select-Object -First 1

    if ($installed) {
        if ($MinimumVersion -and ($installed.Version -lt [version]$MinimumVersion)) {
            Write-Host "$Name is installed but version $($installed.Version) < $MinimumVersion. Updating..." -ForegroundColor Yellow
        } else {
            Write-Host "$Name is already installed (version $($installed.Version))." -ForegroundColor Green
            return
        }
    } else {
        Write-Host "$Name not found. Installing..." -ForegroundColor Yellow
    }

    $isAdmin = Test-IsAdmin
    $scope = $(if ($isAdmin) { 'AllUsers' } else { 'CurrentUser' })
    if (-not $isAdmin) {
        Write-Host "Not running as admin. Using -Scope CurrentUser." -ForegroundColor DarkYellow
    }

    try {
        $params = @{
            Name                = $Name
            Repository          = 'PSGallery'
            Scope               = $scope
            Force               = $true
            AllowClobber        = $true
        }
        if ($MinimumVersion) { $params['MinimumVersion'] = $MinimumVersion }

        Install-Module @params
        Write-Host "$Name installed successfully." -ForegroundColor Green
    } catch {
        Write-Host "Install-Module for $Name failed: $($_.Exception.Message)" -ForegroundColor Red
        throw
    }
}

# ---- Main ----
Write-Host "Starting module check..." -ForegroundColor Cyan

# Prepare PowerShellGet / PSGallery
Ensure-NuGetProvider
Ensure-PSGalleryTrusted

# Ensure modules:
# - PnP.PowerShell (official PnP module for SharePoint Online)
# - Microsoft.Graph (meta-module for Microsoft Graph cmdlets like Connect-MgGraph)
Ensure-Module -Name 'PnP.PowerShell'     -MinimumVersion '2.5.0'
Ensure-Module -Name 'Microsoft.Graph'    -MinimumVersion '2.20.0'  # Adjust if you need a specific baseline

Write-Host "All checks completed." -ForegroundColor Cyan