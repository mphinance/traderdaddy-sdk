"""client.py — The async ``TraderDaddy`` class: one typed method per MCP tool.

Wraps a ``Transport`` (live ``HttpTransport`` or ``MockTransport``) with 429
backoff. Every method returns the tool's typed response. ``call_tool()`` is the
generic escape hatch for tools added to the API before this SDK knows them.

Usage::

    async with TraderDaddy(api_key="td_live_...") as td:
        stats = await td.market_stats()

    demo = TraderDaddy(mock=True)          # keyless demo, identical types
    flow = await demo.unusual_activity()
"""

from __future__ import annotations

from typing import TYPE_CHECKING, Any, Optional

from . import types as t
from .backoff import with_backoff
from .cache import DEFAULT_TTLS, ResponseCache
from .errors import MissingApiKeyError
from .mock import MockTransport
from .transport import DEFAULT_BASE_URL, DEFAULT_TIMEOUT, HttpTransport, Transport

#: The 12 tool names the SDK knows, used to gate caching.
_TOOL_NAMES = frozenset(DEFAULT_TTLS)

if TYPE_CHECKING:  # pragma: no cover
    import httpx


class TraderDaddy:
    """Typed async client for the TraderDaddy Pro MCP API."""

    def __init__(
        self,
        *,
        api_key: str | None = None,
        base_url: str = DEFAULT_BASE_URL,
        mock: bool = False,
        cache: bool | ResponseCache | dict[str, Any] = False,
        backoff: bool | dict[str, Any] = True,
        timeout: float = DEFAULT_TIMEOUT,
        client: "Optional[httpx.AsyncClient]" = None,
        transport: Transport | None = None,
    ) -> None:
        self.mock = mock

        if transport is not None:
            self._transport: Transport = transport
        elif mock:
            self._transport = MockTransport()
        else:
            if not api_key:
                raise MissingApiKeyError()
            self._transport = HttpTransport(
                api_key=api_key, base_url=base_url, timeout=timeout, client=client
            )

        if cache is True:
            self._cache: ResponseCache | None = ResponseCache()
        elif isinstance(cache, ResponseCache):
            self._cache = cache
        elif cache:
            self._cache = ResponseCache(**cache)
        else:
            self._cache = None

        self._backoff = backoff

    # --- core ---------------------------------------------------------------
    async def call_tool(self, name: str, args: dict[str, Any] | None = None) -> Any:
        """Call any tool by name with backoff (and optional cache) applied.

        Prefer the named methods below.
        """
        call_args = args or {}

        if self._cache is not None:
            cached = self._cache.get(name, call_args)
            if cached is not None:
                return cached

        async def run() -> Any:
            return await self._transport.call_tool(name, call_args)

        if self._backoff:
            opts = self._backoff if isinstance(self._backoff, dict) else {}
            value = await with_backoff(run, **opts)
        else:
            value = await run()

        # Only cache tools the SDK knows a TTL for (all 12 named tools).
        if self._cache is not None and name in _TOOL_NAMES:
            self._cache.set(name, call_args, value)
        return value

    # --- one method per tool ------------------------------------------------
    async def market_stats(self) -> t.MarketStats:
        """Market-wide vitals: put/call ratios, sentiment, dominant flow."""
        return await self.call_tool("get_market_stats")

    async def unusual_activity(
        self,
        *,
        ticker: str | None = None,
        direction: str | None = None,
        min_premium: float | None = None,
        limit: int = 25,
    ) -> t.UnusualActivity:
        """The smart-money feed: large, aggressive options prints."""
        args: dict[str, Any] = {"limit": limit}
        if ticker is not None:
            args["ticker"] = ticker
        if direction is not None:
            args["direction"] = direction
        if min_premium is not None:
            args["minPremium"] = min_premium
        return await self.call_tool("get_unusual_activity", args)

    async def put_call_ratios(self, ticker: str = "SPY") -> t.PutCallRatios:
        """Put/call ratios for a ticker (default SPY)."""
        return await self.call_tool("get_put_call_ratios", {"ticker": ticker})

    async def gex_overview(self) -> t.GexOverview:
        """Gamma-exposure roll-up across the major indices."""
        return await self.call_tool("get_gex_overview")

    async def gex_ticker(self, symbol: str) -> t.GexTicker:
        """Gamma-exposure ladder for a single ticker."""
        return await self.call_tool("get_gex_ticker", {"symbol": symbol})

    async def sector_flow(self, window: str = "today") -> t.SectorFlow:
        """Sector-rotation flow. ``window`` defaults to ``today``."""
        return await self.call_tool("get_sector_flow", {"window": window})

    async def iv_rank(self, symbol: str | None = None) -> t.IvRank:
        """IV rank / percentile for a ticker (omit to let the API pick)."""
        return await self.call_tool("get_iv_rank", {"symbol": symbol} if symbol else {})

    async def run_screener(
        self, screener: str, *, limit: int | None = None
    ) -> t.ScreenerResult:
        """Run a named screener (e.g. ``csp-wheel``)."""
        args: dict[str, Any] = {"screener": screener}
        if limit is not None:
            args["limit"] = limit
        return await self.call_tool("run_screener", args)

    async def strategy_ideas(self, symbol: str | None = None) -> t.StrategyIdeas:
        """Ranked options-strategy ideas for a ticker."""
        return await self.call_tool(
            "get_strategy_ideas", {"symbol": symbol} if symbol else {}
        )

    async def edge_xray(self, symbol: str | None = None) -> t.EdgeXray:
        """Per-contract fair-value X-ray (rich/cheap residuals) for a ticker."""
        return await self.call_tool("get_edge_xray", {"symbol": symbol} if symbol else {})

    async def earnings_flow(self, *, days: int = 7) -> t.EarningsFlow:
        """Pre-earnings options flow for the upcoming window."""
        return await self.call_tool("get_earnings_flow", {"days": days})

    async def economic_calendar(self) -> t.EconomicCalendar:
        """Upcoming macroeconomic calendar."""
        return await self.call_tool("get_economic_calendar")

    # --- lifecycle ----------------------------------------------------------
    async def aclose(self) -> None:
        closer = getattr(self._transport, "aclose", None)
        if closer is not None:
            await closer()

    async def __aenter__(self) -> "TraderDaddy":
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.aclose()
