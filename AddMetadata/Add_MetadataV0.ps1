. ".\ConCert.ps1"

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


$ColumnDisplayName = "Coupe"
$LibraryName = "Sarang Test Library"
$TermGroupName = "Standard Metadata" 
$TermSetName = "Coupe"

$termSet = Get-TermSetByName -TermGroup $TermGroupName -TermSetName $TermSetName


Initialize-PnPTaxonomySession
try {

    Write-Host "termSet object type: $($termSet.GetType().FullName)"
    Write-Host "termSet.Id: '$($termSet.Id)'"
    $termSet | Format-List *


    Add-PnPTaxonomyField `
        -List $LibraryName `
        -DisplayName $ColumnDisplayName `
        -InternalName ($ColumnDisplayName -replace '\s', '') `
        -TermSetPath "$TermGroupName|$TermSetName" `
        -AddToDefaultView
        # -MultiValue:$AllowMultipleValues `
        # -ErrorAction Stop

    Write-Host "Managed metadata column '$ColumnDisplayName' added successfully." -ForegroundColor Green
}
catch {
    Write-Host "Failed to add managed metadata column '$ColumnDisplayName'." -ForegroundColor Red
    throw
}