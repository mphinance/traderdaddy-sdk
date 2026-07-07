/**
 * 04 — Combining tools: IV rank → strategy ideas
 *
 * Most useful reads combine a couple of tools. Here IV rank tells you whether
 * premium is rich or cheap, and strategy ideas gives ranked structures that fit
 * — the SDK just returns typed data; the "story" is you stitching them.
 *
 * Run (pass a symbol, defaults to NVDA):
 *   npm run build && node examples/04-iv-and-strategies.mjs TSLA
 */
import { TraderDaddy } from '@traderdaddy/sdk';

const td = new TraderDaddy({ mock: true });
const symbol = (process.argv[2] ?? 'NVDA').toUpperCase();

const [iv, ideas] = await Promise.all([td.ivRank(symbol), td.strategyIdeas(symbol)]);

console.log(`\n  ${symbol} — IV rank ${iv.ivRank} (${iv.interpretation})`);
console.log(`  ${iv.note}\n`);

console.log(`  Strategy ideas (${ideas.direction}):`);
for (const s of ideas.structures) {
  const risk = '$' + s.capitalAtRisk.toLocaleString('en-US');
  const pop = Math.round(s.pop * 100);
  console.log(
    `    #${s.rank} ${s.archetype.padEnd(16)} score ${s.score}  ` +
      `POP ${pop}%  risk ${risk}  (${s.dte}DTE)`,
  );
}
console.log();
