param ([string]$SiteUrl)
    
. ".\ConCert.ps1"

Connect-Site -Url $SiteUrl

# Export-TenantLibraries
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

        # [Parmeter(Mandatory)]
        # [string]$TermSetName
        
    )

    try {

        # Write-Host "termSet object type: $($termSet.GetType().FullName)"
        # Write-Host "termSet.Id: '$($termSet.Id)'"
        # $termSet | Format-List *

        # $termSet = Get-TermSetByName -TermGroup $TermGroupName -TermSetName $TermSetName

        if (-not (Get-PnPField -List $LibraryName -Identity $ColumnName -ErrorAction SilentlyContinue)) {
            Add-PnPTaxonomyField `
                -List $LibraryName `
                -DisplayName $ColumnName `
                -InternalName ($ColumnName -replace '\s', '') `
                -TermSetPath "$TermGroupName|$ColumnName" `
                -ErrorAction SilentlyContinue `
                -AddToDefaultView 

            Write-Host "Managed metadata column '$ColumnName' added successfully." -ForegroundColor Green
        }
        else {
            Write-Host "Field '$ColumnName' already exists, skipping." -ForegroundColor DarkYellow
        }
        
    }
    catch {
        Write-Host "Failed to add managed metadata column '$ColumnName'." -ForegroundColor Red
        throw
    }
}

function Get-SiteLibraries {

}

$LibraryName = "Sarang Test Library"
$TermGroupName = "Standard Metadata" 
# $TermSetName = "Document Status"

# Initialize-PnPTaxonomySession

$columns = @("Department", "Document Type", "Coupe", "Unsure Need Help", "Keywords")

foreach ($column in $columns) {
    Add-MetadataField -LibraryName $LibraryName -ColumnName $column -TermGroupName $TermGroupName
}