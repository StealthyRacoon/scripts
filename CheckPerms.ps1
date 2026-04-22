Connect-ExchangeOnline

$user = "sarang.gadhiya@sttas.com.au"
$group = "GRP­_WorkHealthSafety­"

$members = Get-UnifiedGroupLinks -Identity $group -LinkType Members
$owners  = Get-UnifiedGroupLinks -Identity $group -LinkType Owners
$allPerms = Get-UnifiedGroupLinks -Identity $group -LinkType Members | Where-Object {$_.RecipientType -like "*GRP­_WorkHealthSafety­*"}


Write-Host($allPerms)

# $allUsers = $members + $owners | Select-Object Name, PrimarySmtpAddress, RecipientType

# $allUsers | Sort-Object PrimarySmtpAddress | Format-Table
Write-Host($links)

if ($members.PrimarySmtpAddress -contains $user -or $owners.PrimarySmtpAddress -contains $user -or $links.PrimarySmtpAddress -contains $user) {
    Write-Host "User HAS access to the calendar"
}
else {
    Write-Host "User does NOT have access to the calendar"
}