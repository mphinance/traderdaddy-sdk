"""Mock-mode tests — no network, no API key.

Each test drives the async client via ``asyncio.run`` so it runs under plain
``pytest`` without an asyncio plugin.
"""

from __future__ import annotations

import asyncio

import pytest

from traderdaddy import MissingApiKeyError, TraderDaddy
from traderdaddy.mock import MockTransport, fixtures


def _run(coro):
    return asyncio.run(coro)


def test_missing_api_key_raises():
    with pytest.raises(MissingApiKeyError):
        TraderDaddy()


def test_market_stats():
    td = TraderDaddy(mock=True)
    data = _run(td.market_stats())
    assert data["spy_sentiment"] == "Bullish"
    assert data["largest_trade_symbol"] == "NVDA260710C00185000"


def test_unusual_activity_shape_and_aggregates():
    td = TraderDaddy(mock=True)
    data = _run(td.unusual_activity(limit=10))
    assert data["total"] == len(data["data"])
    # Aggregate premium equals the sum of the rows.
    assert data["aggregates"]["totalPremium"] == sum(r["premium"] for r in data["data"])
    # The demo tape includes at least one LEGENDARY print (drives the binary_sensor).
    assert any(r["tier"] == "LEGENDARY" for r in data["data"])


def test_gex_overview_market_summary():
    td = TraderDaddy(mock=True)
    data = _run(td.gex_overview())
    assert data["marketSummary"]["bias"] == "LONG_GAMMA"
    assert "SPY" in data


def test_gex_ticker_is_callable_fixture():
    td = TraderDaddy(mock=True)
    data = _run(td.gex_ticker("QQQ"))
    assert data["symbol"] == "QQQ"
    assert data["proxy"] == {"symbol": "NQ", "scaleFactor": 0.24}


def test_iv_rank_uses_symbol_arg():
    td = TraderDaddy(mock=True)
    data = _run(td.iv_rank("NVDA"))
    assert data["symbol"] == "NVDA"
    assert 0 <= data["ivRank"] <= 100


def test_put_call_ratios_default_and_ticker():
    td = TraderDaddy(mock=True)
    assert _run(td.put_call_ratios())["ticker"] == "SPY"
    assert _run(td.put_call_ratios("QQQ"))["ticker"] == "QQQ"


def test_sector_flow_macro():
    td = TraderDaddy(mock=True)
    data = _run(td.sector_flow())
    assert data["macro"]["dominantSector"] == "Technology"


def test_deepcopy_isolation():
    """Mutating one result must not bleed into the next call."""
    td = TraderDaddy(mock=True)
    first = _run(td.market_stats())
    first["spy_sentiment"] = "MUTATED"
    second = _run(td.market_stats())
    assert second["spy_sentiment"] == "Bullish"


def test_unknown_fixture_raises():
    tp = MockTransport()
    with pytest.raises(ValueError):
        _run(tp.call_tool("get_nonexistent_tool"))


def test_fixtures_module_exports():
    assert fixtures.get_market_stats["tradingDate"] == "2026-07-07"
