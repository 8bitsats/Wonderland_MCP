import dotenv from 'dotenv';
import fs from 'fs';
// Example OpenAI API client for using Wonderland MCP
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Get directory path
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an image and mint as NFT using Wonderland MCP
 */
async function generateAndMintNFT() {
  try {
    console.log("Starting image generation with Wonderland MCP...");
    
    // Step 1: Generate the image
    console.log("Step 1: Generating image...");
    const imageResponse = await openai.responses.create({
      model: "gpt-4.1",
      tools: [{
        "type": "mcp",
        "server_label": "wonderland",
        "server_url": "http://localhost:3000", // Your MCP server URL or use stdio
      }],
      input: "Generate a surreal image of Alice in Wonderland where she's floating in space with planets that look like teacups and a cosmic white rabbit made of stars."
    });
    
    console.log("Image generation complete!");
    
    // Extract image data from response
    const imageOutput = imageResponse.output.find(
      output => output.type === 'image'
    );
    
    if (!imageOutput || !imageOutput.image) {
      throw new Error("No image data found in response");
    }
    
    const imageBase64 = imageOutput.image.data;
    
    // Save image to file (optional)
    const imagePath = path.join(__dirname, 'generated-image.png');
    fs.writeFileSync(imagePath, Buffer.from(imageBase64, 'base64'));
    console.log(`Image saved to: ${imagePath}`);
    
    // Step 2: Mint the NFT
    console.log("Step 2: Minting NFT...");
    const mintResponse = await openai.responses.create({
      model: "gpt-4.1",
      tools: [{
        "type": "mcp",
        "server_label": "wonderland",
        "server_url": "http://localhost:3000",
      }],
      input: `Mint the image we just generated as an NFT with these details:
      - Name: "Cosmic Tea Party"
      - Description: "Alice floats through a cosmic wonderland where planets are teacups and a constellation forms a white rabbit."
      - Symbol: "ALICE"
      - Attributes: [{"trait_type": "Style", "value": "Surreal"}, {"trait_type": "Collection", "value": "Wonderland"}]`
    });
    
    console.log("NFT minting complete!");
    console.log(mintResponse.output.filter(o => o.type === 'text').map(o => o.text).join("\n"));
    
    // Step 3 (Optional): Check ALICE token balance
    console.log("Step 3: Checking $ALICE token balance...");
    const balanceResponse = await openai.responses.create({
      model: "gpt-4.1",
      tools: [{
        "type": "mcp",
        "server_label": "wonderland",
        "server_url": "http://localhost:3000",
      }],
      input: "Check my $ALICE token balance"
    });
    
    console.log("Balance check complete!");
    console.log(balanceResponse.output.filter(o => o.type === 'text').map(o => o.text).join("\n"));
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Execute the example
generateAndMintNFT().catch(console.error);