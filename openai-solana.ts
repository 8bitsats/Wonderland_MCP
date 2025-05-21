import OpenAI from 'openai';

import { createSolanaRpc } from '@solana/kit';
import { Keypair } from '@solana/web3.js';

import {
  mintNFT,
  uploadToArweave,
} from '../utils/solana-helpers.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Solana connection
const solanaRpc = createSolanaRpc(process.env.HELIUS_RPC_URL!);

// Load wallet from private key
const wallet = Keypair.fromSecretKey(
  Buffer.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY!))
);

// Image generation handler
export const generateImageHandler = async (args: {
  prompt: string;
  size?: string;
  quality?: string;
  style?: string;
}) => {
  try {
    console.log(`Generating image with prompt: ${args.prompt}`);
    
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: args.prompt,
      size: args.size as any || "1024x1024",
      quality: args.quality as any || "standard",
      style: args.style as any || "vivid",
      n: 1,
      response_format: "b64_json"
    });

    // Extract the base64 data and revised prompt
    const imageData = response.data[0].b64_json;
    const revisedPrompt = response.data[0].revised_prompt;
    
    return {
      content: [
        {
          type: "text" as const,
          text: `Image generated successfully!

Prompt: "${args.prompt}"
Revised prompt: "${revisedPrompt}"

You can use the solana_mint_nft tool to mint this image as an NFT on Solana.`
        },
        {
          type: "image" as const,
          data: imageData!,
          mimeType: "image/png"
        }
      ],
    };
  } catch (error: any) {
    console.error("Error generating image:", error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error generating image: ${error.message}`
        }
      ],
      isError: true
    };
  }
};

// NFT minting handler
export const mintNftHandler = async (args: {
  imageBase64: string;
  name: string;
  description: string;
  symbol?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}) => {
  try {
    console.log(`Minting NFT: ${args.name}`);
    
    // Upload image to Arweave
    console.log("Uploading image to Arweave...");
    const imageUri = await uploadToArweave(args.imageBase64);
    
    // Mint the NFT
    console.log("Minting NFT on Solana...");
    const { signature, mintAddress } = await mintNFT({
      connection: solanaRpc,
      wallet,
      name: args.name,
      description: args.description,
      symbol: args.symbol || "NFT",
      imageUri,
      attributes: args.attributes || []
    });
    
    const explorerUrl = `https://explorer.solana.com/address/${mintAddress}?cluster=mainnet`;
    const solscanUrl = `https://solscan.io/token/${mintAddress}`;
    
    return {
      content: [
        {
          type: "text" as const,
          text: `NFT minted successfully!

Name: ${args.name}
Description: ${args.description}
Symbol: ${args.symbol || "NFT"}
Mint Address: ${mintAddress}
Transaction: ${signature}

View on:
- Solana Explorer: ${explorerUrl}
- Solscan: ${solscanUrl}`
        }
      ],
    };
  } catch (error: any) {
    console.error("Error minting NFT:", error);
    return {
      content: [
        {
          type: "text" as const,
          text: `Error minting NFT: ${error.message}`
        }
      ],
      isError: true
    };
  }
};