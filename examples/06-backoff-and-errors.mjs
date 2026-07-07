/**
 * 06 — Backoff and typed errors
 *
 * Two things the SDK handles so your app doesn't have to:
 *   1. Errors are a typed hierarchy — narrow with `instanceof`.
 *   2. Rate limits (HTTP 429 / JSON-RPC -32000) are retried automatically with
 *      exponential backoff. You rarely see a RateLimitError escape.
 *
 * We demonstrate both without touching the network: a custom `transport` that
 * fails twice with a RateLimitError, then succeeds — exactly what a throttled
 * endpoint looks like.
 *
 * Run:
 *   npm run build && node examples/06-backoff-and-errors.mjs
 */
import { TraderDaddy, RateLimitError, MissingApiKeyError } from '@traderdaddy/sdk';

// 1) Typed errors. Live mode with no key throws a specific, catchable error.
try {
  new TraderDaddy(); // no key, not mock
} catch (err) {
  if (err instanceof MissingApiKeyError) {
    console.log('\n  Caught MissingApiKeyError (as expected in live mode with no key).');
  } else {
    throw err;
  }
}

// 2) Automatic 429 backoff. Inject a flaky transport to simulate throttling.
let attempts = 0;
const flakyTransport = {
  async callTool(name) {
    attempts++;
    if (attempts < 3) throw new RateLimitError(`429 on attempt ${attempts}`);
    return { recoveredOn: attempts, tool: name };
  },
};

const td = new TraderDaddy({
  transport: flakyTransport,
  // Short delays so the example runs fast; production defaults are 2s→60s.
  backoff: {
    baseMs: 20,
    jitterMs: 0,
    onRetry: ({ attempt, delayMs }) =>
      console.log(`  429 received — backing off ${delayMs}ms then retry #${attempt}`),
  },
});

console.log('\n  Calling a throttled endpoint...');
const result = await td.marketStats();
console.log(`  Recovered after ${result.recoveredOn} attempts.\n`);
