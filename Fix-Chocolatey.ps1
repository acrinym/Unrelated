function Test-IsAdmin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Ensure-Tls {
    $types = [Net.SecurityProtocolType]
    $protocols = $types::Tls12 -bor $types::Tls11 -bor $types::Tls
    [Net.ServicePointManager]::SecurityProtocol = $protocols
}

function Get-ChocoInstallPath {
    if ($env:ChocolateyInstall -and (Test-Path $env:ChocolateyInstall)) {
        return $env:ChocolateyInstall
    }
    $default = "C:\ProgramData\chocolatey"
    if (Test-Path $default) {
        return $default
    }
    return $null
}

function Ensure-ChocoOnPath {
    param(
        [string]$ChocoInstall
    )

    if (-not $ChocoInstall) {
        return
    }

    $chocoBin = Join-Path $ChocoInstall "bin"
    if (-not (Test-Path $chocoBin)) {
        return
    }

    $machineTarget = [EnvironmentVariableTarget]::Machine
    $currentMachinePath = [Environment]::GetEnvironmentVariable("Path", $machineTarget)

    if ($currentMachinePath) {
        $pathParts = $currentMachinePath.Split(";") | Where-Object { $_ -ne "" }
    } else {
        $pathParts = @()
    }

    if ($pathParts -notcontains $chocoBin) {
        $newMachinePath = ($pathParts + $chocoBin) -join ";"
        [Environment]::SetEnvironmentVariable("Path", $newMachinePath, $machineTarget)
    }

    if (-not ($env:Path.Split(";") -contains $chocoBin)) {
        $env:Path = $env:Path.TrimEnd(";") + ";" + $chocoBin
    }
}

function Install-OrRepair-Chocolatey {
    param(
        [switch]$ForceInstall
    )

    $chocoInstallPath = Get-ChocoInstallPath
    $chocoExe = $null

    if ($chocoInstallPath) {
        $chocoExeCandidate = Join-Path $chocoInstallPath "bin\choco.exe"
        if (Test-Path $chocoExeCandidate) {
            $chocoExe = $chocoExeCandidate
        }
    }

    $chocoExists = $chocoExe -ne $null

    if (-not $chocoExists -or $ForceInstall) {
        Write-Host ""
        Write-Host "Installing or repairing Chocolatey from official install script..." -ForegroundColor Cyan
        Ensure-Tls
        try {
            Set-ExecutionPolicy Bypass -Scope Process -Force | Out-Null
        } catch {
        }

        try {
            $wc = New-Object System.Net.WebClient
            $script = $wc.DownloadString("https://community.chocolatey.org/install.ps1")
            Invoke-Expression $script
        } catch {
            Write-Host ""
            Write-Host "Installation script failed: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host ""
        Write-Host "Chocolatey appears to be installed, ensuring PATH is correct..." -ForegroundColor Cyan
        Ensure-ChocoOnPath -ChocoInstall $chocoInstallPath
    }

    return $true
}

function Test-ChocoWorking {
    Write-Host ""
    Write-Host "Testing Chocolatey..." -ForegroundColor Cyan
    try {
        $output = choco --version 2>&1
        if ($LASTEXITCODE -eq 0 -and $output) {
            Write-Host "Chocolatey is working. Version: $output" -ForegroundColor Green
            return $true
        } else {
            Write-Host "Chocolatey test failed. Exit code: $LASTEXITCODE" -ForegroundColor Yellow
            Write-Host $output
            return $false
        }
    } catch {
        Write-Host "Error when trying to run choco: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Main {
    if (-not (Test-IsAdmin)) {
        Write-Host "Re-launching script as Administrator..." -ForegroundColor Yellow
        Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
        exit
    }

    Write-Host ""
    Write-Host "==== Chocolatey Fixer ====" -ForegroundColor Cyan

    $chocoInstallPath = Get-ChocoInstallPath
    if ($chocoInstallPath) {
        Write-Host "Detected Chocolatey directory: $chocoInstallPath" -ForegroundColor DarkCyan
    } else {
        Write-Host "No existing Chocolatey install directory detected." -ForegroundColor Yellow
    }

    Ensure-ChocoOnPath -ChocoInstall $chocoInstallPath
    $testBefore = Test-ChocoWorking

    if ($testBefore) {
        Write-Host ""
        Write-Host "Chocolatey already appears to work. No reinstall needed." -ForegroundColor Green
        return
    }

    $installResult = Install-OrRepair-Chocolatey

    if (-not $installResult) {
        Write-Host ""
        Write-Host "Install/repair step failed. See error above." -ForegroundColor Red
        return
    }

    $chocoInstallPath = Get-ChocoInstallPath
    Ensure-ChocoOnPath -ChocoInstall $chocoInstallPath

    $testAfter = Test-ChocoWorking

    if (-not $testAfter) {
        Write-Host ""
        Write-Host "Chocolatey still appears broken after repair." -ForegroundColor Red
        Write-Host "Check for:" -ForegroundColor Yellow
        Write-Host "  - Corporate proxy or SSL inspection blocking downloads"
        Write-Host "  - Antivirus blocking choco.exe"
        Write-Host "  - Group Policy locking execution policy or PATH"
    } else {
        Write-Host ""
        Write-Host "Chocolatey repaired successfully." -ForegroundColor Green
    }
}

Main

