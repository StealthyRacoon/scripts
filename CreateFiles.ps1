# ------------------------------
# CONFIGURATION
# ------------------------------

$SiteUrl = "https://sustainabletimbertasmania.sharepoint.com/teams/SharePointTrainingSite"
$LibraryName = "Organised Document Library"


. "$PSScriptRoot\ConCert.ps1"

Connect-Site -Url $SiteUrl
# ------------------------------
# FILE LIST (Flat Structure)
# ------------------------------

$Files = @(
    "2022_HR_Recruitment_Report.pdf",
    "2025_IT_Security_Audit.docx",
    "FY2023_Procurement_Vendor_Payments_Report.pdf",
    "20250115_FIN_Payroll_Register_Report.pdf",
    "March_FIN_Cashflow_Summary.xlsx",
    "20240101_20240131_FIN_MonthEnd_Close_Report.pdf",
    "2023Q1_FIN_Revenue_Report.pdf",
    "LEGAL_Contract_Template.docx",
    "FY2026_FIN_Capital_Expenditure_Report.xlsx",
    "20211115_IT_Data_Migration_Report.docx"
)

$Files = 1..5 | ForEach-Object { $Files }  # Expand to 50

# ------------------------------
# TERM VALUES (Managed Metadata)
# ------------------------------

$Departments = @(
    "Admin", "Board", "Business Systems", "Certification",
    "Communications & Engagement", "Executive", "Finance",
    "Fire Management", "Fleet and Facilities", "Forest Management",
    "IT Infrastructure", "Land and Property", "Nursery",
    "People & Culture", "Production (North)", "Production (South)",
    "Resources & Planning", "Roading", "Stewardship", "WH&S"
)

$UnsureOptions = @("Yes", "No")

function New-CoupeCode {
    $letters = -join ((65..90) | Get-Random -Count 2 | ForEach-Object { [char]$_ })
    $numbers = Get-Random -Minimum 100 -Maximum 999
    $lastLetter = [char](Get-Random -Minimum 65 -Maximum 90)
    return "$letters$numbers$lastLetter"
}

# ------------------------------
# CREATE + UPLOAD FILES
# ------------------------------

foreach ($File in $Files) {

    # ------------------------------
    # Create a temporary local file
    # ------------------------------
    $TempPath = Join-Path $env:TEMP $File
    New-Item -ItemType File -Path $TempPath -Force | Out-Null

    # ------------------------------
    # Generate random metadata
    # ------------------------------
    $Department = Get-Random $Departments
    $Coupe      = New-CoupeCode
    $Unsure     = Get-Random $UnsureOptions
    $Keyword    = @("Harvest","Compliance","Planning","Budget","Safety") | Get-Random

    # ------------------------------
    # Upload file AND set metadata at the same time
    # ------------------------------
    Add-PnPFile -Path $TempPath -Folder $LibraryName 

    # ------------------------------
    # Clean up temp file
    # ------------------------------
    Remove-Item $TempPath
}


Write-Host "50 documents uploaded with Managed Metadata to $LibraryName"
