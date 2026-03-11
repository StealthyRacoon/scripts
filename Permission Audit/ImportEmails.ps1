Import-Module PSSQLite -ErrorAction Stop

$csv = Import-Csv "Emails.csv"

$DatabasePath = "C:\Users\spadmin\Downloads\Scripts\Permission Audit\Permissions.db"
$TableName = "SuperOwners"
$totalRows = $csvData.Count
$currentRow = 0

function Show-RowProgress {
    param (
        [int]$Current,
        [int]$Total,
        [string]$Activity = "Processing"
    )

    if ($Total -eq 0) { return }

    $percentComplete = [int](($Current / $Total) * 100)

    Write-Progress `
        -Activity $Activity `
        -Status "$Current of $Total rows processed" `
        -PercentComplete $percentComplete
}

function Complete-RowProgress {
    param (
        [string]$Activity = "Processing"
    )

    Write-Progress -Activity $Activity -Completed
}

foreach ($row in $csv) {
    $currentRow++

    Show-RowProgress `
        -Current $currentRow `
        -Total $totalRows `
        -Activity "Inserting rows into [$TableName]"

    $name = $row.Name
    $Email = $row.Email

    $insertQuery = @"
            Update SuperOwners 
            SET Email = @Email
            WHERE Name = @Name    ;

"@

    # Write-Host $insertQuery
    Invoke-SqliteQuery -DataSource $DatabasePath -Query $insertQuery -SqlParameters @{
        Email = $Email
        Name = $name
    }

    
    Complete-RowProgress -Activity "Inserting rows into [$TableName]"

    Write-Host "Import complete! $totalRows rows inserted." -ForegroundColor Cyan
}