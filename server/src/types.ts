// OpenAI Types
export type GenerateImageArgs = {
  prompt: string;
  size?: string;
  quality?: string;
  style?: string;
};

export type GenerateImageResult = {
  imageBase64: string;
  revisedPrompt?: string;
};

// Solana Types
export type MintNftArgs = {
  imageBase64: string;
  name: string;
  description: string;
  symbol?: string;
  attributes?: Array<{ trait_type: string; value: string }>;
  useAliceToken?: boolean;
};

export type MintNftResult = {
  signature: string;
  mintAddress: string;
  explorerUrl: string;
};

// Alice Types
export type AliceTokenBalanceArgs = {
  walletAddress?: string;
};

export type AliceTokenBalanceResult = {
  balance: number;
  walletAddress: string;
};

export type AliceTokenTransferArgs = {
  recipient: string;
  amount: number;
  memo?: string;
};

export type AliceTokenTransferResult = {
  signature: string;
  source: string;
  destination: string;
  amount: number;
};

export type AliceAgentTaskArgs = {
  taskType: 'NFT_MONITOR' | 'TOKEN_SWAP' | 'SCHEDULED_TRANSACTION' | 'CUSTOM';
  parameters: Record<string, any>;
  callbackAddress?: string;
};

export type AliceAgentTaskResult = {
  taskId: string;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  estimatedCompletionTime?: string;
};

// MCP Response Types
export type SuccessResponse = {
  content: Array<{
    type: 'text' | 'image';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: false;
};

export type ErrorResponse = {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError: true;
};

export type MCPResponse = SuccessResponse | ErrorResponse;

// Handler Type
export type HandlerFunction<T, R> = (args: T) => Promise<MCPResponse>;