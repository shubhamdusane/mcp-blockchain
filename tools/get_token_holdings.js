/**
 * MCP Tool: get_token_holdings
 * Called by: server.js (MCP server entrypoint)
 * Returns ERC-20 token holdings for a wallet
 */

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export const tool = {
  name: 'get_token_holdings',
  description: 'Get ERC-20 token holdings for a wallet address',
  inputSchema: {
    type: 'object',
    properties: {
      address: { type: 'string', description: 'Wallet address (0x...)' },
      token_addresses: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of ERC-20 contract addresses to check',
      },
      chain: {
        type: 'string',
        enum: ['ethereum', 'polygon', 'base'],
        default: 'ethereum',
      },
    },
    required: ['address', 'token_addresses'],
  },
};

export async function execute({ address, token_addresses, chain = 'ethereum' }) {
  const { ethers } = await import('ethers');
  const { getProvider } = await import('../chains/index.js');
  const provider = getProvider(chain);
  const holdings = [];

  for (const tokenAddr of token_addresses) {
    try {
      const contract = new ethers.Contract(tokenAddr, ERC20_ABI, provider);
      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol(),
      ]);
      if (Number(balance) > 0) {
        const formatted = (Number(balance) / Math.pow(10, Number(decimals))).toFixed(4);
        holdings.push({ token_address: tokenAddr, symbol, balance_formatted: `${formatted} ${symbol}` });
      }
    } catch { /* skip non-ERC20 */ }
  }

  return { address, chain, holdings };
}
