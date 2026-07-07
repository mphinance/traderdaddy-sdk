/**
 * Smoke + behaviour tests against the built package (dist/).
 * Run with `npm test` (which builds first via the pretest chain is not set —
 * CI/`npm run build` should precede, or run `npm run build && npm test`).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  TraderDaddy,
  MissingApiKeyError,
  RateLimitError,
  withBackoff,
  backoffDelayMs,
  getMarketPhase,
  isMarketOpen,
  ResponseCache,
  DEFAULT_TTLS,
} from '../dist/index.js';
import { MockTransport, fixtures } from '../dist/mock.js';

test('mock mode needs no api key and returns typed fixtures', async () => {
  const td = new TraderDaddy({ mock: true });
  assert.equal(td.mock, true);

  const flow = await td.unusualActivity();
  assert.equal(flow.data.length, 12);
  assert.equal(flow.aggregates.topTicker, 'NVDA');

  const stats = await td.marketStats();
  assert.equal(stats.largestTrade.ticker, 'NVDA');

  const gex = await td.gexTicker('QQQ');
  assert.equal(gex.symbol, 'QQQ');
  assert.deepEqual(gex.proxy, { symbol: 'NQ', scaleFactor: 0.24 });

  const setups = await td.runScreener('csp-wheel');
  assert.equal(setups.screener.id, 'csp-wheel');
  assert.ok(setups.tickers.includes('META'));

  const iv = await td.ivRank('TSLA');
  assert.equal(iv.symbol, 'TSLA');
  assert.equal(iv.interpretation, 'rich');
});

test('live mode without an api key throws MissingApiKeyError', () => {
  assert.throws(() => new TraderDaddy(), MissingApiKeyError);
});

test('mock transport deep-clones so callers cannot mutate shared fixtures', async () => {
  const t = new MockTransport();
  const a = await t.callTool('get_market_stats');
  a.sentimentScore = -999;
  const b = await t.callTool('get_market_stats');
  assert.equal(b.sentimentScore, fixtures.get_market_stats.sentimentScore);
  assert.notEqual(b.sentimentScore, -999);
});

test('withBackoff retries on RateLimitError then succeeds', async () => {
  let calls = 0;
  const delays = [];
  const result = await withBackoff(
    async () => {
      calls++;
      if (calls < 3) throw new RateLimitError('429');
      return 'ok';
    },
    { retries: 5, sleep: async (ms) => { delays.push(ms); } },
  );
  assert.equal(result, 'ok');
  assert.equal(calls, 3);
  assert.equal(delays.length, 2);
});

test('withBackoff gives up after `retries` and rethrows', async () => {
  let calls = 0;
  await assert.rejects(
    withBackoff(
      async () => { calls++; throw new RateLimitError('429'); },
      { retries: 2, sleep: async () => {} },
    ),
    RateLimitError,
  );
  assert.equal(calls, 3); // initial + 2 retries
});

test('withBackoff does not retry non-rate-limit errors', async () => {
  let calls = 0;
  await assert.rejects(
    withBackoff(async () => { calls++; throw new Error('boom'); }, { retries: 5, sleep: async () => {} }),
    /boom/,
  );
  assert.equal(calls, 1);
});

test('backoffDelayMs grows and respects the cap', () => {
  const d0 = backoffDelayMs(0, { jitterMs: 0 });
  const d1 = backoffDelayMs(1, { jitterMs: 0 });
  const dBig = backoffDelayMs(20, { jitterMs: 0 });
  assert.equal(d0, 2000);
  assert.equal(d1, 4000);
  assert.equal(dBig, 60000); // capped
});

test('cache serves within TTL and refetches after expiry', async () => {
  let now = 0;
  const cache = new ResponseCache({ now: () => now });
  cache.set('get_market_stats', {}, { v: 1 });
  assert.deepEqual(cache.get('get_market_stats', {}), { v: 1 });
  now += DEFAULT_TTLS.get_market_stats + 1;
  assert.equal(cache.get('get_market_stats', {}), undefined);
});

test('client cache avoids a second transport call within TTL', async () => {
  let now = 0;
  let calls = 0;
  const transport = {
    async callTool() { calls++; return { n: calls }; },
  };
  const td = new TraderDaddy({ transport, cache: { now: () => now } });
  const first = await td.marketStats();
  const second = await td.marketStats();
  assert.deepEqual(first, second);
  assert.equal(calls, 1);
  now += DEFAULT_TTLS.get_market_stats + 1;
  await td.marketStats();
  assert.equal(calls, 2);
});

test('cache single-flights concurrent identical calls', async () => {
  let calls = 0;
  const transport = {
    async callTool() {
      calls++;
      await new Promise((r) => setTimeout(r, 10));
      return { n: calls };
    },
  };
  const td = new TraderDaddy({ transport, cache: true });
  const [a, b] = await Promise.all([td.marketStats(), td.marketStats()]);
  assert.deepEqual(a, b);
  assert.equal(calls, 1);
});

test('getMarketPhase classifies a known open weekday time', () => {
  // 2026-07-07 is a Tuesday. 14:30 UTC == 10:30 ET → open.
  const p = getMarketPhase(new Date('2026-07-07T14:30:00Z'));
  assert.equal(p.phase, 'open');
  assert.equal(p.isOpen, true);
  assert.equal(isMarketOpen(new Date('2026-07-07T14:30:00Z')), true);
});

test('getMarketPhase flags weekends and holidays as closed', () => {
  // 2026-07-04 is a Saturday.
  assert.equal(getMarketPhase(new Date('2026-07-04T15:00:00Z')).phase, 'weekend');
  // 2026-12-25 is Christmas (holiday) — 15:00 UTC == 10:00 ET.
  assert.equal(getMarketPhase(new Date('2026-12-25T15:00:00Z')).phase, 'holiday');
});

test('getMarketPhase distinguishes premarket and afterhours', () => {
  // 12:00 UTC == 08:00 ET (premarket) on a weekday.
  assert.equal(getMarketPhase(new Date('2026-07-07T12:00:00Z')).phase, 'premarket');
  // 22:00 UTC == 18:00 ET (afterhours).
  assert.equal(getMarketPhase(new Date('2026-07-07T22:00:00Z')).phase, 'afterhours');
});
