# ContextDB MCP Server - Node.js Bridge

Since the core ContextDB is written in Rust (for ripgrep-like performance), 
we'll create a Node.js MCP server that calls the Rust binary.

This gives us:
- Rust performance for indexing/search
- Node.js simplicity for MCP protocol
- Best of both worlds

## Implementation

Create a Node.js MCP server that:
1. Spawns `contextdb` binary for operations
2. Implements MCP protocol in TypeScript
3. Provides toolcalls: contextdb_search, contextdb_ingest, etc.

## Alternative: Pure Rust MCP

If Rust MCP SDK exists, we can implement directly in Rust.
Otherwise, Node.js bridge is the practical approach.

