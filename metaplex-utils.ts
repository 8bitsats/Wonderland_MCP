import {
  bundlrStorage,
  keypairIdentity,
  Metaplex,
  toMetaplexFileFromBrowser,
} from '@metaplex-foundation/js';
import {
  Connection,
  Keypair,
} from '@solana/web3.js';

// Create Metaplex instance
export const createMetaplexInstance = (connection: Connection, wallet: Keypair) => {
  return Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(bundlrStorage({
      address: 'https://node1.bundlr.network',
      providerUrl: process.env.HELIUS_RPC_URL,
      timeout: 60000,
    }));
};

// Helper to create a bundlr uploader
export const createBundlrUploader = async (metaplex: Metaplex) => {
  return metaplex.storage().bundlr();
};

// Helper to convert buffer to MetaplexFile
export const toMetaplexFile = (buffer: Buffer, fileName: string) => {
  return toMetaplexFileFromBrowser(
    new File([buffer], fileName, { type: 'image/png' })
  );
};

// Re-export Metaplex for convenience
export { Metaplex };