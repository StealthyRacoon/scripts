param ([string]$SiteUrl)
    
. ".\ConCert.ps1"

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



$LibraryName = "Organised Document Library"
$TermGroupName = "Standard Metadata" 
# $TermSetName = "Document Status"

# Initialize-PnPTaxonomySession

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


# Export-TenantLibraries