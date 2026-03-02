. ".\ConCert.ps1"

# Connect-MgGraph -Scopes "Directory.Read.All"

$grpUnifiedSetting = Get-MgBetaDirectorySetting | Where-Object { $_.Values.Name -eq "EnableMIPLabels" }
$grpUnifiedSetting.Values

# Disconnect-MgGraph -ErrorAction SilentlyContinue
# Remove-Item "$env:USERPROFILE\.mg" -Recurse -Force -ErrorAction SilentlyContinue
