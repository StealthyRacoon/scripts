. ".\ConCert.ps1"

# Connect-SPO


$Public = "57b99052-bc37-4435-bf59-91ab873ae7d6"
$Internal = "ad84d95a-88ca-4030-a440-6bb30f25e048"
$Confidential = "5ab66c90-6373-49c6-b02d-edb9ab9171a1"
$Restricted = "48d45578-6fb7-4786-9b5d-9dbd19c9b73e"
$SiteUrl = "https://sustainabletimbertasmania.sharepoint.com/teams/AdrianoTestSite"
$libraryTitle = "Sarang Test Library"

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

Import-Module Microsoft.Graph.Authentication

Connect-MgGraph -TenantId $TenantId -ClientId $ClientId -CertificateThumbprint $Thumbprint
# Write-Host $Thumbprint

# Connect-Graph

# Resolve site and the drive (library) id
$siteObj = Get-MgSite -Search $SiteUrl | Where-Object { $_.WebUrl -eq $SiteUrl }
$drive = Get-MgSiteDrive -SiteId $siteObj.Id | Where-Object { $_.Name -eq $LibraryTitle }

# $drive

# Recursively traverse folders and label supported files (Office + PDF)
function Set-LabelRecursively {
    param($DriveId, $ParentId)

    $DriveID
    $ParentId

    # Get all files directly under the folder
    $items = Get-MgDriveItemChild -DriveId $DriveId -DriveItemId $folder.Id -All |
    Where-Object { $_.File }   # only files
 
    # Apply the label (filter to supported extensions to avoid noise)
    $valid = @('.docx', '.xlsx', '.pptx', '.pdf')  # typical supported types
    foreach ($i in $items) {
        $ext = [io.path]::GetExtension($i.Name).ToLower()
        if ($valid -contains $ext) {
            Set-MgDriveItemSensitivityLabel -DriveId $DriveId -DriveItemId $i.Id -SensitivityLabelId $LabelId

        }
    }


}





Set-LabelRecursively -DriveId $drive.Id -ParentId "root"