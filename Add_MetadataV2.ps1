param ([string]$SiteUrl)
    
. ".\ConCert.ps1"

$SiteUrl = "https://sustainabletimbertasmania.sharepoint.com/teams/SharePointTrainingSite"

Connect-Site -Url $SiteUrl

function Get-TermSetByName {
    param (
        [Parameter(Mandatory)]
        [string]$TermGroupName,

        [Parameter(Mandatory)]
        [string]$TermSetName
    )

    $termSet = Get-PnPTermSet `
        -TermGroup $TermGroupName `
        -Identity $TermSetName `
        -ErrorAction Stop

    if (-not $termSet -or -not $termSet.Id) {
        throw "Term set '$TermSetName' in group '$TermGroupName' could not be resolved."
    }

    return $termSet
}


function Add-MetadataField {
    param(
        [Parameter(Mandatory)]
        [string]$LibraryName,
        
        [Parameter(Mandatory)]
        [string]$ColumnName,
        
        [Parameter(Mandatory)]
        [string]$TermGroupName        
    )

    try {

        # Special case: Keywords = Enterprise Keywords
        if ($ColumnName -eq "Keywords") {

            if (-not (Get-PnPField -List $LibraryName -Identity "TaxKeyword" -ErrorAction SilentlyContinue)) {

                Add-PnPField `
                    -List $LibraryName `
                    -DisplayName "Keywords" `
                    -InternalName "TaxKeyword" `
                    -Type TaxonomyFieldTypeMulti `
                    -AddToDefaultView

                Write-Host "Enterprise Keywords column enabled." -ForegroundColor Green
            }
            else {
                Write-Host "Enterprise Keywords already enabled." -ForegroundColor DarkYellow
            }

            return
        }

        # Normal Managed Metadata fields
        if (-not (Get-PnPField -List $LibraryName -Identity $ColumnName -ErrorAction SilentlyContinue)) {

            Add-PnPTaxonomyField `
                -List $LibraryName `
                -DisplayName $ColumnName `
                -InternalName ($ColumnName -replace '\s', '') `
                -TermSetPath "$TermGroupName|$ColumnName" `
                -AddToDefaultView

            Write-Host "Managed metadata column '$ColumnName' added successfully." -ForegroundColor Green
        }
        else {
            Write-Host "Field '$ColumnName' already exists, skipping." -ForegroundColor DarkYellow
        }

    }
    catch {
        Write-Host "Failed to add column '$ColumnName'." -ForegroundColor Red
        throw
    }
}

function Add-MetadataFields {
    param(
        [Parameter(Mandatory)]
        [string]$DocumentLibrary 
    )
    $LibraryName = "Unorganised Document Library"
    $TermGroupName = "Standard Metadata" 

    $managedColumns = @("Department", "Document Type", "Coupe")
    $freeColumns = @("Keywords")

    foreach ($column in $managedColumns) {
        Add-MetadataField -LibraryName $LibraryName -ColumnName $column -TermGroupName $TermGroupName
    }

    foreach ($column in $freeColumns) {
        Add-PnPField `
            -List $LibraryName `
            -DisplayName $column `
            -InternalName ($column -replace '\s', '') `
            -Type Text `
            -AddToDefaultView
    }
}


function LibrariesThatWillBeProcessed {
    param (
        [string]$SiteUrl,
        [array]$Libraries,
        [string]$ExportPath
    )

    $results = @()

    foreach ($library in $Libraries) {

        # Build full library URL
        $libraryUrl = $SiteUrl.TrimEnd('/') + $library.RootFolder.ServerRelativeUrl

        $results += [PSCustomObject]@{
            SiteUrl      = $SiteUrl
            LibraryTitle = $library.Title
            LibraryUrl   = $libraryUrl
        }
    }

    # Append if file exists, otherwise create new
    if (Test-Path $ExportPath) {
        $results | Export-Csv -Path $ExportPath -NoTypeInformation -Append
    }
    else {
        $results | Export-Csv -Path $ExportPath -NoTypeInformation
    }

    Write-Host "Exported $($results.Count) libraries for $SiteUrl"
}


function Process-SitesFromCsv {
    param (
        [string]$CsvPath,
        [string]$ExportPath
    )

    $rows = Get-Content -Path $CsvPath

    foreach ($siteUrl in $rows) {

        $siteUrl = $siteUrl.TrimEnd('/')
        Write-Host "`nConnecting to $siteUrl..."

        try {
            Connect-Site -Url $siteUrl

            # Get all visible document libraries
            $librariesToProcess = Get-PnPList | Where-Object {
                $_.BaseTemplate -eq 101 -and $_.Hidden -eq $false
            }

            LibrariesThatWillBeProcessed -SiteUrl $siteUrl `
                -Libraries $librariesToProcess `
                -ExportPath $ExportPath
        }
        catch {
            Write-Warning "Failed processing $siteUrl. Error: $_"
        }
    }
}


Process-SitesFromCsv `
    -CsvPath "sites.csv" `
    -ExportPath "IteratedLibraries.csv"