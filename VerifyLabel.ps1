# Connect-AzAccount
# $labels = Get-AzPurviewSensitivityLabel -AccountName "<purview_account_name>"
# $exists = $labels | Where-Object { $_.Id -eq "ad84d95a-88ca-4030-a440-6bb30f25e048" }

# Install-Module Microsoft.Graph -Scope CurrentUser
# Install-Module Microsoft.Graph.Beta -Scope CurrentUser

Import-Module Microsoft.Graph.Beta
Select-MgProfile beta

Connect-MgGraph -Scopes "Directory.ReadWrite.All" -UseDeviceCode

$grpUnifiedSetting = Get-MgBetaDirectorySetting | Where-Object { $_.Values.Name -eq "EnableMIPLabels" }
$grpUnifiedSetting.Values

# $params = @{
#      Values = @(
#  	    @{
#  		    Name = "EnableMIPLabels"
#  		    Value = "True"
#  	    }
#      )
# }

# Update-MgBetaDirectorySetting -DirectorySettingId $grpUnifiedSetting.Id -BodyParameter $params


# $Setting = Get-MgBetaDirectorySetting -DirectorySettingId $grpUnifiedSetting.Id
# $Setting.Values