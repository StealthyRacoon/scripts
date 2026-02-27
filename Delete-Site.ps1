. ".\ConCert.ps1"
Install-Module -Name Microsoft.Online.SharePoint.PowerShell
Import-Module Microsoft.Online.SharePoint.PowerShell
Install-Module PnP.PowerShell -Scope CurrentUser
Import-Module PnP.PowerShell







$AdminUrl = "https://sustainabletimbertasmania-admin.sharepoint.com"
$SiteUrl = "https://sustainabletimbertasmania.sharepoint.com/teams/SMSTestingV1"

# Connect to SPO Admin
Connect-SPOService -Url $AdminUrl

# Permanently remove deleted site
Remove-SPODeletedSite -Identity $SiteUrl

# Get-SPOSite -Identity $SiteUrl | Select Url, GroupId