# traderdaddy-sdk

> Typed SDK for the public **TraderDaddy Pro** MCP API — the shared client that
> powers the `daddy-*` open-source family (DaddyBoard, DaddyLens, DaddyBot, …).

**Status:** 🚧 Spec only — not built yet. This README is the build brief.

Part of the [TraderDaddy Pro](https://traderdaddy.pro) open-source family, alongside
[DaddyBoard](https://github.com/mphinance/daddyboard) (the wall display).

---

## Why this exists

Every companion app in the family talks to the same read-only endpoint
(`POST /api/v1/mcp`) with a customer's own `td_live_` key. DaddyBoard already
re-implemented that client by hand. Rather than copy it into every new project,
this package **extracts DaddyBoard's proven client into one typed, published
library** so every downstream tool is "SDK + a thin shell."

Funnel role: an official SDK signals the public API is real, its npm/PyPI pages
are evergreen SEO, and — critically — it ships **demo-mode fixtures as a
first-class export**, so every downstream project inherits keyless demo mode for
free (the mechanism that lets the whole family spread without a key, then
convert on "go live").

## Scope

- **`@traderdaddy/sdk` (TypeScript, isomorphic)** — v1. Runs in Node **and** the
  browser (this is what makes DaddyLens and DaddyEmbed cheap).
- **`traderdaddy` (Python)** — fast-follow. Unlocks the Home Assistant
  integration (DaddyHome) and the notebook/quant crowd.

## What to extract from DaddyBoard

DaddyBoard already contains the hard parts — lift these into the SDK:

| From DaddyBoard (`src/`) | Becomes in the SDK |
|---|---|
| `mcpClient` (JSON-RPC over `POST /api/v1/mcp`) | `Transport` — isomorphic `fetch` client |
| `poller` (429 backoff, caching, market-hours schedule) | `withBackoff()` + `isMarketOpen()` helpers |
| mock fixtures (demo mode) | `@traderdaddy/sdk/mock` — first-class demo export |
| per-panel response shapes | shared TypeScript response types |

## Public API surface (endpoint reference)

- **Origin:** `https://api.traderdaddy.pro`
- **Endpoint:** `POST /api/v1/mcp` — JSON-RPC 2.0 (`tools/list`, `tools/call`)
- **Auth:** the customer's own key, either `X-API-Key: td_live_…` **or**
  `Authorization: Bearer td_live_…`. Inherits the `has_api_access` gate +
  per-key rate limit + usage logging.
- **Tools** (each a method on the SDK):
  `get_market_stats`, `get_unusual_activity`, `get_put_call_ratios`,
  `get_gex_overview`, `get_gex_ticker`, `get_sector_flow`, `get_iv_rank`,
  `run_screener`, `get_strategy_ideas`, `get_edge_xray`, `get_earnings_flow`,
  `get_economic_calendar`.

## Proposed shape

```ts
import { TraderDaddy } from "@traderdaddy/sdk";

const td = new TraderDaddy({ apiKey: process.env.TD_API_KEY });   // or { mock: true }

const flow   = await td.unusualActivity();          // typed rows
const gex     = await td.gexTicker("SPY");
const ivrank  = await td.ivRank();
const setups  = await td.runScreener("csp-wheel");

// Demo mode — no key required, same types:
import { TraderDaddy } from "@traderdaddy/sdk";
const demo = new TraderDaddy({ mock: true });
```

Design rules:
- Isomorphic — no Node-only deps in the core (`fetch` only).
- Built-in 429 backoff + optional response cache (TTL per tool).
- `{ mock: true }` returns fixtures with identical types to live.
- Typed everywhere — no `any`. Types generated/mirrored from the MCP responses.

## ⚠️ Browser key-safety note (matters for DaddyLens & DaddyEmbed)

The SDK runs in the browser, but **a `td_live_` key must never be shipped inside
a public webpage or a distributed extension.** Two supported patterns:

1. **Personal-use / self-host** — the user supplies their own key locally
   (DaddyBoard and DaddyLens work this way). Fine.
2. **Public embed** (DaddyEmbed on someone else's blog) — requires either a
   server-side proxy or a new **domain-scoped publishable key** (`td_pub_`?).
   That's a backend product decision; flag it before DaddyEmbed ships publicly.

The SDK should make pattern (1) trivial and document (2) loudly.

## Build milestones

1. Scaffold `@traderdaddy/sdk` (TS, tsup/tsc dual ESM+CJS, zero runtime deps).
2. Port `Transport` + auth (both header styles) from DaddyBoard's `mcpClient`.
3. Port backoff + market-hours helpers.
4. Type every tool response; expose one method per tool.
5. `@traderdaddy/sdk/mock` demo export from DaddyBoard fixtures.
6. README with copy-paste quickstart; publish to npm.
7. (Fast-follow) mirror as `traderdaddy` on PyPI for DaddyHome.

## Picking this up in a new session

Start here: clone [DaddyBoard](https://github.com/mphinance/daddyboard), read
`src/mcpClient*`, `src/poller*`, and the mock fixtures — those are the source of
truth for request framing, backoff, and demo data. Then scaffold this package and
port them. **This is the foundation for the rest of the family — build it first.**
