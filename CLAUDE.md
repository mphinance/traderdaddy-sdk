# CLAUDE.md — agent ground-truth for `@traderdaddy/sdk`

> Read this first. It's the short, factual map an AI agent needs to work in this
> repo (or to build a `daddy-*` app on top of it) without re-deriving the shape
> from scratch. Tool-agnostic — if you use Cursor/other, copy this to `AGENTS.md`.
>
> **Building a new app, not editing the SDK?** Jump to
> [`docs/PROMPTS.md`](docs/PROMPTS.md) for drop-in prompts, then
> [`docs/BUILDING-APPS.md`](docs/BUILDING-APPS.md) for the playbook.

## What this is

A typed, isomorphic TypeScript SDK for the public **TraderDaddy Pro** MCP API
(`POST /api/v1/mcp`, JSON-RPC 2.0). It's the shared client every `daddy-*`
open-source app is built on. One method per MCP tool, fully typed responses,
keyless demo mode. Zero runtime deps (`fetch` only). Runs in Node ≥18 and the
browser.

## The one pattern (the whole point of the family)

Every app = **this SDK + a thin shell**. The SDK owns transport, 429 backoff,
market-hours, caching, and fixtures. The shell only decides *how the data looks /
where it goes*. Two constructors, identical methods, identical types:

```ts
const td = new TraderDaddy({ mock: true });                    // keyless demo
const td = new TraderDaddy({ apiKey: process.env.TD_API_KEY }); // live
```

You build + screenshot against `mock: true`, then flip one flag to go live. That
demo→live switch is the funnel — downstream apps inherit it for free.

## Repo map

| Path | What |
|---|---|
| `src/client.ts` | `TraderDaddy` class — one method per tool. The public surface. |
| `src/transport.ts` | `HttpTransport` — the single POST/call to the MCP endpoint. |
| `src/backoff.ts` | `withBackoff` — 429 retry (4 attempts, base 2s, cap 60s, jitter). |
| `src/marketHours.ts` | `isMarketOpen()` / `getMarketPhase()` — US equity session logic. |
| `src/cache.ts` | `ResponseCache` — per-tool TTL cache (opt-in via `{ cache: true }`). |
| `src/errors.ts` | Error hierarchy, all extend `TraderDaddyError`. |
| `src/types.ts` | Response types for every tool. **The contract.** |
| `src/mock/fixtures.ts` | Realistic demo fixtures — must stay type-identical to live. |
| `src/index.ts` | Public barrel. Anything users import comes from here. |
| `examples/*.mjs` | Short runnable keyless snippets (import the *built* package). |
| `python/` | `traderdaddy` — the async Python mirror (published separately on PyPI). |
| `docs/BUILDING-APPS.md` | Per-app playbook (DaddyLens/Bot/Home/Embed). |
| `docs/PROMPTS.md` | Copy-paste prompts for vibe coders building apps. |

## Commands

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run build       # tsup → dual ESM + CJS + .d.ts in dist/
npm test            # node --test (RUN AFTER build — examples/tests import dist/)
```

`dist/` is gitignored and built locally. Examples and tests import the *built*
package, so `npm run build` before `npm test` or running any example.

## Conventions (match these)

- **One method per MCP tool.** New tool on the API → new method in `client.ts` +
  its type in `types.ts` + a fixture in `mock/fixtures.ts`. Keep all three in sync.
- **No `any`.** Open-ended string fields use the `Enum | (string & {})` pattern so
  known values autocomplete without rejecting new ones the API may add.
- **Fixtures are a contract, not decoration.** A `mock: true` response must satisfy
  the exact same type as live. If you change a type, update the fixture.
- **Zero runtime deps.** Don't add dependencies to the SDK. `fetch` only.
- **Isomorphic.** No Node-only APIs in `src/` (no `fs`, no `process` beyond the
  documented env reads). It has to run in a browser unchanged.
- **The Python mirror tracks the TS SDK 1:1.** If you change a method signature,
  a type, or a fixture here, mirror it in `python/`.

## Gotchas

- **Key safety is per-app, and it's the one rule that bites.** A `td_live_` key is
  a secret. Personal-use/self-host (user supplies their own key locally) is fine.
  A **public** page/extension must NEVER ship a `td_live_` key — needs a server
  proxy or a domain-scoped publishable key (a backend decision that doesn't exist
  yet). DaddyEmbed is blocked on exactly this. See the table in `docs/BUILDING-APPS.md`.
- **`callTool(name, args)`** is the escape hatch for a tool newer than this SDK
  version. Prefer adding a typed method over leaning on it.
- **Fast-poll only when `isMarketOpen()`.** Don't hammer the endpoint overnight.
- **Build before test.** The single most common mistake here.

## Where to look when unsure

- Full API reference + options → [`README.md`](README.md)
- How to build an app on the SDK → [`docs/BUILDING-APPS.md`](docs/BUILDING-APPS.md)
- Prompts to hand a vibe coder → [`docs/PROMPTS.md`](docs/PROMPTS.md)
- A working full consumer → [DaddyBoard](https://github.com/mphinance/daddyboard)
- The thinnest consumer → [DaddyBot](https://github.com/mphinance/daddybot)
