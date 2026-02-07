# ContextDB - Implementation Guide

## 🚀 Building ContextDB

### Prerequisites
- Rust toolchain (`stable-x86_64-pc-windows-gnu`)
- MinGW-w64 (provided via `w64devkit` in repo)

### Build Steps

1. **Setup Environment**:
   ```powershell
   .\dev_shell.ps1
   ```

2. **Build**:
   ```powershell
   cargo build --release
   ```

### Installation

```bash
# Add to PATH or run via cargo run
$env:PATH += ";D:\GitHub\Unrelated\target\release"
```

---

## 📖 Usage Examples

### Initialize Project

```bash
cargo run -- init --project test --path .
```

### Ingest Files

```bash
cargo run -- ingest --project test src/main.rs src/lib.rs
```

### Search

```bash
# Simple search
cargo run -- search "ContextDB" --project test

# With whole context
cargo run -- search "ContextDB" --project test --whole-context
```

### MCP Server (for AI agents)

*Note: MCP implementation is currently a placeholder/Node.js bridge.*

```bash
cd mcp-server
npm install
node src/index.mjs
```

---

## 🔧 MCP Integration

### Toolcall Examples

```javascript
// Search
await client.callTool({
  name: 'contextdb_search',
  arguments: {
    query: 'ContextDB',
    project: 'test',
    whole_context: true
  }
});
```

---

## 🎯 Next Steps

1. **Build the project** - ✅
2. **Test ingestion** - ✅
3. **Test search** - ✅
4. **MCP integration** - 🚧 In Progress

---

**Status**: 🚧 **BETA**
**Location**: `D:\GitHub\Unrelated`

