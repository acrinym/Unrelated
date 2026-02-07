$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$W64DevKitPath = Join-Path $ScriptDir "w64devkit\bin"
$env:PATH = "$W64DevKitPath;" + $env:PATH
Write-Host "Environment configured with w64devkit."
Write-Host "You can now run 'cargo build' or 'cargo run'."
powershell
