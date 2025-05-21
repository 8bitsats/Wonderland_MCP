import { config } from 'dotenv';

import { createSolanaRpc } from '@solana/kit';
import {
  Keypair,
  PublicKey,
} from '@solana/web3.js';

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'HELIUS_RPC_URL',
  'SOLANA_PRIVATE_KEY',
  'ALICE_TOKEN_MINT'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing environment variable: ${envVar}`);
  }
}

// Config object
export const CONFIG = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY!
  },
  solana: {
    rpcUrl: process.env.HELIUS_RPC_URL!,
    walletPrivateKey: JSON.parse(process.env.SOLANA_PRIVATE_KEY!) as number[],
    get wallet() {
      return Keypair.fromSecretKey(
        Buffer.from(this.walletPrivateKey)
      );
    }
  },
  alice: {
    tokenMint: new PublicKey(process.env.ALICE_TOKEN_MINT!),
    agentProgramId: process.env.ALICE_AGENT_PROGRAM_ID 
      ? new PublicKey(process.env.ALICE_AGENT_PROGRAM_ID)
      : undefined,
    fees: {
      imageGeneration: 0.1, // ALICE tokens
      nftMinting: 0.5      // ALICE tokens
    }
  },
  bundlr: {
    address: 'https://node1.bundlr.network',
    timeout: 60000
  }
};

// Initialize Solana RPC
export const solanaRpc = createSolanaRpc(CONFIG.solana.rpcUrl);

// Export wallet for convenience
export const wallet = CONFIG.solana.wallet;