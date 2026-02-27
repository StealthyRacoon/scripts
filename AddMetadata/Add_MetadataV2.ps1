. "..\ConCert.ps1"

# ------------------------------------------------------------
# Adds a single metadata column
# ------------------------------------------------------------
function Add-MetadataField {
    param(
        [string]$LibraryName,
        [string]$ColumnName,
        [string]$TermGroupName        
    )

    Write-Host "   -> Checking column '$ColumnName' in '$LibraryName'..." -ForegroundColor Gray

    try {

        if ($ColumnName -eq "Keywords") {

            if (-not (Get-PnPField -List $LibraryName -Identity "TaxKeyword" -ErrorAction SilentlyContinue)) {

                Add-PnPField `
                    -List $LibraryName `
                    -DisplayName "Keywords" `
                    -InternalName "TaxKeyword" `
                    -Type Text `
                    -AddToDefaultView

                Write-Host "      ✓ Enterprise Keywords enabled." -ForegroundColor Green
            }
            else {
                Write-Host "      - Enterprise Keywords already exists." -ForegroundColor DarkYellow
            }

            return
        }

        if (-not (Get-PnPField -List $LibraryName -Identity $ColumnName -ErrorAction SilentlyContinue)) {

            Add-PnPTaxonomyField `
                -List $LibraryName `
                -DisplayName $ColumnName `
                -InternalName ($ColumnName -replace '\s', '') `
                -TermSetPath "$TermGroupName|$ColumnName" `
                -AddToDefaultView

            Write-Host "      ✓ Added '$ColumnName'" -ForegroundColor Green
        }
        else {
            Write-Host "      - '$ColumnName' already exists." -ForegroundColor DarkYellow
        }

    }
    catch {
        Write-Host "      ✗ Failed to add '$ColumnName'" -ForegroundColor Red
    }
}

# ------------------------------------------------------------
# Adds all metadata fields to a library
# ------------------------------------------------------------
function Add-MetadataFields {
    param([string]$DocumentLibrary)

    $TermGroupName = "Standard Metadata"
    $managedColumns = @("Department", "Document Type", "Coupe", "Keywords")

    Write-Host "  Processing Library: $DocumentLibrary" -ForegroundColor Yellow

    foreach ($column in $managedColumns) {
        Add-MetadataField `
            -LibraryName $DocumentLibrary `
            -ColumnName $column `
            -TermGroupName $TermGroupName
    }
}

# ------------------------------------------------------------
# Processes libraries and exports results
# ------------------------------------------------------------
function LibrariesThatWillBeProcessed {
    param (
        [string]$SiteUrl,
        [array]$Libraries,
        [string]$ExportPath
    )

    $results = @()

    foreach ($library in $Libraries) {

        Add-MetadataFields -DocumentLibrary $library.Title

        $libraryUrl = $SiteUrl.TrimEnd('/') + $library.RootFolder.ServerRelativeUrl

        $results += [PSCustomObject]@{
            SiteUrl      = $SiteUrl
            LibraryTitle = $library.Title
            LibraryUrl   = $libraryUrl
        }
    }

    if ($results.Count -gt 0) {
        if (Test-Path $ExportPath) {
            $results | Export-Csv -Path $ExportPath -NoTypeInformation -Append
        }
        else {
            $results | Export-Csv -Path $ExportPath -NoTypeInformation
        }

        Write-Host "  ✓ Exported $($results.Count) libraries." -ForegroundColor Green
    }
    else {
        Write-Host "  - No libraries found to export." -ForegroundColor DarkYellow
    }
}

# ------------------------------------------------------------
# Main processor (Plain text file version)
# ------------------------------------------------------------
function Process-SitesFromFile {
    param (
        [string]$FilePath,
        [string]$ExportPath
    )

    if (-not (Test-Path $FilePath)) {
        Write-Host "Sites file not found: $FilePath" -ForegroundColor Red
        return
    }

    $siteUrls = Get-Content -Path $FilePath | Where-Object { $_.Trim() -ne "" }

    Write-Host "Found $($siteUrls.Count) sites to process." -ForegroundColor Cyan

    foreach ($siteUrl in $siteUrls) {

        $siteUrl = $siteUrl.TrimEnd('/')

        Write-Host "`n==================================================" -ForegroundColor DarkGray
        Write-Host "Connecting to $siteUrl" -ForegroundColor Cyan

        try {
            Connect-Site -Url $siteUrl

            Write-Host "Connected successfully." -ForegroundColor Green
            Write-Host "Retrieving document libraries..." -ForegroundColor Gray

            $librariesToProcess = Get-PnPList -Includes RootFolder | Where-Object {
                $_.BaseTemplate -eq 101 -and
                $_.Hidden -eq $false -and
                $_.IsCatalog -eq $false -and
                $_.Title -notin @(
                    "Site Assets",
                    "Site Pages",
                    "Style Library",
                    "Form Templates",
                    "Preservation Hold Library"
                )
            }

            Write-Host "Found $($librariesToProcess.Count) libraries." -ForegroundColor Cyan

            LibrariesThatWillBeProcessed `
                -SiteUrl $siteUrl `
                -Libraries $librariesToProcess `
                -ExportPath $ExportPath

        }
        catch {
            Write-Host "Failed processing $siteUrl" -ForegroundColor Red
            Write-Host $_ -ForegroundColor Red
        }
    }

    Write-Host "`nProcessing Complete." -ForegroundColor Green
}

# ------------------------------------------------------------
# Execute
# ------------------------------------------------------------
Process-SitesFromFile `
    -FilePath "sites.csv" `
    -ExportPath "IteratedLibraries.csv"