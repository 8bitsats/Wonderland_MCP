// Map tool names to handler functions
export const handlers = {
  "openai_generate_image": generateImageHandler,
  "solana_mint_nft": mintNftHandler,
  "alice_token_balance": async ({ address }) => ({
    content: [{ type: "text", text: `Balance for ${address}: (stubbed)` }]
  }),
  "alice_agent_task": async ({ task }) => ({
    content: [{ type: "text", text: `Task submitted to Alice agent: ${task} (stubbed)` }]
  }),
  "alice_token_transfer": async ({ from, to, amount }) => ({
    content: [{ type: "text", text: `Transferred ${amount} $ALICE from ${from} to ${to} (stubbed)` }]
  })
}; 