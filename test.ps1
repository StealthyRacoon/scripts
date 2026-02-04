$tenant = "sustainabletimbertasmania.onmicrosoft.com"
$clientId = "2a539f71-673a-41a6-a878-77be10574006"  # App ID from Azure
$certPath = "C:\Users\sarang.gadhiya\PnpAdminCert.pfx"
$certPass = ConvertTo-SecureString "cjayG03s2Church!" -AsPlainText -Force

Connect-PnPOnline -Url https://sustainabletimbertasmania.sharepoint.com `
    -ClientId $clientId `
    -Tenant $tenant `
    -CertificatePath $certPath `
    -CertificatePassword $certPass

# Example: load the 'Templates' folder
$Templates = Get-PnPFolder -Url "https://sustainabletimbertasmania.sharepoint.com/"

# Now expand properties
Get-PnPProperty -ClientObject $Templates -Property Name, ServerRelativeUrl, List



# Connect first if not already
# Connect-PnPOnline -Url "https://contoso.sharepoint.com/sites/YourSite" -Interactive

$results = @()

function Get-WebAssignments {
    $web = Get-PnPWeb -Includes RoleAssignments
    foreach ($ra in $web.RoleAssignments) {
        Get-PnPProperty -ClientObject $ra -Property Member, RoleDefinitionBindings
        $member = $ra.Member
        $roles  = ($ra.RoleDefinitionBindings | Select-Object -ExpandProperty Name) -join "; "

        if ($member.PrincipalType -eq [Microsoft.SharePoint.Client.PrincipalType]::SharePointGroup) {
            # Expand group to users
            $group = Get-PnPGroup -Identity $member.Id
            $groupUsers = Get-PnPProperty -ClientObject $group -Property Users
            foreach ($u in $groupUsers) {
                $results += [pscustomobject]@{
                    Scope        = "Web"
                    Object       = (Get-PnPWeb).Title
                    Principal    = $u.LoginName
                    PrincipalType= "User"
                    Role         = $roles
                    ViaGroup     = $group.Title
                }
            }
            # Also record the group itself (optional)
            $results += [pscustomobject]@{
                Scope        = "Web"
                Object       = (Get-PnPWeb).Title
                Principal    = $group.Title
                PrincipalType= "SharePointGroup"
                Role         = $roles
                ViaGroup     = $null
            }
        }
        else {
            $results += [pscustomobject]@{
                Scope        = "Web"
                Object       = (Get-PnPWeb).Title
                Principal    = $member.LoginName
                PrincipalType= $member.PrincipalType.ToString()
                Role         = $roles
                ViaGroup     = $null
            }
        }
    }
}

function Get-ListAssignments {
    $lists = Get-PnPList
    foreach ($list in $lists) {
        $l = Get-PnPList -Identity $list.Id -Includes RoleAssignments, HasUniqueRoleAssignments, Title
        # Only report lists with unique permissions; remove the if block if you want inherited too
        if ($l.HasUniqueRoleAssignments) {
            foreach ($ra in $l.RoleAssignments) {
                Get-PnPProperty -ClientObject $ra -Property Member, RoleDefinitionBindings
                $member = $ra.Member
                $roles  = ($ra.RoleDefinitionBindings | Select-Object -ExpandProperty Name) -join "; "

                if ($member.PrincipalType -eq [Microsoft.SharePoint.Client.PrincipalType]::SharePointGroup) {
                    $group = Get-PnPGroup -Identity $member.Id
                    $groupUsers = Get-PnPProperty -ClientObject $group -Property Users
                    foreach ($u in $groupUsers) {
                        $results += [pscustomobject]@{
                            Scope        = "List"
                            Object       = $l.Title
                            Principal    = $u.LoginName
                            PrincipalType= "User"
                            Role         = $roles
                            ViaGroup     = $group.Title
                        }
                    }
                    $results += [pscustomobject]@{
                        Scope        = "List"
                        Object       = $l.Title
                        Principal    = $group.Title
                        PrincipalType= "SharePointGroup"
                        Role         = $roles
                        ViaGroup     = $null
                    }
                }
                else {
                    $results += [pscustomobject]@{
                        Scope        = "List"
                        Object       = $l.Title
                        Principal    = $member.LoginName
                        PrincipalType= $member.PrincipalType.ToString()
                        Role         = $roles
                        ViaGroup     = $null
                    }
                }
            }
        }
    }
}

Get-WebAssignments
Get-ListAssignments

# Helpful views:
$results | Sort-Object Scope, Object, Principal | Format-Table -AutoSize

# Export CSV
$timestamp = Get-Date -Format "yyyyMMdd-HHmm"
$csvPath = "SitePermissions-$timestamp.csv"
$results | Export-Csv -NoType$results | Export-Csv -NoTypeInformation -Path $csvPath

