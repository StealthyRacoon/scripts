

$CsvPath = "Permissions.csv"
$SuperOwners = "SuperOwners.csv"
$DatabasePath = "C:\Users\sarang.gadhiya\Downloads\Scripts\Permission Audit\Permissions.db"
$TableName = "SharePointPermissions"


Import-Module PSSQLite -ErrorAction Stop

function CreatePermissionsTable {

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

    foreach ($row in $SuperOwnersData) {
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

} 


function ImportRows {
    $csvData = Import-Csv -Path $CsvPath
    foreach ($row in $csvData) {

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
}



CreateSuperOwnerTable


# Write-Host "Data import completed successfully."