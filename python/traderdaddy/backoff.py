"""backoff.py — Exponential backoff with jitter for rate-limited calls.

Port of @traderdaddy/sdk's backoff.ts (base 2s, cap 60s, +1s jitter). Retries
only on ``RateLimitError``; any other error propagates on the first throw.
"""

from __future__ import annotations

import asyncio
import random
from typing import Awaitable, Callable, Optional, TypeVar

from .errors import RateLimitError

T = TypeVar("T")

RetryCallback = Callable[[int, float, RateLimitError], None]
Sleep = Callable[[float], Awaitable[None]]


def backoff_delay_ms(
    attempt: int,
    *,
    base_ms: float = 2_000,
    cap_ms: float = 60_000,
    jitter_ms: float = 1_000,
) -> float:
    """Jittered delay for a given 0-based attempt index."""
    delay = min(base_ms * (2**attempt), cap_ms)
    return delay + random.random() * jitter_ms


async def with_backoff(
    fn: Callable[[], Awaitable[T]],
    *,
    retries: int = 4,
    base_ms: float = 2_000,
    cap_ms: float = 60_000,
    jitter_ms: float = 1_000,
    on_retry: Optional[RetryCallback] = None,
    sleep: Optional[Sleep] = None,
) -> T:
    """Run ``fn``, retrying on ``RateLimitError`` with exponential backoff.

    Re-throws the last ``RateLimitError`` once ``retries`` is exhausted; any
    non-rate-limit error is raised immediately.
    """
    _sleep: Sleep = sleep or (lambda ms: asyncio.sleep(ms / 1000))
    attempt = 0
    while True:
        try:
            return await fn()
        except RateLimitError as err:
            if attempt >= retries:
                raise
            delay = backoff_delay_ms(
                attempt, base_ms=base_ms, cap_ms=cap_ms, jitter_ms=jitter_ms
            )
            if on_retry is not None:
                on_retry(attempt + 1, delay, err)
            await _sleep(delay)
            attempt += 1
