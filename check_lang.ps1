$csv = Import-Csv 'D:\WinSystemOnSystem.csv'

$nonEnLangs = 'ar-SA|bg-BG|ca-ES|cs-CZ|da-DK|de-DE|el-GR|es-ES|es-MX|et-EE|eu-ES|fi-FI|fr-CA|fr-FR|gl-ES|he-IL|hr-HR|hu-HU|id-ID|it-IT|ja-JP|ko-KR|lt-LT|lv-LV|nb-NO|nl-NL|pl-PL|pt-BR|pt-PT|ro-RO|ru-RU|sk-SK|sl-SI|sv-SE|th-TH|tr-TR|uk-UA|vi-VN|zh-CN|zh-TW'

# Files in language subdirectories within WinSxS components
$langFiles = $csv | Where-Object {
    $_.Path -match "\\($nonEnLangs)\\" -or
    $_.Name -match "\.($nonEnLangs)\.mui$"
}

$sum = ($langFiles | Measure-Object -Property Size -Sum).Sum
Write-Host "Matching files: $($langFiles.Count)"
Write-Host "Total size: $([math]::Round($sum/1MB,1)) MB ($([math]::Round($sum/1GB,2)) GB)"
Write-Host ""

# Sample some paths to understand structure
Write-Host "=== SAMPLE PATHS ==="
$langFiles | Select-Object -First 20 | Format-Table Name, Path, @{N='KB';E={[math]::Round([long]$_.Size/1KB,0)}} -AutoSize

Write-Host "=== BY LANGUAGE ==="
$langFiles | ForEach-Object {
    if ($_.Path -match "\\(($nonEnLangs))\\") { $Matches[1] }
    elseif ($_.Name -match "\.(($nonEnLangs))\.mui$") { $Matches[1] }
    else { "other" }
} | Group-Object | Sort-Object Count -Descending | Format-Table Name, Count -AutoSize

Write-Host "=== FILE TYPES ==="
$langFiles | Group-Object Type | Sort-Object {($_.Group | Measure-Object -Property Size -Sum).Sum} -Descending |
    ForEach-Object {
        $s = ($_.Group | Measure-Object -Property Size -Sum).Sum
        [PSCustomObject]@{Type=$_.Name; Count=$_.Count; MB=[math]::Round($s/1MB,1)}
    } | Format-Table -AutoSize
