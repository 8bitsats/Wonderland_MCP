import { z } from 'zod';

import {
  aliceAgentTaskHandler,
  aliceTokenBalanceHandler,
  aliceTokenTransferHandler,
} from './handlers/alice-handler.js';
import { generateImageHandler } from './handlers/openai-handler.js';
import { mintNftHandler } from './handlers/solana-handler.js';
import { HandlerFunction } from './types.js';

// Define all tools with their schemas and descriptions
export const tools = [
  {
    name: "openai_generate_image",
    description: "Generate an image using OpenAI's DALL-E model",
    inputSchema: {
      prompt: z.string().describe("Description of the image to generate"),
      size: z.enum(["1024x1024", "1792x1024", "1024x1792"]).optional().describe("Size of the generated image"),
      quality: z.enum(["standard", "hd"]).optional().describe("Quality of the generated image"),
      style: z.enum(["vivid", "natural"]).optional().describe("Style of the generated image")
    }
  },
  {
    name: "solana_mint_nft",
    description: "Mint an NFT on the Solana blockchain with the generated image",
    inputSchema: {
      imageBase64: z.string().describe("Base64-encoded image data"),
      name: z.string().describe("Name of the NFT"),
      description: z.string().describe("Description of the NFT"),
      symbol: z.string().optional().describe("Symbol for the NFT collection"),
      attributes: z.array(
        z.object({
          trait_type: z.string(),
          value: z.string()
        })
      ).optional().describe("Attributes/traits for the NFT"),
      useAliceToken: z.boolean().optional().describe("Whether to use $ALICE tokens for the minting fee")
    }
  },
  {
    name: "alice_token_balance",
    description: "Get the balance of $ALICE tokens for a wallet",
    inputSchema: {
      walletAddress: z.string().optional().describe("The Solana address to check (defaults to the server's wallet)")
    }
  },
  {
    name: "alice_token_transfer",
    description: "Transfer $ALICE tokens to another wallet",
    inputSchema: {
      recipient: z.string().describe("The recipient's Solana address"),
      amount: z.number().positive().describe("The amount of $ALICE tokens to send"),
      memo: z.string().optional().describe("Optional memo to include with the transfer")
    }
  },
  {
    name: "alice_agent_task",
    description: "Submit a task to be performed by the Alice agent on Solana",
    inputSchema: {
      taskType: z.enum(["NFT_MONITOR", "TOKEN_SWAP", "SCHEDULED_TRANSACTION", "CUSTOM"])
        .describe("The type of task to perform"),
      parameters: z.record(z.any()).describe("Parameters specific to the task type"),
      callbackAddress: z.string().optional().describe("Optional address to notify when the task is complete")
    }
  }
];

// Map tool names to their handler functions
export const handlers: Record<string, HandlerFunction<any, any>> = {
  "openai_generate_image": generateImageHandler,
  "solana_mint_nft": mintNftHandler,
  "alice_token_balance": aliceTokenBalanceHandler,
  "alice_token_transfer": aliceTokenTransferHandler,
  "alice_agent_task": aliceAgentTaskHandler
};