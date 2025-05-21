import {
  CONFIG,
  solanaRpc,
  wallet,
} from '../config.js';
import {
  MCPResponse,
  MintNftArgs,
} from '../types.js';
import {
  checkAliceTokenBalance,
  deductAliceTokenFee,
} from '../utils/alice-utils.js';
import {
  mintNFT,
  uploadToArweave,
} from '../utils/solana-helpers.js';

/**
 * Handler for minting NFTs on Solana
 */
export const mintNftHandler = async (args: MintNftArgs): Promise<MCPResponse> => {
  try {
    console.log(`🖼️ Minting NFT: ${args.name}`);
    
    // Check if using Alice token for fees and verify balance
    const useAliceToken = args.useAliceToken ?? true;
    
    if (useAliceToken) {
      const aliceFee = CONFIG.alice.fees.nftMinting;
      const hasAliceBalance = await checkAliceTokenBalance(aliceFee);
      
      if (!hasAliceBalance) {
        return {
          content: [
            {
              type: "text",
              text: `Insufficient $ALICE tokens. You need at least ${aliceFee} $ALICE tokens to mint an NFT.`
            }
          ],
          isError: true
        };
      }
    }
    
    // Validate the base64 image data
    if (!args.imageBase64 || !args.imageBase64.trim()) {
      return {
        content: [
          {
            type: "text",
            text: "Image data is missing or invalid. Please provide a valid base64-encoded image."
          }
        ],
        isError: true
      };
    }
    
    // Upload image to Arweave
    console.log("📤 Uploading image to Arweave...");
    const imageUri = await uploadToArweave(args.imageBase64);
    
    // Mint the NFT
    console.log("🏦 Minting NFT on Solana...");
    const { signature, mintAddress } = await mintNFT({
      connection: solanaRpc,
      wallet,
      name: args.name,
      description: args.description,
      symbol: args.symbol || "ALICE",
      imageUri,
      attributes: args.attributes || [
        { trait_type: "Collection", value: "Wonderland" },
        { trait_type: "Creator", value: "Alice Agent" }
      ],
      useAliceToken
    });
    
    // Deduct ALICE tokens if using them
    if (useAliceToken) {
      await deductAliceTokenFee(
        CONFIG.alice.fees.nftMinting, 
        `NFT Minting: ${args.name}`
      );
    }
    
    // Construct explorer links
    const explorerUrl = `https://explorer.solana.com/address/${mintAddress}?cluster=mainnet`;
    const solscanUrl = `https://solscan.io/token/${mintAddress}`;
    const magicEdenUrl = `https://magiceden.io/item-details/${mintAddress}`;
    
    return {
      content: [
        {
          type: "text",
          text: `✅ NFT minted successfully! ${useAliceToken ? `(Fee: ${CONFIG.alice.fees.nftMinting} $ALICE)` : ''}

📋 Details:
• Name: ${args.name}
• Description: ${args.description}
• Symbol: ${args.symbol || "ALICE"}
• Mint Address: ${mintAddress}
• Transaction: ${signature}

🔍 View on:
• Solana Explorer: ${explorerUrl}
• Solscan: ${solscanUrl}
• Magic Eden: ${magicEdenUrl}`
        }
      ],
    };
  } catch (error: any) {
    console.error("❌ Error minting NFT:", error);
    
    return {
      content: [
        {
          type: "text",
          text: `Error minting NFT: ${error.message || "Unknown error"}`
        }
      ],
      isError: true
    };
  }
};