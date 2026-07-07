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

export interface LargestTrade {
  ticker: string;
  type: OptionType;
  premium: number;
  sentiment: Sentiment;
  tradeType: TradeType;
  score: number;
}

export interface MarketStats {
  tradingDate: string;
  marketOpen: boolean;
  timestamp: string;
  putCallRatioSPY: number;
  putCallRatioQQQ: number;
  putCallRatioIWM: number;
  overallSentiment: Sentiment;
  sentimentScore: number;
  dominantFlow: FlowSide;
  totalFlowPremium: number;
  largestTrade: LargestTrade;
  totalBullishPremium: number;
  totalBearishPremium: number;
  bullishBearishRatio: number;
  activeAlerts: number;
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
}

export type ToolName = keyof ToolResponses;

/** JSON-RPC arguments accepted by a `tools/call`. */
export type ToolArgs = Record<string, unknown>;
