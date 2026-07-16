/**
 * types.ts — TypeScript response types for every TraderDaddy Pro MCP tool.
 *
 * These mirror the real MCP tool payloads (the same shapes DaddyBoard renders
 * and the shapes the `@traderdaddy/sdk/mock` fixtures satisfy). Open-ended
 * string fields use the `Enum | (string & {})` pattern so known values
 * autocomplete without rejecting unknown ones the API may add later.
 */

/* eslint-disable @typescript-eslint/ban-types */

export type Sentiment = 'Bullish' | 'Bearish' | 'Neutral' | (string & {});
export type OptionType = 'CALL' | 'PUT';
export type FlowSide = 'calls' | 'puts';
export type GexBias = 'LONG_GAMMA' | 'SHORT_GAMMA' | (string & {});
export type TradeType = 'sweep' | 'block' | (string & {});
export type Tier = 'LEGENDARY' | 'ELITE' | 'NOTABLE' | (string & {});
export type Moneyness = 'OTM' | 'ATM' | 'ITM' | (string & {});
export type Impact = 'high' | 'medium' | 'low' | (string & {});

// ---------------------------------------------------------------------------
// get_market_stats
// ---------------------------------------------------------------------------

// NOTE: `get_market_stats` is the one legacy tool whose live payload is
// snake_case (the rest of the API is camelCase). This type mirrors the *actual*
// wire shape so `mock: true` stays byte-identical to live. It does NOT carry an
// overall sentiment index, bull/bear ratio, or alert count — those never
// existed on the wire; derive any composite from the three index P/C ratios +
// sentiments below.
export interface MarketStats {
  spy_put_call_ratio: number;
  qqq_put_call_ratio: number;
  iwm_put_call_ratio: number;
  spy_sentiment: Sentiment;
  qqq_sentiment: Sentiment;
  iwm_sentiment: Sentiment;
  largest_trade_premium: number;
  largest_trade_symbol: string;
  largest_trade_strike: number;
  largest_trade_expiry: string;
  largest_trade_type: OptionType;
  tradingDate: string;
  timestamp: string;
  marketOpen: boolean;
}

// ---------------------------------------------------------------------------
// get_unusual_activity
// ---------------------------------------------------------------------------

export interface UnusualActivityRow {
  id: string;
  tradeTime: string;
  ticker: string;
  type: OptionType;
  premium: number;
  volume: number;
  openInterest: number;
  sentiment: Sentiment;
  sentimentConfidence: 'high' | 'inferred' | (string & {});
  score: number;
  tradeType: TradeType;
  executionSpeed: 'fast' | 'normal' | (string & {});
  vsOI: number;
  vsADV: number;
  flowDescription: string;
  tier: Tier;
  tierColor: string;
  tierDescription: string;
  repeatCount: number;
  clusterId: string | null;
  convictionLevel: string;
  isRepeatFlow: boolean;
  sentimentAction: string;
  sentimentLabel: string;
  sentimentDescription: string;
  sentimentExplanation: string;
  isDivergentFlow: boolean;
  moneynessPct: number;
  moneynessBucket: Moneyness;
}

export interface UnusualActivityAggregates {
  totalPremium: number;
  bullishPremium: number;
  bearishPremium: number;
  bullishCount: number;
  bearishCount: number;
  avgScore: number;
  topTicker: string;
  topPremium: number;
}

export interface UnusualActivityFilters {
  ticker: string | null;
  direction: string | null;
  minPremium: number | null;
  limit: number | null;
}

export interface UnusualActivity {
  data: UnusualActivityRow[];
  total: number;
  aggregates: UnusualActivityAggregates;
  filters: UnusualActivityFilters;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// get_gex_overview / get_gex_ticker
// ---------------------------------------------------------------------------

export interface GexStrike {
  strike: number;
  callGex: number;
  putGex: number;
  netGex: number;
  callOi: number;
  putOi: number;
  callGamma: number;
  putGamma: number;
  distanceFromSpot: number;
  isAboveSpot: boolean;
}

export interface GexSymbol {
  symbol: string;
  totalGEX: number;
  callGex: number;
  putGex: number;
  netGex: number;
  flipPoint: number;
  bias: GexBias;
  byStrike: GexStrike[];
}

export interface GexMarketSummary {
  totalGEX: number;
  bias: GexBias;
  interpretation: string;
}

/**
 * get_gex_overview keys per-index GEX by symbol (SPY, QQQ, SPX, …) alongside a
 * `marketSummary` roll-up. Access a symbol with `overview.SPY` and narrow, or
 * read `overview.marketSummary`.
 */
export type GexOverview = { marketSummary: GexMarketSummary } & Record<
  string,
  GexSymbol | GexMarketSummary
>;

export interface GexProxy {
  symbol: string;
  scaleFactor: number;
}

export interface GexTicker extends GexSymbol {
  /** Set when the ticker is priced off a futures proxy (e.g. QQQ → NQ). */
  proxy: GexProxy | null;
}

// ---------------------------------------------------------------------------
// get_sector_flow
// ---------------------------------------------------------------------------

export interface Sector {
  sym: string;
  name: string;
  flowNet: number;
  chgPct: number;
  flowSide: FlowSide;
  sentiment: number;
  avgConviction: number;
  cpRatio: number;
  cylinders: 'bullish' | 'bearish' | null;
  last: number;
  sparkline: number[];
  sentimentSpark: number[];
  hasEtf: boolean;
  pills: unknown[];
}

export interface SectorMacro {
  label: string;
  description: string;
  riskOnScore: number;
  dominantSector: string;
  dominantFlow: FlowSide;
}

export interface SectorFlow {
  window: string;
  macro: SectorMacro;
  sectors: Sector[];
  subsectors: Sector[];
  thematic: Sector[];
  technicals: { bullish: string[]; bearish: string[] };
  walls: { events: unknown[] };
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// get_put_call_ratios
// ---------------------------------------------------------------------------

export interface PutCallRatios {
  ticker: string;
  putCallRatio: number;
  expirationDate: string;
  putVolume: number;
  callVolume: number;
  sentiment: Sentiment;
  dataSource: 'volume' | 'openInterest' | (string & {});
}

// ---------------------------------------------------------------------------
// get_earnings_flow
// ---------------------------------------------------------------------------

export interface EarningsEvent {
  symbol: string;
  earningsDate: string;
  earningsTime: 'AMC' | 'BMO' | (string & {});
  expectedMovePct: number;
  expectedMovePrice: number;
  realizedMovePct: number | null;
  realizedDirection: string | null;
  preEarningsClose: number | null;
  postEarningsOpen: number | null;
  preEarningsFlowCount: number;
  preEarningsPremium: number;
  preEarningsBullishPct: number;
  preEarningsSentiment: Sentiment;
  consensusConfidence: string;
  epsEstimate: number;
  revenueEstimate: number;
  sector: string;
  marketCapUsd: number;
  lastEarningsOutcome: 'beat' | 'miss' | 'inline' | (string & {});
}

export interface EarningsFlowLeg {
  daysBeforeEarnings: number;
  signalWindow: string;
  signalWeight: number;
  premium: number;
  sentiment: Sentiment;
  unusualScore: number;
  tradeType: TradeType;
  contractType: OptionType;
  moneyness: Moneyness;
}

export interface EarningsFlowSummary {
  direction: string;
  confidence: string;
  note: string;
}

export interface EarningsFlowItem {
  event: EarningsEvent;
  flows: EarningsFlowLeg[];
  summary: EarningsFlowSummary;
}

export interface EarningsFlow {
  earnings: EarningsFlowItem[];
  count: number;
  days: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// get_economic_calendar
// ---------------------------------------------------------------------------

export interface EconomicEvent {
  date: string;
  time: string;
  event: string;
  impact: Impact;
  forecast: string | null;
  previous: string | null;
  actual: string | null;
  country: string;
}

export interface EconomicCalendar {
  dateFrom: string;
  dateTo: string;
  totalEvents: number;
  events: EconomicEvent[];
}

// ---------------------------------------------------------------------------
// run_screener
// ---------------------------------------------------------------------------

export interface ScreenerResultRow {
  ticker: string;
  name?: string;
  price: number;
  change: number;
  changePct: number;
  volume?: number;
  avgVolume?: number;
  relVol?: number;
  score: number;
  sector: string;
  setup?: string;
  edgeScore?: number;
  weeklyRoc?: number;
}

export interface ScreenerResult {
  screener: { id: string; name: string };
  results: ScreenerResultRow[];
  tickers: string[];
  count: number;
  returned: number;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// get_iv_rank
// ---------------------------------------------------------------------------

export interface IvRank {
  symbol: string;
  ivRank: number;
  ivPercentile: number;
  currentIV: number;
  ivMin52w: number;
  ivMax52w: number;
  interpretation: 'rich' | 'cheap' | 'neutral' | (string & {});
  note: string;
}

// ---------------------------------------------------------------------------
// get_strategy_ideas
// ---------------------------------------------------------------------------

export interface StrategyLeg {
  type: 'CALL' | 'PUT' | 'STOCK';
  side: 'buy' | 'sell';
  qty: number;
  strike: number | null;
  premium: number;
  delta: number;
}

export interface StrategyStructure {
  archetype: string;
  rank: number;
  score: number;
  legs: StrategyLeg[];
  maxProfit: number | null;
  maxLoss: number;
  breakevens: number[];
  pop: number;
  capitalAtRisk: number;
  expiration: string;
  dte: number;
  rationale: string;
  earningsInWindow: boolean;
}

export interface StrategyIdeas {
  symbol: string;
  direction: string;
  derivedFromTechnicals: boolean;
  structures: StrategyStructure[];
  timestamp: string;
}

// ---------------------------------------------------------------------------
// get_edge_xray
// ---------------------------------------------------------------------------

export interface EdgeXrayContract {
  strike: number;
  type: OptionType;
  mid: number;
  iv: number;
  delta: number;
  residual: number;
  verdict: 'rich' | 'cheap' | 'fair' | (string & {});
}

export interface EdgeXray {
  symbol: string;
  spot: number;
  expiration: string;
  dte: number;
  availableExpirations: string[];
  contracts: EdgeXrayContract[];
  fairIvSummary: {
    callsMedianResidual: number;
    putsMedianResidual: number;
    overallBias: string;
  };
  timestamp: string;
}

// ---------------------------------------------------------------------------
// get_apex_levels
// ---------------------------------------------------------------------------

export interface ApexLevel {
  strike: number;
  /** 0–100, dominant magnet = 100. */
  score: number;
  /** 1 = dominant magnet. */
  rank: number;
  netGEX: number;
  totalOI: number;
  isAboveSpot: boolean;
}

export interface ApexLevels {
  symbol: string;
  spotPrice: number;
  snapshotTime: string;
  mode: 'aggregate' | 'single' | (string & {});
  expirationsUsed: string[];
  availableExpirations: string[];
  /** Simulated price where net gamma crosses zero. */
  gammaFlip: number;
  levels: ApexLevel[];
}

// ---------------------------------------------------------------------------
// get_politician_trades / get_politician_trades_by_ticker
// ---------------------------------------------------------------------------

export type PoliticianTradesTab = 'top_portfolios' | 'most_active' | (string & {});

export interface PoliticianPortfolioEntry {
  name: string;
  party: string;
  chamber: 'House' | 'Senate' | (string & {});
  totalEstimated: number;
  tradeCount: number;
  uniqueTickers: number;
  topTickers: string[];
  lastTradeDate: string;
}

export interface PoliticianTrades {
  success: boolean;
  tab: PoliticianTradesTab;
  window_days: number;
  generated_at: string;
  entries: PoliticianPortfolioEntry[];
}

export interface PoliticianTrade {
  id: string;
  name: string;
  party: string;
  chamber: 'House' | 'Senate' | (string & {});
  state_abbreviation: string;
  state_name: string;
  company: string;
  ticker: string;
  trade_date: string;
  days_until_disclosure: number;
  trade_type: 'buy' | 'sell' | (string & {});
  trade_amount: string;
  value_at_purchase: string;
  updated_at: string;
}

export interface PoliticianTradesByTicker {
  success: boolean;
  ticker: string;
  period_days: number;
  total_trades: number;
  trades: PoliticianTrade[];
}

// ---------------------------------------------------------------------------
// get_institutional_activity
// ---------------------------------------------------------------------------

export interface InstitutionalFlow {
  ticker: string;
  sentiment: Sentiment;
  total_premium: number;
  flow_count: number;
}

export interface InstitutionalActivity {
  flows: InstitutionalFlow[];
  trading_date: string;
  is_current_day: boolean;
  timeframe: string;
}

// ---------------------------------------------------------------------------
// get_dividend_calendar
// ---------------------------------------------------------------------------

export interface DividendEvent {
  symbol: string;
  companyName: string;
  sector: string;
  exDate: string;
  payDate: string;
  dividendRate: number;
  dividendYield: number;
}

export interface DividendCalendar {
  count: number;
  from: string;
  days: number;
  results: DividendEvent[];
}

// ---------------------------------------------------------------------------
// get_long_term_quality
// ---------------------------------------------------------------------------

export interface QualityRow {
  symbol: string;
  companyName: string;
  sector: string;
  /** 0–100 composite: profitability + balance-sheet safety + valuation + growth + payout safety. */
  qualityScore: number;
  pe: number;
  pb: number;
  beta: number;
  marketCap: number;
  netMargin: number;
  operatingMargin: number;
  grossMargin: number;
  roe: number;
  roa: number;
  revenueGrowthYoY: number;
  epsGrowthYoY: number;
  dividendYield: number | null;
  dividendRate: number;
  payoutRatio: number | null;
  debtToEquity: number;
  currentRatio: number;
  interestCoverage: number;
  week52High: number;
  week52Low: number;
  updatedAt: string;
}

export interface QualityList {
  count: number;
  results: QualityRow[];
}

export interface QualitySingle extends QualityRow {
  nextExDate: string | null;
  nextPayDate: string | null;
  nextEarningsDate: string | null;
  /** True when this row came from a live fundamentals fetch, not the nightly table. */
  live: boolean;
}

// ---------------------------------------------------------------------------
// get_ipo_scanner
// ---------------------------------------------------------------------------

export type IpoScannerView = 'upcoming' | 'recent' | 'radar' | 'transitions';

export interface IpoUpcomingRow {
  id: number;
  company: string;
  companyKey: string;
  symbol: string | null;
  exchange: string;
  status: string;
  priceRange: string | null;
  sharesOffered: number | null;
  expectedDate: string | null;
  firstTradeDate: string | null;
  ipoPrice: number | null;
  secForm: string | null;
  secFilingDate: string | null;
  sources: string[];
  sourceUrls: string[];
  primaryLink: string | null;
  cik: string | null;
  accession: string | null;
  lifecycleStage: string;
  currentBucket: string;
  withdrawn: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  updatedAt: string;
}

export interface IpoRecentRow extends IpoUpcomingRow {
  currentPrice: number | null;
  pctFromIpo: number | null;
  pctFromFirstClose: number | null;
  day1Volume: number | null;
  avgVolume30d: number | null;
  setupAttentionScore: number | null;
  setupAttentionTier: 'LOW' | 'MED' | 'HIGH' | (string & {}) | null;
  perfUpdatedAt: string | null;
}

export interface IpoRadarRow {
  company: string;
  companyKey: string;
  estValuationB: number | null;
  sector: string | null;
  /** 0–100 Evidence Score. */
  evidenceScore: number;
  evidenceCount: number;
  lastSignalDate: string;
  topDrivers: string[];
  signalConfidentialFiling: number;
  signalPublicFiling: number;
  signalConfirmedIpoIntent: number;
  signalTargetTiming: number;
  signalValuationReported: number;
  signalNamedUnderwriters: number;
  signalMultipleCredibleReports: number;
}

export interface IpoTransitionEvent {
  id: number;
  companyKey: string;
  company: string;
  symbol: string | null;
  eventType: string;
  fromBucket: string | null;
  toBucket: string | null;
  meta: Record<string, unknown>;
  occurredAt: string;
}

export interface IpoScannerResult<T> {
  data: T[];
  asOf: string;
  sourceCount: number;
}

export type IpoUpcoming = IpoScannerResult<IpoUpcomingRow>;
export type IpoRecent = IpoScannerResult<IpoRecentRow>;
export type IpoRadar = IpoScannerResult<IpoRadarRow>;
export type IpoTransitions = IpoScannerResult<IpoTransitionEvent>;

// ---------------------------------------------------------------------------
// get_bounce_signals / get_bounce_score
// ---------------------------------------------------------------------------

export interface BounceIndicatorData {
  bbPctb: number;
  bbScore: number;
  bbState: string;
  kcScore: number;
  kcState: string;
  cciScore: number;
  cciState: string;
  cciValue: number;
  rsiScore: number;
  rsiState: string;
  rsiValue: number;
  volRatio: number;
  volScore: number;
  volState: string;
  macdScore: number;
  macdState: string;
  signalDate: string;
  stochScore: number;
  stochState: string;
  willrScore: number;
  willrState: string;
  willrValue: number;
  rsiDivBonus: number;
  stochDValue: number;
  stochKValue: number;
  compositeScore: number;
  compositeYesterday: number;
}

export interface BounceSignal {
  id: number;
  ticker: string;
  signalType: 'bounce_top' | 'bounce_bottom' | (string & {});
  price: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  indicatorData: BounceIndicatorData;
  source: string;
  detectedAt: string;
}

export interface BounceSignals {
  signals: BounceSignal[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface BounceScore {
  ticker: string;
  price: number;
  changePercent: number;
  compositeScore: number;
  compositeYesterday: number;
  kcScore: number;
  rsiScore: number;
  rsiDivBonus: number;
  stochScore: number;
  bbScore: number;
  macdScore: number;
  volScore: number;
  willrScore: number;
  cciScore: number;
  rsiValue: number;
  stochKValue: number;
  stochDValue: number;
  bbPctb: number;
  volRatio: number;
  willrValue: number;
  cciValue: number;
  kcState: string;
  rsiState: string;
  stochState: string;
  bbState: string;
  macdState: string;
  volState: string;
  willrState: string;
  cciState: string;
}

// ---------------------------------------------------------------------------
// get_conviction
// ---------------------------------------------------------------------------

export interface ConvictionTickerEntry {
  ticker: string;
  score: number;
  adds24h: number;
  removes24h: number;
  net24h: number;
}

export interface ConvictionTopAdd extends ConvictionTickerEntry {
  net7d: number;
}

export interface ConvictionMarket {
  score: number;
  breakdown: {
    watchlistMomentum: number;
    chatSentiment: number;
    discordReactions: number;
  };
  topTickers: ConvictionTickerEntry[];
  topAdds: ConvictionTopAdd[];
  asOf: string;
}

export interface ConvictionTicker {
  ticker: string;
  score: number;
  breakdown: {
    watchlistMomentum: number;
    chatSentiment: number;
  };
  asOf: string;
}

// ---------------------------------------------------------------------------
// get_market_health
// ---------------------------------------------------------------------------

export type HealthStatus = 'ALERT' | 'WATCH' | 'CLEAR' | 'OK' | 'UNAVAILABLE' | (string & {});

export interface MarketHealthSignal {
  id: string;
  label: string;
  category: string;
  status: HealthStatus;
  summary: string;
  dataPoints: string[];
  asOf: string;
  detail: Record<string, unknown>;
}

export interface MarketHealth {
  signals: MarketHealthSignal[];
  alertCount: number;
  watchCount: number;
  availableCount: number;
  totalCount: number;
  generatedAt: string;
  compositeScore: {
    value: number;
    max: number;
    label: 'LOW' | 'ELEVATED' | 'HIGH' | (string & {});
  };
}

// ---------------------------------------------------------------------------
// get_hedge_analysis
// ---------------------------------------------------------------------------

export interface HedgeLeg {
  type: 'put' | 'call';
  side: 'long' | 'short';
  strike: number;
  qty: number;
  premium: number;
}

export interface HedgeStructure {
  kind: 'put_spread_collar' | 'collar' | 'bear_put_spread' | 'protective_put' | (string & {});
  legs: HedgeLeg[];
  /** Debit (+) or credit (−). */
  cost: number;
  dollarsProtected: number;
  costPerDollarProtected: number;
  breakevenAtExpiry: number | null;
  positionDelta: number;
  rationale: string;
}

/** Shopped hedges for the position. `error` is set (e.g. "Ticker not found") when the symbol/chain can't be resolved. */
export type HedgeAnalysis =
  | { symbol: string; error: string }
  | {
      symbol: string;
      spot: number;
      expiration: string;
      dte: number;
      downsideMove: number;
      downsideBasis: 'expected_move' | 'atr' | (string & {});
      downsideDollars: number;
      hedges: HedgeStructure[];
      error?: undefined;
    };

// ---------------------------------------------------------------------------
// Tool registry — maps each MCP tool name to its response type.
// ---------------------------------------------------------------------------

export interface ToolResponses {
  get_market_stats: MarketStats;
  get_unusual_activity: UnusualActivity;
  get_put_call_ratios: PutCallRatios;
  get_gex_overview: GexOverview;
  get_gex_ticker: GexTicker;
  get_sector_flow: SectorFlow;
  get_iv_rank: IvRank;
  run_screener: ScreenerResult;
  get_strategy_ideas: StrategyIdeas;
  get_edge_xray: EdgeXray;
  get_earnings_flow: EarningsFlow;
  get_economic_calendar: EconomicCalendar;
  get_apex_levels: ApexLevels;
  get_politician_trades: PoliticianTrades;
  get_politician_trades_by_ticker: PoliticianTradesByTicker;
  get_institutional_activity: InstitutionalActivity;
  get_dividend_calendar: DividendCalendar;
  get_long_term_quality: QualityList | QualitySingle;
  get_ipo_scanner: IpoUpcoming | IpoRecent | IpoRadar | IpoTransitions;
  get_bounce_signals: BounceSignals;
  get_bounce_score: BounceScore;
  get_conviction: ConvictionMarket | ConvictionTicker;
  get_market_health: MarketHealth;
  get_hedge_analysis: HedgeAnalysis;
}

export type ToolName = keyof ToolResponses;

/** JSON-RPC arguments accepted by a `tools/call`. */
export type ToolArgs = Record<string, unknown>;
