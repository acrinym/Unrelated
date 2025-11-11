# Rust Installation Guide for D: Drive (Windows)

## 🎯 Goal
Install Rust toolchain on D: drive instead of default C: drive location.

---

## ✅ Method 1: Environment Variables (Recommended)

### Step 1: Set Environment Variables BEFORE Installation

**PowerShell (Run as Administrator):**
```powershell
# Set user-level environment variables
[Environment]::SetEnvironmentVariable("CARGO_HOME", "D:\rust\cargo", "User")
[Environment]::SetEnvironmentVariable("RUSTUP_HOME", "D:\rust\rustup", "User")

# Verify
[Environment]::GetEnvironmentVariable("CARGO_HOME", "User")
[Environment]::GetEnvironmentVariable("RUSTUP_HOME", "User")
```

**Command Prompt (Run as Administrator):**
```cmd
setx CARGO_HOME "D:\rust\cargo"
setx RUSTUP_HOME "D:\rust\rustup"
```

### Step 2: Download Rust Installer

```powershell
# Download rustup-init.exe
Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe"
```

Or visit: https://rustup.rs/

### Step 3: Run Installer

```powershell
# Run installer (it will use the environment variables)
& "$env:TEMP\rustup-init.exe"
```

**During installation:**
- Choose option `1` (default installation)
- The installer will automatically use `D:\rust\cargo` and `D:\rust\rustup`

### Step 4: Add to PATH

**PowerShell:**
```powershell
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
$cargoBin = "D:\rust\cargo\bin"
if ($currentPath -notlike "*$cargoBin*") {
    [Environment]::SetEnvironmentVariable("Path", "$currentPath;$cargoBin", "User")
}
```

**Command Prompt:**
```cmd
setx Path "%Path%;D:\rust\cargo\bin"
```

### Step 5: Restart Terminal

**Close and reopen your terminal**, then verify:

```powershell
rustc --version
cargo --version
rustup show
```

---

## ✅ Method 2: Custom Installation Path

### Step 1: Run rustup-init.exe

```powershell
.\rustup-init.exe
```

### Step 2: Choose Custom Installation

When prompted:
```
Current installation options:

   default host triple: x86_64-pc-windows-msvc
     default toolchain: stable (default)
               profile: default
  modify PATH variable: yes

1) Proceed with installation (default)
2) Customize installation
3) Cancel installation
```

**Choose `2` (Customize installation)**

### Step 3: Set Custom Paths

```
Default host triple? [x86_64-pc-windows-msvc]
Default toolchain? (stable/beta/nightly/none) [stable]
Profile? (minimal/default/complete) [default]
Modify PATH variable? (Y/n) [y]
Custom toolchain directory? (for advanced users) [leave blank]
```

**For custom toolchain directory, enter:**
```
D:\rust\rustup\toolchains
```

**For cargo home, set environment variable before installation:**
```powershell
$env:CARGO_HOME = "D:\rust\cargo"
```

---

## 🔍 Verification

After installation, verify paths:

```powershell
# Check cargo home
echo $env:CARGO_HOME
# Should show: D:\rust\cargo

# Check rustup home
echo $env:RUSTUP_HOME
# Should show: D:\rust\rustup

# Check installation
rustup show
# Should show toolchain location in D:\rust\rustup

# Check cargo
cargo --version
# Should work without errors
```

---

## 🐛 Troubleshooting

### Issue: "rustc: command not found"

**Solution:**
1. Verify PATH includes `D:\rust\cargo\bin`
2. Restart terminal
3. Check environment variables are set correctly

### Issue: "Permission denied" when installing

**Solution:**
1. Run PowerShell/CMD as Administrator
2. Ensure D:\rust directory exists and is writable

### Issue: Rust still installing to C: drive

**Solution:**
1. Uninstall existing Rust installation
2. Set environment variables BEFORE running installer
3. Verify variables are set: `echo $env:CARGO_HOME`

---

## 📝 Post-Installation

### Configure Cargo (Optional)

Create/edit `D:\rust\cargo\config.toml`:

```toml
[build]
# Use D: drive for build artifacts
target-dir = "D:\\rust\\cargo\\target"

[registry]
# Use D: drive for registry cache
index = "https://github.com/rust-lang/crates.io-index"
```

---

## ✅ Success Checklist

- [ ] `CARGO_HOME` environment variable set to `D:\rust\cargo`
- [ ] `RUSTUP_HOME` environment variable set to `D:\rust\rustup`
- [ ] `D:\rust\cargo\bin` added to PATH
- [ ] Terminal restarted
- [ ] `rustc --version` works
- [ ] `cargo --version` works
- [ ] `rustup show` shows D: drive paths

---

**Location**: `D:\tools\contextdb\RUST_INSTALLATION.md`

