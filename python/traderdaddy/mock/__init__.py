"""traderdaddy.mock — first-class keyless demo mode.

``MockTransport`` satisfies the same ``Transport`` interface the live
``HttpTransport`` does, resolving each tool call from a typed fixture instead of
the network. This is what lets ``TraderDaddy(mock=True)`` run with no API key.

The raw fixtures are re-exported for tests and screenshots::

    from traderdaddy.mock import fixtures
"""

from __future__ import annotations

import asyncio
import copy
from typing import Any

from . import fixtures as fixtures


class MockTransport:
    """A ``Transport`` that serves typed fixtures — no network, no API key."""

    def __init__(self, latency_ms: float = 0) -> None:
        self._latency_ms = latency_ms

    async def call_tool(self, name: str, args: dict[str, Any] | None = None) -> Any:
        fixture = getattr(fixtures, name, None)
        if fixture is None:
            raise ValueError(f"No mock fixture for tool: {name}")
        if self._latency_ms > 0:
            await asyncio.sleep(self._latency_ms / 1000)
        value = fixture(args or {}) if callable(fixture) else fixture
        # Deep-copy so callers can't mutate the shared fixture between calls.
        return copy.deepcopy(value)


__all__ = ["MockTransport", "fixtures"]
