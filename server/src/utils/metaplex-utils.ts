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

import { CONFIG } from '../config.js';

/**
 * Create a Metaplex instance with configured identity and storage
 */
export const createMetaplexInstance = (connection: Connection, wallet: Keypair): Metaplex => {
  return Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(bundlrStorage({
      address: CONFIG.bundlr.address,
      providerUrl: CONFIG.solana.rpcUrl,
      timeout: CONFIG.bundlr.timeout,
    }));
};

/**
 * Create a Bundlr uploader from Metaplex instance
 */
export const createBundlrUploader = async (metaplex: Metaplex) => {
  return metaplex.storage().bundlr();
};

/**
 * Convert a Buffer to a MetaplexFile
 */
export const toMetaplexFile = (buffer: Buffer, fileName: string) => {
  return toMetaplexFileFromBrowser(
    new File([buffer], fileName, { type: 'image/png' })
  );
};

/**
 * Re-export Metaplex for convenience
 */
export { Metaplex };