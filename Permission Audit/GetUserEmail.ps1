. "..\ConCert.ps1"

Connect-PnP
# Import CSV
$csv = Import-Csv "SuperOwners.csv"

# Get all Entra ID users once
$allUsers = Get-PnPAzureADUser

Write-Host $allUsers

# Process rows
$result = foreach ($row in $csv) {

    $match = $allUsers | Where-Object { $_.DisplayName -eq $row.Name } | Select-Object -First 1

    [PSCustomObject]@{
        URL   = $row.URL
        Name  = $row.Name
        Email = $match.Mail
        UPN   = $match.UserPrincipalName
    }
}

# Export result
$result | Export-Csv "SuperOwners_WithEmails.csv" -NoTypeInformation