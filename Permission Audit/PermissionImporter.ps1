$CsvPath = "Permissions.csv"
$SuperOwners = "SuperOwners.csv"
$DatabasePath = "C:\Users\sarang.gadhiya\Downloads\Scripts\Permission Audit\Permissions.db"
$TableName = "SharePointPermissions"


Import-Module PSSQLite -ErrorAction Stop


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

function CreatePermissionsTable {

    Write-Host "Creating table [$TableName]..." -ForegroundColor Cyan

    $createTableQuery = @"
    CREATE TABLE IF NOT EXISTS $TableName (
        Id INTEGER PRIMARY KEY AUTOINCREMENT,
        URL TEXT,
        SharePointObject TEXT,
        ObjectType TEXT,
        InheritsPermissions TEXT,
        Name TEXT,
        SensitivityLabel TEXT,
        RetentionLabel TEXT,
        Email TEXT,
        PrincipalType TEXT,
        IsExternalUser TEXT,
        IsDeleted TEXT,
        IsLicensed TEXT,
        SignInStatus TEXT,
        GivenThrough TEXT,
        Department TEXT,
        JobTitle TEXT,
        Permission TEXT
    );
"@
        
    Invoke-SqliteQuery -DataSource $DatabasePath -Query $createTableQuery

    Write-Host "Table ready. Importing CSV..." -ForegroundColor Green

    $csvData = Import-Csv -Path $CsvPath
    $totalRows = $csvData.Count
    $currentRow = 0

    foreach ($row in $csvData) {

        $currentRow++

        Show-RowProgress `
            -Current $currentRow `
            -Total $totalRows `
            -Activity "Inserting rows into [$TableName]"

        $insertQuery = @"
        INSERT INTO $TableName (
            URL,
            SharePointObject,
            ObjectType,
            InheritsPermissions,
            Name,
            SensitivityLabel,
            RetentionLabel,
            Email,
            PrincipalType,
            IsExternalUser,
            IsDeleted,
            IsLicensed,
            SignInStatus,
            GivenThrough,
            Department,
            JobTitle,
            Permission
        )
        VALUES (
            @URL,
            @SharePointObject,
            @ObjectType,
            @InheritsPermissions,
            @Name,
            @SensitivityLabel,
            @RetentionLabel,
            @Email,
            @PrincipalType,
            @IsExternalUser,
            @IsDeleted,
            @IsLicensed,
            @SignInStatus,
            @GivenThrough,
            @Department,
            @JobTitle,
            @Permission
        );
"@

        Invoke-SqliteQuery -DataSource $DatabasePath -Query $insertQuery -SqlParameters @{
            URL                 = $row.URL
            SharePointObject    = $row.'SharePoint Object'
            ObjectType          = $row.'Object Type'
            InheritsPermissions = $row.'Inherits Permissions'
            Name                = $row.Name
            SensitivityLabel    = $row.'Sensitivity Label'
            RetentionLabel      = $row.'Retention Label'
            Email               = $row.'E-mail'
            PrincipalType       = $row.'Principal Type'
            IsExternalUser      = $row.'Is External User'
            IsDeleted           = $row.'Is Deleted'
            IsLicensed          = $row.'Is Licensed'
            SignInStatus        = $row.'Sign-in Status'
            GivenThrough        = $row.'Given Through'
            Department          = $row.Department
            JobTitle            = $row.'Job Title'
            Permission          = $row.Permission
        }
    }

    Complete-RowProgress -Activity "Inserting rows into [$TableName]"

    Write-Host "Import complete! $totalRows rows inserted." -ForegroundColor Cyan
}


function CreateSuperOwnerTable {
       
    $createTableQuery = @"
        CREATE TABLE IF NOT EXISTS SuperOwners (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            URL TEXT,
            Name TEXT
        );
               
"@

    Invoke-SqliteQuery -DataSource $DatabasePath -Query $createTableQuery


    $SuperOwnersData = Import-Csv -Path $SuperOwners

    $totalRows = $SuperOwnersData.Count
    $currentRow = 0

    foreach ($row in $SuperOwnersData) {
        $currentRow++
        $insertQuery = @"
            INSERT INTO SuperOwners (
                URL,
                Name
            )
            VALUES(
                @URL,
                @Name
            );

"@

        Invoke-SqliteQuery -DataSource $DatabasePath -Query $insertQuery -SqlParameters @{
            URL  = $row.URL         
            Name = $row.Name
           
        }

        
    }

    Complete-RowProgress -Activity "Inserting rows into [$TableName]"
    Write-Host "Import complete! $totalRows rows inserted." -ForegroundColor Cyan

} 




# CreatePermissionsTable
CreateSuperOwnerTable