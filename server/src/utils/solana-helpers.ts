import { Keypair } from '@solana/web3.js';

import {
  solanaRpc,
  wallet as defaultWallet,
} from '../config.js';
import {
  createMetaplexInstance,
  toMetaplexFile,
} from './metaplex-utils.js';

/**
 * Upload image to Arweave via Bundlr network
 * @param base64Image Base64-encoded image data
 * @returns URI of the uploaded image
 */
export const uploadToArweave = async (base64Image: string): Promise<string> => {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Image, 'base64');
    
    // Initialize Metaplex
    const metaplex = createMetaplexInstance(solanaRpc, defaultWallet);
    
    // Create a MetaplexFile
    const file = toMetaplexFile(buffer, 'image.png');
    
    // Upload to Arweave via Bundlr
    console.log("📤 Uploading to Arweave...");
    const imageUri = await metaplex.storage().upload(file);
    console.log("✅ Image uploaded:", imageUri);
    
    return imageUri;
  } catch (error) {
    console.error("❌ Error uploading to Arweave:", error);
    throw error;
  }
};

/**
 * Upload metadata to Arweave
 * @param metaplex Metaplex instance
 * @param name NFT name
 * @param description NFT description
 * @param imageUri Image URI
 * @param attributes NFT attributes
 * @returns URI of the uploaded metadata
 */
export const uploadMetadata = async (
  metaplex: any,
  name: string,
  description: string,
  imageUri: string,
  attributes: Array<{ trait_type: string; value: string }>
): Promise<string> => {
  try {
    console.log("📤 Uploading metadata...");
    
    // Create and upload metadata
    const { uri } = await metaplex.nfts().uploadMetadata({
      name,
      description,
      image: imageUri,
      attributes,
      properties: {
        files: [
          {
            type: "image/png",
            uri: imageUri,
          },
        ],
      },
    });
    
    console.log("✅ Metadata uploaded:", uri);
    return uri;
  } catch (error) {
    console.error("❌ Error uploading metadata:", error);
    throw error;
  }
};

/**
 * Mint NFT on Solana
 */
export const mintNFT = async ({
  connection,
  wallet = defaultWallet,
  name,
  description,
  symbol,
  imageUri,
  attributes,
  useAliceToken = true
}: {
  connection: any;
  wallet?: Keypair;
  name: string;
  description: string;
  symbol: string;
  imageUri: string;
  attributes: Array<{ trait_type: string; value: string }>;
  useAliceToken?: boolean;
}): Promise<{ signature: string; mintAddress: string }> => {
  try {
    // Initialize Metaplex
    const metaplex = createMetaplexInstance(connection, wallet);
    
    // Upload metadata
    const metadataUri = await uploadMetadata(
      metaplex,
      name,
      description,
      imageUri,
      attributes
    );
    
    // Mint the NFT
    console.log("💰 Minting NFT...");
    const { nft } = await metaplex.nfts().create({
      uri: metadataUri,
      name,
      sellerFeeBasisPoints: 500, // 5% royalty
      symbol,
      creators: [
        {
          address: wallet.publicKey,
          share: 100,
          verified: true,
        },
      ],
      isMutable: true,
    });
    
    console.log("✅ NFT minted:", nft.address.toString());
    
    return {
      signature: nft.response.signature,
      mintAddress: nft.address.toString(),
    };
  } catch (error) {
    console.error("❌ Error minting NFT:", error);
    throw error;
  }
};

/**
 * Convert lamports to SOL
 */
export const lamportsToSol = (lamports: number): number => {
  return lamports / 1_000_000_000;
};

/**
 * Convert SOL to lamports
 */
export const solToLamports = (sol: number): number => {
  return sol * 1_000_000_000;
};