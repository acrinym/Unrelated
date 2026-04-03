$csv = Import-Csv 'D:\WinSystemOnSystem.csv'
$winsxsRoot = "C:\Windows\WinSxS\"

# Extract unique WinSxS folders and their sizes
$folderSizes = @{}
foreach ($row in $csv) {
    if ($row.Path -like "$winsxsRoot*") {
        $relative = $row.Path.Substring($winsxsRoot.Length)
        $folder = $relative.Split('\')[0]
        if ($folder) {
            if (-not $folderSizes.ContainsKey($folder)) { $folderSizes[$folder] = 0 }
            $folderSizes[$folder] += [long]$row.Size
        }
    }
}

# Folder format: arch_name_pubkey_version_lang_hash
# lang field is 5th-to-last segment when split by _... easier: match _xx-xx_ pattern
$keepLangs   = @('en-us','en-gb','none')  # 'none' = language-neutral
$langPattern = '_([a-z]{2}-[a-z]{2})_[0-9a-f]+$'

$keep   = @()
$delete = @()

foreach ($folder in $folderSizes.Keys) {
    if ($folder -match $langPattern) {
        $lang = $Matches[1]
        if ($keepLangs -contains $lang) {
            $keep += [PSCustomObject]@{ Folder=$folder; Lang=$lang; Size=$folderSizes[$folder] }
        } else {
            $delete += [PSCustomObject]@{ Folder=$folder; Lang=$lang; Size=$folderSizes[$folder] }
        }
    }
}

$delSize = ($delete | Measure-Object Size -Sum).Sum
$keepSize = ($keep | Measure-Object Size -Sum).Sum

Write-Host "=== LANGUAGE-TAGGED COMPONENT FOLDERS ==="
Write-Host "Keep (en-us/en-gb/neutral): $($keep.Count) folders | $([math]::Round($keepSize/1MB,0)) MB"
Write-Host "Delete (all other langs):   $($delete.Count) folders | $([math]::Round($delSize/1MB,0)) MB ($([math]::Round($delSize/1GB,2)) GB)"

Write-Host "`n=== BREAKDOWN BY LANGUAGE (delete candidates) ==="
$delete | Group-Object Lang | ForEach-Object {
    $s = ($_.Group | Measure-Object Size -Sum).Sum
    [PSCustomObject]@{ Lang=$_.Name; Folders=$_.Count; MB=[math]::Round($s/1MB,1) }
} | Sort-Object MB -Descending | Format-Table -AutoSize
