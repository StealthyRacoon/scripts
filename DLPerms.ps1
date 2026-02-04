
# Inputs (reuse your existing variables)
$sites      = Import-Csv "Sites.csv"          # Must contain a 'SiteUrl' column
$clientId   = "2a539f71-673a-41a6-a878-77be10574006"
$tenant     = "sustainabletimbertasmania.onmicrosoft.com"
$certPath   = "C:\Users\sarang.gadhiya\PnpAdminCert.pfx"
$certPass   = (ConvertTo-SecureString "cjayG03s2Church!" -AsPlainText -Force)


# =========================
# Library-level user grants (one row per user per grant)
# Expands SharePoint groups; includes site-inherited permissions
# =========================

# Inputs — reuse your existing values
$sites      = Import-Csv "Sites.csv"            # Must contain 'SiteUrl'
$clientId   = $clientId                         # Or: "<client-id>"
$tenant     = $tenant                           # Or: "<tenant>.onmicrosoft.com"
$certPath   = $certPath                         # Or: "C:\Path\To\Cert.pfx"
$certPass   = $certPass                         # Or: (ConvertTo-SecureString "<password>" -AsPlainText -Force)

# Results
$results = @()                  # user-level rows (per grant)
$aadGroupsUnexpanded = @()      # AAD/M365 groups not expanded

# Helper: Yes/No flag
function To-YesNo { param($cond) if ($cond) { "Yes" } else { "No" } }

foreach ($site in $sites) {
    try {
        Connect-PnPOnline -Url $site.SiteUrl -ClientId $clientId -Tenant $tenant `
            -CertificatePath $certPath -CertificatePassword $certPass -WarningAction SilentlyContinue

        $web = Get-PnPWeb
        Get-PnPProperty -ClientObject $web -Property Title,Url,RoleAssignments

        # All document libraries (include everything)
        $lists = Get-PnPList | Where-Object { $_.BaseTemplate -eq 101 }

        foreach ($list in $lists) {
            Get-PnPProperty -ClientObject $list -Property Title,RootFolder,RoleAssignments,HasUniqueRoleAssignments

            $inheritance = if ($list.HasUniqueRoleAssignments) { "Unique" } else { "Inherited" }

            # Use library role assignments if unique; otherwise use site's assignments
            $assignments = if ($list.HasUniqueRoleAssignments) {
                $list.RoleAssignments
            } else {
                $web.RoleAssignments
            }

            foreach ($ra in $assignments) {
                Get-PnPProperty -ClientObject $ra -Property Principal,RoleDefinitionBindings

                # Role names granted in this assignment
                $roleNames = $ra.RoleDefinitionBindings | ForEach-Object { $_.Name }

                # Standard flags + Write (Edit or Contribute)
                $hasFull       = $roleNames -contains "Full Control"
                $hasEdit       = $roleNames -contains "Edit"
                $hasContribute = $roleNames -contains "Contribute"
                $hasRead       = $roleNames -contains "Read"
                $hasViewOnly   = $roleNames -contains "View Only"
                $hasWrite      = $hasEdit -or $hasContribute

                # Anything custom or additional (e.g., Design, Approve, Restricted View)
                $known = @("Full Control","Edit","Contribute","Read","View Only")
                $customRoles = ($roleNames | Where-Object { $_ -notin $known }) -join "; "

                $principal = $ra.Principal
                Get-PnPProperty -ClientObject $principal -Property Title,LoginName,PrincipalType

                $siteTitle   = $web.Title
                $libraryUrl  = $list.RootFolder.ServerRelativeUrl
                $sourceName  = $principal.Title
                $sourceType  = switch ($principal.PrincipalType.ToString()) {
                    "User"            { "Direct" }
                    "SharePointGroup" { "SPGroup" }
                    "SecurityGroup"   { "AADGroup" }  # Includes M365/security groups
                    default           { $principal.PrincipalType.ToString() }
                }

                if ($sourceType -eq "SPGroup") {
                    # Expand SharePoint group members → one row per member per grant
                    $spGroup = Get-PnPGroup -Identity $principal.Title -ErrorAction SilentlyContinue
                    if ($spGroup) {
                        Get-PnPProperty -ClientObject $spGroup -Property Users
                        foreach ($member in $spGroup.Users) {
                            # Try to resolve email for robustness
                            $resolved = Get-PnPUser -Identity $member.LoginName -ErrorAction SilentlyContinue
                            $email = if ($resolved -and $resolved.Email) { $resolved.Email } else { $member.Email }

                            $results += [PSCustomObject]@{
                                SiteUrl        = $site.SiteUrl
                                SiteTitle      = $siteTitle
                                LibraryTitle   = $list.Title
                                LibraryUrl     = $libraryUrl
                                Inheritance    = $inheritance
                                UserDisplay    = $member.Title
                                UserLogin      = $member.LoginName
                                UserEmail      = $email
                                SourceType     = $sourceType
                                SourceName     = $sourceName
                                FullControl    = To-YesNo $hasFull
                                Edit           = To-YesNo $hasEdit
                                Contribute     = To-YesNo $hasContribute
                                Read           = To-YesNo $hasRead
                                ViewOnly       = To-YesNo $hasViewOnly
                                Write          = To-YesNo $hasWrite
                                CustomRoles    = $customRoles
                            }
                        }
                    }
                }
                elseif ($sourceType -eq "Direct") {
                    # Direct user assignment → one row per grant
                    $resolved = Get-PnPUser -Identity $principal.LoginName -ErrorAction SilentlyContinue
                    $userTitle = if ($resolved -and $resolved.Title) { $resolved.Title } else { $principal.Title }
                    $userEmail = if ($resolved) { $resolved.Email } else { $null }

                    $results += [PSCustomObject]@{
                        SiteUrl        = $site.SiteUrl
                        SiteTitle      = $siteTitle
                        LibraryTitle   = $list.Title
                        LibraryUrl     = $libraryUrl
                        Inheritance    = $inheritance
                        UserDisplay    = $userTitle
                        UserLogin      = $principal.LoginName
                        UserEmail      = $userEmail
                        SourceType     = $sourceType
                        SourceName     = $sourceName
                        FullControl    = To-YesNo $hasFull
                        Edit           = To-YesNo $hasEdit
                        Contribute     = To-YesNo $hasContribute
                        Read           = To-YesNo $hasRead
                        ViewOnly       = To-YesNo $hasViewOnly
                        Write          = To-YesNo $hasWrite
                        CustomRoles    = $customRoles
                    }
                }
                else {
                    # AAD/M365/Security groups — not expanded here (requires Graph)
                    $aadGroupsUnexpanded += [PSCustomObject]@{
                        SiteUrl        = $site.SiteUrl
                        SiteTitle      = $siteTitle
                        LibraryTitle   = $list.Title
                        LibraryUrl     = $libraryUrl
                        Inheritance    = $inheritance
                        GroupType      = $sourceType
                        GroupName      = $sourceName
                        FullControl    = To-YesNo $hasFull
                        Edit           = To-YesNo $hasEdit
                        Contribute     = To-YesNo $hasContribute
                        Read           = To-YesNo $hasRead
                        ViewOnly       = To-YesNo $hasViewOnly
                        Write          = To-YesNo $hasWrite
                        CustomRoles    = $customRoles
                    }
                }
            }
        }
    }
    catch {
        Write-Host "Failed to process $($site.SiteUrl): $_" -ForegroundColor Yellow
    }
}

# Export
$results | Export-Csv "LibraryUserGrants.csv" -NoTypeInformation -Encoding UTF8
$aadGroupsUnexpanded | Export-Csv "LibraryUnexpandedAADGroups.csv" -NoTypeInformation -Encoding UTF8


