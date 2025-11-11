# ContextDB - Ripgrep-Powered Context Storage for AI Agents

**A high-performance, whole-context database system that works like ripgrep but with persistent storage.**

---

## 🎯 Purpose

ContextDB enables AI agents (like me!) to:
- **Store** entire codebases, books, documentation with whole-context integrity
- **Search** as fast as ripgrep with persistent storage
- **Access** via MCP toolcalls or CLI commands
- **Remember** codebase structure across sessions without re-reading

---

## 🚀 Installation

### Prerequisites: Rust on D: Drive

**⚠️ IMPORTANT: Rust must be installed on D: drive, not C:**

1. **Download Rust installer:**
   ```powershell
   # Download rustup-init.exe from https://rustup.rs/
   ```

2. **Set custom installation path:**
   ```powershell
   # Set environment variables BEFORE running rustup-init.exe
   $env:CARGO_HOME = "D:\rust\cargo"
   $env:RUSTUP_HOME = "D:\rust\rustup"
   
   # Run installer
   .\rustup-init.exe
   ```

3. **Add to PATH (permanent):**
   ```powershell
   # Add to user PATH environment variable
   [Environment]::SetEnvironmentVariable("Path", $env:Path + ";D:\rust\cargo\bin", "User")
   ```

4. **Verify installation:**
   ```powershell
   rustc --version
   cargo --version
   ```

### Build ContextDB

```bash
cd D:\tools\contextdb
cargo build --release
```

---

## 📖 Quick Start

### Initialize a Project
```bash
contextdb init --project=phoenix --path=D:\GitHub\PhoenixVisualizer
```

### Search
```bash
contextdb search "function name" --project=phoenix
```

### MCP Access (for AI agents)
```bash
# MCP server runs automatically
# AI agents can call: contextdb_search, contextdb_ingest, contextdb_list_projects
```

---

## 🏗️ Architecture

### Core Components

1. **Index Engine** (Ripgrep-based)
   - Fast regex search using ripgrep algorithm
   - Line-level indexing
   - File path indexing
   - Whole-context storage (compressed)

2. **Storage Layer**
   - Compressed file storage (zstd compression)
   - Metadata database (SQLite)
   - Project management

3. **MCP Server**
   - Toolcalls for AI agent access
   - `contextdb_search` - Search projects
   - `contextdb_ingest` - Add files/projects
   - `contextdb_list_projects` - List available projects

4. **CLI Interface**
   - Ripgrep-like commands
   - Simple, intuitive interface

---

## 📁 Project Structure

```
contextdb/
├── src/
│   ├── main.rs (CLI)
│   ├── lib.rs (Core library)
│   └── mcp_server.rs (Placeholder)
├── mcp-server/
│   ├── src/
│   │   └── index.mjs (Node.js MCP bridge)
│   └── package.json
├── Cargo.toml
├── README.md
└── .gitignore
```

---

## 🔧 Implementation Plan

### Phase 1: Core Index Engine ✅
- [x] Ripgrep-based indexing
- [x] File storage (compressed)
- [x] Basic search functionality

### Phase 2: MCP Server
- [x] Node.js bridge implementation
- [ ] MCP protocol integration
- [ ] AI agent integration

### Phase 3: CLI Interface ✅
- [x] Ripgrep-like commands
- [x] Project management
- [x] User-friendly interface

### Phase 4: Advanced Features
- [ ] Incremental updates
- [ ] Semantic search (optional holographic layer)
- [ ] Cross-project search

---

## 💡 Key Features

- **Ripgrep Speed**: Uses proven ripgrep algorithm for fast search
- **Whole-Context**: Stores complete files, no information loss
- **MCP Compatible**: AI agents can access via toolcalls
- **Easy Setup**: Simple initialization and ingestion
- **Persistent**: Context persists across sessions
- **Compressed**: Efficient storage using zstd compression

---

## 🎯 Use Cases

### For AI Agents (like me!)
```javascript
// MCP toolcall
await client.callTool({
  name: 'contextdb_search',
  arguments: {
    query: 'RenderFrame',
    project: 'phoenix',
    options: { whole_context: true }
  }
});
```

### For Developers
```bash
# Search codebase
contextdb search "class definition" --project=mycodebase

# Ingest new project
contextdb ingest --project=newproject --path=/path/to/code

# List projects
contextdb list
```

---

## 🔧 Rust Installation on D: Drive (Windows)

### Method 1: Environment Variables (Recommended)

1. **Before installing Rust**, set these environment variables:
   ```powershell
   # User-level environment variables
   [Environment]::SetEnvironmentVariable("CARGO_HOME", "D:\rust\cargo", "User")
   [Environment]::SetEnvironmentVariable("RUSTUP_HOME", "D:\rust\rustup", "User")
   ```

2. **Download and run rustup-init.exe** from https://rustup.rs/

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
