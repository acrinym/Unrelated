$csv = Import-Csv 'D:\WinSystemOnSystem.csv'

Write-Host "`n=== TOTAL FILE COUNT & SIZE ===" -ForegroundColor Cyan
$total = $csv | Measure-Object -Property Size -Sum
Write-Host "Files: $($total.Count)"
Write-Host "Total: $([math]::Round($total.Sum/1GB,2)) GB"

Write-Host "`n=== TOP 20 FILE TYPES BY SIZE ===" -ForegroundColor Cyan
$csv | Group-Object Type | ForEach-Object {
    $sum = ($_.Group | Measure-Object -Property Size -Sum).Sum
    [PSCustomObject]@{ Type=$_.Name; Count=$_.Count; TotalMB=[math]::Round($sum/1MB,1) }
} | Sort-Object TotalMB -Descending | Select-Object -First 20 | Format-Table -AutoSize

Write-Host "`n=== TOP 30 LARGEST INDIVIDUAL FILES ===" -ForegroundColor Cyan
$csv | Sort-Object {[long]$_.Size} -Descending | Select-Object -First 30 |
    Select-Object Name, @{N='SizeMB';E={[math]::Round([long]$_.Size/1MB,1)}}, Type, Path |
    Format-Table -AutoSize

Write-Host "`n=== LANGUAGE PACKS (non-en-US) ===" -ForegroundColor Cyan
$langPattern = '_(?!en-us)[a-z]{2}-[a-z]{2}_'
$langFiles = $csv | Where-Object { $_.Path -match $langPattern }
$langSum = ($langFiles | Measure-Object -Property Size -Sum).Sum
Write-Host "Files: $($langFiles.Count) | Size: $([math]::Round($langSum/1MB,1)) MB"
$langFiles | Group-Object { ($_.Path -replace '.*_((?!en-us)[a-z]{2}-[a-z]{2})_.*','$1') } | ForEach-Object {
    $sum = ($_.Group | Measure-Object -Property Size -Sum).Sum
    [PSCustomObject]@{ Lang=$_.Name; Count=$_.Count; MB=[math]::Round($sum/1MB,1) }
} | Sort-Object MB -Descending | Format-Table -AutoSize

Write-Host "`n=== COMPONENT VERSION COUNTS (packages with multiple versions) ===" -ForegroundColor Cyan
$csv | Where-Object { $_.Path -match '\\WinSxS\\([^\\]+)\\' } | ForEach-Object {
    $folder = [regex]::Match($_.Path, '\\WinSxS\\([^\\]+)\\').Groups[1].Value
    $base = $folder -replace '_\d+\.\d+\.\d+\.\d+_none_[0-9a-f]+$',''
    [PSCustomObject]@{ Base=$base; Folder=$folder; Size=[long]$_.Size }
} | Group-Object Base | Where-Object {
    ($_.Group | Select-Object -ExpandProperty Folder -Unique).Count -gt 1
} | ForEach-Object {
    $versions = ($_.Group | Select-Object -ExpandProperty Folder -Unique).Count
    $sum = ($_.Group | Measure-Object -Property Size -Sum).Sum
    [PSCustomObject]@{ Component=$_.Name; Versions=$versions; TotalMB=[math]::Round($sum/1MB,1) }
} | Sort-Object TotalMB -Descending | Select-Object -First 30 | Format-Table -AutoSize
