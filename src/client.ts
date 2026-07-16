/**
 * client.ts — The `TraderDaddy` class: one typed method per MCP tool.
 *
 * Wraps a `Transport` (live `HttpTransport` or `MockTransport`) with the two
 * cross-cutting behaviours DaddyBoard proved out: 429 backoff (`withBackoff`)
 * and an optional per-tool TTL cache. Every method returns the tool's typed
 * response; `callTool()` is the generic escape hatch.
 */

import { withBackoff, type BackoffOptions } from './backoff.js';
import { ResponseCache, type CacheOptions } from './cache.js';
import { MissingApiKeyError } from './errors.js';
import { MockTransport } from './mock/index.js';
import { HttpTransport, type FetchLike, type Transport } from './transport.js';
import type {
  ApexLevels,
  BounceScore,
  BounceSignals,
  ConvictionMarket,
  ConvictionTicker,
  DividendCalendar,
  EarningsFlow,
  EconomicCalendar,
  EdgeXray,
  GexOverview,
  GexTicker,
  HedgeAnalysis,
  InstitutionalActivity,
  IpoRadar,
  IpoRecent,
  IpoScannerView,
  IpoTransitions,
  IpoUpcoming,
  IvRank,
  MarketHealth,
  MarketStats,
  PoliticianTrades,
  PoliticianTradesByTicker,
  PoliticianTradesTab,
  PutCallRatios,
  QualityList,
  QualitySingle,
  ScreenerResult,
  SectorFlow,
  StrategyIdeas,
  ToolArgs,
  ToolName,
  ToolResponses,
} from './types.js';

export interface TraderDaddyOptions {
  /** Your `td_live_…` key. Required unless `mock` is true. */
  apiKey?: string;
  /** API origin. Default `https://api.traderdaddy.pro`. */
  baseUrl?: string;
  /** Keyless demo mode — serves typed fixtures instead of the network. */
  mock?: boolean;
  /**
   * Response caching. `true` uses the default per-tool TTLs (mirroring
   * DaddyBoard's poll cadence); pass `CacheOptions` to tune. Omit/`false` to
   * disable. Default disabled.
   */
  cache?: boolean | CacheOptions;
  /**
   * 429 backoff behaviour, or `false` to disable retries entirely.
   * Default: 4 retries, base 2s, cap 60s, ±1s jitter.
   */
  backoff?: boolean | BackoffOptions;
  /** Per-request timeout in ms (live mode). Default 45000. */
  timeoutMs?: number;
  /** Inject a `fetch` implementation (non-standard runtimes / testing). */
  fetch?: FetchLike;
  /** Provide a custom transport, bypassing the live/mock selection. */
  transport?: Transport;
}

export class TraderDaddy {
  readonly mock: boolean;
  private readonly transport: Transport;
  private readonly cache: ResponseCache | null;
  private readonly backoffOpts: BackoffOptions | null;

  constructor(opts: TraderDaddyOptions = {}) {
    this.mock = opts.mock ?? false;

    if (opts.transport) {
      this.transport = opts.transport;
    } else if (this.mock) {
      this.transport = new MockTransport();
    } else {
      if (!opts.apiKey) throw new MissingApiKeyError();
      this.transport = new HttpTransport({
        apiKey: opts.apiKey,
        ...(opts.baseUrl !== undefined ? { baseUrl: opts.baseUrl } : {}),
        ...(opts.timeoutMs !== undefined ? { timeoutMs: opts.timeoutMs } : {}),
        ...(opts.fetch !== undefined ? { fetch: opts.fetch } : {}),
      });
    }

    if (opts.cache === true) {
      this.cache = new ResponseCache();
    } else if (opts.cache && typeof opts.cache === 'object') {
      this.cache = new ResponseCache(opts.cache);
    } else {
      this.cache = null;
    }

    if (opts.backoff === false) {
      this.backoffOpts = null;
    } else if (opts.backoff && typeof opts.backoff === 'object') {
      this.backoffOpts = opts.backoff;
    } else {
      this.backoffOpts = {};
    }
  }

  /**
   * Generic escape hatch: call any tool by name with typed results. Prefer the
   * named methods below; use this for tools added to the API before this SDK
   * version knows about them.
   */
  async callTool<K extends ToolName>(name: K, args?: ToolArgs): Promise<ToolResponses[K]>;
  async callTool<T = unknown>(name: string, args?: ToolArgs): Promise<T>;
  async callTool(name: string, args: ToolArgs = {}): Promise<unknown> {
    const run = (): Promise<unknown> => this.transport.callTool(name, args);
    const invoke = (): Promise<unknown> =>
      this.backoffOpts ? withBackoff(run, this.backoffOpts) : run();

    if (!this.cache) return invoke();

    const cached = this.cache.get(name, args);
    if (cached !== undefined) return cached;

    // Single-flight: fold concurrent identical calls into one request.
    const pending = this.cache.getInflight(name, args);
    if (pending !== undefined) return pending;

    const promise = invoke();
    this.cache.setInflight(name, args, promise);
    try {
      const value = await promise;
      // Only cache tools the SDK knows a TTL for (all 12 named tools).
      if (name in TOOL_NAMES) this.cache.set(name as ToolName, args, value);
      return value;
    } finally {
      this.cache.clearInflight(name, args);
    }
  }

  // --- One method per tool -------------------------------------------------

  /** Market-wide vitals: put/call ratios, sentiment, dominant flow, largest trade. */
  marketStats(): Promise<MarketStats> {
    return this.callTool('get_market_stats');
  }

  /** The smart-money feed: large, aggressive options prints. */
  unusualActivity(
    opts: { ticker?: string; direction?: 'bullish' | 'bearish'; minPremium?: number; limit?: number } = {},
  ): Promise<ToolResponses['get_unusual_activity']> {
    return this.callTool('get_unusual_activity', { limit: 25, ...prune(opts) });
  }

  /** Put/call ratios for a ticker (default SPY). */
  putCallRatios(ticker = 'SPY'): Promise<PutCallRatios> {
    return this.callTool('get_put_call_ratios', { ticker });
  }

  /** Gamma-exposure roll-up across the major indices. */
  gexOverview(): Promise<GexOverview> {
    return this.callTool('get_gex_overview');
  }

  /** Gamma-exposure ladder for a single ticker. */
  gexTicker(symbol: string): Promise<GexTicker> {
    return this.callTool('get_gex_ticker', { symbol });
  }

  /** Sector-rotation flow. `window` defaults to `today`. */
  sectorFlow(window = 'today'): Promise<SectorFlow> {
    return this.callTool('get_sector_flow', { window });
  }

  /** IV rank / percentile for a ticker (omit to let the API pick its default). */
  ivRank(symbol?: string): Promise<IvRank> {
    return this.callTool('get_iv_rank', symbol ? { symbol } : {});
  }

  /** Run a named screener (e.g. `csp-wheel`). */
  runScreener(screener: string, opts: { limit?: number } = {}): Promise<ScreenerResult> {
    return this.callTool('run_screener', { screener, ...prune(opts) });
  }

  /** Ranked options-strategy ideas for a ticker. */
  strategyIdeas(symbol?: string): Promise<StrategyIdeas> {
    return this.callTool('get_strategy_ideas', symbol ? { symbol } : {});
  }

  /** Per-contract fair-value X-ray (rich/cheap residuals) for a ticker. */
  edgeXray(symbol?: string): Promise<EdgeXray> {
    return this.callTool('get_edge_xray', symbol ? { symbol } : {});
  }

  /** Pre-earnings options flow for the upcoming window. `days` defaults to 7. */
  earningsFlow(opts: { days?: number } = {}): Promise<EarningsFlow> {
    return this.callTool('get_earnings_flow', { days: 7, ...prune(opts) });
  }

  /** Upcoming macroeconomic calendar. */
  economicCalendar(): Promise<EconomicCalendar> {
    return this.callTool('get_economic_calendar');
  }

  /** Composite "magnet" ranking of option strikes — where price is most strongly pinned/attracted. */
  apexLevels(symbol: string, opts: { expiration?: string } = {}): Promise<ApexLevels> {
    return this.callTool('get_apex_levels', { symbol, ...prune(opts) });
  }

  /** Congressional stock-disclosure leaderboard ("Power Players"). */
  politicianTrades(
    opts: { tab?: PoliticianTradesTab; window?: number; limit?: number } = {},
  ): Promise<PoliticianTrades> {
    return this.callTool('get_politician_trades', prune(opts));
  }

  /** All disclosed congressional trades for a single ticker. */
  politicianTradesByTicker(ticker: string, opts: { days?: number } = {}): Promise<PoliticianTradesByTicker> {
    return this.callTool('get_politician_trades_by_ticker', { ticker, ...prune(opts) });
  }

  /** Most actively-traded tickers by institutional options-flow volume (ex index ETFs / MAG7). */
  institutionalActivity(opts: { limit?: number } = {}): Promise<InstitutionalActivity> {
    return this.callTool('get_institutional_activity', prune(opts));
  }

  /** Upcoming ex-dividend calendar across the optionable universe. */
  dividendCalendar(opts: { from?: string; days?: number; limit?: number } = {}): Promise<DividendCalendar> {
    return this.callTool('get_dividend_calendar', prune(opts));
  }

  /** Fundamental quality + dividend screener for a single ticker. */
  longTermQuality(symbol: string): Promise<QualitySingle>;
  /** Fundamental quality + dividend screener — ranked list over the universe. */
  longTermQuality(
    opts?: { minScore?: number; minDivYield?: number; sector?: string; sort?: 'score' | 'divYield' | 'marketCap' | 'pe'; limit?: number },
  ): Promise<QualityList>;
  longTermQuality(
    arg?: string | { minScore?: number; minDivYield?: number; sector?: string; sort?: string; limit?: number },
  ): Promise<QualityList | QualitySingle> {
    if (typeof arg === 'string') {
      return this.callTool('get_long_term_quality', { symbol: arg });
    }
    return this.callTool('get_long_term_quality', prune(arg ?? {}));
  }

  /** IPO Scanner — scheduled/expected IPOs. */
  ipoScanner(view: 'upcoming', opts?: { from?: string; to?: string; limit?: number }): Promise<IpoUpcoming>;
  /** IPO Scanner — recently-listed names with performance since IPO. */
  ipoScanner(view: 'recent', opts?: { days?: number; limit?: number }): Promise<IpoRecent>;
  /** IPO Scanner — still-private companies ranked by Evidence Score. */
  ipoScanner(view: 'radar', opts?: { minScore?: number; limit?: number }): Promise<IpoRadar>;
  /** IPO Scanner — lifecycle event log (bucket changes, withdrawals). */
  ipoScanner(view: 'transitions', opts?: { limit?: number; sinceHours?: number }): Promise<IpoTransitions>;
  ipoScanner(view: IpoScannerView, opts: Record<string, unknown> = {}): Promise<unknown> {
    return this.callTool('get_ipo_scanner', { view, ...prune(opts) });
  }

  /** Bounce Finder screener: recently detected oversold-bounce / overbought-fade signals. */
  bounceSignals(
    opts: { direction?: 'all' | 'top' | 'bottom'; page?: number; pageSize?: number } = {},
  ): Promise<BounceSignals> {
    return this.callTool('get_bounce_signals', prune(opts));
  }

  /** On-demand oversold/overbought bounce composite score for a single ticker. */
  bounceScore(symbol: string): Promise<BounceScore> {
    return this.callTool('get_bounce_score', { symbol });
  }

  /** Market-wide Community Conviction gauge, with a top-tickers leaderboard. */
  conviction(): Promise<ConvictionMarket>;
  /** Per-ticker Community Conviction gauge. */
  conviction(symbol: string): Promise<ConvictionTicker>;
  conviction(symbol?: string): Promise<ConvictionMarket | ConvictionTicker> {
    return this.callTool('get_conviction', symbol ? { symbol } : {});
  }

  /** Market Health confluence: 7 macro-regime detectors blended into a composite risk score. */
  marketHealth(): Promise<MarketHealth> {
    return this.callTool('get_market_health');
  }

  /** Ranked downside-protection structures (protective put, collar, put-spread collar, bear put spread) for a share position. */
  hedgeAnalysis(
    symbol: string,
    shares: number,
    opts: { basis?: number; atr?: number; limit?: number } = {},
  ): Promise<HedgeAnalysis> {
    return this.callTool('get_hedge_analysis', { symbol, shares, ...prune(opts) });
  }
}

/** Drop `undefined` values so they don't override method defaults. */
function prune<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Partial<T> = {};
  for (const key of Object.keys(obj) as Array<keyof T>) {
    if (obj[key] !== undefined) out[key] = obj[key];
  }
  return out;
}

/** The tool names the SDK knows, used to gate caching. */
const TOOL_NAMES: Record<ToolName, true> = {
  get_market_stats: true,
  get_unusual_activity: true,
  get_put_call_ratios: true,
  get_gex_overview: true,
  get_gex_ticker: true,
  get_sector_flow: true,
  get_iv_rank: true,
  run_screener: true,
  get_strategy_ideas: true,
  get_edge_xray: true,
  get_earnings_flow: true,
  get_economic_calendar: true,
  get_apex_levels: true,
  get_politician_trades: true,
  get_politician_trades_by_ticker: true,
  get_institutional_activity: true,
  get_dividend_calendar: true,
  get_long_term_quality: true,
  get_ipo_scanner: true,
  get_bounce_signals: true,
  get_bounce_score: true,
  get_conviction: true,
  get_market_health: true,
  get_hedge_analysis: true,
};
