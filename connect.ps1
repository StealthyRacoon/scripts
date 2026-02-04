$AppId = "0451fea0-45e2-4275-ae69-048ea97036db"
$Thumbprint = "4ED121B4E6BB082D6B34E8E798E8CDEAD7A6EE36"
$Organization = "contoso.onmicrosoft.com"
$Password = ConvertTo-SecureString "123456Sustainable" -AsPlainText -Force

# Connect-ExchangeOnline `
#     -AppId $AppId `
#     -CertificateThumbprint $Thumbprint `
#     -Organization $Organization `
#     -ShowBanner:$false




# $Password = ConvertTo-SecureString `
#   (Get-Content C:\ProgramData\EXO\pfx-password.txt) `
#   -AsPlainText -Force

Connect-ExchangeOnline `
  -AppId $AppId `
  -Organization $Organization
  -CertificateFilePath "C:\ProgramData\EXO\exo-automation.pfx" `
  -CertificatePassword $Password `
  -ShowBanner:$false


Get-EXOMailbox -ResultSize 1

