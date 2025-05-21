import { Keypair } from '@solana/web3.js';

import {
  createMetaplexInstance,
  toMetaplexFile,
} from './metaplex-utils.js';

// Upload image to Arweave via Bundlr
export const uploadToArweave = async (base64Image: string): Promise<string> => {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Image, 'base64');
    
    // Get connection and wallet
    const connection = createSolanaRpc(process.env.HELIUS_RPC_URL!);
    const wallet = Keypair.fromSecretKey(
      Buffer.from(JSON.parse(process.env.SOLANA_PRIVATE_KEY!))
    );
    
    // Initialize Metaplex
    const metaplex = createMetaplexInstance(connection, wallet);
    
    // Create a MetaplexFile
    const file = toMetaplexFile(buffer, 'image.png');
    
    // Upload to Arweave via Bundlr
    console.log("Uploading to Arweave...");
    const imageUri = await metaplex.storage().upload(file);
    console.log("Image uploaded:", imageUri);
    
    return imageUri;
  } catch (error) {
    console.error("Error uploading to Arweave:", error);
    throw error;
  }
};

// Mint NFT on Solana
export const mintNFT = async ({
  connection,
  wallet,
  name,
  description,
  symbol,
  imageUri,
  attributes
}: {
  connection: any;
  wallet: Keypair;
  name: string;
  description: string;
  symbol: string;
  imageUri: string;
  attributes: Array<{ trait_type: string; value: string }>;
}): Promise<{ signature: string; mintAddress: string }> => {
  try {
    // Initialize Metaplex
    const metaplex = createMetaplexInstance(connection, wallet);
    
    // Create metadata JSON
    console.log("Creating metadata...");
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
    console.log("Metadata created:", uri);
    
    // Mint the NFT
    console.log("Minting NFT...");
    const { nft } = await metaplex.nfts().create({
      uri,
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
    console.log("NFT minted:", nft.address.toString());
    
    return {
      signature: nft.response.signature,
      mintAddress: nft.address.toString(),
    };
  } catch (error) {
    console.error("Error minting NFT:", error);
    throw error;
  }
};