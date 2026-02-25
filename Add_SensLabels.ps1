. ".\ConCert.ps1"

Ensure-Environment

Connect-SPO


$Public       ="57b99052-bc37-4435-bf59-91ab873ae7d6"
$Internal     ="ad84d95a-88ca-4030-a440-6bb30f25e048"
$Confidential ="5ab66c90-6373-49c6-b02d-edb9ab9171a1"
$Restricted   ="48d45578-6fb7-4786-9b5d-9dbd19c9b73e"



$LabelId = $Internal
$site = "https://sustainabletimbertasmania.sharepoint.com/teams/AdrianoTestSite"


Set-SPOSite -Identity $site -SensitivityLabel $LabelId
        Write-Host "Applied label to $site"

$siteObj = Get-SPOSite -Identity $site
$label = $siteObj.SensitivityLabel

Write-Host "Applied $label to $site"
# Disconnect-SPO
