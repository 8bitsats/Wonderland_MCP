import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  StdioServerTransport,
} from '@modelcontextprotocol/sdk/server/stdio.js';

import { wallet } from './config.js';
import {
  handlers,
  tools,
} from './tools.js';

console.log(`🌈 Starting Wonderland MCP Server...`);
console.log(`💰 Using wallet: ${wallet.publicKey.toString()}`);

async function runServer() {
  try {
    const server = new McpServer({
      name: "wonderland-mcp",
      version: "1.0.0",
      description: "An MCP server that connects AI models to Solana with $ALICE token integration"
    });

    console.log(`🔧 Registering tools...`);
    for (const tool of tools) {
      console.log(`  - ${tool.name}: ${tool.description}`);
      server.tool(tool.name, tool.inputSchema, handlers[tool.name]);
    }

    console.log(`📝 Registering prompts...`);
    server.prompt(
      "create-wonderland-nft",
      { artDescription: "string", nftName: "string", nftDescription: "string" },
      ({ artDescription, nftName, nftDescription }) => ({
        description: "Create and mint a Wonderland-themed NFT",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Generate an image of ${artDescription} in a Wonderland style. Then mint it as an NFT named "${nftName}" with the description "${nftDescription}" using the $ALICE token.`
            }
          }
        ]
      })
    );

    console.log(`📚 Registering resources...`);
    server.resource(
      "alice-token-info",
      "solana://wonderland/alice-token",
      async () => ({
        contents: [
          {
            uri: "solana://wonderland/alice-token",
            text: JSON.stringify({
              name: "Alice Token",
              symbol: "ALICE",
              description: "The governance and utility token of the Wonderland ecosystem",
              uses: [
                "Pay fees for AI services",
                "Mint NFTs on Solana",
                "Interact with the Alice Agent",
                "Participate in governance"
              ],
              links: {
                website: "https://wonderland.ai",
                twitter: "https://twitter.com/wonderland_ai",
                discord: "https://discord.gg/wonderland"
              }
            }, null, 2)
          }
        ]
      })
    );

    console.log(`🔌 Connecting server to transport...`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.log(`✅ Wonderland MCP Server ready!`);
  } catch (error) {
    console.error(`❌ Error starting server:`, error);
    process.exit(1);
  }
}

runServer().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});