/**
 * @traderdaddy/sdk — Typed, isomorphic client for the public TraderDaddy Pro
 * MCP API. The shared foundation for the daddy-* open-source family.
 *
 * ```ts
 * import { TraderDaddy } from "@traderdaddy/sdk";
 *
 * const td = new TraderDaddy({ apiKey: process.env.TD_API_KEY });
 * const flow = await td.unusualActivity();
 *
 * // Keyless demo mode — same types:
 * const demo = new TraderDaddy({ mock: true });
 * ```
 */

export { TraderDaddy, type TraderDaddyOptions } from './client.js';

// Transport layer (advanced / custom runtimes)
export {
  HttpTransport,
  type HttpTransportOptions,
  type Transport,
  type FetchLike,
  DEFAULT_BASE_URL,
} from './transport.js';

// Helpers
export {
  withBackoff,
  backoffDelayMs,
  type BackoffOptions,
} from './backoff.js';
export {
  getMarketPhase,
  isMarketOpen,
  type MarketPhase,
  type MarketPhaseName,
} from './marketHours.js';
export {
  ResponseCache,
  DEFAULT_TTLS,
  type CacheOptions,
} from './cache.js';

// Errors
export {
  TraderDaddyError,
  RateLimitError,
  HttpError,
  JsonRpcError,
  MissingApiKeyError,
} from './errors.js';

// Every response + tool-registry type
export type * from './types.js';
