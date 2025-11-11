# ContextDB - Implementation Guide

## 🚀 Building ContextDB

### Prerequisites
- Rust toolchain (rustc, cargo)
- Or C# .NET SDK (if using C# version)

### Build Steps

```bash
cd D:\tools\contextdb

# Build main CLI
cargo build --release

# Build MCP server
cd mcp-server
cargo build --release
```

### Installation

```bash
# Copy binaries to PATH
cp target/release/contextdb.exe C:\utils\
cp target/release/contextdb-mcp.exe C:\utils\
```

---

## 📖 Usage Examples

### Initialize Phoenix Visualizer Project

```bash
contextdb init --project=phoenix --path=D:\GitHub\PhoenixVisualizer
```

### Ingest All C# Files

```bash
# Find all .cs files and ingest
Get-ChildItem -Path D:\GitHub\PhoenixVisualizer -Filter "*.cs" -Recurse | 
    ForEach-Object { $_.FullName } | 
    contextdb ingest --project=phoenix
```

### Search

```bash
# Simple search
contextdb search "RenderFrame" --project=phoenix

# With whole context
contextdb search "RenderFrame" --project=phoenix --whole-context
```

### MCP Server (for AI agents)

```bash
# Start MCP server
contextdb-mcp

# AI agents can then call:
# - contextdb_search
# - contextdb_ingest  
# - contextdb_list_projects
# - contextdb_init
```

---

## 🔧 MCP Integration

### For Cursor/Claude Desktop

Add to MCP config:

```json
{
  "mcpServers": {
    "contextdb": {
      "command": "D:\\tools\\contextdb\\target\\release\\contextdb-mcp.exe",
      "args": []
    }
  }
}
```

### Toolcall Examples

```javascript
// Search
await client.callTool({
  name: 'contextdb_search',
  arguments: {
    query: 'RenderFrame',
    project: 'phoenix',
    whole_context: true
  }
});

// Ingest files
await client.callTool({
  name: 'contextdb_ingest',
  arguments: {
    project: 'phoenix',
    paths: ['D:/GitHub/PhoenixVisualizer/src/file.cs']
  }
});

// List projects
await client.callTool({
  name: 'contextdb_list_projects',
  arguments: {}
});
```

---

## 🎯 Next Steps

1. **Build the project** - Test compilation
2. **Test ingestion** - Ingest Phoenix Visualizer codebase
3. **Test search** - Verify ripgrep-like performance
4. **MCP integration** - Connect to Cursor/Claude Desktop
5. **Performance tuning** - Optimize for large codebases

---

**Status**: 🚧 **IN DEVELOPMENT**  
**Location**: `D:\tools\contextdb`

