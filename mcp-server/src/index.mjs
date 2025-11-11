#!/usr/bin/env node

// ============================================================================
// CONTEXTDB MCP SERVER
// ============================================================================
// Node.js MCP server that bridges to Rust contextdb binary
// Provides MCP toolcalls for AI agent access
// ============================================================================

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const readFile = promisify(fs.readFile);

class ContextDBMCPServer {
    private server: Server;
    private contextdbPath: string;

    constructor() {
        this.server = new Server(
            {
                name: 'contextdb-mcp',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        // Path to contextdb binary (adjust based on build location)
        this.contextdbPath = process.env.CONTEXTDB_BINARY || 
            (process.platform === 'win32' 
                ? 'D:\\RustTemp\\release\\contextdb.exe'
                : 'contextdb');

        this.setupHandlers();
    }

    setupHandlers() {
        // List tools
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'contextdb_search',
                    description: 'Search within a ContextDB project. Returns matching lines and optionally full file context.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'Search query (supports ripgrep-like patterns)',
                            },
                            project: {
                                type: 'string',
                                description: 'Project name to search within',
                            },
                            whole_context: {
                                type: 'boolean',
                                description: 'If true, returns full file content for matches',
                                default: false,
                            },
                        },
                        required: ['query', 'project'],
                    },
                },
                {
                    name: 'contextdb_ingest',
                    description: 'Ingest files into a ContextDB project. Stores whole-context with compression.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project: {
                                type: 'string',
                                description: 'Project name',
                            },
                            paths: {
                                type: 'array',
                                items: { type: 'string' },
                                description: 'File paths to ingest',
                            },
                        },
                        required: ['project', 'paths'],
                    },
                },
                {
                    name: 'contextdb_list_projects',
                    description: 'List all available ContextDB projects.',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'contextdb_init',
                    description: 'Initialize a new ContextDB project.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            project: {
                                type: 'string',
                                description: 'Project name',
                            },
                            path: {
                                type: 'string',
                                description: 'Source path to index',
                            },
                        },
                        required: ['project', 'path'],
                    },
                },
            ],
        }));

        // Call tool
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'contextdb_search': {
                        const { query, project, whole_context } = args;
                        const result = await this.runCommand([
                            'search',
                            query,
                            '--project',
                            project,
                            ...(whole_context ? ['--whole-context'] : []),
                        ]);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result,
                                },
                            ],
                        };
                    }

                    case 'contextdb_ingest': {
                        const { project, paths } = args;
                        const result = await this.runCommand([
                            'ingest',
                            '--project',
                            project,
                            ...paths,
                        ]);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result,
                                },
                            ],
                        };
                    }

                    case 'contextdb_list_projects': {
                        const result = await this.runCommand(['list']);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result,
                                },
                            ],
                        };
                    }

                    case 'contextdb_init': {
                        const { project, path } = args;
                        const result = await this.runCommand([
                            'init',
                            '--project',
                            project,
                            '--path',
                            path,
                        ]);
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: result,
                                },
                            ],
                        };
                    }

                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });

        // Error handling
        this.server.onerror = (error) => {
            console.error('[ContextDB MCP] Error:', error);
        };

        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    async runCommand(args) {
        return new Promise((resolve, reject) => {
            const child = spawn(this.contextdbPath, args, {
                stdio: ['ignore', 'pipe', 'pipe'],
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve(stdout || stderr);
                } else {
                    reject(new Error(`Command failed: ${stderr || stdout}`));
                }
            });

            child.on('error', (error) => {
                reject(error);
            });
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('✅ ContextDB MCP Server running');
    }
}

// Start server
const server = new ContextDBMCPServer();
server.run().catch(console.error);

