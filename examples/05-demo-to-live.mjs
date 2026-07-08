/**
 * 05 — The demo→live switch (the funnel pattern)
 *
 * This is the single most important pattern in the family: default to keyless
 * demo mode, and light up live data the moment a real key is present. One flag,
 * same methods, same types. Turn on caching while you're at it so repeated
 * reads don't re-hit the API.
 *
 * Run without a key (demo):
 *   npm run build && node examples/05-demo-to-live.mjs
 * Run live (your own data):
 *   TD_API_KEY=td_live_... node examples/05-demo-to-live.mjs
 */
import { TraderDaddy } from '@traderdaddy/sdk';

const key = process.env.TD_API_KEY;

const td = new TraderDaddy({
  mock: !key, // ← demo unless a real key is present
  apiKey: key,
  cache: true, // per-tool TTL cache (mirrors DaddyBoard's poll cadence)
});

console.log(`\n  Running in ${td.mock ? 'DEMO (fixtures, no key)' : 'LIVE'} mode\n`);

const stats = await td.marketStats();
console.log(`  SPY sentiment: ${stats.spy_sentiment} (P/C ${stats.spy_put_call_ratio})`);
console.log(`  Largest trade: ${stats.largest_trade_symbol} ${stats.largest_trade_type} ` +
  `$${stats.largest_trade_premium.toLocaleString('en-US')}`);

// The cache means this second call returns instantly without another request.
const again = await td.marketStats();
console.log(`\n  Second call served from cache: ${again.timestamp === stats.timestamp}\n`);
