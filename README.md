# @traderdaddy/sdk

> Typed, isomorphic SDK for the public **TraderDaddy Pro** MCP API — the shared
> client that powers the `daddy-*` open-source family (DaddyBoard, DaddyLens,
> DaddyBot, …).

Part of the [TraderDaddy Pro](https://traderdaddy.pro) open-source family, alongside
[DaddyBoard](https://github.com/mphinance/daddyboard) (the wall display).

**Building another app in the family?** Start with the step-by-step
[app playbook](docs/BUILDING-APPS.md) — the one pattern (SDK + a thin shell) plus
a per-app guide for DaddyLens, DaddyBot, DaddyHome, and DaddyEmbed.

- **Isomorphic** — runs in Node ≥18 **and** the browser. `fetch` only, zero runtime deps.
- **Typed everywhere** — one method per tool, fully-typed responses, no `any`.
- **Keyless demo mode** — `{ mock: true }` serves realistic fixtures with *identical types* to live.
- **Battle-tested internals** — the transport, 429 backoff, and market-hours logic are
  lifted straight from DaddyBoard, which already runs them against the live endpoint.

---

## Install

```bash
npm install @traderdaddy/sdk
```

## Quickstart

```ts
import { TraderDaddy } from "@traderdaddy/sdk";

const td = new TraderDaddy({ apiKey: process.env.TD_API_KEY }); // "td_live_..."

const flow    = await td.unusualActivity();      // typed rows
const gex      = await td.gexTicker("SPY");
const ivrank   = await td.ivRank("NVDA");
const setups   = await td.runScreener("csp-wheel");
```

### Demo mode — no key required

Same API, same types, realistic fixtures, no network:

```ts
import { TraderDaddy } from "@traderdaddy/sdk";

const demo = new TraderDaddy({ mock: true });
const flow = await demo.unusualActivity();   // fixtures, fully typed
```

This is the mechanism that lets every downstream app inherit keyless demo mode
for free — flip `mock: true` and the SDK swaps the network transport for typed
fixtures. The raw fixtures are also exported for tests and screenshots:

```ts
import { fixtures, MockTransport } from "@traderdaddy/sdk/mock";
```

---

## Options

```ts
new TraderDaddy({
  apiKey:    "td_live_...",   // required unless mock:true
  baseUrl:   "https://api.traderdaddy.pro",  // default
  mock:      false,           // keyless demo fixtures
  cache:     false,           // true → per-tool TTL cache (mirrors DaddyBoard cadence)
  backoff:   true,            // 429 retry: 4 attempts, base 2s, cap 60s, jitter
  timeoutMs: 45_000,          // per-request timeout (live)
  fetch:     undefined,       // inject a fetch impl for non-standard runtimes
});
```

`cache` and `backoff` also accept an options object to tune them
(`{ ttl }`, `{ retries, baseMs, capMs }`); pass `false` to disable.

## Methods

Each maps to one MCP tool and returns its typed response.

| Method | Tool |
|---|---|
| `marketStats()` | `get_market_stats` |
| `unusualActivity({ ticker?, direction?, minPremium?, limit? })` | `get_unusual_activity` |
| `putCallRatios(ticker = "SPY")` | `get_put_call_ratios` |
| `gexOverview()` | `get_gex_overview` |
| `gexTicker(symbol)` | `get_gex_ticker` |
| `sectorFlow(window = "today")` | `get_sector_flow` |
| `ivRank(symbol?)` | `get_iv_rank` |
| `runScreener(screener, { limit? })` | `run_screener` |
| `strategyIdeas(symbol?)` | `get_strategy_ideas` |
| `edgeXray(symbol?)` | `get_edge_xray` |
| `earningsFlow({ days = 7 })` | `get_earnings_flow` |
| `economicCalendar()` | `get_economic_calendar` |

`callTool(name, args)` is a generic escape hatch for tools added to the API
before this SDK version knows about them.

## Helpers

Exported standalone for the apps that don't need the full client:

```ts
import { isMarketOpen, getMarketPhase, withBackoff } from "@traderdaddy/sdk";

if (isMarketOpen()) { /* fast-poll */ }
getMarketPhase();  // { phase: "open", isOpen: true, label, nextChangeAt }
await withBackoff(() => td.marketStats());  // manual 429 backoff around any call
```

## Errors

All errors extend `TraderDaddyError`, so you can narrow with `instanceof`:

- `RateLimitError` — HTTP 429 or JSON-RPC `-32000`. What `withBackoff` retries on.
- `HttpError` (`.status`) — other non-2xx responses.
- `JsonRpcError` (`.code`) — a JSON-RPC-level error.
- `MissingApiKeyError` — live mode requested without a key.

---

## Public API reference

- **Origin:** `https://api.traderdaddy.pro`
- **Endpoint:** `POST /api/v1/mcp` — JSON-RPC 2.0, stateless StreamableHTTP
  (a bare `tools/call` is accepted; no `initialize` handshake, one POST per call).
- **Auth:** your own key, sent as **both** `X-API-Key: td_live_…` and
  `Authorization: Bearer td_live_…`. Inherits the `has_api_access` gate, the
  per-key rate limit, and usage logging.

## ⚠️ Browser key-safety

The SDK runs in the browser, but **a `td_live_` key must never be shipped inside
a public webpage or a distributed extension.** Two supported patterns:

1. **Personal-use / self-host** — the user supplies their own key locally
   (DaddyBoard and DaddyLens work this way). Fine.
2. **Public embed** — requires a server-side proxy or a domain-scoped
   publishable key. Don't put a `td_live_` key in anything you distribute.

---

## Development

```bash
npm install
npm run typecheck      # tsc --noEmit
npm run build          # tsup → dual ESM + CJS + .d.ts in dist/
npm test               # node --test (run after build)
```

The internals are ported from DaddyBoard's `src/` — `mcpClient` → `transport`,
`poller`'s backoff → `withBackoff`, `marketHours` → `isMarketOpen`, and the mock
fixtures → `@traderdaddy/sdk/mock`. See [DaddyBoard](https://github.com/mphinance/daddyboard)
for the reference consumer.

## License

MIT
