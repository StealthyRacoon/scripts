. ".\ConCert.ps1"

$url = "https://sustainabletimbertasmania.sharepoint.com/sites/pwa"

Connect-Site -Url $url
Remove-SPODeletedSite -Identity $url
