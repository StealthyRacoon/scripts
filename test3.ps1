
$adminUrl = "https://sustainabletimbertasmania-admin.sharepoint.com/"
# $tenant   = "sustainabletimbertasmania.onmicrosoft.com"
Connect-SPOService -Url $adminUrl


Get-SPOSite
# Example: apply a label
Set-SPOSite -Identity https://sustainabletimbertasmania.sharepoint.com/teams/AdrianoTestSite -SensitivityLabel "Test - Internal"
