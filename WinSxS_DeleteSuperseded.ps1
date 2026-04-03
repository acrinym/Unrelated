# WinSxS_DeleteSuperseded.ps1
# Reads the Everything CSV export, finds superseded component versions,
# and generates a deletion batch file + summary.
# Run the OUTPUT .cmd file elevated (or from WinPE) to actually delete.

param(
    [string]$CsvPath   = "D:\WinSystemOnSystem.csv",
    [string]$OutputCmd = "D:\GitHub\Unrelated\WinSxS_Delete.cmd",
    [switch]$DryRun    # If set, prints summary only, does not write .cmd
)

Write-Host "Reading CSV..." -ForegroundColor Cyan
$csv = Import-Csv $CsvPath

# Extract unique WinSxS top-level subfolder names from paths
# Path format: C:\Windows\WinSxS\<folder>\...
$winsxsRoot = "C:\Windows\WinSxS\"

$folderSizes = @{}
foreach ($row in $csv) {
    $path = $row.Path
    if ($path -like "$winsxsRoot*") {
        $relative = $path.Substring($winsxsRoot.Length)
        $folder = $relative.Split('\')[0]
        if ($folder -and $folder -ne "" -and $folder -notmatch '^\.' ) {
            if (-not $folderSizes.ContainsKey($folder)) {
                $folderSizes[$folder] = 0
            }
            $folderSizes[$folder] += [long]$row.Size
        }
    }
}

Write-Host "Found $($folderSizes.Count) unique WinSxS component folders." -ForegroundColor Cyan

# Parse folder name: arch_name_pubkey_version_lang_hash
# Group key = arch_name_pubkey (everything before the version x.x.x.x)
$versionPattern = '^(.+?)_(\d+\.\d+\.\d+\.\d+)_(none|[a-z]{2}-[a-z]{2})_([0-9a-f]+)$'

$groups = @{}
$unparsed = @()

foreach ($folder in $folderSizes.Keys) {
    if ($folder -match $versionPattern) {
        $base    = $Matches[1]
        $ver     = $Matches[2]
        $size    = $folderSizes[$folder]
        if (-not $groups.ContainsKey($base)) {
            $groups[$base] = @()
        }
        $groups[$base] += [PSCustomObject]@{
            Folder  = $folder
            Version = [System.Version]$ver
            Size    = $size
        }
    } else {
        $unparsed += $folder
    }
}

# Find superseded: groups with >1 version — keep newest, delete rest
$toDelete = @()
$keptCount = 0

foreach ($base in $groups.Keys) {
    $versions = $groups[$base] | Sort-Object Version -Descending
    if ($versions.Count -gt 1) {
        $keep = $versions[0]
        $keptCount++
        foreach ($old in $versions | Select-Object -Skip 1) {
            $toDelete += [PSCustomObject]@{
                Folder  = $old.Folder
                Version = $old.Version
                SizeMB  = [math]::Round($old.Size / 1MB, 1)
                Base    = $base
                KeepVer = $keep.Version
            }
        }
    }
}

$totalSavingsMB = ($toDelete | Measure-Object SizeMB -Sum).Sum

Write-Host "`n=== SUPERSEDED COMPONENTS TO DELETE ===" -ForegroundColor Yellow
$toDelete | Sort-Object SizeMB -Descending | Select-Object -First 40 |
    Format-Table Folder, Version, SizeMB, KeepVer -AutoSize

Write-Host "Total folders to delete : $($toDelete.Count)" -ForegroundColor Green
Write-Host "Estimated space savings : $([math]::Round($totalSavingsMB/1024,2)) GB" -ForegroundColor Green

if ($DryRun) {
    Write-Host "`n[DryRun] No file written." -ForegroundColor Gray
    return
}

# Write deletion .cmd
$lines = @()
$lines += "@echo off"
$lines += ":: WinSxS superseded component cleanup"
$lines += ":: Generated $(Get-Date -Format 'yyyy-MM-dd HH:mm') - run as SYSTEM via: PsExec.exe -s cmd.exe"
$lines += ":: Estimated savings: $([math]::Round($totalSavingsMB/1024,2)) GB"
$lines += "::"
$lines += ":: DO NOT use takeown/icacls - changes ownership away from TrustedInstaller and breaks CBS/WU."
$lines += ":: Run this from a SYSTEM shell (PsExec -s) or from WinPE. SYSTEM already has delete rights."
$lines += "::"
$lines += ":: To launch a SYSTEM shell:  PsExec.exe -s -i cmd.exe  (then run this .cmd from there)"
$lines += "echo This script must run as SYSTEM (PsExec -s) or from WinPE."
$lines += "echo Press Ctrl+C to abort, or any key to continue."
$lines += "pause"
$lines += ""

foreach ($item in $toDelete | Sort-Object SizeMB -Descending) {
    $fullPath = "$winsxsRoot$($item.Folder)"
    $lines += ":: $($item.Base) | v$($item.Version) -> keep v$($item.KeepVer) | ~$($item.SizeMB) MB"
    $lines += "rd /s /q `"$fullPath`""
    $lines += ""
}

$lines += "echo Done."
$lines | Out-File -FilePath $OutputCmd -Encoding ascii

Write-Host "`nDeletion script written to: $OutputCmd" -ForegroundColor Cyan
Write-Host "Review it before running. Run elevated or from WinPE." -ForegroundColor Yellow
