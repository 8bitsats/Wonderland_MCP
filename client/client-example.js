import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateImage() {
  const response = await client.responses.create({
    model: "gpt-4.1",
    tools: [{
      "type": "mcp",
      "server_label": "openai-solana",
      "server_url": "http://localhost:3000", // Your MCP server URL
    }],
    input: "Generate an image of a cyberpunk cat wearing VR goggles"
  });
  
  console.log(response);
  
  // Extract image ID or base64 data for NFT minting
  const imageData = response.output.find(
    output => output.type === 'image_generation_call'
  )?.result;
  
  if (imageData) {
    // Mint the NFT with a second call
    const mintResponse = await client.responses.create({
      model: "gpt-4.1",
      tools: [{
        "type": "mcp",
        "server_label": "openai-solana",
        "server_url": "http://localhost:3000",
      }],
      input: `Mint the image as an NFT with these details:
      - Name: Cyberpunk Feline
      - Description: A cyberpunk cat exploring virtual reality
      - Symbol: CPUNK
      - Attributes: [{"trait_type": "Species", "value": "Cat"}, {"trait_type": "Style", "value": "Cyberpunk"}]`
    });
    
    console.log(mintResponse);
  }
}

generateImage().catch(console.error);