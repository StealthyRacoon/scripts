
$SiteUrl = "https://sustainabletimbertasmania.sharepoint.com/teams/SharePointTrainingSite"


. "$PSScriptRoot\ConCert.ps1"

Connect-Site -Url $SiteUrl


# Example variables
$LibraryName = "Organised Document Library"
$Departments = @(
    "Admin", "Board", "Business Systems", "Certification",
    "Communications & Engagement", "Executive", "Finance",
    "Fire Management", "Fleet and Facilities", "Forest Management",
    "IT Infrastructure", "Land and Property", "Nursery",
    "People & Culture", "Production (North)", "Production (South)",
    "Resources & Planning", "Roading", "Stewardship", "WH&S"
)
$DocumentTypes = @(
    "-", "Application", "Budget", "Certificate", "Contract", "Diagram",
    "Email", "General Document", "Guide", "Invoice", "Letter Of Authority", "Notes",
    "Policy", "Procedure", "Purchase Order", "Quote", "Receipt", "Register", "Report",
    "Resume", "Schematic", "Unassigned"
)
$Coupes = @(
    "-", "AR004C", "AR004D", "AR004E", "AR005B", "AR005C", "AR005D", "AR006H",
    "AR006I", "AR007D", "AR007E", "AR007G", "AR008C", "AR008D", "AR009E", "AR009F",
    "AR009G", "AR010D", "AR011E", "AR012F", "AR012G", "AR012H", "AR014D", "AR014E",
    "AR014F", "AR014G", "AR014H", "AR015B", "AR015D", "AR015F", "AR015P", "AR016A",
    "AR016B", "AR018B", "AR018C", "AR018D", "AR022D", "AR022E", "AR022F", "AR022H", "
    AR022J", "AR023B", "AR023D", "AR023E", "AR023F", "AR023G", "AR023H", "AR026C",
    "AR026E", "AR026G"
)
$UnsureOptions = @("Yes", "No")
$KeywordOptions = @("Harvest", "Compliance", "Planning", "Budget", "Safety")




function Set-RandomMetadataForLibrary {

    

    # Get all list items (files) from the library
    $ListItems = Get-PnPListItem -List $LibraryName -PageSize 500 -Fields "ID", "FileLeafRef"

    foreach ($file in $ListItems) {

        if ($file.Id -ne $null) {


            $Department = Get-Random $Departments
            $DepartmentTerm = Get-PnPTerm -TermSet "Department" -TermGroup "Standard Metadata" -Identity $Department
            $Coupe = Get-Random $Coupes
            $CoupeTerm = Get-PnPTerm -TermSet "Coupe" -TermGroup "Standard Metadata" -Identity $Coupe
            $DocumentType = Get-Random $DocumentTypes
            $DocumentTypeTerm = Get-PnPTerm -TermSet "Document Type" -TermGroup "Standard Metadata" -Identity $DocumentType
            $UnsureOption = Get-Random $UnsureOptions
            $UnsureOptionTerm = Get-PnPTerm -TermSet "Unsure Need Help" -TermGroup "Standard Metadata" -Identity $UnsureOption
            $Keyword = Get-Random $KeywordOptions


            Write-Host "Random Department: $Department"
            Write-Host "Random Coupe: $Coupe"
            Write-Host "Random Document Type: $DocumentType"
            Write-Host "Random Need Help: $UnsureOption"
            Write-Host "Random Keywords: $Keyword"


            Set-PnPListItem -List $libraryName -Identity $file.Id -Values @{
                "Department"       = "$($DepartmentTerm.Name)|$($DepartmentTerm.Id.Guid)"
                "Document Type"    = "$($DocumentTypeTerm.Name)|$($DocumentTypeTerm.Id.Guid)"
                "Coupe"            = "$($CoupeTerm.Name)|$($CoupeTerm.Id.Guid)"
                "Unsure Need Help" = "$($UnsureOptionTerm.Name)|$($UnsureOptionTerm.Id.Guid)"
                "Keywords"         = "$Keyword"
            }

            Write-Host "Updated metadata for '$($file.FieldValues.FileLeafRef)'" -ForegroundColor Green
        }
        else {
            Write-Host "Skipping item: no valid ID" -ForegroundColor Yellow
        }
    }
}



Set-RandomMetadataForLibrary 
