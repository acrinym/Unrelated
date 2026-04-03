$csv = Import-Csv 'D:\WinSystemOnSystem.csv'

# .mui files
$mui = $csv | Where-Object { $_.Name -like '*.mui' }
Write-Host ".mui files: $($mui.Count)"
$mui | Select-Object -First 5 | Format-Table Name, Path -AutoSize

# Any path with lang-like segment
$langSample = $csv | Where-Object { $_.Path -match '[a-z]{2}-[A-Z]{2}' } | Select-Object -First 10
Write-Host "Sample lang-pattern paths: $($langSample.Count)"
$langSample | Format-Table Name, Path -AutoSize

# What do paths actually look like - sample 5 deep paths
Write-Host "Sample deep paths (most subfolders):"
$csv | Sort-Object { ($_.Path.Split('\').Count) } -Descending | Select-Object -First 5 |
    Format-Table Path -AutoSize
