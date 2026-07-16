"""cache.py — Optional in-memory TTL response cache, keyed by tool + args.

Port of @traderdaddy/sdk's cache.ts. Default TTLs mirror DaddyBoard's poll
cadence so a caller who flips caching on gets sensible per-tool freshness
without tuning. Live and mock transports share the same cache path.
"""

from __future__ import annotations

import json
import time
from typing import Any, Callable, Optional, Union

#: Default TTL per tool in ms — mirrors DaddyBoard's poll intervals.
DEFAULT_TTLS: dict[str, float] = {
    "get_unusual_activity": 30_000,
    "get_market_stats": 60_000,
    "get_put_call_ratios": 60_000,
    "get_gex_overview": 120_000,
    "get_sector_flow": 120_000,
    "get_iv_rank": 120_000,
    "get_strategy_ideas": 120_000,
    "get_edge_xray": 120_000,
    "get_gex_ticker": 120_000,
    "run_screener": 300_000,
    "get_earnings_flow": 30 * 60_000,
    "get_economic_calendar": 30 * 60_000,
    "get_apex_levels": 120_000,
    "get_politician_trades": 5 * 60_000,
    "get_politician_trades_by_ticker": 5 * 60_000,
    "get_institutional_activity": 60_000,
    "get_dividend_calendar": 30 * 60_000,
    "get_long_term_quality": 30 * 60_000,
    "get_ipo_scanner": 5 * 60_000,
    "get_bounce_signals": 60_000,
    "get_bounce_score": 15 * 60_000,
    "get_conviction": 60_000,
    "get_market_health": 5 * 60_000,
    "get_hedge_analysis": 60_000,
}

_FALLBACK_TTL = 120_000.0

#: A single TTL (ms) applied to every tool, or per-tool overrides.
TtlOption = Union[float, dict[str, float]]


class ResponseCache:
    """Per-tool TTL cache keyed by ``tool?sorted-args``.

    ``now`` is an injectable clock returning milliseconds (defaults to
    ``time.time() * 1000``), which keeps tests deterministic.
    """

    def __init__(
        self,
        *,
        ttl: Optional[TtlOption] = None,
        now: Optional[Callable[[], float]] = None,
    ) -> None:
        self._store: dict[str, tuple[Any, float]] = {}
        self._inflight: dict[str, Any] = {}
        self._now = now or (lambda: time.time() * 1000)

        if isinstance(ttl, (int, float)):
            self._ttl_for: Callable[[str], float] = lambda _tool: float(ttl)
        elif ttl:
            self._ttl_for = lambda tool: ttl.get(
                tool, DEFAULT_TTLS.get(tool, _FALLBACK_TTL)
            )
        else:
            self._ttl_for = lambda tool: DEFAULT_TTLS.get(tool, _FALLBACK_TTL)

    def _key(self, tool: str, args: dict[str, Any]) -> str:
        # Stable key: sort arg entries so order doesn't fragment the cache.
        sorted_args = "&".join(
            f"{k}={json.dumps(args[k], sort_keys=True)}" for k in sorted(args)
        )
        return f"{tool}?{sorted_args}"

    def get(self, tool: str, args: dict[str, Any]) -> Any:
        """Return the cached value, or ``None`` on miss/expiry."""
        key = self._key(tool, args)
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires = entry
        if expires <= self._now():
            del self._store[key]
            return None
        return value

    def set(self, tool: str, args: dict[str, Any], value: Any) -> None:
        self._store[self._key(tool, args)] = (value, self._now() + self._ttl_for(tool))

    def get_inflight(self, tool: str, args: dict[str, Any]) -> Any:
        """Single-flight: the in-flight awaitable for this key, if one is
        already running. Concurrent callers await it instead of firing a
        duplicate request.
        """
        return self._inflight.get(self._key(tool, args))

    def set_inflight(self, tool: str, args: dict[str, Any], task: Any) -> None:
        self._inflight[self._key(tool, args)] = task

    def clear_inflight(self, tool: str, args: dict[str, Any]) -> None:
        self._inflight.pop(self._key(tool, args), None)

    def clear(self) -> None:
        self._store.clear()
        self._inflight.clear()
