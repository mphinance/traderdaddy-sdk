"""Cache tests — mirror @traderdaddy/sdk's cache tests in sdk.test.mjs.

Drives the async client via ``asyncio.run`` so it runs under plain ``pytest``.
"""

from __future__ import annotations

import asyncio
from typing import Any

from traderdaddy import DEFAULT_TTLS, ResponseCache, TraderDaddy


def _run(coro):
    return asyncio.run(coro)


class _CountingTransport:
    """Records how many times the transport is hit."""

    def __init__(self) -> None:
        self.calls = 0

    async def call_tool(self, name: str, args: dict[str, Any] | None = None) -> Any:
        self.calls += 1
        return {"n": self.calls}


def test_cache_serves_within_ttl_and_refetches_after_expiry():
    now = {"t": 0.0}
    cache = ResponseCache(now=lambda: now["t"])
    cache.set("get_market_stats", {}, {"v": 1})
    assert cache.get("get_market_stats", {}) == {"v": 1}
    now["t"] += DEFAULT_TTLS["get_market_stats"] + 1
    assert cache.get("get_market_stats", {}) is None


def test_client_cache_avoids_second_transport_call_within_ttl():
    now = {"t": 0.0}
    transport = _CountingTransport()
    td = TraderDaddy(transport=transport, cache={"now": lambda: now["t"]})

    first = _run(td.market_stats())
    second = _run(td.market_stats())
    assert first == second
    assert transport.calls == 1

    now["t"] += DEFAULT_TTLS["get_market_stats"] + 1
    _run(td.market_stats())
    assert transport.calls == 2


def test_cache_disabled_by_default():
    transport = _CountingTransport()
    td = TraderDaddy(transport=transport)
    _run(td.market_stats())
    _run(td.market_stats())
    assert transport.calls == 2


class _SlowTransport:
    """Delays so concurrent calls overlap in flight."""

    def __init__(self) -> None:
        self.calls = 0

    async def call_tool(self, name: str, args: dict[str, Any] | None = None) -> Any:
        self.calls += 1
        await asyncio.sleep(0.01)
        return {"n": self.calls}


def test_cache_single_flights_concurrent_calls():
    transport = _SlowTransport()
    td = TraderDaddy(transport=transport, cache=True)

    async def go():
        return await asyncio.gather(td.market_stats(), td.market_stats())

    a, b = _run(go())
    assert a == b
    assert transport.calls == 1


def test_cache_key_distinguishes_args():
    transport = _CountingTransport()
    td = TraderDaddy(transport=transport, cache=True)
    _run(td.put_call_ratios("SPY"))
    _run(td.put_call_ratios("QQQ"))
    _run(td.put_call_ratios("SPY"))
    # SPY served from cache on the third call; QQQ was a distinct key.
    assert transport.calls == 2
