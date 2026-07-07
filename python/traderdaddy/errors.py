"""errors.py — Exception hierarchy mirroring @traderdaddy/sdk's errors.ts.

All errors extend ``TraderDaddyError`` so callers can narrow with a single
``except TraderDaddyError``. ``RateLimitError`` is the one ``with_backoff``
retries on; everything else propagates on the first throw.
"""

from __future__ import annotations


class TraderDaddyError(Exception):
    """Base class for every error the SDK raises."""


class MissingApiKeyError(TraderDaddyError):
    """Live mode was requested without an API key."""

    def __init__(self, message: str = "An API key is required unless mock=True.") -> None:
        super().__init__(message)


class RateLimitError(TraderDaddyError):
    """HTTP 429 or JSON-RPC -32000 — what ``with_backoff`` retries on."""

    def __init__(
        self, message: str = "Rate limited", retry_after_ms: float | None = None
    ) -> None:
        #: Server-requested wait in ms, parsed from a ``Retry-After`` header if present.
        self.retry_after_ms = retry_after_ms
        super().__init__(message)


class TimeoutError(TraderDaddyError):
    """The request exceeded its timeout before a response arrived."""

    def __init__(self, timeout_s: float) -> None:
        self.timeout_s = timeout_s
        super().__init__(f"Request timed out after {timeout_s}s")


class NetworkError(TraderDaddyError):
    """The request never reached the server (connection/transport failure)."""


class HttpError(TraderDaddyError):
    """A non-2xx HTTP response other than 429."""

    def __init__(self, status: int, message: str) -> None:
        self.status = status
        super().__init__(f"HTTP {status}: {message}")


class JsonRpcError(TraderDaddyError):
    """A JSON-RPC-level error in the response envelope."""

    def __init__(self, code: int, message: str) -> None:
        self.code = code
        super().__init__(f"JSON-RPC {code}: {message}")
