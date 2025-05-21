# Wonderland MCP

A Model Context Protocol (MCP) server that bridges AI models with the Solana blockchain, powered by $ALICE token and the Alice agent.

## 🌈 Features

- **AI Image Generation**: Generate images with OpenAI's DALL-E models
- **NFT Minting**: Mint generated images as NFTs on Solana
- **$ALICE Integration**: Use $ALICE tokens for fee payments and governance
- **Alice Agent**: Autonomous AI agent for Solana blockchain interactions
- **MCP Protocol**: Connect any AI model to Solana through standardized interfaces

## 📋 Prerequisites

- Node.js v16+
- Solana CLI (for wallet management)
- OpenAI API key
- Helius RPC URL for Solana access
- Solana wallet with $ALICE tokens

## 🚀 Quick Start

1. **Clone this repository**
   ```bash
   git clone https://github.com/yourusername/wonderland-mcp.git
   cd wonderland-mcp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with the following:
   ```
   OPENAI_API_KEY=your_openai_api_key
   HELIUS_RPC_URL=your_helius_rpc_url
   SOLANA_PRIVATE_KEY=["your","solana","private","key","as","byte","array"]
   ALICE_TOKEN_MINT=your_alice_token_mint_address
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 🔌 Integration with AI Models

### Claude Desktop

To use with Claude Desktop:

1. Open Claude Desktop settings
2. Go to Developer → Edit Config
3. Add the Wonderland MCP server configuration
4. Save and restart Claude Desktop

Example configuration:
```json
{
  "mcpServers": {
    "wonderland": {
      "command": "node",
      "args": [
        "/absolute/path/to/build/index.js"
      ],
      "env": {
        "OPENAI_API_KEY": "your_openai_api_key",
        "HELIUS_RPC_URL": "your_helius_rpc_url",
        "SOLANA_PRIVATE_KEY": "[\"your\",\"solana\",\"private\",\"key\",\"as\",\"byte\",\"array\"]",
        "ALICE_TOKEN_MINT": "your_alice_token_mint_address"
      }
    }
  }
}
```

### OpenAI API

```javascript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.responses.create({
  model: "gpt-4.1",
  tools: [{
    "type": "mcp",
    "server_label": "wonderland",
    "server_url": "http://localhost:3000", 
  }],
  input: "Generate an art piece of Alice in Wonderland and mint it as an NFT"
});
```

## 🧩 Available Tools

| Tool | Description |
|------|-------------|
| `openai_generate_image` | Generate images using OpenAI DALL-E |
| `solana_mint_nft` | Mint NFTs on Solana |
| `alice_token_balance` | Check $ALICE token balance |
| `alice_agent_task` | Submit tasks to the Alice agent |
| `alice_token_transfer` | Transfer $ALICE tokens |

## 🏦 $ALICE Token Economy

The $ALICE token powers the Wonderland ecosystem:

- Pay fees for image generation and NFT minting
- Stake tokens to participate in governance
- Earn rewards for contributing to the ecosystem
- Trade on Solana DEXs like Jupiter, Orca, and Raydium

## 🤖 The Alice Agent

The Alice Agent is an autonomous AI entity on Solana that can:

- Execute complex multi-step transactions
- Monitor NFT collections and token prices
- Perform scheduled actions on behalf of users
- Interact with other Solana protocols and programs

## 📄 License

MIT