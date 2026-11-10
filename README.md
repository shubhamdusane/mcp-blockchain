# mcp-blockchain

> An MCP server that exposes blockchain data as native tools for any AI agent.

[![MCP Compatible](https://img.shields.io/badge/MCP-Compatible-blue?style=flat)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Status: Early](https://img.shields.io/badge/Status-Early-orange)](https://github.com/shubhamdusane/mcp-blockchain)

**Status: early. Two tools work end to end. The rest are listed as planned — not built.**

---

## The Problem

AI agents can reason about financial data, but on-chain data sits behind bespoke integrations. Every agent framework ends up writing its own connector, and every model switch breaks it.

MCP standardizes the tool interface. This exposes blockchain reads through it.

## What It Does

`mcp-blockchain` is an [MCP server](https://modelcontextprotocol.io) exposing on-chain data as tools any MCP-compatible agent (Claude Code, Cursor, Gemini CLI) can call natively — the same way it would query a database.

## Tools

| Tool | Description | Status |
|------|-------------|--------|
| `get_wallet_balance(address, chain)` | Native token balance (ETH/MATIC) for a wallet | ✅ Working |
| `get_token_holdings(address, token_addresses, chain)` | ERC-20 balances for a given token list | ✅ Working |
| `get_transaction_history(address, limit)` | Recent transactions | 📋 Planned |
| `get_defi_pool_state(protocol, pool_id)` | TVL, APY, liquidity | 📋 Planned |
| `get_nft_holdings(address, chain)` | NFT inventory | 📋 Planned |
| `watch_contract_events(address, event_sig)` | Subscribe to on-chain events | 📋 Planned |

`get_token_holdings` requires an explicit list of ERC-20 contract addresses — there is no auto-discovery yet. That needs an indexer, which is why it isn't done.

## Supported Chains

Ethereum, Polygon, and Base. Each defaults to a public RPC and can be overridden by environment variable.

## Quick Start

Not yet published to npm — clone and run locally:

```bash
git clone https://github.com/shubhamdusane/mcp-blockchain.git
cd mcp-blockchain
npm ci
node server.js
```

Add to your MCP client config (e.g. `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "blockchain": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-blockchain/server.js"],
      "env": {
        "ETH_RPC_URL": "https://mainnet.infura.io/v3/YOUR_KEY"
      }
    }
  }
}
```

### Environment variables

| Variable | Default |
|----------|---------|
| `ETH_RPC_URL` | `https://eth.llamarpc.com` |
| `POLYGON_RPC_URL` | `https://polygon.llamarpc.com` |
| `BASE_RPC_URL` | `https://mainnet.base.org` |

Public RPCs are rate-limited. Use your own endpoint for anything beyond experimentation.

## Example

```
You: What's the ETH balance of 0x742d35Cc6634C0532925a3b8D4C9C4C7b7E6b7a?

Agent: [calls get_wallet_balance]
{
  "address": "0x742d35Cc6634C0532925a3b8D4C9C4C7b7E6b7a",
  "chain": "ethereum",
  "native_balance": { "formatted": "1.2470 ETH" }
}
```

## Architecture

```
mcp-blockchain/
├── tools/
│   ├── get_wallet_balance.js     # native balance
│   └── get_token_holdings.js     # ERC-20 balances
├── chains/
│   └── index.js                  # provider factory, RPC config, caching
├── server.js                     # MCP server entrypoint
├── package.json
└── LICENSE
```

Each tool exports a `tool` descriptor (name, description, JSON input schema) and an `execute` function. `server.js` registers them. Adding a tool means adding one file and one registration line.

## Status & limitations

- **Early (v0.1.0).** Two read-only tools. Not published to npm. Not audited.
- **Tests:** `npm test` runs 11 offline smoke checks (tool descriptors, schemas, chain factory, address validation). No test calls a live RPC, so on-chain behaviour is not covered by CI. CI runs `npm ci --ignore-scripts && npm test`.
- `get_token_holdings` needs an explicit token list; no auto-discovery.
- Default RPCs are public and rate-limited; the server trusts whatever RPC endpoint you configure. Do not point it at an endpoint you do not trust.
- Addresses passed to tools are sent to the configured RPC provider (privacy implication).

## Scope

Read-only by design. The code contains no signer, wallet, private key, mnemonic or transaction-sending calls: it uses an ethers `JsonRpcProvider` (`getBalance`) and `Contract` instances built with a provider and a view-only ABI (`balanceOf`, `decimals`, `symbol`). It reads no secrets from the environment, only RPC URLs. An agent using this cannot move funds through this server; it can only observe chain state.

## Good First Issues

- [ ] Add Arbitrum to the provider factory
- [ ] Add `get_gas_price()`
- [ ] ENS name resolution for addresses
- [ ] Test suite for the chain adapters
- [ ] Implement `get_transaction_history` (needs an indexer or explorer API)

## Contributing

PRs welcome. Keep tools single-purpose and read-only.

## Built By

[Shubham Dusane](https://linkedin.com/in/shubhamdusane) — blockchain engineer and AI product lead. 6 years across smart contracts and agent infrastructure.

## License

MIT — see [LICENSE](LICENSE).
