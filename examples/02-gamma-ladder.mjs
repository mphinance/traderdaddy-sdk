/**
 * 02 — Gamma-exposure ladder for a ticker
 *
 * `get_gex_ticker` returns net gamma by strike. Here we draw it as a quick
 * ASCII bar ladder so you can see the shape and the flip point at a glance —
 * the same data DaddyBoard's gamma panel renders.
 *
 * Run (pass a symbol, defaults to NVDA):
 *   npm run build && node examples/02-gamma-ladder.mjs SPY
 */
import { TraderDaddy } from '@traderdaddy/sdk';

const td = new TraderDaddy({ mock: true });

const symbol = (process.argv[2] ?? 'NVDA').toUpperCase();
const gex = await td.gexTicker(symbol);

console.log(
  `\n  ${gex.symbol} gamma exposure — bias ${gex.bias}, flip point ${gex.flipPoint}\n`,
);

const maxAbs = Math.max(...gex.byStrike.map((s) => Math.abs(s.netGex)), 1);
for (const s of gex.byStrike) {
  const width = Math.max(1, Math.round((Math.abs(s.netGex) / maxAbs) * 24));
  const bar = (s.netGex >= 0 ? '█' : '░').repeat(width);
  const spot = s.isAboveSpot ? '' : '  ◄ near spot';
  console.log(`  ${String(s.strike).padStart(5)}  ${bar}${spot}`);
}
console.log('\n  █ positive net gamma   ░ negative net gamma\n');
