/**
 * mcp-blockchain — MCP Server entrypoint
 * Registers all blockchain tools for any MCP-compatible agent
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { tool as walletBalance, execute as execWalletBalance } from './tools/get_wallet_balance.js';
import { tool as tokenHoldings, execute as execTokenHoldings } from './tools/get_token_holdings.js';

const server = new McpServer({
  name: 'mcp-blockchain',
  version: '0.1.0',
});

// Register tools
server.tool(walletBalance.name, walletBalance.inputSchema, execWalletBalance);
server.tool(tokenHoldings.name, tokenHoldings.inputSchema, execTokenHoldings);

// TODO Week 2: add get_defi_pool_state, watch_contract_events

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('mcp-blockchain server running');
