#!/usr/bin/env node

import { config } from 'dotenv';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio.js';

import {
  handlers,
  tools,
} from '../tools.js';

config(); // Load environment variables

async function runServer() {
  // Create the MCP server
  const server = new McpServer({
    name: "openai-solana-mcp",
    version: "1.0.0",
  });

  // Register all tools
  for (const tool of tools) {
    server.tool(tool.name, tool.inputSchema, handlers[tool.name]);
  }

  // Connect the server to standard I/O
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});