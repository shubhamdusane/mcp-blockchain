/**
 * MCP Tool: get_wallet_balance
 * Called by: server.js (MCP server entrypoint)
 * Returns ETH + native balance for a wallet address on supported chains
 */

import { ethers } from 'ethers';
import { getProvider } from '../chains/index.js';

export const tool = {
  name: 'get_wallet_balance',
  description: 'Get the native token balance (ETH/MATIC) for a blockchain wallet address',
  inputSchema: {
    type: 'object',
    properties: {
      address: {
        type: 'string',
        description: 'Wallet address (0x...)',
      },
      chain: {
        type: 'string',
        enum: ['ethereum', 'polygon', 'base'],
        description: 'Blockchain network (default: ethereum)',
        default: 'ethereum',
      },
    },
    required: ['address'],
  },
};

export async function execute({ address, chain = 'ethereum' }) {
  if (!ethers.isAddress(address)) {
    throw new Error(`Invalid address: ${address}`);
  }

  const provider = getProvider(chain);
  const balanceWei = await provider.getBalance(address);
  const balanceFormatted = ethers.formatEther(balanceWei);
  const symbol = chain === 'polygon' ? 'MATIC' : 'ETH';

  return {
    address,
    chain,
    native_balance: {
      raw: balanceWei.toString(),
      formatted: `${parseFloat(balanceFormatted).toFixed(4)} ${symbol}`,
    },
  };
}
