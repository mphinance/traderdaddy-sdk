/**
 * errors.ts — Typed error hierarchy.
 *
 * Ported from DaddyBoard's `mcpClient.js`. `RateLimitError` is what
 * `withBackoff()` catches and retries on; everything else surfaces as
 * `TraderDaddyError` (or a subclass) so callers can `instanceof`-narrow.
 */

/** Base class for every error thrown by the SDK. */
export class TraderDaddyError extends Error {
  override name = 'TraderDaddyError';
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Thrown on HTTP 429 or JSON-RPC error code -32000. `withBackoff()` retries
 * on this; other errors propagate immediately.
 */
export class RateLimitError extends TraderDaddyError {
  override name = 'RateLimitError';
  constructor(message = 'Rate limited') {
    super(message);
  }
}

/** A non-2xx HTTP response that isn't a rate limit. */
export class HttpError extends TraderDaddyError {
  override name = 'HttpError';
  readonly status: number;
  constructor(status: number, statusText: string) {
    super(`MCP HTTP ${status}: ${statusText}`);
    this.status = status;
  }
}

/** A JSON-RPC-level error (`error` present in the envelope). */
export class JsonRpcError extends TraderDaddyError {
  override name = 'JsonRpcError';
  readonly code: number;
  constructor(code: number, message: string) {
    super(`JSON-RPC error ${code}: ${message}`);
    this.code = code;
  }
}

/** Live mode was requested without an API key. */
export class MissingApiKeyError extends TraderDaddyError {
  override name = 'MissingApiKeyError';
  constructor() {
    super(
      'TraderDaddy requires an API key in live mode. ' +
        'Pass `{ apiKey: "td_live_..." }`, or use `{ mock: true }` for keyless demo mode.',
    );
  }
}
