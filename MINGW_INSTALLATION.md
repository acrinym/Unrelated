# MinGW-w64 Installation Guide for ContextDB

## ⚠️ Required: MinGW-w64 for GNU Toolchain

The GNU Rust toolchain needs MinGW-w64's `dlltool.exe` to compile.

---

## 🚀 Quick Installation Options

### Option 1: Download Pre-built MinGW-w64 (Recommended)

1. **Download from:**
   - https://winlibs.com/
   - Choose: "Win64 - GCC 13.2.0 + MinGW-w64 UCRT runtime - release" (or latest)
   - Extract to `D:\mingw64`

2. **Add to PATH:**
   ```powershell
   $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
   [Environment]::SetEnvironmentVariable("Path", "$currentPath;D:\mingw64\bin", "User")
   ```

3. **Restart terminal** and verify:
   ```powershell
   gcc --version
   dlltool --version
   ```

### Option 2: MSYS2 (Full Development Environment)

1. **Download MSYS2:**
   - https://www.msys2.org/
   - Install to `D:\msys64`

2. **Install MinGW-w64:**
   ```bash
   # Open MSYS2 terminal
   pacman -Syu
   pacman -S mingw-w64-x86_64-gcc
   ```

3. **Add to PATH:**
   ```powershell
   $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
   [Environment]::SetEnvironmentVariable("Path", "$currentPath;D:\msys64\mingw64\bin", "User")
   ```

### Option 3: Use MSVC Toolchain Instead

If you prefer to avoid MinGW installation:

```powershell
# Switch back to MSVC toolchain
rustup default stable-x86_64-pc-windows-msvc

# Then install Visual Studio Build Tools
# Download: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
# Install "Desktop development with C++" workload
```

---

## ✅ After Installing MinGW

Once MinGW is installed and in PATH:

```powershell
cd D:\tools\contextdb
cargo build --release
```

---

## 🔍 Verify Installation

```powershell
# Check GCC
gcc --version

# Check dlltool
dlltool --version

# Check Rust can find it
rustc --version
# Should show: rustc 1.91.1 (x86_64-pc-windows-gnu)
```

---

**Recommendation**: Option 1 (WinLibs) is the fastest and simplest!

