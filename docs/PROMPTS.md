# Prompt pack — build a `daddy-*` app by talking to your AI

You don't need to be a TypeScript expert to build on this SDK. Pick a prompt
below, paste it into your AI coding tool (Claude Code, Cursor, Windsurf, …), and
follow along. Every prompt is written so the AI does the right thing: **install
the SDK, build in keyless demo mode first, and only wire in a real key at the
end.**

> **How to use one:** copy the whole block (including the checklist), paste it as
> your first message in an empty folder, and let the AI drive. Answer its
> questions. When it stops, run what it tells you to.

---

## 0. The universal starter (any idea)

Use this when you have an idea that isn't one of the named apps below. Fill in the
one bracket.

```
I'm a beginner and I want to build a small app on top of the @traderdaddy/sdk
npm package. It's a typed client for options-flow / market data with a built-in
keyless "demo mode".

My idea: [describe it in one sentence — e.g. "a webpage that shows today's
biggest options trades as a scrolling ticker"].

Please:
1. Read the SDK's docs first: its README, docs/BUILDING-APPS.md, and the
   examples/ folder. Follow the "SDK + a thin shell" pattern it describes.
2. Scaffold the project and `npm install @traderdaddy/sdk`.
3. Put ALL SDK usage in one file (src/data.ts) that starts in demo mode:
   `new TraderDaddy({ mock: !process.env.TD_API_KEY, apiKey: process.env.TD_API_KEY, cache: true })`.
   My shell code should import from that file, never from the SDK directly.
4. Build the smallest thing that works in demo mode (no API key), so I can see it
   run immediately.
5. Only after it works in demo, show me exactly how to add my own TD_API_KEY to
   go live.

Before you write code, tell me the plan and which SDK methods you'll use. Ask me
anything you're unsure about instead of guessing.
```

---

## 1. A web dashboard / page

```
Build me a single-page web app (plain HTML/JS or Vite — your call, keep it
simple) that displays live market data using the @traderdaddy/sdk package.

Read the SDK README and docs/BUILDING-APPS.md first. Use the "SDK + thin shell"
pattern. Start everything in keyless demo mode (`new TraderDaddy({ mock: true })`)
so it runs with no API key.

Panels I want:
- A "smart money" flow tape from `unusualActivity()` (ticker, CALL/PUT, premium, tier).
- A market vitals bar from `marketStats()` (overall sentiment, put/call ratios).
- A gamma ladder for one ticker from `gexTicker("SPY")`.

Refresh on an interval, but ONLY when `isMarketOpen()` returns true (import it
from the SDK). Colour flow rows by their `tierColor` field.

Build it demo-first so I can open it in a browser right now. Then tell me how to
plug in my own key. IMPORTANT: never hard-code a td_live_ key into the page —
explain why and what my options are (the SDK docs have a key-safety section).
```

---

## 2. A Discord / Slack bot

```
Build me a self-hosted chat bot (Discord with discord.js, or Slack — ask me
which) on top of @traderdaddy/sdk. There's already a reference: the "DaddyBot"
repo — mirror its shape.

Read the SDK's docs/BUILDING-APPS.md "DaddyBot" section first. Put all SDK usage
in one src/data.ts with `cache: true` so repeated questions don't spam the API.

Commands I want:
- /flow <ticker>  → `unusualActivity({ ticker, limit: 5 })`, one line per print.
- /vitals         → `marketStats()` summary.
- /gex <ticker>   → `gexTicker(ticker)`.
- /iv <ticker>    → `ivRank(ticker)`.

Start in demo mode so I can test replies with NO API key and NO bot token wired
to real data. Add an offline "smoke test" script I can run to see the formatted
output without connecting to Discord. Only at the end, walk me through adding the
bot token and my TD_API_KEY as environment variables (never in code).
```

---

## 3. A browser extension (annotate tickers on any page)

```
Build me a Manifest V3 browser extension (like the "DaddyLens" app) that finds
$TICKER symbols on whatever webpage I'm viewing and shows a small popup with
options flow for that ticker, using @traderdaddy/sdk.

Read docs/BUILDING-APPS.md "DaddyLens" section first — the SDK is isomorphic so it
runs in the browser unchanged. Key safety: this is the PERSONAL-USE pattern — the
user pastes THEIR OWN key into the extension's options page and it's read from
`chrome.storage.local`, never bundled. Default to demo mode (`mock: true`) so it
works the second it's installed, with a "Go live" field in options.

Show me how to load the unpacked extension in Chrome to test it in demo mode.
```

---

## 4. Polish your own app (self-review)

Paste this **inside** an app you (or the AI) already built.

```
Review this app against the @traderdaddy/sdk best-practices and improve it. Read
the SDK's CLAUDE.md and docs/BUILDING-APPS.md, then check my app against the
"Shipping checklist" at the bottom of BUILDING-APPS.md:

- [ ] All SDK usage is in ONE data-layer file; the rest of the app never imports the SDK directly.
- [ ] It works in `mock: true` with no key.
- [ ] A single flag/env var flips it to live.
- [ ] Key safety matches where it runs (personal-use vs public-embed) — no td_live_ key in anything public.
- [ ] `cache: true` where the same data is read repeatedly.
- [ ] It only fast-polls while `isMarketOpen()`.
- [ ] It uses the SDK's typed methods (not raw fetch / not re-implementing backoff or market-hours).

Tell me each thing that's wrong BEFORE changing it, then fix them one at a time.
Don't add features I didn't ask for.
```

---

## 5. Contribute back — make the SDK / family better

The whole `daddy-*` family is open source. If you hit a rough edge, fix it for
everyone. Paste this **inside a clone of the repo you want to improve** (the SDK
itself, or any `daddy-*` app).

```
I want to contribute a change to this open-source repo and open a pull request.
I'm a beginner — walk me through it carefully and don't skip the checks.

1. Read CLAUDE.md first (the agent ground-truth) and match its conventions
   exactly. Do NOT add runtime dependencies, do NOT use `any`, keep it isomorphic.
2. Here's what I want to change: [pick one —
     - "fix this bug: <describe it>"
     - "add a method for a new MCP tool called <tool_name>"
     - "improve the demo fixtures for <tool>"
     - "improve the docs / a prompt in docs/PROMPTS.md"].
3. If it touches a tool, remember the SDK's rule: one method per tool, kept in
   sync across THREE places — src/client.ts (the method), src/types.ts (the
   response type), and src/mock/fixtures.ts (a demo fixture with the identical
   type). If you change any, update all three. Then mirror the same change in the
   Python SDK under python/ (it tracks the TS SDK 1:1).
4. Before we call it done, run the checks and fix anything red:
     npm run typecheck && npm run build && npm test
   (build BEFORE test — the tests import the built package, this trips everyone up).
5. Then help me commit with a clear message and open the PR against `main` on
   GitHub, summarising what changed and why.

Explain each step as you go so I learn the repo. Show me the plan before editing.
```

---

## 6. "Explain this to me like I'm new"

Not a build prompt — a learning one. Great before you start.

```
I'm new to this. Read the @traderdaddy/sdk README and examples/ folder, then
explain to me in plain language:
1. What each of the SDK's methods returns, with a one-line real-world example.
2. What "demo mode" (mock: true) is and why I'd build with it first.
3. The one key-safety rule and how to not screw it up.
Keep it short. Assume I know a little JavaScript but nothing about options trading.
```

---

## Tips for getting good results

- **Always let it build in demo mode first.** If your AI jumps straight to needing
  an API key, tell it: *"start in `mock: true`, no key."*
- **Ask for the plan before the code.** "Tell me the plan and which methods you'll
  use first" catches wrong turns cheaply.
- **One data file.** If the AI scatters `new TraderDaddy(...)` across the app, tell
  it to consolidate into `src/data.ts`. That's the pattern the whole family uses.
- **Never paste a `td_live_` key into anything public.** If your app is a website
  or an extension other people install, read the key-safety section of
  [`BUILDING-APPS.md`](BUILDING-APPS.md) before going live.
- **Stuck?** Point your AI at the two reference apps:
  [DaddyBoard](https://github.com/mphinance/daddyboard) (full) and
  [DaddyBot](https://github.com/mphinance/daddybot) (thinnest).
