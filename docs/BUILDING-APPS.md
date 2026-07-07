# Building on `@traderdaddy/sdk` — the `daddy-*` app playbook

You don't need to understand the transport, the rate-limit backoff, or the
market-hours math to build a new app. The SDK owns all of that. **Every app in
the family is the same shape:**

```
@traderdaddy/sdk  (the data — you never touch this again)
        +
   a thin shell   (the only part you write: how the data looks / where it goes)
```

DaddyBoard is that pattern's first proof: a Node daemon + a vanilla web shell.
DaddyLens, DaddyBot, DaddyHome, and DaddyEmbed are the same SDK with a different
shell. This guide shows the one pattern, then gives a per-app playbook.

---

## The two lines that matter

Everything starts from one object. Demo mode needs **no key**:

```ts
import { TraderDaddy } from "@traderdaddy/sdk";

const td = new TraderDaddy({ mock: true });                 // keyless demo
const td = new TraderDaddy({ apiKey: process.env.TD_API_KEY }); // live
```

Both expose the **same methods returning the same types**, so you build and
screenshot against `mock: true`, then flip one flag to go live. That's the whole
"spread without a key, convert on go-live" funnel — you get it for free.

The methods (one per data panel — see the [README](../README.md#methods) for the full table):

```ts
await td.marketStats();            // market vitals
await td.unusualActivity();        // the smart-money flow tape
await td.gexTicker("SPY");         // gamma ladder for a ticker
await td.ivRank("NVDA");           // IV rank / percentile
await td.runScreener("csp-wheel"); // a named screener's setups
await td.sectorFlow();             // sector rotation
// …12 tools total
```

---

## Build a new app in 4 steps

### 1. Scaffold

```bash
mkdir daddy-yourapp && cd daddy-yourapp
npm init -y
npm install @traderdaddy/sdk
```

### 2. Write a tiny data layer (the only SDK code you write)

Wrap the client once so the rest of your app never imports the SDK directly.
This is where you decide mock-vs-live and turn caching on:

```ts
// src/data.ts
import { TraderDaddy, isMarketOpen } from "@traderdaddy/sdk";

export const td = new TraderDaddy({
  // Demo unless a real key is present — the funnel default.
  mock: !process.env.TD_API_KEY,
  apiKey: process.env.TD_API_KEY,
  cache: true,     // per-tool TTL cache (mirrors DaddyBoard's cadence)
  backoff: true,   // auto-retry on 429 — on by default
});

export { isMarketOpen };
```

### 3. Build your shell

Your shell only ever calls the data layer. It never knows whether the data came
from the network or a fixture:

```ts
import { td, isMarketOpen } from "./data.js";

async function refresh() {
  const flow = await td.unusualActivity({ limit: 10 });
  render(flow.data);                 // <- your presentation, whatever it is
}

// Only fast-poll while the market is open — the SDK exports this for you.
setInterval(() => { if (isMarketOpen()) refresh(); }, 30_000);
```

### 4. Ship demo-first

Build, screenshot, and publish in demo mode. Real users add their own
`TD_API_KEY` to go live. Done.

---

## The one rule that changes per app: key safety

A `td_live_` key is a **secret**. Where the shell runs decides how you handle it:

| Where your shell runs | Pattern | Key handling |
|---|---|---|
| A device the user controls (Pi, their laptop, their server) | **Personal-use / self-host** | User's key in a local file / env var. Ships in the client. ✅ |
| A public webpage or a distributed extension | **Public embed** | ❌ **Never ship the key.** Requires a server-side proxy or a domain-scoped publishable key. |

DaddyBoard and DaddyLens are personal-use. DaddyEmbed is public — see its
playbook below. When in doubt: **if a stranger can view-source or unzip your app
and read the key, you're in the public-embed case.**

---

## Per-app playbooks

Each is "the 4 steps above" with a specific shell. Pick the one you're building.

### DaddyLens — browser overlay / extension

A lightweight in-browser read of the flow, on top of a broker or charting site.

- **Runs in:** the browser. The SDK is isomorphic, so `new TraderDaddy(...)`
  works client-side unchanged.
- **Key safety:** **personal-use** — the user installs it and pastes *their own*
  key into the extension's options page. That key stays in the extension's local
  storage, on their machine. Fine. (A *public* embed on someone else's site is a
  different app — that's DaddyEmbed.)
- **Data layer:** read the key from extension storage instead of `process.env`:
  ```ts
  const { tdKey } = await chrome.storage.local.get("tdKey");
  export const td = new TraderDaddy({ mock: !tdKey, apiKey: tdKey, cache: true });
  ```
- **Shell:** a content script / popup that renders a compact `unusualActivity()`
  tape and `ivRank()` for the ticker the user is viewing.
- **Start in demo:** ship the extension defaulting to `mock: true` so it works
  the moment it's installed, with a "Go live" field in options.

### DaddyBot — chat / Discord / Slack bot

Answers "what's the flow on NVDA?" in a chat channel.

- **Runs in:** a Node process you host (server, Railway, a Pi). **Personal-use**
  key safety — the key lives in the host's env, never in a message.
- **Data layer:** exactly the step-2 scaffold. Turn `cache: true` on — many users
  asking the same question shouldn't each hit the API.
- **Shell:** map a slash command to an SDK method and format the reply:
  ```ts
  // /flow NVDA
  const ua = await td.unusualActivity({ ticker: symbol, limit: 5 });
  reply(ua.data.map(r => `${r.ticker} ${r.type} $${r.premium.toLocaleString()} — ${r.tier}`).join("\n"));
  ```
- **Rate limits:** the SDK backs off on 429 automatically; with `cache: true`
  you'll rarely hit it. If you fan out many symbols at once, call them in small
  batches rather than all at once (DaddyBoard caps 2 in-flight on boot for the
  same reason).

### DaddyHome — Home Assistant integration

Surfaces market state as Home Assistant sensors (e.g. flash a light on a
LEGENDARY print).

- **Language note:** Home Assistant is **Python**, and the Python SDK
  (`traderdaddy` on PyPI) is a **fast-follow that isn't published yet.** Until it
  lands you have two interim options:
  1. **Node sidecar** — run a tiny Node service using this SDK that exposes the
     data over local HTTP, and have the HA integration read that. (This is
     literally DaddyBoard's `/api/state` shape — you could reuse it.)
  2. **Call the endpoint directly** from Python (`POST /api/v1/mcp`, JSON-RPC,
     the same auth headers) — but that re-implements what the SDK exists to
     prevent, so prefer option 1 or wait for the PyPI port.
- **Key safety:** personal-use — the key sits in the HA server's config.
- **Recommendation:** don't start DaddyHome until the Python SDK ships, unless
  you're happy running the Node sidecar. Flag it to whoever owns the PyPI port.

### DaddyEmbed — public embed for someone else's site

A widget a blogger drops onto their page. **This is the one that's different.**

- **Key safety:** **public embed** — you **cannot** ship a `td_live_` key in the
  page. Two supported routes:
  1. **Server-side proxy** — you host an endpoint that holds the key and forwards
     requests; the embed calls *your* endpoint, not TraderDaddy directly. The SDK
     helps here too: run it in your proxy (Node) with the real key.
  2. **Domain-scoped publishable key** (e.g. a `td_pub_` key) — this is a
     **backend product decision that doesn't exist yet.** It needs to be built on
     the API side before DaddyEmbed can ship publicly.
- **Action:** DaddyEmbed is blocked on a backend decision. Build it in `mock: true`
  as a demo now, but **don't ship it live** until the proxy or publishable-key
  story exists. Raise it before you start.

---

## Shipping checklist for any new app

- [ ] Depends on `@traderdaddy/sdk` — no re-implemented transport/backoff/market-hours.
- [ ] Data layer wraps `TraderDaddy` in one place; the shell never imports the SDK directly.
- [ ] Works in `mock: true` with no key (build + screenshot in demo).
- [ ] A single flag/env var flips it to live.
- [ ] Key safety matched to where it runs (personal-use vs public-embed table above).
- [ ] `cache: true` if the same data is read repeatedly.
- [ ] Fast-polls only while `isMarketOpen()`.

---

## Quick reference

| Need | Use |
|---|---|
| Keyless demo | `new TraderDaddy({ mock: true })` |
| Live | `new TraderDaddy({ apiKey })` |
| Auto-cache repeated reads | `{ cache: true }` |
| Manual backoff around any call | `import { withBackoff }` |
| "Is the market open?" | `import { isMarketOpen }` |
| Raw fixtures for tests/screenshots | `import { fixtures } from "@traderdaddy/sdk/mock"` |
| A tool the SDK doesn't have a method for yet | `td.callTool("tool_name", args)` |

The reference consumer is always [DaddyBoard](https://github.com/mphinance/daddyboard) —
when a pattern here is unclear, that's the working example.
