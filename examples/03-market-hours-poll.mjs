/**
 * 03 — Poll only while the market is open
 *
 * The pattern every always-on app in the family uses: fast-poll during the
 * regular session, go quiet otherwise. `isMarketOpen()` / `getMarketPhase()`
 * are exported standalone so you don't need a client to use them, and they're
 * timezone-independent (they compute ET internally).
 *
 * Run:
 *   npm run build && node examples/03-market-hours-poll.mjs
 */
import { TraderDaddy, getMarketPhase, isMarketOpen } from '@traderdaddy/sdk';

// 1) The phase right now.
const phase = getMarketPhase();
console.log(`\n  Market is ${phase.label} (phase: ${phase.phase})`);
console.log(`  Next change: ${phase.nextChangeAt}\n`);

// 2) How the phase looks across a trading day (fixed sample timestamps in ET).
console.log('  Phase across a sample weekday (2026-07-07, a Tuesday):');
for (const [utc, note] of [
  ['2026-07-07T12:00:00Z', '08:00 ET'],
  ['2026-07-07T14:30:00Z', '10:30 ET'],
  ['2026-07-07T21:30:00Z', '17:30 ET'],
  ['2026-07-08T02:00:00Z', '22:00 ET'],
]) {
  const p = getMarketPhase(new Date(utc));
  console.log(`    ${note.padEnd(9)} → ${p.phase}${p.isOpen ? ' (open)' : ''}`);
}

// 3) The guard itself. A real daemon runs this on setInterval forever; here we
//    take three ticks a second apart and then exit so the example terminates.
const td = new TraderDaddy({ mock: true });
console.log('\n  Three poll ticks (only fetches when open):');
for (let i = 0; i < 3; i++) {
  if (isMarketOpen()) {
    const stats = await td.marketStats();
    console.log(`    tick ${i + 1}: fetched — SPY sentiment ${stats.spy_sentiment}`);
  } else {
    console.log(`    tick ${i + 1}: market closed — skipping fetch, serving last values`);
  }
  await new Promise((r) => setTimeout(r, 1000));
}
console.log();
