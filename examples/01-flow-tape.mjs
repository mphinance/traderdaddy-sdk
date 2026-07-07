/**
 * 01 — The smart-money flow tape
 *
 * DaddyBoard's hero panel in ~20 lines: the live feed of large, aggressive
 * options prints, sorted by premium. This is `get_unusual_activity`.
 *
 * Run (no API key needed — uses the built-in demo fixtures):
 *   npm run build && node examples/01-flow-tape.mjs
 */
import { TraderDaddy } from '@traderdaddy/sdk';

const td = new TraderDaddy({ mock: true });

const flow = await td.unusualActivity({ limit: 10 });

const usd = (n) => '$' + n.toLocaleString('en-US');

console.log(`\n  Unusual options activity — top ${flow.data.length} by premium\n`);
for (const row of flow.data) {
  const arrow = row.sentiment === 'Bullish' ? '▲' : row.sentiment === 'Bearish' ? '▼' : '•';
  console.log(
    `  ${arrow} ${row.ticker.padEnd(6)} ${row.type.padEnd(4)} ` +
      `${usd(row.premium).padStart(12)}  ${row.tier.padEnd(10)} score ${row.score}`,
  );
}

const { totalPremium, bullishCount, bearishCount } = flow.aggregates;
console.log(
  `\n  Aggregate: ${usd(totalPremium)} total premium — ` +
    `${bullishCount} bullish / ${bearishCount} bearish\n`,
);
