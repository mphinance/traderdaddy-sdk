"""traderdaddy — typed async Python SDK for the TraderDaddy Pro MCP API.

The Python mirror of ``@traderdaddy/sdk``. Same tool surface, same shapes, same
keyless demo mode::

    from traderdaddy import TraderDaddy, is_market_open

    async with TraderDaddy(api_key="td_live_...") as td:   # live
        stats = await td.market_stats()

    demo = TraderDaddy(mock=True)                          # keyless demo
    flow = await demo.unusual_activity()
"""

from __future__ import annotations

from .backoff import backoff_delay_ms, with_backoff
from .client import TraderDaddy
from .errors import (
    HttpError,
    JsonRpcError,
    MissingApiKeyError,
    NetworkError,
    RateLimitError,
    TimeoutError,
    TraderDaddyError,
)
from .market_hours import MarketPhase, get_market_phase, is_market_open
from .transport import DEFAULT_BASE_URL, HttpTransport, Transport

__version__ = "0.1.0"

__all__ = [
    "TraderDaddy",
    "is_market_open",
    "get_market_phase",
    "MarketPhase",
    "with_backoff",
    "backoff_delay_ms",
    "HttpTransport",
    "Transport",
    "DEFAULT_BASE_URL",
    "TraderDaddyError",
    "MissingApiKeyError",
    "RateLimitError",
    "TimeoutError",
    "NetworkError",
    "HttpError",
    "JsonRpcError",
    "__version__",
]
