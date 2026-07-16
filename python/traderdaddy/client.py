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

import asyncio
from typing import TYPE_CHECKING, Any, Optional

from . import types as t
from .backoff import with_backoff
from .cache import DEFAULT_TTLS, ResponseCache
from .errors import MissingApiKeyError
from .mock import MockTransport
from .transport import DEFAULT_BASE_URL, DEFAULT_TIMEOUT, HttpTransport, Transport

#: The tool names the SDK knows, used to gate caching.
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

        if self._cache is None:
            return await self._invoke(name, call_args)

        cached = self._cache.get(name, call_args)
        if cached is not None:
            return cached

        # Single-flight: fold concurrent identical calls into one request.
        pending = self._cache.get_inflight(name, call_args)
        if pending is not None:
            return await pending

        task = asyncio.ensure_future(self._invoke(name, call_args))
        self._cache.set_inflight(name, call_args, task)
        try:
            value = await task
        finally:
            self._cache.clear_inflight(name, call_args)

        # Only cache tools the SDK knows a TTL for (all 12 named tools).
        if name in _TOOL_NAMES:
            self._cache.set(name, call_args, value)
        return value

    async def _invoke(self, name: str, call_args: dict[str, Any]) -> Any:
        async def run() -> Any:
            return await self._transport.call_tool(name, call_args)

        if self._backoff:
            opts = self._backoff if isinstance(self._backoff, dict) else {}
            return await with_backoff(run, **opts)
        return await run()

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

    async def apex_levels(
        self, symbol: str, *, expiration: str | None = None
    ) -> t.ApexLevels:
        """Composite "magnet" ranking of option strikes — where price is most
        strongly pinned/attracted."""
        args: dict[str, Any] = {"symbol": symbol}
        if expiration is not None:
            args["expiration"] = expiration
        return await self.call_tool("get_apex_levels", args)

    async def politician_trades(
        self,
        *,
        tab: str | None = None,
        window: int | None = None,
        limit: int | None = None,
    ) -> t.PoliticianTrades:
        """Congressional stock-disclosure leaderboard ("Power Players")."""
        args: dict[str, Any] = {}
        if tab is not None:
            args["tab"] = tab
        if window is not None:
            args["window"] = window
        if limit is not None:
            args["limit"] = limit
        return await self.call_tool("get_politician_trades", args)

    async def politician_trades_by_ticker(
        self, ticker: str, *, days: int | None = None
    ) -> t.PoliticianTradesByTicker:
        """All disclosed congressional trades for a single ticker."""
        args: dict[str, Any] = {"ticker": ticker}
        if days is not None:
            args["days"] = days
        return await self.call_tool("get_politician_trades_by_ticker", args)

    async def institutional_activity(
        self, *, limit: int | None = None
    ) -> t.InstitutionalActivity:
        """Most actively-traded tickers by institutional options-flow volume
        (ex index ETFs / MAG7)."""
        args: dict[str, Any] = {}
        if limit is not None:
            args["limit"] = limit
        return await self.call_tool("get_institutional_activity", args)

    async def dividend_calendar(
        self,
        *,
        from_: str | None = None,
        days: int | None = None,
        limit: int | None = None,
    ) -> t.DividendCalendar:
        """Upcoming ex-dividend calendar across the optionable universe."""
        args: dict[str, Any] = {}
        if from_ is not None:
            args["from"] = from_
        if days is not None:
            args["days"] = days
        if limit is not None:
            args["limit"] = limit
        return await self.call_tool("get_dividend_calendar", args)

    async def long_term_quality(
        self,
        symbol: str | None = None,
        *,
        min_score: float | None = None,
        min_div_yield: float | None = None,
        sector: str | None = None,
        sort: str | None = None,
        limit: int | None = None,
    ) -> t.QualityList | t.QualitySingle:
        """Fundamental quality + dividend screener. Pass ``symbol`` for a
        single ticker, or omit it for a ranked list over the universe."""
        if symbol is not None:
            return await self.call_tool("get_long_term_quality", {"symbol": symbol})
        args: dict[str, Any] = {}
        if min_score is not None:
            args["minScore"] = min_score
        if min_div_yield is not None:
            args["minDivYield"] = min_div_yield
        if sector is not None:
            args["sector"] = sector
        if sort is not None:
            args["sort"] = sort
        if limit is not None:
            args["limit"] = limit
        return await self.call_tool("get_long_term_quality", args)

    async def ipo_scanner(
        self, view: str, **opts: Any
    ) -> t.IpoUpcoming | t.IpoRecent | t.IpoRadar | t.IpoTransitions:
        """IPO Scanner. ``view`` is one of ``upcoming``, ``recent``,
        ``radar``, ``transitions``; ``opts`` are view-specific filters."""
        args: dict[str, Any] = {"view": view}
        args.update({k: v for k, v in opts.items() if v is not None})
        return await self.call_tool("get_ipo_scanner", args)

    async def bounce_signals(
        self,
        *,
        direction: str | None = None,
        page: int | None = None,
        page_size: int | None = None,
    ) -> t.BounceSignals:
        """Bounce Finder screener: recently detected oversold-bounce /
        overbought-fade signals."""
        args: dict[str, Any] = {}
        if direction is not None:
            args["direction"] = direction
        if page is not None:
            args["page"] = page
        if page_size is not None:
            args["pageSize"] = page_size
        return await self.call_tool("get_bounce_signals", args)

    async def bounce_score(self, symbol: str) -> t.BounceScore:
        """On-demand oversold/overbought bounce composite score for a single
        ticker."""
        return await self.call_tool("get_bounce_score", {"symbol": symbol})

    async def conviction(
        self, symbol: str | None = None
    ) -> t.ConvictionMarket | t.ConvictionTicker:
        """Community Conviction gauge. Pass ``symbol`` for a per-ticker
        gauge, or omit it for the market-wide gauge + top-tickers leaderboard."""
        return await self.call_tool(
            "get_conviction", {"symbol": symbol} if symbol else {}
        )

    async def market_health(self) -> t.MarketHealth:
        """Market Health confluence: 7 macro-regime detectors blended into a
        composite risk score."""
        return await self.call_tool("get_market_health")

    async def hedge_analysis(
        self,
        symbol: str,
        shares: int,
        *,
        basis: float | None = None,
        atr: float | None = None,
        limit: int | None = None,
    ) -> t.HedgeAnalysis:
        """Ranked downside-protection structures (protective put, collar,
        put-spread collar, bear put spread) for a share position."""
        args: dict[str, Any] = {"symbol": symbol, "shares": shares}
        if basis is not None:
            args["basis"] = basis
        if atr is not None:
            args["atr"] = atr
        if limit is not None:
            args["limit"] = limit
        return await self.call_tool("get_hedge_analysis", args)

    # --- lifecycle ----------------------------------------------------------
    async def aclose(self) -> None:
        closer = getattr(self._transport, "aclose", None)
        if closer is not None:
            await closer()

    async def __aenter__(self) -> "TraderDaddy":
        return self

    async def __aexit__(self, *exc: object) -> None:
        await self.aclose()
