# traderdaddy (Python)

> Typed **async** Python SDK for the public **TraderDaddy Pro** MCP API — the
> Python mirror of [`@traderdaddy/sdk`](../README.md).

Part of the [TraderDaddy Pro](https://traderdaddy.pro) open-source family. This
is the SDK [DaddyHome](https://github.com/mphinance/daddyhome)'s Home Assistant
integration depends on.

- **Async, isomorphic-in-spirit** — one `httpx` dependency; inject your own
  `AsyncClient` (e.g. Home Assistant's) or let the SDK manage one.
- **Typed everywhere** — one method per tool, `TypedDict` responses, `py.typed`.
- **Keyless demo mode** — `TraderDaddy(mock=True)` serves realistic fixtures
  with the *same shapes* as live. Same funnel the TS SDK gives every app.
- **Behaviour ported 1:1** — transport, 429 backoff, and market-hours logic
  mirror `@traderdaddy/sdk`.

## Install

```bash
pip install traderdaddy
```

## Quickstart

```python
import asyncio
from traderdaddy import TraderDaddy

async def main():
    async with TraderDaddy(api_key="td_live_...") as td:   # live
        stats = await td.market_stats()
        gex   = await td.gex_ticker("SPY")
        ivr   = await td.iv_rank("NVDA")

asyncio.run(main())
```

### Demo mode — no key required

```python
demo = TraderDaddy(mock=True)
flow = await demo.unusual_activity()   # typed fixtures, no network
```

### Home Assistant note

Pass HA's shared client so the SDK doesn't spin up its own:

```python
td = TraderDaddy(api_key=key, client=async_get_clientsession(hass))  # httpx client
```

## Methods

Each maps to one MCP tool and returns its typed response.

| Method | Tool |
|---|---|
| `market_stats()` | `get_market_stats` |
| `unusual_activity(*, ticker=None, direction=None, min_premium=None, limit=25)` | `get_unusual_activity` |
| `put_call_ratios(ticker="SPY")` | `get_put_call_ratios` |
| `gex_overview()` | `get_gex_overview` |
| `gex_ticker(symbol)` | `get_gex_ticker` |
| `sector_flow(window="today")` | `get_sector_flow` |
| `iv_rank(symbol=None)` | `get_iv_rank` |
| `run_screener(screener, *, limit=None)` | `run_screener` |
| `strategy_ideas(symbol=None)` | `get_strategy_ideas` |
| `edge_xray(symbol=None)` | `get_edge_xray` |
| `earnings_flow(*, days=7)` | `get_earnings_flow` |
| `economic_calendar()` | `get_economic_calendar` |

`call_tool(name, args)` is the generic escape hatch.

## Helpers

```python
from traderdaddy import is_market_open, get_market_phase, with_backoff

if is_market_open():
    ...
get_market_phase()  # MarketPhase(phase, is_open, label, next_change_at)
```

## Status

**v0.1.0.** All 12 methods work live, and `mock=True` serves a typed fixture for
every one of them — build against the demo, flip to live with a key. A per-tool
TTL cache (the TS SDK's `cache: true`) is a planned fast-follow; Home Assistant's
coordinator handles cadence in the meantime.

## Development

```bash
pip install -e ".[dev]"
pytest
```

## License

MIT
