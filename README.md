# ContextDB - Fast, Compressed Context Storage for AI Agents

**A high-performance, whole-context database system for AI context management.**

---

## 🎯 Purpose

ContextDB enables AI agents (like me!) to:
- **Store** entire codebases, books, documentation with whole-context integrity
- **Search** with parallel execution (rayon) on persistent storage
- **Access** via CLI commands
- **Remember** codebase structure across sessions without re-reading

---

## 🚀 Installation & Setup

### Requirements
- **Rust Toolchain**: `stable-x86_64-pc-windows-gnu` (Recommended for Windows)
- **MinGW-w64**: Required for building with GNU toolchain (included in repository)

### Quick Setup (Recommended)
This repository includes a portable `w64devkit` (MinGW-w64) and a helper script to set up the environment automatically.

1. **Open PowerShell in the repository root**
2. **Run the setup shell:**
   ```powershell
   .\dev_shell.ps1
   ```
   This will configure your PATH to use the local compiler tools.

3. **Build the project:**
   ```powershell
   cargo build --release
   ```

### Manual Setup
If you prefer to configure it manually:
1. Ensure `rustup toolchain install stable-x86_64-pc-windows-gnu` is installed.
2. Add `w64devkit/bin` to your PATH.
3. Run `cargo build`.

---

## 📖 Usage

### Initialize a Project
```bash
# Note: --path is now a named argument
cargo run -- init --project test --path .
```

### Ingest Files
```bash
cargo run -- ingest --project test src/main.rs src/lib.rs
```

### Search
```bash
cargo run -- search "ContextDB" --project test
```

### List Projects
```bash
cargo run -- list
```

### MCP Server (for AI agents)

The MCP server is a Node.js bridge that exposes ContextDB functionality to AI agents.

1. **Navigate to the MCP server directory:**
   ```bash
   cd mcp-server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   node src/index.mjs
   ```

   **Configuration for Claude Desktop / Cursor:**
   Add the following to your MCP settings file:
   ```json
   {
     "mcpServers": {
       "contextdb": {
         "command": "node",
         "args": ["D:\\GitHub\\Unrelated\\mcp-server\\src\\index.mjs"]
       }
     }
   }
   ```

---

## 🏗️ Architecture

### Core Components

1. **Search Engine** (Parallel)
   - Fast parallel search using `rayon`
   - Optimized compressed storage (flate2/gzip)
   - O(1) ingestion per file (no line-level indexing bloat)

2. **Storage Layer**
   - Compressed file storage (gzip compression)
   - Metadata database (SQLite)
   - Project management

3. **CLI Interface**
   - Simple, intuitive interface
   - Fast execution

---

## 📁 Project Structure

```
contextdb/
├── src/
│   ├── main.rs (CLI)
│   ├── lib.rs (Core library)
├── w64devkit/ (Portable MinGW-w64 tools)
├── dev_shell.ps1 (Environment setup script)
├── Cargo.toml
└── README.md
```

---

## 💡 Key Features

- **Parallel Search**: Uses `rayon` for multi-threaded search across compressed files.
- **Whole-Context**: Stores complete files, no information loss.
- **Bloat-Free**: Minimal metadata storage (SQLite), bulk data is compressed on disk.
- **Portable**: Includes necessary build tools for Windows.
- **Compressed**: Efficient storage using gzip compression (`flate2`).

---


3. **Add to PATH:**
   ```powershell
   # Add cargo bin to PATH
   $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
   [Environment]::SetEnvironmentVariable("Path", "$currentPath;D:\rust\cargo\bin", "User")
   ```

4. **Restart terminal** and verify:
   ```powershell
   rustc --version
   cargo --version
   ```

### Method 2: Custom Installer Options

When running `rustup-init.exe`, you can also:
- Choose "Customize installation"
- Set custom paths during installation

---

## 📝 Notes

- **Rust Toolchain**: Must be installed on D: drive
- **Cargo Cache**: Will be stored in `D:\rust\cargo`
- **Rustup**: Will be stored in `D:\rust\rustup`
- **Project Location**: `D:\tools\contextdb`

---

**Status**: 🚧 **IN DEVELOPMENT**  
**Language**: Rust (core) + Node.js (MCP bridge)  
**License**: MIT (open-source, donor-supported)
