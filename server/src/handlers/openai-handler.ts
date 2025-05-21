import OpenAI from 'openai';

import { CONFIG } from '../config.js';
import {
  GenerateImageArgs,
  MCPResponse,
} from '../types.js';
import {
  checkAliceTokenBalance,
  deductAliceTokenFee,
} from '../utils/alice-utils.js';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: CONFIG.openai.apiKey,
});

/**
 * Handler for generating images with OpenAI's DALL-E model
 */
export const generateImageHandler = async (args: GenerateImageArgs): Promise<MCPResponse> => {
  try {
    console.log(`🎨 Generating image with prompt: ${args.prompt}`);
    
    // Check if the wallet has enough ALICE tokens for this operation
    const hasAliceBalance = await checkAliceTokenBalance(CONFIG.alice.fees.imageGeneration);
    if (!hasAliceBalance) {
      return {
        content: [
          {
            type: "text",
            text: `Insufficient $ALICE tokens. You need at least ${CONFIG.alice.fees.imageGeneration} $ALICE tokens to generate an image.`
          }
        ],
        isError: true
      };
    }

    // Generate image with OpenAI
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: args.prompt,
      size: args.size as any || "1024x1024",
      quality: args.quality as any || "standard",
      style: args.style as any || "vivid",
      n: 1,
      response_format: "b64_json"
    });

    // Extract image data and revised prompt
    const imageData = response.data[0].b64_json;
    const revisedPrompt = response.data[0].revised_prompt;
    
    if (!imageData) {
      throw new Error("OpenAI did not return image data");
    }

    // Deduct ALICE tokens for the fee
    await deductAliceTokenFee(CONFIG.alice.fees.imageGeneration, "Image generation fee");
    
    return {
      content: [
        {
          type: "text",
          text: `✨ Image generated successfully! (Fee: ${CONFIG.alice.fees.imageGeneration} $ALICE)

Prompt: "${args.prompt}"
Revised prompt: "${revisedPrompt}"

You can use the solana_mint_nft tool to mint this image as an NFT on Solana.`
        },
        {
          type: "image",
          data: imageData,
          mimeType: "image/png"
        }
      ],
    };
  } catch (error: any) {
    console.error("❌ Error generating image:", error);
    
    return {
      content: [
        {
          type: "text",
          text: `Error generating image: ${error.message || "Unknown error"}`
        }
      ],
      isError: true
    };
  }
};