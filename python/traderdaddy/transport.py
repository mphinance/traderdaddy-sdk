"""transport.py — Async MCP JSON-RPC transport over StreamableHTTP.

Port of @traderdaddy/sdk's transport.ts. The public endpoint
(``POST /api/v1/mcp``) is a *stateless* StreamableHTTP transport: a bare
``tools/call`` is accepted directly — no ``initialize`` handshake — so we issue
exactly ONE POST per tool call.

Responses may be ``application/json`` or ``text/event-stream`` (SSE); both are
handled. The real payload lives at ``result.content[0].text`` and is JSON.

``httpx`` is imported lazily so mock mode works without it installed. A caller
(e.g. a Home Assistant integration) may inject its own ``httpx.AsyncClient``;
when it does, this transport will not close it.
"""

from __future__ import annotations

import json
from typing import TYPE_CHECKING, Any, Optional, Protocol

from .errors import HttpError, JsonRpcError, RateLimitError

if TYPE_CHECKING:  # pragma: no cover
    import httpx

DEFAULT_BASE_URL = "https://api.traderdaddy.pro"
MCP_PATH = "/api/v1/mcp"
DEFAULT_TIMEOUT = 45.0


class Transport(Protocol):
    """A transport turns a tool name + args into a decoded payload."""

    async def call_tool(self, name: str, args: dict[str, Any] | None = None) -> Any: ...


def _parse_body(status: int, content_type: str, text: str) -> dict[str, Any]:
    """Decode a response body, handling both SSE and JSON content-types."""
    if "text/event-stream" in content_type:
        last: str | None = None
        for line in text.split("\n"):
            if line.startswith("data:"):
                candidate = line[5:].strip()
                if candidate:
                    last = candidate
        if last is None:
            raise HttpError(status, "SSE response contained no data lines")
        return json.loads(last)
    return json.loads(text)


class HttpTransport:
    """Live transport against the TraderDaddy Pro MCP endpoint."""

    def __init__(
        self,
        *,
        api_key: str,
        base_url: str = DEFAULT_BASE_URL,
        timeout: float = DEFAULT_TIMEOUT,
        client: "Optional[httpx.AsyncClient]" = None,
    ) -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._client = client
        self._owns_client = client is None
        self._id = 0

    def _headers(self) -> dict[str, str]:
        # Both auth styles the endpoint accepts — belt and suspenders.
        return {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream",
            "X-API-Key": self._api_key,
            "Authorization": f"Bearer {self._api_key}",
        }

    def _get_client(self) -> "httpx.AsyncClient":
        if self._client is None:
            import httpx

            self._client = httpx.AsyncClient(timeout=self._timeout)
        return self._client

    async def call_tool(self, name: str, args: dict[str, Any] | None = None) -> Any:
        self._id += 1
        body = {
            "jsonrpc": "2.0",
            "id": self._id,
            "method": "tools/call",
            "params": {"name": name, "arguments": args or {}},
        }

        client = self._get_client()
        resp = await client.post(
            f"{self._base_url}{MCP_PATH}",
            headers=self._headers(),
            content=json.dumps(body),
            timeout=self._timeout,
        )

        if resp.status_code == 429:
            raise RateLimitError("HTTP 429 from MCP endpoint")
        if not (200 <= resp.status_code < 300):
            raise HttpError(resp.status_code, resp.reason_phrase or "request failed")

        envelope = _parse_body(
            resp.status_code, resp.headers.get("content-type", "") or "", resp.text
        )

        err = envelope.get("error")
        if err:
            code = err.get("code")
            message = err.get("message", "")
            if code == -32000:  # the endpoint's rate-limit signal
                raise RateLimitError(f"JSON-RPC -32000: {message}")
            raise JsonRpcError(code, message)

        content = (envelope.get("result") or {}).get("content")
        payload = content[0].get("text") if content else None
        if not isinstance(payload, str):
            raise HttpError(resp.status_code, f"Unexpected MCP result shape for tool {name}")

        return json.loads(payload)

    async def aclose(self) -> None:
        """Close the underlying client — only if this transport created it."""
        if self._owns_client and self._client is not None:
            await self._client.aclose()
            self._client = None
