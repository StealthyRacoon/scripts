# BulkMetadataUpdater_Modified.ps1
# ==============================================
# 1. ASSEMBLIES AND INITIAL SETUP
# ==============================================
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

# Set your tenant admin URL (modify as needed)
$adminUrl = "https://sustainabletimbertasmania-admin.sharepoint.com/"

# Ensure PnP.PowerShell is installed and imported.
if (-not (Get-Module -ListAvailable -Name PnP.PowerShell)) {
    $installChoice = [System.Windows.Forms.MessageBox]::Show(
        "The PnP.PowerShell module is required for SharePoint functionality. Install it now?",
        "Module Required",
        [System.Windows.Forms.MessageBoxButtons]::YesNo)
    if ($installChoice -eq 'Yes') {
        try {
            Install-Module PnP.PowerShell -Scope CurrentUser -Force
            Import-Module PnP.PowerShell
        }
        catch {
            [System.Windows.Forms.MessageBox]::Show("Failed to install PnP.PowerShell. Please install it manually.", "Installation Error")
            exit
        }
    }
}
else {
    Import-Module PnP.PowerShell
}

# ==============================================
# 1.5 Helper Functions
# ==============================================

# Show a semi-transparent overlay with a prominent message.
function Show-Overlay {
    param(
        [System.Windows.Forms.Form]$ownerForm,
        [string]$message
    )
    $overlay = New-Object System.Windows.Forms.Form
    $overlay.FormBorderStyle = 'None'
    $overlay.StartPosition = 'Manual'
    $overlay.Size = $ownerForm.ClientSize
    $overlay.BackColor = [System.Drawing.Color]::Black
    $overlay.Opacity = 0.6
    $overlay.ShowInTaskbar = $false
    $overlay.TopMost = $true
    $overlay.Location = $ownerForm.PointToScreen([System.Drawing.Point]::Empty)
    
    $lbl = New-Object System.Windows.Forms.Label
    $lbl.AutoSize = $false
    $lbl.Size = $overlay.ClientSize
    $lbl.TextAlign = 'MiddleCenter'
    $lbl.Font = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)
    $lbl.ForeColor = [System.Drawing.Color]::White
    $lbl.Text = $message
    $overlay.Controls.Add($lbl)
    
    $overlay.Show()
    return $overlay
}

# Wait for a background job to complete while processing UI events.
function Wait-ForJob {
    param(
        [System.Management.Automation.Job]$job
    )
    while (($job.State -ne 'Completed') -and ($job.State -ne 'Failed')) {
        Start-Sleep -Milliseconds 100
        [System.Windows.Forms.Application]::DoEvents()
    }
    $result = Receive-Job -Job $job -Wait -AutoRemoveJob
    return $result
}


function Build-FileTree {
    param (
        [Array]$items
    )
    
    # Create a hashtable to store the tree structure
    $tree = @{}
    
    # First pass: Create folder entries
    foreach ($item in $items | Where-Object { $_.IsFolder }) {
        $path = $item.RelativePath
        if (-not $tree.ContainsKey($path)) {
            $tree[$path] = @{
                Item     = $item
                Children = @{}
            }
        }
    }
    
    # Second pass: Create parent folders that might not exist in the items
    foreach ($item in $items) {
        $pathParts = $item.RelativePath.Split('/', [System.StringSplitOptions]::RemoveEmptyEntries)
        $currentPath = ""
        
        for ($i = 0; $i -lt $pathParts.Count - 1; $i++) {
            $previousPath = $currentPath
            $currentPath = if ($previousPath) {
                "$previousPath/$($pathParts[$i])"
            }
            else {
                $pathParts[$i]
            }
            
            if (-not $tree.ContainsKey($currentPath)) {
                $tree[$currentPath] = @{
                    Item     = @{
                        Name         = $pathParts[$i]
                        RelativePath = $currentPath
                        IsFolder     = $true
                        Level        = $i
                    }
                    Children = @{}
                }
            }
        }
    }
    
    # Third pass: Add all items to their parent folders
    foreach ($item in $items | Where-Object { -not $_.IsFolder }) {
        $parentPath = Split-Path -Parent $item.RelativePath
        if ([string]::IsNullOrEmpty($parentPath)) {
            if (-not $tree.ContainsKey("root")) {
                $tree["root"] = @{
                    Children = @{}
                }
            }
            $tree["root"].Children[$item.Name] = $item
        }
        else {
            if (-not $tree.ContainsKey($parentPath)) {
                $tree[$parentPath] = @{
                    Item     = @{
                        Name         = Split-Path -Leaf $parentPath
                        RelativePath = $parentPath
                        IsFolder     = $true
                        Level        = ($parentPath.Split('/')).Count - 1
                    }
                    Children = @{}
                }
            }
            $tree[$parentPath].Children[$item.Name] = $item
        }
    }
    
    return $tree
}

$global:fileIndexMap = @{}


# Add this debug function at the start
function Write-FileObject {
    param($file)
    return "ID: $($file.ID), Name: $($file.Name), Path: $($file.RelativePath), IsFolder: $($file.IsFolder)"
}

# Updated file index map to store full file object
$global:fileIndexMap = @{}

# Update the Add-TreeToListBox function to store complete file info
function Add-TreeToListBox {
    param (
        [System.Windows.Forms.CheckedListBox]$listBox,
        [hashtable]$tree,
        [Array]$allFiles,
        [string]$currentPath = "",
        [int]$level = 0
    )
    
    $global:fileIndexMap.Clear()
    
    # Add root items first
    if ($tree.ContainsKey("root")) {
        foreach ($item in $tree["root"].Children.Values | Sort-Object Name) {
            $indent = "    " * $level
            $index = $listBox.Items.Add("$indent├── $($item.Name)")
            if (-not $item.IsFolder) {
                $global:fileIndexMap[$index] = $item
            }
            $listBox.SetItemChecked($index, $false)
        }
    }
    
    # Then process all other paths
    foreach ($path in $tree.Keys | Where-Object { $_ -ne "root" } | Sort-Object) {
        $node = $tree[$path]
        if ($node.Item) {
            $indent = "    " * $node.Item.Level
            # Add folder
            $index = $listBox.Items.Add("$indent├── [FOLDER] $($node.Item.Name)")
            $listBox.SetItemChecked($index, $false)
            
            # Add children
            foreach ($child in $node.Children.Values | Sort-Object Name) {
                $childIndent = "    " * ($node.Item.Level + 1)
                $index = $listBox.Items.Add("$childIndent├── $($child.Name)")
                if (-not $child.IsFolder) {
                    $global:fileIndexMap[$index] = $child
                }
                $listBox.SetItemChecked($index, $false)
            }
        }
    }
}

# ==============================================
# 2. FORM AND CONTROL CREATION
# ==============================================
$form = New-Object System.Windows.Forms.Form
$form.Text = "SharePoint Metadata Updater"
$form.Size = New-Object System.Drawing.Size(950, 850)
$form.StartPosition = "CenterScreen"
$form.Font = New-Object System.Drawing.Font("Segoe UI", 10)

# --- SharePoint Panel (Site & Library selection, Files list) ---
$spPanel = New-Object System.Windows.Forms.Panel
$spPanel.Location = New-Object System.Drawing.Point(20, 50)
$spPanel.Size = New-Object System.Drawing.Size(900, 420)
$spPanel.BorderStyle = 'FixedSingle'
$form.Controls.Add($spPanel)

# SharePoint Site ComboBox
$spSiteLabel = New-Object System.Windows.Forms.Label
$spSiteLabel.Location = New-Object System.Drawing.Point(10, 10)
$spSiteLabel.Size = New-Object System.Drawing.Size(150, 25)
$spSiteLabel.Text = "SharePoint Site:"
$spPanel.Controls.Add($spSiteLabel)

$spSiteComboBox = New-Object System.Windows.Forms.ComboBox
$spSiteComboBox.Location = New-Object System.Drawing.Point(170, 10)
$spSiteComboBox.Size = New-Object System.Drawing.Size(700, 25)
$spSiteComboBox.DropDownStyle = 'DropDownList'
$spPanel.Controls.Add($spSiteComboBox)

# Library ComboBox
$spLibLabel = New-Object System.Windows.Forms.Label
$spLibLabel.Location = New-Object System.Drawing.Point(10, 45)
$spLibLabel.Size = New-Object System.Drawing.Size(150, 25)
$spLibLabel.Text = "Library:"
$spPanel.Controls.Add($spLibLabel)

$spLibComboBox = New-Object System.Windows.Forms.ComboBox
$spLibComboBox.Location = New-Object System.Drawing.Point(170, 45)
$spLibComboBox.Size = New-Object System.Drawing.Size(700, 25)
$spLibComboBox.DropDownStyle = 'DropDownList'
$spPanel.Controls.Add($spLibComboBox)

# Replace the plain ListBox with a CheckedListBox.
$fileListBoxSP = New-Object System.Windows.Forms.CheckedListBox
$fileListBoxSP.Location = New-Object System.Drawing.Point(10, 80)
$fileListBoxSP.Size = New-Object System.Drawing.Size(870, 325)
$fileListBoxSP.CheckOnClick = $true
$spPanel.Controls.Add($fileListBoxSP)

# --- Metadata Panel (Dropdowns for updating metadata) ---
$metadataPanel = New-Object System.Windows.Forms.Panel
$metadataPanel.Location = New-Object System.Drawing.Point(20, 475)
$metadataPanel.Size = New-Object System.Drawing.Size(900, 100)
$metadataPanel.BorderStyle = 'FixedSingle'
$form.Controls.Add($metadataPanel)

# Document Type dropdown.
$docTypeLabel = New-Object System.Windows.Forms.Label
$docTypeLabel.Location = New-Object System.Drawing.Point(10, 10)
$docTypeLabel.Size = New-Object System.Drawing.Size(150, 25)
$docTypeLabel.Text = "Document Type:"
$metadataPanel.Controls.Add($docTypeLabel)

$docTypeComboBox = New-Object System.Windows.Forms.ComboBox
$docTypeComboBox.Location = New-Object System.Drawing.Point(170, 10)
$docTypeComboBox.Size = New-Object System.Drawing.Size(700, 25)
$docTypeComboBox.DropDownStyle = 'DropDownList'
$metadataPanel.Controls.Add($docTypeComboBox)

# Department dropdown.
$deptLabel = New-Object System.Windows.Forms.Label
$deptLabel.Location = New-Object System.Drawing.Point(10, 50)
$deptLabel.Size = New-Object System.Drawing.Size(150, 25)
$deptLabel.Text = "Department:"
$metadataPanel.Controls.Add($deptLabel)

$deptComboBox = New-Object System.Windows.Forms.ComboBox
$deptComboBox.Location = New-Object System.Drawing.Point(170, 50)
$deptComboBox.Size = New-Object System.Drawing.Size(700, 25)
$deptComboBox.DropDownStyle = 'DropDownList'
$metadataPanel.Controls.Add($deptComboBox)

# --- Update Files Button ---
$updateButton = New-Object System.Windows.Forms.Button
$updateButton.Location = New-Object System.Drawing.Point(750, 600)
$updateButton.Size = New-Object System.Drawing.Size(150, 40)
$updateButton.Text = "Update Files"
$updateButton.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 212)
$updateButton.ForeColor = [System.Drawing.Color]::White
$updateButton.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$form.Controls.Add($updateButton)

# --- Output Logging Section ---
$outputLabel = New-Object System.Windows.Forms.Label
$outputLabel.Location = New-Object System.Drawing.Point(20, 625)
$outputLabel.Size = New-Object System.Drawing.Size(150, 25)
$outputLabel.Text = "Console:"
$form.Controls.Add($outputLabel)

$outputTextBox = New-Object System.Windows.Forms.RichTextBox
$outputTextBox.Location = New-Object System.Drawing.Point(20, 650)
$outputTextBox.Size = New-Object System.Drawing.Size(900, 150)
$outputTextBox.ReadOnly = $true
$outputTextBox.Font = New-Object System.Drawing.Font("Consolas", 10)
$outputTextBox.ScrollBars = "Vertical"
$form.Controls.Add($outputTextBox)

# --- Global Variable for Selected Files ---
$global:selectedFilesSP = @()

# ==============================================
# 3. EVENT HANDLERS
# ==============================================

# Define Get-FolderItems function string
# Replace the existing Get-FolderItems function with this simplified approach
$getFolderItemsFunction = @'
function Get-FolderItems {
    [CmdletBinding()]
    param (
        [string]$LibraryName
    )
    
    Write-Host "Retrieving all items from library: $LibraryName"
    
    try {
        # Get the library and its root folder URL
        $library = Get-PnPList -Identity $LibraryName -ErrorAction Stop
        $rootFolderUrl = $library.RootFolder.ServerRelativeUrl
        
        # Get all items from the library
        $items = Get-PnPListItem -List $LibraryName -PageSize 500 -ErrorAction Stop | 
            Where-Object { $_.FieldValues.FSObjType -ne $null }
        
        Write-Host "Found $($items.Count) total items"
        
        $results = @()
        
        foreach ($item in $items) {
            try {
                $fileUrl = $item.FieldValues.FileRef
                $fileName = $item.FieldValues.FileLeafRef
                $folderPath = Split-Path -Parent $fileUrl.Replace($rootFolderUrl, "").TrimStart("/")
                $level = ($folderPath.Split("/", [System.StringSplitOptions]::RemoveEmptyEntries)).Count
                
                # Check if item is a folder
                $isFolder = $item.FieldValues.FSObjType -eq 1
                
                $results += [PSCustomObject]@{
                    ID = $item.Id
                    Name = $fileName
                    ServerRelativeUrl = $fileUrl
                    RelativePath = $fileUrl.Replace($rootFolderUrl, "").TrimStart("/")
                    Level = $level
                    IsFolder = $isFolder
                }
            }
            catch {
                Write-Host "Error processing item $($item.Id): $($_.Exception.Message)"
            }
        }
        
        # Sort items to ensure folders appear before their contents
        $results = $results | Sort-Object -Property @{Expression={$_.RelativePath.Split('/').Count}}, RelativePath
        
        return $results
    }
    catch {
        Write-Host "Error retrieving library items: $($_.Exception.Message)"
        return @()
    }
}
'@

# When the form is shown, retrieve the list of sites.
$form.Add_Shown({
        $overlay = Show-Overlay -ownerForm $form -message "Loading sites, please wait..."
        $siteJob = Start-Job -ScriptBlock {
            param($adminUrl)
            Import-Module PnP.PowerShell
            # Connect-PnPOnline -Url $adminUrl -UseWebLogin
            & ".\ConCert.ps1 " $adminUrl

            # & ".\ConCert.ps1 " $adminUrl

            $sites = Get-PnPTenantSite | Select-Object -ExpandProperty Url
            return $sites
        } -ArgumentList $adminUrl
        $sites = Wait-ForJob -job $siteJob
        $spSiteComboBox.Items.Clear()
        $spSiteComboBox.Items.Add("-- Select a Site --")
        foreach ($s in $sites) {
            $spSiteComboBox.Items.Add($s)
        }
        $spSiteComboBox.SelectedIndex = 0
        $overlay.Close()
    })

# When a site is selected, load its libraries.
$spSiteComboBox.Add_SelectedIndexChanged({
        $selectedSite = $spSiteComboBox.SelectedItem
        if ([string]::IsNullOrEmpty($selectedSite) -or $selectedSite -eq "-- Select a Site --") { 
            $spLibComboBox.Items.Clear()
            $spLibComboBox.Items.Add("-- Select a Site First --")
            $spLibComboBox.SelectedIndex = 0
            return 
        }
        $overlay = Show-Overlay -ownerForm $form -message "Loading site libraries, please wait..."
        $libJob = Start-Job -ScriptBlock {
            param($siteUrl)
            Import-Module PnP.PowerShell
            # Connect-PnPOnline -Url $siteUrl -UseWebLogin
            & ".\ConCert.ps1 " $siteUrl
            $libs = Get-PnPList | Where-Object { $_.BaseTemplate -eq 101 } | Select-Object -ExpandProperty Title
            return $libs
        } -ArgumentList $selectedSite
        $libs = Wait-ForJob -job $libJob
        $spLibComboBox.Items.Clear()
        $spLibComboBox.Items.Add("-- Select a Library --")
        foreach ($l in $libs) {
            $spLibComboBox.Items.Add($l)
        }
        $spLibComboBox.SelectedIndex = 0
        $overlay.Close()
    })

# When a library is selected, load files recursively
$spLibComboBox.Add_SelectedIndexChanged({
        $selectedSite = $spSiteComboBox.SelectedItem
        $selectedLibrary = $spLibComboBox.SelectedItem
    
        if ([string]::IsNullOrEmpty($selectedLibrary) -or $selectedLibrary -eq "-- Select a Library --" -or 
            [string]::IsNullOrEmpty($selectedSite) -or $selectedSite -eq "-- Select a Site --") {
            $fileListBoxSP.Items.Clear()
            return
        }

        $fileListBoxSP.Items.Clear()
        $global:selectedFilesSP = @()

        $overlay = Show-Overlay -ownerForm $form -message "Loading files and metadata recursively, please wait..."
        $job = Start-Job -ScriptBlock {
            param($siteUrl, $libraryName, $getFolderItemsFunc)
            try {
                Import-Module PnP.PowerShell
                # Connect-PnPOnline -Url $siteUrl -UseWebLogin
                & ".\ConCert.ps1 " $siteUrl
                Write-Host "Connected to SharePoint site: $siteUrl"
            
                # Execute the function definition string
                Invoke-Expression $getFolderItemsFunc
            
                # Get all items using the simplified function
                $items = Get-FolderItems -LibraryName $libraryName
            
                # Get metadata terms
                $docTypeTerms = Get-PnPTerm -TermSet "Document Type" -TermGroup "Standard Metadata" -ErrorAction Stop | 
                ForEach-Object { $_.Name }
                $deptTerms = Get-PnPTerm -TermSet "Department" -TermGroup "Standard Metadata" -ErrorAction Stop | 
                ForEach-Object { $_.Name }
            
                return @{
                    Files        = $items
                    DocTypeTerms = $docTypeTerms
                    DeptTerms    = $deptTerms
                    Error        = $null
                }
            }
            catch {
                return @{
                    Files        = @()
                    DocTypeTerms = @()
                    DeptTerms    = @()
                    Error        = $_.Exception.Message
                }
            }
        } -ArgumentList $selectedSite, $selectedLibrary, $getFolderItemsFunction

        $result = Wait-ForJob -job $job
    
        if ($result.Error) {
            [System.Windows.Forms.MessageBox]::Show("Error loading SharePoint files/terms: $($result.Error)", "Error")
            $outputTextBox.AppendText("Error loading SharePoint files/terms.`n")
        }
        else {
            $outputTextBox.AppendText("Building directory tree...`n")
            $outputTextBox.ScrollToCaret()
            $fileListBoxSP.Items.Clear()
        
            # Build tree structure
            $tree = Build-FileTree -items $result.Files
        
            # Add items to listbox in tree structure with mapping
            Add-TreeToListBox -listBox $fileListBoxSP -tree $tree -allFiles $result.Files
        
            $outputTextBox.AppendText("Found $($result.Files.Count) items in total.`n")
            $outputTextBox.ScrollToCaret()
        
            # Store all non-folder items in the global variable
            $global:selectedFilesSP = $result.Files | Where-Object { -not $_.IsFolder }
        
            # Update metadata dropdowns
            $docTypeComboBox.Items.Clear()
            $result.DocTypeTerms | ForEach-Object { $docTypeComboBox.Items.Add($_) }
            if ($docTypeComboBox.Items.Count -gt 0) { $docTypeComboBox.SelectedIndex = 0 }
        
            $deptComboBox.Items.Clear()
            $result.DeptTerms | ForEach-Object { $deptComboBox.Items.Add($_) }
            if ($deptComboBox.Items.Count -gt 0) { $deptComboBox.SelectedIndex = 0 }
        }
    
        $overlay.Close()
    })

# Update button click handler with level-aware field names
$updateButton.Add_Click({
        $selectedSite = $spSiteComboBox.SelectedItem
        $selectedLibrary = $spLibComboBox.SelectedItem
    
        # Initial validation
        if ([string]::IsNullOrEmpty($selectedLibrary) -or $selectedLibrary -eq "-- Select a Library --" -or 
            [string]::IsNullOrEmpty($selectedSite) -or $selectedSite -eq "-- Select a Site --") {
            [System.Windows.Forms.MessageBox]::Show("Please select a site and library first.", "Warning")
            return
        }

        # Get checked items
        $checkedIndices = $fileListBoxSP.CheckedIndices
        if ($checkedIndices.Count -eq 0) {
            [System.Windows.Forms.MessageBox]::Show("Please select at least one file to update.", "Warning")
            return
        }

        # Get selected metadata values
        $selectedDocType = $docTypeComboBox.SelectedItem
        $selectedDept = $deptComboBox.SelectedItem

        if ([string]::IsNullOrEmpty($selectedDocType) -or [string]::IsNullOrEmpty($selectedDept)) {
            [System.Windows.Forms.MessageBox]::Show("Please select both Document Type and Department.", "Warning")
            return
        }

        # Get files to update
        $filesToUpdate = @()
        foreach ($index in $checkedIndices) {
            if ($global:fileIndexMap.ContainsKey($index)) {
                $filesToUpdate += $global:fileIndexMap[$index]
            }
        }

        if ($filesToUpdate.Count -eq 0) {
            [System.Windows.Forms.MessageBox]::Show("No valid files selected for update.", "Warning")
            return
        }

        $outputTextBox.AppendText("`nPreparing to update $($filesToUpdate.Count) file(s):`n")
        $outputTextBox.ScrollToCaret()
        foreach ($file in $filesToUpdate) {
            $outputTextBox.AppendText("- $($file.Name)`n")
            $outputTextBox.ScrollToCaret()
        }

        $overlay = Show-Overlay -ownerForm $form -message "Updating files, please wait..."

        $updateJob = Start-Job -ScriptBlock {
            param($siteUrl, $libraryName, $docType, $dept, $files)
        
            try {
                # Import required module
                Import-Module PnP.PowerShell
            
                # Connect to SharePoint
                # Connect-PnPOnline -Url $siteUrl -UseWebLogin
                & ".\ConCert.ps1 " $siteUrl
                Write-Host "Connected to SharePoint site: $siteUrl"
    
                # Get term objects
                $docTypeTerm = Get-PnPTerm -TermSet "Document Type" -TermGroup "Standard Metadata" | 
                Where-Object { $_.Name -eq $docType }
            
                $deptTerm = Get-PnPTerm -TermSet "Department" -TermGroup "Standard Metadata" | 
                Where-Object { $_.Name -eq $dept }
    
                if (-not $docTypeTerm) {
                    throw "Document Type term '$docType' not found in term store"
                }
                if (-not $deptTerm) {
                    throw "Department term '$dept' not found in term store"
                }
    
                Write-Host "Retrieved terms:"
                Write-Host "Document Type: $($docTypeTerm.Name) ($($docTypeTerm.Id))"
                Write-Host "Department: $($deptTerm.Name) ($($deptTerm.Id))"
    
                # Process each file
                $results = @()
                foreach ($file in $files) {
                    try {
                        Write-Host "`nProcessing file: $($file.Name) (ID: $($file.ID))"
    
                        # Get the list item to check available fields
                        $item = Get-PnPListItem -List $libraryName -Id $file.ID -ErrorAction Stop
                        $availableFields = $item.FieldValues.Keys
                        Write-Host "Available fields: $($availableFields -join ', ')"
    
                        # Create metadata hashtable based on available field names
                        $newMetadata = @{}
                    
                        # Try different possible field name variations
                        $docTypeFieldNames = @("Document_x0020_Type", "Document Type", "DocumentType", "ContentType")
                        $deptFieldNames = @("Department", "Dept", "Department_x0020_Name")
    
                        $docTypeField = $docTypeFieldNames | Where-Object { $availableFields -contains $_ } | Select-Object -First 1
                        $deptField = $deptFieldNames | Where-Object { $availableFields -contains $_ } | Select-Object -First 1
    
                        Write-Host "Found document type field: $docTypeField"
                        Write-Host "Found department field: $deptField"
    
                        if ($docTypeField) {
                            $docTypeValue = "$($docTypeTerm.Name)|$($docTypeTerm.Id)"
                            $newMetadata[$docTypeField] = $docTypeValue
                            Write-Host "Setting document type: $docTypeValue"
                        }
                        else {
                            Write-Host "WARNING: Could not find matching document type field"
                        }
    
                        if ($deptField) {
                            $deptValue = "$($deptTerm.Name)|$($deptTerm.Id)"
                            $newMetadata[$deptField] = $deptValue
                            Write-Host "Setting department: $deptValue"
                        }
                        else {
                            Write-Host "WARNING: Could not find matching department field"
                        }
    
                        if ($newMetadata.Count -eq 0) {
                            throw "No matching metadata fields found in SharePoint"
                        }
    
                        Write-Host "Applying metadata: $($newMetadata | ConvertTo-Json)"
                        $updateResult = Set-PnPListItem -List $libraryName -Identity $file.ID -Values $newMetadata -ErrorAction Stop
                        Write-Host "Successfully updated file: $($file.Name)"
    
                        $results += @{
                            FileName = $file.Name
                            Success  = $true
                            Error    = $null
                            Fields   = $newMetadata
                        }
                    }
                    catch {
                        Write-Host "ERROR updating file $($file.Name): $($_.Exception.Message)"
                    
                        $results += @{
                            FileName = $file.Name
                            Success  = $false
                            Error    = $_.Exception.Message
                        }
                    }
                }
    
                # Return successful completion with results
                return @{
                    Results = $results
                    Error   = $null
                }
            }
            catch {
                # Handle any errors in the overall process
                Write-Host "ERROR in update process: $($_.Exception.Message)"
                return @{
                    Results = @()
                    Error   = $_.Exception.Message
                }
            }
        } -ArgumentList $selectedSite, $selectedLibrary, $selectedDocType, $selectedDept, $filesToUpdate

        $result = Wait-ForJob -job $updateJob
    
        if ($result.Error) {
            [System.Windows.Forms.MessageBox]::Show("Error updating files: $($result.Error)", "Error")
            $outputTextBox.AppendText("`nError updating files: $($result.Error)`n")
            $outputTextBox.ScrollToCaret()
        }
        else {
            $successCount = ($result.Results | Where-Object { $_.Success }).Count
            $failureCount = ($result.Results | Where-Object { -not $_.Success }).Count
        
            $outputTextBox.AppendText("`nUpdate Results:`n")
            $outputTextBox.AppendText("Successfully updated: $successCount files`n")
            $outputTextBox.ScrollToCaret()
            if ($failureCount -gt 0) {
                $outputTextBox.AppendText("Failed to update: $failureCount files`n")
                $outputTextBox.AppendText("`nFailed files:`n")
                $outputTextBox.ScrollToCaret()
                foreach ($failed in $result.Results | Where-Object { -not $_.Success }) {
                    $outputTextBox.AppendText("- $($failed.FileName): $($failed.Error)`n")
                    $outputTextBox.ScrollToCaret()
                }
            }
        
            <#
        if ($successCount -gt 0) {
            [System.Windows.Forms.MessageBox]::Show("Successfully updated $successCount file(s)!", "Success")
        }
        #>
        }
    
        $overlay.Close()
    })

# ==============================================
# 4. SHOW THE FORM
# ==============================================
$form.ShowDialog()