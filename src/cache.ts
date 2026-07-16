/**
 * cache.ts — Optional in-memory TTL response cache, keyed by tool + args.
 *
 * Default TTLs mirror DaddyBoard's poll cadence (poller.js), so a caller who
 * flips caching on gets sensible freshness per tool without tuning. Live and
 * mock transports share the same cache path.
 */

import type { ToolName } from './types.js';

/** Default TTL per tool in ms — mirrors DaddyBoard's poll intervals. */
export const DEFAULT_TTLS: Record<ToolName, number> = {
  get_unusual_activity: 30_000,
  get_market_stats: 60_000,
  get_put_call_ratios: 60_000,
  get_gex_overview: 120_000,
  get_sector_flow: 120_000,
  get_iv_rank: 120_000,
  get_strategy_ideas: 120_000,
  get_edge_xray: 120_000,
  get_gex_ticker: 120_000,
  run_screener: 300_000,
  get_earnings_flow: 30 * 60_000,
  get_economic_calendar: 30 * 60_000,
  get_apex_levels: 120_000,
  get_politician_trades: 5 * 60_000,
  get_politician_trades_by_ticker: 5 * 60_000,
  get_institutional_activity: 60_000,
  get_dividend_calendar: 30 * 60_000,
  get_long_term_quality: 30 * 60_000,
  get_ipo_scanner: 5 * 60_000,
  get_bounce_signals: 60_000,
  get_bounce_score: 15 * 60_000,
  get_conviction: 60_000,
  get_market_health: 5 * 60_000,
  get_hedge_analysis: 60_000,
};

const FALLBACK_TTL = 120_000;

export interface CacheOptions {
  /**
   * Per-tool TTL overrides (ms), or a single number applied to every tool.
   * Anything unspecified falls back to `DEFAULT_TTLS`.
   */
  ttl?: number | Partial<Record<ToolName, number>>;
  /** Injectable clock (ms). Defaults to `Date.now`. Handy in tests. */
  now?: () => number;
}

interface Entry {
  value: unknown;
  expires: number;
}

export class ResponseCache {
  private readonly store = new Map<string, Entry>();
  private readonly inflight = new Map<string, Promise<unknown>>();
  private readonly ttlFor: (tool: ToolName) => number;
  private readonly now: () => number;

  constructor(opts: CacheOptions = {}) {
    this.now = opts.now ?? Date.now;
    const ttl = opts.ttl;
    if (typeof ttl === 'number') {
      this.ttlFor = () => ttl;
    } else if (ttl) {
      this.ttlFor = (tool) => ttl[tool] ?? DEFAULT_TTLS[tool] ?? FALLBACK_TTL;
    } else {
      this.ttlFor = (tool) => DEFAULT_TTLS[tool] ?? FALLBACK_TTL;
    }
  }

  private key(tool: string, args: Record<string, unknown>): string {
    // Stable key: sort arg entries so order doesn't fragment the cache.
    const sorted = Object.keys(args)
      .sort()
      .map((k) => `${k}=${JSON.stringify(args[k])}`)
      .join('&');
    return `${tool}?${sorted}`;
  }

  get<T>(tool: string, args: Record<string, unknown>): T | undefined {
    const entry = this.store.get(this.key(tool, args));
    if (!entry) return undefined;
    if (entry.expires <= this.now()) {
      this.store.delete(this.key(tool, args));
      return undefined;
    }
    return entry.value as T;
  }

  set(tool: ToolName, args: Record<string, unknown>, value: unknown): void {
    this.store.set(this.key(tool, args), {
      value,
      expires: this.now() + this.ttlFor(tool),
    });
  }

  /**
   * Single-flight: the in-flight request for this key, if one is already
   * running. Concurrent callers await it instead of firing a duplicate.
   */
  getInflight(tool: string, args: Record<string, unknown>): Promise<unknown> | undefined {
    return this.inflight.get(this.key(tool, args));
  }

  setInflight(tool: string, args: Record<string, unknown>, promise: Promise<unknown>): void {
    this.inflight.set(this.key(tool, args), promise);
  }

  clearInflight(tool: string, args: Record<string, unknown>): void {
    this.inflight.delete(this.key(tool, args));
  }

  clear(): void {
    this.store.clear();
    this.inflight.clear();
  }
}
