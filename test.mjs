/**
 * Offline smoke test — no network required.
 *
 * Verifies tool descriptors, input schemas, address validation, chain
 * factory behaviour and provider caching. Live RPC calls are deliberately
 * not tested here so the suite stays runnable in CI without an endpoint.
 *
 *   node test.mjs
 */

const assert = (cond, msg) => {
  if (!cond) { console.error(`FAIL: ${msg}`); process.exit(1); }
};

const wb = await import('./tools/get_wallet_balance.js');
const th = await import('./tools/get_token_holdings.js');
const ch = await import('./chains/index.js');

// -- tool descriptors -------------------------------------------------
assert(wb.tool.name === 'get_wallet_balance', 'wallet tool name');
assert(typeof wb.execute === 'function', 'wallet execute is a function');
assert(wb.tool.inputSchema.properties.address, 'wallet schema declares address');
assert(wb.tool.inputSchema.required.includes('address'), 'address is required');

assert(th.tool.name === 'get_token_holdings', 'holdings tool name');
assert(typeof th.execute === 'function', 'holdings execute is a function');
assert(th.tool.inputSchema.required.includes('token_addresses'), 'token_addresses required');

// -- chain factory ----------------------------------------------------
assert(
  JSON.stringify(ch.SUPPORTED_CHAINS) === '["ethereum","polygon","base"]',
  `supported chains, got ${ch.SUPPORTED_CHAINS}`
);

let threw = false;
try { ch.getProvider('dogecoin'); } catch (e) { threw = /Unsupported chain/.test(e.message); }
assert(threw, 'unsupported chain is rejected');

assert(ch.getProvider('ethereum') === ch.getProvider('ethereum'), 'providers are cached');

// -- input validation (no network reached) ----------------------------
let rejected = false;
try {
  await wb.execute({ address: 'not-an-address' });
} catch (e) {
  rejected = /Invalid address/.test(e.message);
}
assert(rejected, 'malformed address is rejected before any RPC call');

console.log('smoke test: PASS (11 checks)');
