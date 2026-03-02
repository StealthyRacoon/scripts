Import-Module ImportExcel
Import-Module PSSQLite

$dbPath = ".\Permissions.db"

function GetAllSites {

    $query = @"
        SELECT DISTINCT URL 
        FROM SharePointPermissions 
        WHERE ObjectType = 'Site'
        AND URL = "https://sustainabletimbertasmania.sharepoint.com/sites/Covid"
        OR URL = "https://sustainabletimbertasmania.sharepoint.com/sites/ContractManagement"
        OR URL = "https://sustainabletimbertasmania.sharepoint.com/sites/ChangeHub"
        OR URL = "https://sustainabletimbertasmania.sharepoint.com"
"@

    Invoke-SqliteQuery -DataSource $dbPath -Query $query
}

function GetSitePermissions {
    param(
        [String]$site
    )

    $query = @"
        SELECT URL, Permission, GivenThrough, Name
        FROM SharePointPermissions
        WHERE URL = '$site'
        AND ObjectType = 'Site'
        ORDER BY Permission, GivenThrough, Name;
"@

    Invoke-SqliteQuery -DataSource $dbPath -Query $query
}

function Export-SitePermissionReport {

    $sites = GetAllSites

    foreach ($siteObj in $sites) {

        $site = $siteObj.URL
        Write-Host "Processing $site..."

        $data = GetSitePermissions -site $site

        if (-not $data) {
            Write-Host "No permissions found for $site"
            continue
        }

        $rows = @()

        foreach ($perm in $data | Group-Object Permission) {

            # Level 1 – Permission
            $rows += [PSCustomObject]@{
                DisplayName  = $perm.Name
                Type         = "Permission"
                OutlineLevel = 1
            }

            foreach ($group in $perm.Group | Group-Object GivenThrough) {

                # Level 2 – Group
                $rows += [PSCustomObject]@{
                    DisplayName  = $group.Name
                    Type         = "Group"
                    OutlineLevel = 2
                }

                foreach ($user in $group.Group) {

                    # Level 3 – User
                    $rows += [PSCustomObject]@{
                        DisplayName  = $user.Name
                        Type         = "User"
                        OutlineLevel = 3
                    }
                }
            }
        }

        $safeName = $site.Replace("https://", "").Replace("/", "_")
        $path = ".\$safeName.xlsx"

        # Export base data
        $rows | Export-Excel $path -WorksheetName "Permissions" -AutoSize -FreezeTopRow

        # Apply outline grouping
        $excel = Open-ExcelPackage $path
        $sheet = $excel.Workbook.Worksheets["Permissions"]

        $sheet.Cells["A1:C1"].Merge = $true
        $sheet.Cells["A1"].Value = $site
        $sheet.Cells["A1"].Style.HorizontalAlignment = "Center"
        $sheet.Cells["A1"].Style.Font.Bold = $true

        for ($i = 3; $i -le $sheet.Dimension.Rows; $i++) {
            $level = $sheet.Cells[$i, 3].Value
            $type = $sheet.Cells[$i, 2].Value
            $sheet.Row($i).OutlineLevel = $level
            if ($type -ne "User") {
                $sheet.Cells[$i, 1].Style.Indent = ($level - 1) * 2
                $sheet.Cells[$i, 1].Style.Font.Bold = $true
            }
            if ($level -gt 1) {
                $sheet.Row($i).Collapsed = $true
                $sheet.Row($i).Hidden = $true
            }
        }


        Close-ExcelPackage $excel

        Write-Host "Created $path"
    }
}

# Run everything
Export-SitePermissionReport