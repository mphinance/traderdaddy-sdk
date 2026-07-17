# Docs

Everything beyond the [SDK reference](../README.md) itself.

## Building on the SDK

| Doc | What |
|---|---|
| [BUILDING-APPS.md](BUILDING-APPS.md) | The one pattern — SDK + a thin shell — plus a per-app playbook (DaddyLens, DaddyBot, DaddyHome, DaddyEmbed). |
| [PROMPTS.md](PROMPTS.md) | Copy-paste prompts for building an app with Claude Code / Cursor, demo-first. |

## Connecting a broker — the execution layer

TraderDaddy Pro is the **intelligence layer**: screeners, options flow, technicals. It
deliberately doesn't place trades. To execute, you pair it with a broker MCP server —
the hands — and let Claude bridge the two.

- **[ECOSYSTEM.md](ECOSYSTEM.md)** — how the two layers fit together, with the flow
  diagram. Start here.
- **[awesome-broker-mcp](https://github.com/mphinance/awesome-broker-mcp)** — the
  broker directory itself. Which brokers have an MCP server, official vs. community,
  what each can actually trade, and who has no route at all (confirmed, not assumed).

> The broker research used to live in this repo under `docs/brokers/`. It outgrew being
> an appendix to an SDK — it's now its own list, so it can be found by people who aren't
> already here. Same pages, same verification discipline, better address.
