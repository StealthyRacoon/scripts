param(
    [Parameter(Mandatory)]
    [string]$Execute
)

# === Step 1: Connect safely ===
# $tenant   = "sustainabletimbertasmania.onmicrosoft.com"
# $clientId = "2a539f71-673a-41a6-a878-77be10574006"  # App ID from Azure
# $certPath = "C:\Users\sarang.gadhiya\PnpAdminCert.pfx"
# $certPass = ConvertTo-SecureString "cjayG03s2Church!" -AsPlainText -Force

# Connect-PnPOnline -Url https://sustainabletimbertasmania-admin.sharepoint.com `
#     -ClientId $clientId `
#     -Tenant $tenant `
#     -CertificatePath $certPath `
#     -CertificatePassword $certPass

# === Step 2: Determine if Execute is a file path or inline code ===
if (Test-Path $Execute) {
    $code = Get-Content $Execute -Raw
    $sourceType = "File: $Execute"
} else {
    $code = $Execute
    $sourceType = "Inline command"
}

# === Step 3: Parse the code into AST ===
$tokens = $null
$errors = $null
$ast = [System.Management.Automation.Language.Parser]::ParseInput($code, [ref]$tokens, [ref]$errors)

if ($errors.Count -gt 0) {
    Disconnect-PnPOnline
    throw "Syntax errors detected in $sourceType. Execution aborted."
}

# === Step 4: Define allowed commands ===
$AllowedCommands = @(
    'Get-PnPTenantSite',
    'Get-PnPListItem',
    'Export-Csv',
    'Get-PnPUser',
    'Get-PnPGroup',
    'Write-Host',
    'Connect-PnPOnline',
    'Get-PnPMicrosoft365GroupOwners',
    'Get-PnPGroupMember',
    '.\ConCert.ps1'


)

# === Step 5: Inspect AST for unauthorized commands ===
$foundCommands = $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] }, $true)

$violations = foreach ($cmd in $foundCommands) {
    $name = $cmd.GetCommandName()
    if ($name -and ($AllowedCommands -notcontains $name)) {
        [PSCustomObject]@{
            Command = $name
            Line    = $cmd.Extent.StartLineNumber
        }
    }
}

if ($violations) {
    Write-Error "Unauthorized commands detected in :"
    $violations | Format-Table
    Disconnect-PnPOnline
    return
}

# === Step 6: Execute safely ===
Write-Host "$sourceType passed allowed-command check. Executing..."
if (Test-Path $Execute) {
    & $Execute
} else {
    Invoke-Expression $Execute
}

# === Step 7: Disconnect ===
Disconnect-PnPOnline
Write-Host "Execution complete. Connection closed."
