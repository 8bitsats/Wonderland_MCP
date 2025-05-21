import {
  createTransferInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
} from '@solana/spl-token';
import {
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

import {
  CONFIG,
  solanaRpc,
  wallet,
} from '../config.js';
import { AliceAgentTaskResult } from '../types.js';

/**
 * Get the $ALICE token balance for a wallet
 * @param walletAddress Public key of the wallet to check
 * @returns Balance in $ALICE tokens
 */
export const getAliceTokenBalance = async (walletAddress: PublicKey): Promise<number> => {
  try {
    // Get the associated token account
    const tokenAccount = await getAssociatedTokenAddress(
      CONFIG.alice.tokenMint,
      walletAddress
    );
    
    try {
      // Get account info
      const accountInfo = await getAccount(solanaRpc, tokenAccount);
      // Convert from raw amount to decimal amount based on decimals (SPL tokens typically have 9 decimals)
      return Number(accountInfo.amount) / Math.pow(10, 9);
    } catch (error) {
      // If account doesn't exist, balance is 0
      return 0;
    }
  } catch (error) {
    console.error("Error getting ALICE token balance:", error);
    throw error;
  }
};

/**
 * Check if the server wallet has enough $ALICE tokens
 * @param amount Amount needed
 * @returns Boolean indicating if balance is sufficient
 */
export const checkAliceTokenBalance = async (amount: number): Promise<boolean> => {
  const balance = await getAliceTokenBalance(wallet.publicKey);
  return balance >= amount;
};

/**
 * Deduct $ALICE tokens as a fee
 * This simulates a fee being paid by "burning" tokens or sending to a fee wallet
 * @param amount Amount to deduct
 * @param memo Optional memo for the transaction
 */
export const deductAliceTokenFee = async (amount: number, memo?: string): Promise<string> => {
  // For this example, we'll just transfer to a designated fee collector address
  // In a real system, you might burn the tokens or use a more sophisticated fee system
  
  // This is a fictional fee collector address - replace with a real one in production
  const feeCollector = new PublicKey("A1ice111111111111111111111111111111111111111");
  
  return transferAliceTokens(feeCollector, amount, memo || "Service fee");
};

/**
 * Transfer $ALICE tokens to another wallet
 * @param recipient Recipient wallet public key
 * @param amount Amount to transfer
 * @param memo Optional memo
 * @returns Transaction signature
 */
export const transferAliceTokens = async (
  recipient: PublicKey,
  amount: number,
  memo?: string
): Promise<string> => {
  try {
    // Get the token accounts
    const sourceAccount = await getOrCreateAssociatedTokenAccount(
      solanaRpc,
      wallet,
      CONFIG.alice.tokenMint,
      wallet.publicKey
    );
    
    const destinationAccount = await getOrCreateAssociatedTokenAccount(
      solanaRpc,
      wallet,
      CONFIG.alice.tokenMint,
      recipient
    );
    
    // Create transfer instruction
    const transferInstruction = createTransferInstruction(
      sourceAccount.address,
      destinationAccount.address,
      wallet.publicKey,
      amount * Math.pow(10, 9) // Convert to raw token amount (assuming 9 decimals)
    );
    
    // Add memo if provided
    const transaction = new Transaction().add(transferInstruction);
    
    if (memo) {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: recipient,
          lamports: 0, // No SOL transfer, just adding memo
        })
      );
      // The memo would normally be added here with a MemoProgram instruction
      // For simplicity, we're just simulating it in this example
    }
    
    // Send and confirm the transaction
    const signature = await sendAndConfirmTransaction(
      solanaRpc,
      transaction,
      [wallet]
    );
    
    console.log(`$ALICE transfer complete: ${signature}`);
    return signature;
  } catch (error) {
    console.error("Error transferring ALICE tokens:", error);
    throw error;
  }
};

/**
 * Submit a task to the Alice agent
 * @param taskType Type of task
 * @param parameters Task parameters
 * @param callbackAddress Optional callback address
 * @returns Task result
 */
export const submitAliceAgentTask = async (
  taskType: 'NFT_MONITOR' | 'TOKEN_SWAP' | 'SCHEDULED_TRANSACTION' | 'CUSTOM',
  parameters: Record<string, any>,
  callbackAddress?: PublicKey
): Promise<AliceAgentTaskResult> => {
  // This is a mock implementation - in a real system, you would submit the task
  // to an on-chain program or off-chain service
  
  // Check if Alice agent program ID is configured
  if (!CONFIG.alice.agentProgramId) {
    throw new Error("Alice agent program ID not configured");
  }
  
  console.log(`Submitting ${taskType} task to Alice agent`);
  console.log(`Parameters: ${JSON.stringify(parameters)}`);
  if (callbackAddress) {
    console.log(`Callback: ${callbackAddress.toString()}`);
  }
  
  // For this example, we'll just return a mock response
  // In a real implementation, you would create a transaction that interacts with
  // the Alice agent program on Solana
  
  // Generate a random task ID
  const taskId = `task_${Math.random().toString(36).substring(2, 15)}`;
  
  // Estimate completion time (5 minutes from now)
  const now = new Date();
  const estimatedCompletionTime = new Date(now.getTime() + 5 * 60 * 1000).toISOString();
  
  return {
    taskId,
    status: 'QUEUED',
    estimatedCompletionTime
  };
};