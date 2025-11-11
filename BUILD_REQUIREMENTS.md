# ContextDB Build Requirements

## ✅ Rust Installed
Rust is installed and working! (`cargo 1.91.1`, `rustc 1.91.1`)

## ⚠️ Missing: C++ Build Tools

Rust needs a C++ linker to compile. You have two options:

---

## Option 1: GNU Toolchain (Recommended - Simpler)

**No Visual Studio needed!** Uses MinGW instead.

```powershell
# Install GNU toolchain
rustup toolchain install stable-x86_64-pc-windows-gnu

# Set as default
rustup default stable-x86_64-pc-windows-gnu

# Verify
rustc --version
# Should show: rustc 1.91.1 (x86_64-pc-windows-gnu)
```

**Pros:**
- ✅ No Visual Studio installation needed
- ✅ Smaller download
- ✅ Works immediately

**Cons:**
- ⚠️ Some Windows-specific crates prefer MSVC
- ⚠️ Slightly larger binaries

---

## Option 2: Visual Studio Build Tools (MSVC)

**Requires Visual Studio Build Tools installation.**

1. **Download Build Tools:**
   - Visit: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
   - Download "Build Tools for Visual Studio 2022"

2. **Install:**
   - Run installer
   - Select "Desktop development with C++" workload
   - Install (several GB)

3. **Verify:**
   ```powershell
   rustc --version
   # Should show: rustc 1.91.1 (x86_64-pc-windows-msvc)
   ```

**Pros:**
- ✅ Better Windows integration
- ✅ Smaller binaries
- ✅ Preferred by most Windows Rust projects

**Cons:**
- ❌ Large download (~3-4 GB)
- ❌ Requires Visual Studio Build Tools installation

---

## 🚀 After Installing Build Tools

Once you have either toolchain installed:

```powershell
cd D:\tools\contextdb
cargo build --release
```

---

## 💡 Recommendation

**For ContextDB:** GNU toolchain is perfectly fine and much simpler to set up!

```powershell
rustup toolchain install stable-x86_64-pc-windows-gnu
rustup default stable-x86_64-pc-windows-gnu
cargo build --release
```

---

**Status**: Waiting for build tools installation

