import { PublicKey } from '@solana/web3.js';

import {
  CONFIG,
  wallet,
} from '../config.js';
import {
  AliceAgentTaskArgs,
  AliceTokenBalanceArgs,
  AliceTokenTransferArgs,
  MCPResponse,
} from '../types.js';
import {
  getAliceTokenBalance,
  submitAliceAgentTask,
  transferAliceTokens,
} from '../utils/alice-utils.js';

/**
 * Handler for checking ALICE token balance
 */
export const aliceTokenBalanceHandler = async (args: AliceTokenBalanceArgs): Promise<MCPResponse> => {
  try {
    // Use provided wallet address or default to our wallet
    const walletAddress = args.walletAddress || wallet.publicKey.toString();
    
    console.log(`💰 Checking $ALICE balance for: ${walletAddress}`);
    
    // Validate wallet address
    let publicKey: PublicKey;
    try {
      publicKey = new PublicKey(walletAddress);
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Invalid wallet address: ${walletAddress}`
          }
        ],
        isError: true
      };
    }
    
    // Get the token balance
    const balance = await getAliceTokenBalance(publicKey);
    
    return {
      content: [
        {
          type: "text",
          text: `$ALICE Token Balance for ${walletAddress}: ${balance} $ALICE`
        }
      ]
    };
  } catch (error: any) {
    console.error("❌ Error checking ALICE balance:", error);
    
    return {
      content: [
        {
          type: "text",
          text: `Error checking $ALICE balance: ${error.message || "Unknown error"}`
        }
      ],
      isError: true
    };
  }
};

/**
 * Handler for transferring ALICE tokens
 */
export const aliceTokenTransferHandler = async (args: AliceTokenTransferArgs): Promise<MCPResponse> => {
  try {
    console.log(`💸 Transferring ${args.amount} $ALICE to ${args.recipient}`);
    
    // Validate recipient address
    let recipientPubkey: PublicKey;
    try {
      recipientPubkey = new PublicKey(args.recipient);
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Invalid recipient address: ${args.recipient}`
          }
        ],
        isError: true
      };
    }
    
    // Check if we have enough tokens
    const balance = await getAliceTokenBalance(wallet.publicKey);
    if (balance < args.amount) {
      return {
        content: [
          {
            type: "text",
            text: `Insufficient $ALICE balance. You have ${balance} $ALICE, but the transfer requires ${args.amount} $ALICE.`
          }
        ],
        isError: true
      };
    }
    
    // Transfer the tokens
    const signature = await transferAliceTokens(
      recipientPubkey, 
      args.amount, 
      args.memo
    );
    
    return {
      content: [
        {
          type: "text",
          text: `✅ Successfully transferred ${args.amount} $ALICE to ${args.recipient}
          
Transaction: ${signature}
Explorer Link: https://explorer.solana.com/tx/${signature}?cluster=mainnet`
        }
      ]
    };
  } catch (error: any) {
    console.error("❌ Error transferring ALICE tokens:", error);
    
    return {
      content: [
        {
          type: "text",
          text: `Error transferring $ALICE tokens: ${error.message || "Unknown error"}`
        }
      ],
      isError: true
    };
  }
};

/**
 * Handler for submitting tasks to the Alice agent
 */
export const aliceAgentTaskHandler = async (args: AliceAgentTaskArgs): Promise<MCPResponse> => {
  try {
    console.log(`🤖 Submitting ${args.taskType} task to Alice agent`);
    
    // Check if Alice agent is configured
    if (!CONFIG.alice.agentProgramId) {
      return {
        content: [
          {
            type: "text",
            text: "Alice agent is not configured. Please set ALICE_AGENT_PROGRAM_ID in your environment variables."
          }
        ],
        isError: true
      };
    }
    
    // Validate callback address if provided
    let callbackPubkey: PublicKey | undefined;
    if (args.callbackAddress) {
      try {
        callbackPubkey = new PublicKey(args.callbackAddress);
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Invalid callback address: ${args.callbackAddress}`
            }
          ],
          isError: true
        };
      }
    }
    
    // Submit the task to the Alice agent
    const { taskId, status, estimatedCompletionTime } = await submitAliceAgentTask(
      args.taskType,
      args.parameters,
      callbackPubkey
    );
    
    return {
      content: [
        {
          type: "text",
          text: `🕹️ Task submitted to Alice agent

Task ID: ${taskId}
Status: ${status}
${estimatedCompletionTime ? `Estimated completion: ${estimatedCompletionTime}` : ''}

You can check task status by submitting another task with type "CUSTOM" and parameter { "action": "CHECK_STATUS", "taskId": "${taskId}" }`
        }
      ]
    };
  } catch (error: any) {
    console.error("❌ Error submitting task to Alice agent:", error);
    
    return {
      content: [
        {
          type: "text",
          text: `Error submitting task to Alice agent: ${error.message || "Unknown error"}`
        }
      ],
      isError: true
    };
  }
};