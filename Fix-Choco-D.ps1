param(
    [switch]$ForceReinstall,
    [switch]$UninstallOnly
)

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

function Get-DesiredChocoRoot {
    $envMachine = [Environment]::GetEnvironmentVariable("ChocolateyInstall", [EnvironmentVariableTarget]::Machine)
    $envUser = [Environment]::GetEnvironmentVariable("ChocolateyInstall", [EnvironmentVariableTarget]::User)
    $envProcess = $env:ChocolateyInstall

    $candidates = @($envMachine, $envUser, $envProcess) | Where-Object { $_ -and $_ -like "D:*" }
    $existing = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
    if ($existing) {
        return $existing.TrimEnd("\")
    }

    $preferred = "D:\Chocolatey"
    $alt = "D:\ProgramData\chocolatey"

    if (Test-Path $preferred) {
        return $preferred
    }
    if (Test-Path $alt) {
        return $alt
    }

    return $preferred
}

function Get-ChocoInstallPath {
    $envMachine = [Environment]::GetEnvironmentVariable("ChocolateyInstall", [EnvironmentVariableTarget]::Machine)
    $envUser = [Environment]::GetEnvironmentVariable("ChocolateyInstall", [EnvironmentVariableTarget]::User)
    $envProcess = $env:ChocolateyInstall

    $candidates = @($envMachine, $envUser, $envProcess, "D:\Chocolatey", "D:\ProgramData\chocolatey") |
        Where-Object { $_ -and $_ -like "D:*" }

    foreach ($c in $candidates) {
        if (Test-Path $c) {
            return $c.TrimEnd("\")
        }
    }
    return $null
}

function Ensure-ChocoEnvAndPath {
    param(
        [string]$Root
    )

    if (-not $Root) {
        return
    }

    if ($Root -notlike "D:*") {
        Write-Host "Refusing to set ChocolateyInstall outside D: drive." -ForegroundColor Red
        return
    }

    [Environment]::SetEnvironmentVariable("ChocolateyInstall", $Root, [EnvironmentVariableTarget]::Machine)
    [Environment]::SetEnvironmentVariable("ChocolateyInstall", $Root, [EnvironmentVariableTarget]::User)
    $env:ChocolateyInstall = $Root

    $chocoBin = Join-Path $Root "bin"

    $machineTarget = [EnvironmentVariableTarget]::Machine
    $machinePath = [Environment]::GetEnvironmentVariable("Path", $machineTarget)

    if ($machinePath) {
        $parts = $machinePath.Split(";") | Where-Object { $_ -ne "" -and $_ -notlike "C:*" }
    } else {
        $parts = @()
    }

    if ($parts -notcontains $chocoBin) {
        $parts = $parts + $chocoBin
    }

    $newMachinePath = ($parts -join ";")
    [Environment]::SetEnvironmentVariable("Path", $newMachinePath, $machineTarget)

    if (-not ($env:Path.Split(";") -contains $chocoBin)) {
        $env:Path = $env:Path.TrimEnd(";") + ";" + $chocoBin
    }
}

function Remove-ChocolateyHard {
    param(
        [string]$Root
    )

    if (-not $Root) {
        Write-Host "No Chocolatey install path detected on D: to remove." -ForegroundColor Yellow
        return
    }

    if ($Root -notlike "D:*") {
        Write-Host "Refusing to remove Chocolatey outside D: drive." -ForegroundColor Red
        return
    }

    Write-Host "Removing Chocolatey from $Root" -ForegroundColor Cyan

    if (Test-Path $Root) {
        try {
            $backupName = "${Root}_backup_{0}" -f (Get-Date -Format "yyyyMMddHHmmss")
            $backupLeaf = Split-Path -Path $backupName -Leaf
            $parent = Split-Path -Path $Root -Parent
            if (-not $parent) {
                $parent = "D:\"
            }
            $backupPath = Join-Path $parent $backupLeaf
            Rename-Item -Path $Root -NewName $backupLeaf -ErrorAction Stop
            Write-Host "Existing Chocolatey directory renamed to $backupPath" -ForegroundColor Yellow
        } catch {
            Write-Host "Failed to rename ${Root}: $($_.Exception.Message)" -ForegroundColor Yellow
            try {
                Remove-Item -Path $Root -Recurse -Force -ErrorAction Stop
                Write-Host "Removed ${Root} after rename failure." -ForegroundColor Yellow
            } catch {
                Write-Host "Failed to fully remove ${Root}: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
    }

    $machineTarget = [EnvironmentVariableTarget]::Machine
    $machinePath = [Environment]::GetEnvironmentVariable("Path", $machineTarget)
    if ($machinePath) {
        $parts = $machinePath.Split(";") | Where-Object {
            $_ -ne "" -and $_ -notlike "$Root*" -and $_ -notlike (Join-Path $Root "bin*")
        }
        $newMachinePath = ($parts -join ";")
        [Environment]::SetEnvironmentVariable("Path", $newMachinePath, $machineTarget)
    }

    $envMachine = [Environment]::GetEnvironmentVariable("ChocolateyInstall", [EnvironmentVariableTarget]::Machine)
    if ($envMachine -and $envMachine -notlike "D:*") {
        [Environment]::SetEnvironmentVariable("ChocolateyInstall", $null, [EnvironmentVariableTarget]::Machine)
    }

    $envUser = [Environment]::GetEnvironmentVariable("ChocolateyInstall", [EnvironmentVariableTarget]::User)
    if ($envUser -and $envUser -notlike "D:*") {
        [Environment]::SetEnvironmentVariable("ChocolateyInstall", $null, [EnvironmentVariableTarget]::User)
    }

    if ($env:ChocolateyInstall -and $env:ChocolateyInstall -notlike "D:*") {
        $env:ChocolateyInstall = $null
    }
}

function Install-OrRepair-Chocolatey {
    param(
        [switch]$Force
    )

    $root = Get-DesiredChocoRoot

    if ($Force) {
        Remove-ChocolateyHard -Root $root
    }

    Ensure-ChocoEnvAndPath -Root $root

    Write-Host "Installing or repairing Chocolatey in $root" -ForegroundColor Cyan

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
        Write-Host "Installation script failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }

    $installPath = Get-ChocoInstallPath
    Ensure-ChocoEnvAndPath -Root $installPath

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

        $argList = @(
            "-ExecutionPolicy Bypass",
            "-File `"$PSCommandPath`""
        )

        if ($ForceReinstall) {
            $argList += "-ForceReinstall"
        }

        if ($UninstallOnly) {
            $argList += "-UninstallOnly"
        }

        $argString = $argList -join " "

        Start-Process -FilePath "powershell.exe" -ArgumentList $argString -Verb RunAs
        exit
    }

    Write-Host ""
    Write-Host "==== Chocolatey D: Fixer ====" -ForegroundColor Cyan

    $currentInstall = Get-ChocoInstallPath
    if ($currentInstall) {
        Write-Host "Detected Chocolatey on D:: $currentInstall" -ForegroundColor DarkCyan
    } else {
        Write-Host "No existing Chocolatey install detected on D:." -ForegroundColor Yellow
    }

    if ($UninstallOnly) {
        Remove-ChocolateyHard -Root (Get-DesiredChocoRoot)
        Write-Host "Uninstall-only mode completed." -ForegroundColor Green
        return
    }

    $testBefore = Test-ChocoWorking

    if ($testBefore -and -not $ForceReinstall) {
        Write-Host ""
        Write-Host "Chocolatey already appears to work on D:. No reinstall requested." -ForegroundColor Green
        return
    }

    $installResult = Install-OrRepair-Chocolatey -Force:$ForceReinstall

    if (-not $installResult) {
        Write-Host ""
        Write-Host "Install/repair step failed. See error above." -ForegroundColor Red
        return
    }

    $testAfter = Test-ChocoWorking

    if (-not $testAfter) {
        Write-Host ""
        Write-Host "Chocolatey still appears broken after repair." -ForegroundColor Red
        Write-Host "Check for network, proxy, AV or group policy issues." -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "Chocolatey repaired successfully on D:." -ForegroundColor Green
    }
}

Main
