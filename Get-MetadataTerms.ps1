. ".\ConCert.ps1"


param (
    [string]$category = "Department"
)

# $ListName = "PreservationHoldLibrary"

$taxonomySession = Get-PnPTaxonomySession
$termStore = $taxonomySession.GetDefaultSiteCollectionTermStore()
$termGroups = Get-PnPTermGroup -TermStore $termStore

# To ensure groups are loaded
foreach ($group in $termGroups) {
    Write-Host "Other Groups: $($group.Name) - Id: $($group.Id)"
}

Write-Host "-----------End of Groups------------"
Write-Host "                                    "
Write-Host "                                    "




# foreach($group in $termGroups){
#     $group
# }
    
# foreach ($group in $termGroups) {
#     Write-Host "Term Group: $($group.Name)"
        
#     # Get all term sets by group name
        
        
$termSet = Get-PnPTermSet -TermGroup "Standard Metadata" -Identity $category
        
$terms = Get-PnPTerm -TermSet $termSet 

$terms



# }

# Add-PnPTaxonomyField -List "Documents" `
#     -DisplayName "Department" `
#     -InternalName "Department" `
#     -TermSet "Department" `
#     -TermGroup "Department" `
#     -AddToDefaultView

# $files = Get-PnPListItem -List $ListName

# foreach($file in $files) {
#     Set-PnPListItem -List $ListName -Identity $file.Id -Values @{"Department"="-"}
# }