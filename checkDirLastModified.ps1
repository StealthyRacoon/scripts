# Set the root directory to scan
$RootDir = "\\fs-w22-prd\Hob"

# CSV output file
$CsvOutput = "recent_files.csv"

# Get the cutoff time (24 hours ago)
$Cutoff = (Get-Date).AddDays(-90)

Write-Host "========================================="
Write-Host " Starting file scan"
Write-Host " Root Directory : $(Resolve-Path $RootDir)"
Write-Host " Cutoff Time    : $Cutoff"
Write-Host " CSV Output     : $CsvOutput"
Write-Host "========================================="
Write-Host ""

$TotalFiles = 0
$RecentFiles = 0
$ErrorCount = 0

# Store matching files
$Results = @()

Write-Host "[INFO] Collecting files..."
$Files = Get-ChildItem -Path $RootDir -Recurse -File -ErrorAction SilentlyContinue

Write-Host "[INFO] Found $($Files.Count) files to scan."
Write-Host ""

foreach ($File in $Files) {
    $TotalFiles++

    try {
        if ($File.LastWriteTime -ge $Cutoff) {
            $RecentFiles++

            Write-Host "[MATCH] $($File.FullName)"

            $Results += [PSCustomObject]@{
                FilePath     = $File.FullName
                LastModified = $File.LastWriteTime
                SizeKB       = [math]::Round($File.Length / 1KB, 2)
            }
        }
    }
    catch {
        $ErrorCount++

        Write-Host "[ERROR] Could not access: $($File.FullName)"
        Write-Host "        $_"
        Write-Host ""
    }
}

# Export results to CSV
$Results |
    Sort-Object LastModified -Descending |
    Export-Csv -Path $CsvOutput -NoTypeInformation

Write-Host ""
Write-Host "========================================="
Write-Host " Scan complete"
Write-Host "========================================="
Write-Host " Total Files Scanned : $TotalFiles"
Write-Host " Recent Files Found  : $RecentFiles"
Write-Host " Errors              : $ErrorCount"
Write-Host " CSV Exported To     : $((Resolve-Path $CsvOutput).Path)"
Write-Host "========================================="