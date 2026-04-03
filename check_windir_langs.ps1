$csv = Import-Csv 'D:\WinSystemOnSystem.csv'

# What top-level Windows dirs are in the CSV?
Write-Host "=== ROOT PATHS IN CSV ==="
$csv | ForEach-Object {
    if ($_.Path -match '^(C:\\Windows\\[^\\]+)') { $Matches[1] }
    elseif ($_.Path -match '^(C:\\Windows)$') { 'C:\Windows (root)' }
    else { ($_.Path -split '\\')[0..2] -join '\' }
} | Group-Object | Sort-Object Count -Descending | Select-Object -First 20 | Format-Table Name, Count -AutoSize

# Language folders outside WinSxS
Write-Host "`n=== NON-ENGLISH LANG FOLDERS OUTSIDE WinSxS ==="
$nonSxS = $csv | Where-Object {
    $_.Path -notlike "C:\Windows\WinSxS*" -and (
        $_.Path -match '\\(ar-SA|bg-BG|cs-CZ|da-DK|de-DE|el-GR|es-ES|es-MX|fi-FI|fr-CA|fr-FR|he-IL|hr-HR|hu-HU|it-IT|ja-JP|ko-KR|nb-NO|nl-NL|pl-PL|pt-BR|pt-PT|ro-RO|ru-RU|sk-SK|sl-SI|sv-SE|th-TH|tr-TR|uk-UA|vi-VN|zh-CN|zh-TW)\\' -or
        $_.Name  -match '\.(ar-SA|bg-BG|cs-CZ|da-DK|de-DE|el-GR|es-ES|fi-FI|fr-FR|he-IL|hr-HR|hu-HU|it-IT|ja-JP|ko-KR|nl-NL|pl-PL|pt-BR|pt-PT|ru-RU|sv-SE|tr-TR|uk-UA|zh-CN|zh-TW)\.mui$'
    )
}
$sum = ($nonSxS | Measure-Object Size -Sum).Sum
Write-Host "Files: $($nonSxS.Count) | Size: $([math]::Round($sum/1MB,1)) MB"

# Break down by parent directory
$nonSxS | ForEach-Object {
    # Get the Windows subdir (e.g. System32, SysWOW64, etc.)
    if ($_.Path -match '^C:\\Windows\\([^\\]+)') { $Matches[1] } else { 'other' }
} | Group-Object | Sort-Object Count -Descending | Format-Table Name, Count -AutoSize

# Sample
Write-Host "=== SAMPLE FILES ==="
$nonSxS | Sort-Object {[long]$_.Size} -Descending | Select-Object -First 20 |
    Format-Table Name, @{N='KB';E={[math]::Round([long]$_.Size/1KB,0)}}, Path -AutoSize
