# Create paths
$downloads = Join-Path $env:USERPROFILE "Downloads"

$cerPath = Join-Path $downloads "MyAppCert.cer"
$pfxPath = Join-Path $downloads "MyAppCert.pfx"

# Create self-signed certificate
$cert = New-SelfSignedCertificate `
    -Subject "CN=MyAppCert" `
    -CertStoreLocation "Cert:\CurrentUser\My" `
    -KeySpec Signature `
    -KeyExportPolicy Exportable `
    -KeyLength 2048 `
    -KeyAlgorithm RSA `
    -HashAlgorithm SHA256

# Export public certificate (.cer)
Export-Certificate `
    -Cert $cert `
    -FilePath $cerPath

# Create password for PFX
$password = ConvertTo-SecureString `
    -String "StrongPass123!" `
    -Force `
    -AsPlainText

# Export private key certificate (.pfx)
Export-PfxCertificate `
    -Cert $cert `
    -FilePath $pfxPath `
    -Password $password

# Display details
Write-Host ""
Write-Host "Certificate successfully created" -ForegroundColor Green
Write-Host "Thumbprint: $($cert.Thumbprint)"
Write-Host ""
Write-Host "CER file: $cerPath"
Write-Host "PFX file: $pfxPath"
Write-Host ""
Write-Host "Upload the CER file to the Azure App Registration."
Write-Host "Keep the PFX file secure."