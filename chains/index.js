/**
 * Chain provider factory
 * Called by: all tools in tools/
 */

import { ethers } from 'ethers';

const RPC_URLS = {
  ethereum: process.env.ETH_RPC_URL || 'https://eth.llamarpc.com',
  polygon:  process.env.POLYGON_RPC_URL || 'https://polygon.llamarpc.com',
  base:     process.env.BASE_RPC_URL || 'https://mainnet.base.org',
};

const providers = {};

export function getProvider(chain = 'ethereum') {
  if (!RPC_URLS[chain]) throw new Error(`Unsupported chain: ${chain}`);
  if (!providers[chain]) {
    providers[chain] = new ethers.JsonRpcProvider(RPC_URLS[chain]);
  }
  return providers[chain];
}

export const SUPPORTED_CHAINS = Object.keys(RPC_URLS);
