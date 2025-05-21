import { z } from 'zod';

import {
  generateImageHandler,
  mintNftHandler,
} from './handlers/openai-solana.js';

// Define the tools with their schemas
export const tools = [
  {
    name: "openai_generate_image",
    description: "Generate an image using OpenAI's image generation capabilities",
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
      ).optional().describe("Attributes/traits for the NFT")
    }
  }
];

// Map tool names to handler functions
export const handlers = {
  "openai_generate_image": generateImageHandler,
  "solana_mint_nft": mintNftHandler
};