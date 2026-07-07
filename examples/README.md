# Examples

Small, runnable snippets — each one focuses on a single idea. They all run in
**keyless demo mode** (the built-in fixtures), so you can run any of them right
after cloning, no API key required.

## Setup

```bash
npm install
npm run build      # examples import the built package (@traderdaddy/sdk)
```

Then run any example:

```bash
node examples/01-flow-tape.mjs
```

## The examples

| File | Teaches | Try |
|---|---|---|
| [`01-flow-tape.mjs`](01-flow-tape.mjs) | The smart-money tape (`unusualActivity`) — the hero read | `node examples/01-flow-tape.mjs` |
| [`02-gamma-ladder.mjs`](02-gamma-ladder.mjs) | Gamma by strike (`gexTicker`), drawn as an ASCII ladder | `node examples/02-gamma-ladder.mjs NVDA` |
| [`03-market-hours-poll.mjs`](03-market-hours-poll.mjs) | `isMarketOpen()` / `getMarketPhase()` — poll only when open | `node examples/03-market-hours-poll.mjs` |
| [`04-iv-and-strategies.mjs`](04-iv-and-strategies.mjs) | Combining tools: `ivRank` + `strategyIdeas` | `node examples/04-iv-and-strategies.mjs TSLA` |
| [`05-demo-to-live.mjs`](05-demo-to-live.mjs) | The demo→live switch + caching — the funnel pattern | `node examples/05-demo-to-live.mjs` |
| [`06-backoff-and-errors.mjs`](06-backoff-and-errors.mjs) | Typed errors + automatic 429 backoff | `node examples/06-backoff-and-errors.mjs` |

## Going live

Every example defaults to demo data. To point one at your own account, give it a
key (only `05` reads it, but the pattern is the same everywhere):

```bash
TD_API_KEY=td_live_... node examples/05-demo-to-live.mjs
```

## Where to next

- [`../README.md`](../README.md) — full API reference.
- [`../docs/BUILDING-APPS.md`](../docs/BUILDING-APPS.md) — the playbook for building
  a whole app (DaddyLens, DaddyBot, …) on top of these primitives.
