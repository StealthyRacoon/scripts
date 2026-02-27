. ".\ConCert.ps1"
Install-Module -Name Microsoft.Online.SharePoint.PowerShell
Import-Module Microsoft.Online.SharePoint.PowerShell
Install-Module PnP.PowerShell -Scope CurrentUser
Import-Module PnP.PowerShell


# https://sustainabletimbertasmania.sharepoint.com/sites/pwa
# https://sustainabletimbertasmania.sharepoint.com/teams/boardpapertraining
# https://sustainabletimbertasmania.sharepoint.com/teams/BusinessSystemsSystemsAccounts
# https://sustainabletimbertasmania.sharepoint.com/teams/IT_Test_Playground
# https://sustainabletimbertasmania.sharepoint.com/teams/PaperMill
# https://sustainabletimbertasmania.sharepoint.com/teams/Testplan
# https://sustainabletimbertasmania.sharepoint.com/teams/ITS-Helpdesk
# https://sustainabletimbertasmania.sharepoint.com/teams/KeyAndLock
# https://sustainabletimbertasmania.sharepoint.com/teams/SEC_EXT_PA_PBM
# https://sustainabletimbertasmania.sharepoint.com/teams/SMSTestingV1





$AdminUrl = "https://sustainabletimbertasmania-admin.sharepoint.com"
$SiteUrl = "https://sustainabletimbertasmania.sharepoint.com/teams/SMSTestingV1"

# Connect to SPO Admin
Connect-SPOService -Url $AdminUrl

# Permanently remove deleted site
Remove-SPODeletedSite -Identity $SiteUrl

# Get-SPOSite -Identity $SiteUrl | Select Url, GroupId