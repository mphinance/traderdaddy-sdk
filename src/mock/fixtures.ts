/**
 * fixtures.ts — Realistic canned payloads for all 12 MCP tools.
 *
 * Ported from DaddyBoard's `src/mock/fixtures.js`. Each fixture is typed against
 * the matching response interface, so the compiler guarantees the promise the
 * SDK makes: **mock data has identical types to live.** Ticker-scoped tools are
 * functions of their args; the rest are constants.
 *
 * Data is vivid and plausible so demo / marketing screenshots look real.
 */

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
  GexSymbol,
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
  PutCallRatios,
  QualityList,
  QualityRow,
  QualitySingle,
  ScreenerResult,
  ScreenerResultRow,
  SectorFlow,
  StrategyIdeas,
  ToolArgs,
  UnusualActivity,
  UnusualActivityRow,
} from '../types.js';

const NOW = (): string => new Date().toISOString();

// ---------------------------------------------------------------------------
// get_market_stats
// ---------------------------------------------------------------------------
export const get_market_stats: MarketStats = {
  spy_put_call_ratio: 0.78,
  qqq_put_call_ratio: 0.65,
  iwm_put_call_ratio: 1.12,
  spy_sentiment: 'Bullish',
  qqq_sentiment: 'Bullish',
  iwm_sentiment: 'Bearish',
  largest_trade_premium: 3_840_000,
  largest_trade_symbol: 'NVDA260710C00185000',
  largest_trade_strike: 185,
  largest_trade_expiry: '07/10/26',
  largest_trade_type: 'CALL',
  tradingDate: '2026-07-07',
  timestamp: NOW(),
  marketOpen: true,
};

// ---------------------------------------------------------------------------
// get_unusual_activity
// ---------------------------------------------------------------------------
const UA_ROWS: UnusualActivityRow[] = [
  {
    id: 'ua-001', tradeTime: '2026-07-07T13:45:22Z',
    ticker: 'NVDA', type: 'CALL', premium: 3_840_000, volume: 4200, openInterest: 18900,
    sentiment: 'Bullish', sentimentConfidence: 'high', score: 94,
    tradeType: 'sweep', executionSpeed: 'fast', vsOI: 22.2, vsADV: 380.1,
    flowDescription: 'Aggressive sweep across 7 exchanges — institutional accumulation pattern',
    tier: 'LEGENDARY', tierColor: '#f59e0b', tierDescription: 'Top 5% unusual flow',
    repeatCount: 3, clusterId: 'cl-nvda-1', convictionLevel: 'ultra-high',
    isRepeatFlow: true, sentimentAction: 'bought calls', sentimentLabel: 'Bullish Conviction',
    sentimentDescription: 'Large call sweep — buyer is paying for upside exposure aggressively',
    sentimentExplanation: 'CALL bought on ask signals directional conviction, not hedging',
    isDivergentFlow: false, moneynessPct: 2.4, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-002', tradeTime: '2026-07-07T13:42:07Z',
    ticker: 'SPY', type: 'PUT', premium: 2_150_000, volume: 9100, openInterest: 42000,
    sentiment: 'Bearish', sentimentConfidence: 'high', score: 87,
    tradeType: 'block', executionSpeed: 'normal', vsOI: 21.7, vsADV: 210.3,
    flowDescription: 'Sizable put block — large hedge or directional short bet ahead of FOMC',
    tier: 'ELITE', tierColor: '#8b5cf6', tierDescription: 'Top 10% unusual flow',
    repeatCount: 1, clusterId: null, convictionLevel: 'high',
    isRepeatFlow: false, sentimentAction: 'bought puts', sentimentLabel: 'Bearish Conviction',
    sentimentDescription: 'Put block bought on ask — downside protection or directional bet',
    sentimentExplanation: 'PUT bought on ask at market close time suggests macro hedge',
    isDivergentFlow: false, moneynessPct: -1.8, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-003', tradeTime: '2026-07-07T13:38:55Z',
    ticker: 'TSLA', type: 'CALL', premium: 1_920_000, volume: 6800, openInterest: 31200,
    sentiment: 'Bullish', sentimentConfidence: 'high', score: 89,
    tradeType: 'sweep', executionSpeed: 'fast', vsOI: 21.8, vsADV: 295.4,
    flowDescription: 'Multi-leg sweep — aggressive call buying ahead of earnings catalyst',
    tier: 'ELITE', tierColor: '#8b5cf6', tierDescription: 'Top 10% unusual flow',
    repeatCount: 2, clusterId: 'cl-tsla-1', convictionLevel: 'high',
    isRepeatFlow: true, sentimentAction: 'bought calls', sentimentLabel: 'Bullish Conviction',
    sentimentDescription: 'Repeated call sweeps confirm institutional accumulation',
    sentimentExplanation: 'CALL bought on ask, repeat flow = rising conviction',
    isDivergentFlow: false, moneynessPct: 3.1, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-004', tradeTime: '2026-07-07T13:35:11Z',
    ticker: 'AAPL', type: 'CALL', premium: 1_340_000, volume: 3100, openInterest: 22400,
    sentiment: 'Bullish', sentimentConfidence: 'high', score: 81,
    tradeType: 'block', executionSpeed: 'normal', vsOI: 13.8, vsADV: 142.7,
    flowDescription: 'Institutional call block — quiet accumulation before product event',
    tier: 'NOTABLE', tierColor: '#3b82f6', tierDescription: 'Top 20% unusual flow',
    repeatCount: 1, clusterId: null, convictionLevel: 'medium',
    isRepeatFlow: false, sentimentAction: 'bought calls', sentimentLabel: 'Bullish',
    sentimentDescription: 'Call block signals bullish positioning or overwrite rollout',
    sentimentExplanation: 'CALL bought slightly above mid — directional lean',
    isDivergentFlow: false, moneynessPct: 1.2, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-005', tradeTime: '2026-07-07T13:30:44Z',
    ticker: 'AMD', type: 'CALL', premium: 975_000, volume: 2800, openInterest: 14900,
    sentiment: 'Bullish', sentimentConfidence: 'high', score: 78,
    tradeType: 'sweep', executionSpeed: 'fast', vsOI: 18.8, vsADV: 188.2,
    flowDescription: 'Call sweep on pullback — smart money buying dip in semis',
    tier: 'NOTABLE', tierColor: '#3b82f6', tierDescription: 'Top 20% unusual flow',
    repeatCount: 1, clusterId: null, convictionLevel: 'medium',
    isRepeatFlow: false, sentimentAction: 'bought calls', sentimentLabel: 'Bullish',
    sentimentDescription: 'Sweep on bid side — opportunistic upside capture',
    sentimentExplanation: 'CALL bought on pullback, sweep pattern = urgency',
    isDivergentFlow: false, moneynessPct: 2.8, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-006', tradeTime: '2026-07-07T13:27:18Z',
    ticker: 'META', type: 'CALL', premium: 2_610_000, volume: 5400, openInterest: 28700,
    sentiment: 'Bullish', sentimentConfidence: 'high', score: 92,
    tradeType: 'sweep', executionSpeed: 'fast', vsOI: 18.8, vsADV: 312.5,
    flowDescription: 'Massive call sweep — AI infrastructure play, near 52-week high',
    tier: 'LEGENDARY', tierColor: '#f59e0b', tierDescription: 'Top 5% unusual flow',
    repeatCount: 2, clusterId: 'cl-meta-1', convictionLevel: 'ultra-high',
    isRepeatFlow: true, sentimentAction: 'bought calls', sentimentLabel: 'Bullish Conviction',
    sentimentDescription: 'Repeat call sweeps — size and speed signal institutional intent',
    sentimentExplanation: 'CALL sweep on ask repeated = persistent buy interest',
    isDivergentFlow: false, moneynessPct: 1.5, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-007', tradeTime: '2026-07-07T13:22:03Z',
    ticker: 'QQQ', type: 'PUT', premium: 890_000, volume: 3200, openInterest: 67500,
    sentiment: 'Bearish', sentimentConfidence: 'high', score: 74,
    tradeType: 'block', executionSpeed: 'normal', vsOI: 4.7, vsADV: 89.4,
    flowDescription: 'Macro hedge — large put block to protect tech exposure',
    tier: 'NOTABLE', tierColor: '#3b82f6', tierDescription: 'Top 20% unusual flow',
    repeatCount: 1, clusterId: null, convictionLevel: 'medium',
    isRepeatFlow: false, sentimentAction: 'bought puts', sentimentLabel: 'Bearish Hedge',
    sentimentDescription: 'Put block in QQQ suggests portfolio protection, not panic',
    sentimentExplanation: 'PUT block bought at mid — typical hedging behavior',
    isDivergentFlow: false, moneynessPct: -2.1, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-008', tradeTime: '2026-07-07T13:18:47Z',
    ticker: 'MSFT', type: 'CALL', premium: 1_120_000, volume: 2400, openInterest: 19300,
    sentiment: 'Bullish', sentimentConfidence: 'high', score: 82,
    tradeType: 'sweep', executionSpeed: 'fast', vsOI: 12.4, vsADV: 165.0,
    flowDescription: 'Call sweep — Azure cloud momentum, AI spending thesis intact',
    tier: 'NOTABLE', tierColor: '#3b82f6', tierDescription: 'Top 20% unusual flow',
    repeatCount: 1, clusterId: null, convictionLevel: 'medium',
    isRepeatFlow: false, sentimentAction: 'bought calls', sentimentLabel: 'Bullish',
    sentimentDescription: 'Sweep signals buyers view dip as opportunity',
    sentimentExplanation: 'CALL bought on ask with urgency pattern',
    isDivergentFlow: false, moneynessPct: 2.0, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-009', tradeTime: '2026-07-07T13:15:22Z',
    ticker: 'AMZN', type: 'CALL', premium: 1_680_000, volume: 3900, openInterest: 24100,
    sentiment: 'Bullish', sentimentConfidence: 'high', score: 86,
    tradeType: 'sweep', executionSpeed: 'fast', vsOI: 16.2, vsADV: 241.0,
    flowDescription: 'Call sweep ahead of AWS earnings catalyst — smart money loading',
    tier: 'ELITE', tierColor: '#8b5cf6', tierDescription: 'Top 10% unusual flow',
    repeatCount: 2, clusterId: 'cl-amzn-1', convictionLevel: 'high',
    isRepeatFlow: true, sentimentAction: 'bought calls', sentimentLabel: 'Bullish Conviction',
    sentimentDescription: 'Repeat sweeps confirm institutional intent before print',
    sentimentExplanation: 'CALL sweep pattern with repeat = high conviction directional',
    isDivergentFlow: false, moneynessPct: 2.5, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-010', tradeTime: '2026-07-07T13:10:05Z',
    ticker: 'GS', type: 'CALL', premium: 620_000, volume: 1400, openInterest: 8900,
    sentiment: 'Bullish', sentimentConfidence: 'inferred', score: 71,
    tradeType: 'block', executionSpeed: 'normal', vsOI: 15.7, vsADV: 123.4,
    flowDescription: 'Financials call block — rate cut narrative reawakening',
    tier: 'NOTABLE', tierColor: '#3b82f6', tierDescription: 'Top 20% unusual flow',
    repeatCount: 1, clusterId: null, convictionLevel: 'medium',
    isRepeatFlow: false, sentimentAction: 'bought calls', sentimentLabel: 'Bullish',
    sentimentDescription: 'Call block in financials aligns with steepening yield curve',
    sentimentExplanation: 'CALL bought at mid slightly — directional but measured',
    isDivergentFlow: false, moneynessPct: 1.8, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-011', tradeTime: '2026-07-07T13:05:33Z',
    ticker: 'XOM', type: 'PUT', premium: 520_000, volume: 2100, openInterest: 16400,
    sentiment: 'Bearish', sentimentConfidence: 'high', score: 73,
    tradeType: 'sweep', executionSpeed: 'normal', vsOI: 12.8, vsADV: 198.7,
    flowDescription: 'Energy put sweep — oil demand uncertainty, China growth fears',
    tier: 'NOTABLE', tierColor: '#3b82f6', tierDescription: 'Top 20% unusual flow',
    repeatCount: 1, clusterId: null, convictionLevel: 'medium',
    isRepeatFlow: false, sentimentAction: 'bought puts', sentimentLabel: 'Bearish',
    sentimentDescription: 'Put sweep signals near-term downside bet in energy',
    sentimentExplanation: 'PUT bought on ask — directional short, not portfolio hedge',
    isDivergentFlow: false, moneynessPct: -1.5, moneynessBucket: 'OTM',
  },
  {
    id: 'ua-012', tradeTime: '2026-07-07T13:01:11Z',
    ticker: 'GOOGL', type: 'CALL', premium: 1_430_000, volume: 2900, openInterest: 21800,
    sentiment: 'Bullish', sentimentConfidence: 'high', score: 84,
    tradeType: 'sweep', executionSpeed: 'fast', vsOI: 13.3, vsADV: 178.6,
    flowDescription: 'Search monopoly narrative intact — call sweep into ad revenue data',
    tier: 'ELITE', tierColor: '#8b5cf6', tierDescription: 'Top 10% unusual flow',
    repeatCount: 1, clusterId: null, convictionLevel: 'high',
    isRepeatFlow: false, sentimentAction: 'bought calls', sentimentLabel: 'Bullish',
    sentimentDescription: 'Call sweep signals buyers positioning for upside into print',
    sentimentExplanation: 'CALL sweep on ask — urgency suggests time-sensitive bet',
    isDivergentFlow: false, moneynessPct: 2.2, moneynessBucket: 'OTM',
  },
];

export const get_unusual_activity: UnusualActivity = {
  data: UA_ROWS,
  total: UA_ROWS.length,
  aggregates: {
    totalPremium: UA_ROWS.reduce((s, r) => s + r.premium, 0),
    bullishPremium: UA_ROWS.filter((r) => r.sentiment === 'Bullish').reduce((s, r) => s + r.premium, 0),
    bearishPremium: UA_ROWS.filter((r) => r.sentiment === 'Bearish').reduce((s, r) => s + r.premium, 0),
    bullishCount: UA_ROWS.filter((r) => r.sentiment === 'Bullish').length,
    bearishCount: UA_ROWS.filter((r) => r.sentiment === 'Bearish').length,
    avgScore: parseFloat((UA_ROWS.reduce((s, r) => s + r.score, 0) / UA_ROWS.length).toFixed(1)),
    topTicker: 'NVDA',
    topPremium: 3_840_000,
  },
  filters: { ticker: null, direction: null, minPremium: null, limit: 25 },
  timestamp: NOW(),
};

// ---------------------------------------------------------------------------
// get_gex_overview / get_gex_ticker
// ---------------------------------------------------------------------------
function makeGexSymbol(sym: string, totalGex: number, bias: string): GexSymbol {
  const byStrike = [470, 480, 490, 500, 510, 520, 530].map((strike, i) => ({
    strike,
    callGex: Math.round((i - 2) * 1.2e9 + 2e9),
    putGex: Math.round((3 - i) * 0.9e9 - 1.5e9),
    netGex: Math.round((i - 2) * 0.8e9 + 0.5e9),
    callOi: 12000 + i * 800,
    putOi: 9000 + (6 - i) * 700,
    callGamma: parseFloat((0.008 + i * 0.002).toFixed(4)),
    putGamma: parseFloat((0.009 - i * 0.0015).toFixed(4)),
    distanceFromSpot: parseFloat((((strike - 499) / 499) * 100).toFixed(2)),
    isAboveSpot: strike >= 499,
  }));
  return {
    symbol: sym,
    totalGEX: totalGex,
    callGex: totalGex * 0.62,
    putGex: totalGex * -0.38,
    netGex: totalGex,
    flipPoint: 487,
    bias,
    byStrike,
  };
}

export const get_gex_overview: GexOverview = {
  SPY: makeGexSymbol('SPY', 4.8e9, 'LONG_GAMMA'),
  QQQ: makeGexSymbol('QQQ', 2.1e9, 'LONG_GAMMA'),
  SPX: makeGexSymbol('SPX', 11.4e9, 'LONG_GAMMA'),
  marketSummary: {
    totalGEX: 18.3e9,
    bias: 'LONG_GAMMA',
    interpretation:
      'Market makers are net long gamma. Expect mean reversion and dampened volatility.',
  },
};

export function get_gex_ticker(args?: ToolArgs): GexTicker {
  const sym = String(args?.symbol ?? 'NVDA').toUpperCase();
  const base = sym === 'NVDA' ? 1.2e9 : 0.8e9;
  const byStrike = [100, 110, 120, 130, 140].map((strike, i) => ({
    strike,
    callGex: base * (0.3 + i * 0.1),
    putGex: -base * (0.25 - i * 0.04),
    netGex: base * (0.05 + i * 0.06),
    callOi: 5000 + i * 400,
    putOi: 4000 + (4 - i) * 350,
    callGamma: 0.012 + i * 0.003,
    putGamma: 0.011 - i * 0.002,
    distanceFromSpot: parseFloat((((strike - 125) / 125) * 100).toFixed(2)),
    isAboveSpot: strike >= 125,
  }));
  return {
    symbol: sym,
    totalGEX: base * 1.4,
    callGex: base * 0.9,
    putGex: -base * 0.5,
    netGex: base * 1.4,
    flipPoint: 118,
    bias: 'LONG_GAMMA',
    byStrike,
    proxy: sym === 'QQQ' ? { symbol: 'NQ', scaleFactor: 0.24 } : null,
  };
}

// ---------------------------------------------------------------------------
// get_sector_flow
// ---------------------------------------------------------------------------
const SECTORS = [
  { sym: 'XLK', name: 'Technology',            flowNet: 4_200_000, chgPct:  1.82, flowSide: 'calls' as const, sentiment: 78, avgConviction: 83, cpRatio: 0.61, cylinders: 'bullish' as const },
  { sym: 'XLY', name: 'Consumer Discretionary', flowNet: 2_100_000, chgPct:  0.94, flowSide: 'calls' as const, sentiment: 65, avgConviction: 71, cpRatio: 0.74, cylinders: null },
  { sym: 'XLF', name: 'Financials',            flowNet: 1_800_000, chgPct:  0.72, flowSide: 'calls' as const, sentiment: 62, avgConviction: 68, cpRatio: 0.80, cylinders: null },
  { sym: 'XLE', name: 'Energy',                flowNet: -980_000,  chgPct: -0.65, flowSide: 'puts'  as const, sentiment: 38, avgConviction: 61, cpRatio: 1.42, cylinders: 'bearish' as const },
  { sym: 'XLV', name: 'Health Care',           flowNet:  420_000,  chgPct:  0.21, flowSide: 'calls' as const, sentiment: 54, avgConviction: 59, cpRatio: 0.98, cylinders: null },
  { sym: 'XLI', name: 'Industrials',           flowNet:  310_000,  chgPct:  0.18, flowSide: 'calls' as const, sentiment: 55, avgConviction: 57, cpRatio: 0.95, cylinders: null },
  { sym: 'XLC', name: 'Communication Svcs',    flowNet: 1_640_000, chgPct:  0.88, flowSide: 'calls' as const, sentiment: 64, avgConviction: 72, cpRatio: 0.77, cylinders: null },
  { sym: 'XLU', name: 'Utilities',             flowNet: -120_000,  chgPct: -0.09, flowSide: 'puts'  as const, sentiment: 46, avgConviction: 50, cpRatio: 1.08, cylinders: null },
  { sym: 'XLRE', name: 'Real Estate',          flowNet: -210_000,  chgPct: -0.14, flowSide: 'puts'  as const, sentiment: 44, avgConviction: 48, cpRatio: 1.18, cylinders: null },
  { sym: 'XLB', name: 'Materials',             flowNet:  180_000,  chgPct:  0.12, flowSide: 'calls' as const, sentiment: 52, avgConviction: 54, cpRatio: 1.02, cylinders: null },
  { sym: 'XLP', name: 'Consumer Staples',      flowNet: -80_000,   chgPct: -0.06, flowSide: 'puts'  as const, sentiment: 47, avgConviction: 49, cpRatio: 1.05, cylinders: null },
].map((s) => ({
  ...s,
  last: 450 + Math.random() * 100,
  sparkline: Array.from({ length: 20 }, (_, i) => 450 + Math.sin(i * 0.4) * 8 + Math.random() * 3),
  sentimentSpark: Array.from({ length: 10 }, (_, i) => (s.sentiment - 50) * 0.8 + Math.sin(i) * 5),
  hasEtf: true,
  pills: [] as unknown[],
}));

export const get_sector_flow: SectorFlow = {
  window: 'today',
  macro: {
    label: 'Risk-On',
    description:
      'Smart money is broadly buying calls across mega-cap tech. Rotation away from defensives.',
    riskOnScore: 74,
    dominantSector: 'Technology',
    dominantFlow: 'calls',
  },
  sectors: SECTORS,
  subsectors: [
    { sym: 'SMH', name: 'Semiconductors', flowNet: 3_100_000, chgPct: 2.14, flowSide: 'calls', sentiment: 82, avgConviction: 88, cpRatio: 0.55, cylinders: 'bullish', last: 248, sparkline: [240, 242, 244, 247, 245, 246, 248, 249, 251, 250, 248], sentimentSpark: [20, 25, 30, 28, 32, 35, 30, 28, 32, 34], hasEtf: true, pills: [] },
    { sym: 'IGV', name: 'Software', flowNet: 1_200_000, chgPct: 1.02, flowSide: 'calls', sentiment: 68, avgConviction: 72, cpRatio: 0.72, cylinders: null, last: 98, sparkline: [95, 96, 97, 97, 98, 98, 99, 98, 99, 100, 98], sentimentSpark: [10, 12, 15, 13, 14, 16, 14, 15, 16, 15], hasEtf: true, pills: [] },
    { sym: 'XBI', name: 'Biotech', flowNet: -340_000, chgPct: -0.44, flowSide: 'puts', sentiment: 40, avgConviction: 55, cpRatio: 1.28, cylinders: null, last: 102, sparkline: [104, 103, 102, 102, 101, 101, 102, 101, 100, 101, 102], sentimentSpark: [-5, -8, -10, -8, -9, -12, -10, -8, -10, -9], hasEtf: true, pills: [] },
    { sym: 'KRE', name: 'Regional Banks', flowNet: 210_000, chgPct: 0.31, flowSide: 'calls', sentiment: 55, avgConviction: 58, cpRatio: 0.94, cylinders: null, last: 63, sparkline: [61, 62, 62, 63, 63, 62, 63, 64, 63, 63, 63], sentimentSpark: [2, 4, 5, 4, 5, 6, 5, 4, 5, 5], hasEtf: true, pills: [] },
  ],
  thematic: [
    { sym: 'KWEB', name: 'China Tech', flowNet: -420_000, chgPct: -0.82, flowSide: 'puts', sentiment: 36, avgConviction: 62, cpRatio: 1.52, cylinders: 'bearish', last: 29, sparkline: [31, 30, 29, 29, 28, 29, 28, 28, 27, 28, 29], sentimentSpark: [-15, -18, -20, -17, -19, -22, -20, -18, -20, -19], hasEtf: true, pills: [] },
    { sym: 'ARKK', name: 'Disruptive Innovation', flowNet: 380_000, chgPct: 1.1, flowSide: 'calls', sentiment: 61, avgConviction: 65, cpRatio: 0.82, cylinders: null, last: 58, sparkline: [55, 56, 57, 57, 58, 58, 59, 58, 59, 60, 58], sentimentSpark: [8, 10, 12, 10, 11, 14, 12, 10, 12, 11], hasEtf: true, pills: [] },
  ],
  technicals: { bullish: ['XLK', 'SMH', 'XLY', 'XLC'], bearish: ['XLE', 'XLRE'] },
  walls: { events: [] },
  generatedAt: NOW(),
};

// ---------------------------------------------------------------------------
// get_put_call_ratios
// ---------------------------------------------------------------------------
export const get_put_call_ratios: PutCallRatios = {
  ticker: 'SPY',
  putCallRatio: 0.78,
  expirationDate: '2026-07-11',
  putVolume: 124_800,
  callVolume: 160_000,
  sentiment: 'Bullish',
  dataSource: 'volume',
};

// ---------------------------------------------------------------------------
// get_earnings_flow
// ---------------------------------------------------------------------------
export const get_earnings_flow: EarningsFlow = {
  earnings: [
    {
      event: {
        symbol: 'TSLA', earningsDate: '2026-07-15', earningsTime: 'AMC',
        expectedMovePct: 8.4, expectedMovePrice: 22.5, realizedMovePct: null,
        realizedDirection: null, preEarningsClose: null, postEarningsOpen: null,
        preEarningsFlowCount: 14, preEarningsPremium: 4_200_000,
        preEarningsBullishPct: 72, preEarningsSentiment: 'Bullish',
        consensusConfidence: 'high', epsEstimate: 0.72, revenueEstimate: 25_800_000_000,
        sector: 'Consumer Discretionary', marketCapUsd: 900_000_000_000,
        lastEarningsOutcome: 'beat',
      },
      flows: [
        { daysBeforeEarnings: 8, signalWindow: '1w', signalWeight: 0.8, premium: 1_920_000, sentiment: 'Bullish', unusualScore: 89, tradeType: 'sweep', contractType: 'CALL', moneyness: 'OTM' },
        { daysBeforeEarnings: 3, signalWindow: '3d', signalWeight: 1.0, premium: 2_280_000, sentiment: 'Bullish', unusualScore: 94, tradeType: 'sweep', contractType: 'CALL', moneyness: 'OTM' },
      ],
      summary: { direction: 'Bullish', confidence: 'high', note: 'Strong call accumulation in final stretch' },
    },
    {
      event: {
        symbol: 'NFLX', earningsDate: '2026-07-16', earningsTime: 'AMC',
        expectedMovePct: 6.2, expectedMovePrice: 42.0, realizedMovePct: null,
        realizedDirection: null, preEarningsClose: null, postEarningsOpen: null,
        preEarningsFlowCount: 8, preEarningsPremium: 1_800_000,
        preEarningsBullishPct: 60, preEarningsSentiment: 'Neutral',
        consensusConfidence: 'medium', epsEstimate: 5.1, revenueEstimate: 10_500_000_000,
        sector: 'Communication Services', marketCapUsd: 280_000_000_000,
        lastEarningsOutcome: 'beat',
      },
      flows: [
        { daysBeforeEarnings: 5, signalWindow: '1w', signalWeight: 0.6, premium: 900_000, sentiment: 'Bullish', unusualScore: 74, tradeType: 'block', contractType: 'CALL', moneyness: 'OTM' },
        { daysBeforeEarnings: 2, signalWindow: '3d', signalWeight: 0.8, premium: 900_000, sentiment: 'Neutral', unusualScore: 68, tradeType: 'block', contractType: 'PUT', moneyness: 'OTM' },
      ],
      summary: { direction: 'Mixed', confidence: 'medium', note: 'Straddle-like positioning — market uncertain on direction' },
    },
    {
      event: {
        symbol: 'AMZN', earningsDate: '2026-07-30', earningsTime: 'AMC',
        expectedMovePct: 5.8, expectedMovePrice: 12.0, realizedMovePct: null,
        realizedDirection: null, preEarningsClose: null, postEarningsOpen: null,
        preEarningsFlowCount: 6, preEarningsPremium: 2_100_000,
        preEarningsBullishPct: 81, preEarningsSentiment: 'Bullish',
        consensusConfidence: 'high', epsEstimate: 1.34, revenueEstimate: 155_000_000_000,
        sector: 'Consumer Discretionary', marketCapUsd: 2_100_000_000_000,
        lastEarningsOutcome: 'beat',
      },
      flows: [
        { daysBeforeEarnings: 24, signalWindow: '1m', signalWeight: 0.5, premium: 2_100_000, sentiment: 'Bullish', unusualScore: 86, tradeType: 'sweep', contractType: 'CALL', moneyness: 'OTM' },
      ],
      summary: { direction: 'Bullish', confidence: 'medium', note: 'Early call sweeps — smart money positioning ahead of AWS print' },
    },
  ],
  count: 3,
  days: 7,
  timestamp: NOW(),
};

// ---------------------------------------------------------------------------
// get_economic_calendar
// ---------------------------------------------------------------------------
export const get_economic_calendar: EconomicCalendar = {
  dateFrom: '2026-07-06',
  dateTo: '2026-07-10',
  totalEvents: 6,
  events: [
    { date: '2026-07-07', time: '08:30', event: 'ISM Services PMI', impact: 'high', forecast: '53.4', previous: '52.9', actual: null, country: 'US' },
    { date: '2026-07-08', time: '08:30', event: 'Initial Jobless Claims', impact: 'medium', forecast: '225K', previous: '219K', actual: null, country: 'US' },
    { date: '2026-07-09', time: '08:30', event: 'CPI (MoM)', impact: 'high', forecast: '0.2%', previous: '0.1%', actual: null, country: 'US' },
    { date: '2026-07-09', time: '08:30', event: 'CPI (YoY)', impact: 'high', forecast: '2.9%', previous: '3.0%', actual: null, country: 'US' },
    { date: '2026-07-10', time: '10:00', event: 'Michigan Sentiment', impact: 'medium', forecast: '68.5', previous: '67.2', actual: null, country: 'US' },
    { date: '2026-07-10', time: '14:00', event: 'Federal Budget Balance', impact: 'low', forecast: '-$215B', previous: '-$228B', actual: null, country: 'US' },
  ],
};

// ---------------------------------------------------------------------------
// run_screener
// ---------------------------------------------------------------------------
const SCREENER_RESULTS: Record<string, ScreenerResultRow[]> = {
  'daily-cuts': [
    { ticker: 'NVDA', name: 'NVIDIA Corp', price: 128.45, change: 2.34, changePct: 1.85, volume: 42_100_000, avgVolume: 31_800_000, relVol: 1.32, score: 94, sector: 'Technology', setup: 'Leveraged Trend', edgeScore: 87 },
    { ticker: 'META', name: 'Meta Platforms', price: 622.8, change: 8.2, changePct: 1.33, volume: 18_400_000, avgVolume: 14_200_000, relVol: 1.3, score: 91, sector: 'Communication Services', setup: 'CSP Wheel', edgeScore: 82 },
    { ticker: 'TSLA', name: 'Tesla Inc', price: 268.1, change: 5.4, changePct: 2.06, volume: 88_200_000, avgVolume: 62_100_000, relVol: 1.42, score: 88, sector: 'Consumer Discretionary', setup: 'LEAPS', edgeScore: 79 },
    { ticker: 'AMD', name: 'Advanced Micro Devices', price: 154.3, change: 3.1, changePct: 2.05, volume: 28_900_000, avgVolume: 21_400_000, relVol: 1.35, score: 85, sector: 'Technology', setup: 'Leveraged Ignition', edgeScore: 76 },
    { ticker: 'AMZN', name: 'Amazon.com', price: 208.7, change: 2.9, changePct: 1.41, volume: 31_200_000, avgVolume: 24_600_000, relVol: 1.27, score: 83, sector: 'Consumer Discretionary', setup: 'LEAPS', edgeScore: 74 },
  ],
  momentum: [
    { ticker: 'NVDA', price: 128.45, change: 2.34, changePct: 1.85, score: 94, sector: 'Technology' },
    { ticker: 'AVGO', price: 188.2, change: 3.8, changePct: 2.06, score: 88, sector: 'Technology' },
    { ticker: 'TSM', price: 214.6, change: 4.2, changePct: 2.0, score: 86, sector: 'Technology' },
  ],
  'csp-wheel': [
    { ticker: 'META', price: 622.8, change: 8.2, changePct: 1.33, score: 91, sector: 'Communication Services', weeklyRoc: 1.42 },
    { ticker: 'AAPL', price: 211.5, change: 1.8, changePct: 0.86, score: 82, sector: 'Technology', weeklyRoc: 1.18 },
    { ticker: 'MSFT', price: 432.1, change: 3.4, changePct: 0.79, score: 79, sector: 'Technology', weeklyRoc: 1.08 },
  ],
  'volatility-squeeze': [
    { ticker: 'PLTR', price: 28.4, change: 0.6, changePct: 2.16, score: 83, sector: 'Technology' },
    { ticker: 'SOFI', price: 14.2, change: 0.35, changePct: 2.53, score: 78, sector: 'Financials' },
  ],
};

export function run_screener(args?: ToolArgs): ScreenerResult {
  const key = String(args?.screener ?? 'daily-cuts');
  const rows = SCREENER_RESULTS[key] ?? SCREENER_RESULTS['daily-cuts']!;
  const limit = typeof args?.limit === 'number' ? args.limit : undefined;
  const results = limit ? rows.slice(0, limit) : rows;
  return {
    screener: { id: key, name: key.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
    results,
    tickers: results.map((r) => r.ticker),
    count: rows.length,
    returned: results.length,
    timestamp: NOW(),
  };
}

// ---------------------------------------------------------------------------
// get_iv_rank
// ---------------------------------------------------------------------------
export function get_iv_rank(args?: ToolArgs): IvRank {
  const sym = String(args?.symbol ?? 'NVDA').toUpperCase();
  const rankMap: Record<string, number> = { NVDA: 72, SPY: 34, QQQ: 38, TSLA: 81, AAPL: 28, META: 55, AMD: 67 };
  const rank = rankMap[sym] ?? 50;
  return {
    symbol: sym,
    ivRank: rank,
    ivPercentile: rank + 5,
    currentIV: parseFloat((0.35 + rank / 200).toFixed(3)),
    ivMin52w: 0.24,
    ivMax52w: 0.82,
    interpretation: rank > 60 ? 'rich' : rank < 30 ? 'cheap' : 'neutral',
    note:
      rank > 60
        ? 'Premium is elevated vs history — favor selling strategies (CSPs, credit spreads, covered calls)'
        : rank < 30
          ? 'Premium is depressed vs history — favor buying strategies (long calls/puts, debit spreads)'
          : 'IV is near its historical median — no strong edge to buyers or sellers',
  };
}

// ---------------------------------------------------------------------------
// get_strategy_ideas
// ---------------------------------------------------------------------------
export function get_strategy_ideas(args?: ToolArgs): StrategyIdeas {
  const sym = String(args?.symbol ?? 'NVDA').toUpperCase();
  return {
    symbol: sym,
    direction: 'bullish',
    derivedFromTechnicals: true,
    structures: [
      {
        archetype: 'bull_put_spread', rank: 1, score: 88,
        legs: [
          { type: 'PUT', side: 'sell', qty: 1, strike: 120, premium: 3.4, delta: -0.28 },
          { type: 'PUT', side: 'buy', qty: 1, strike: 115, premium: 1.8, delta: -0.18 },
        ],
        maxProfit: 160, maxLoss: 340, breakevens: [118.4], pop: 0.72,
        capitalAtRisk: 340, expiration: '2026-08-07', dte: 31,
        rationale: `Sell the 120/115 put spread on ${sym}. Collects $1.60 credit with 72% POP. Structure benefits from continued upside or sideways action. Risk is defined.`,
        earningsInWindow: false,
      },
      {
        archetype: 'long_call', rank: 2, score: 79,
        legs: [{ type: 'CALL', side: 'buy', qty: 1, strike: 130, premium: 4.2, delta: 0.42 }],
        maxProfit: null, maxLoss: 420, breakevens: [134.2], pop: 0.42,
        capitalAtRisk: 420, expiration: '2026-08-07', dte: 31,
        rationale: `Long the 130 call on ${sym}. Directional leverage with defined risk. IV rank at 72 makes this slightly expensive but flow confirms the bull thesis.`,
        earningsInWindow: false,
      },
      {
        archetype: 'covered_call', rank: 3, score: 71,
        legs: [
          { type: 'STOCK', side: 'buy', qty: 100, strike: null, premium: 128.45, delta: 1.0 },
          { type: 'CALL', side: 'sell', qty: 1, strike: 132, premium: 2.8, delta: 0.38 },
        ],
        maxProfit: 635, maxLoss: 12565, breakevens: [125.65], pop: 0.62,
        capitalAtRisk: 12845, expiration: '2026-08-07', dte: 31,
        rationale: `Covered call on ${sym} at the 132 strike. Generates 2.2% monthly income. Capped upside above 132 — appropriate if mildly bullish or looking for income on existing position.`,
        earningsInWindow: false,
      },
    ],
    timestamp: NOW(),
  };
}

// ---------------------------------------------------------------------------
// get_edge_xray
// ---------------------------------------------------------------------------
export function get_edge_xray(args?: ToolArgs): EdgeXray {
  const sym = String(args?.symbol ?? 'NVDA').toUpperCase();
  const spot = 128.45;
  const contracts = [115, 120, 125, 128, 130, 135, 140].flatMap((strike) =>
    (['CALL', 'PUT'] as const).map((type) => {
      const residual = parseFloat(((Math.random() - 0.45) * 0.08).toFixed(4));
      return {
        strike,
        type,
        mid: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        iv: parseFloat((0.35 + Math.random() * 0.2).toFixed(3)),
        delta:
          type === 'CALL'
            ? parseFloat((0.7 - (strike / spot) * 0.5).toFixed(3))
            : parseFloat((-0.3 + (strike / spot) * 0.2).toFixed(3)),
        residual,
        verdict: residual > 0.02 ? 'rich' : residual < -0.02 ? 'cheap' : 'fair',
      };
    }),
  );
  return {
    symbol: sym,
    spot,
    expiration: '2026-08-07',
    dte: 31,
    availableExpirations: ['2026-07-11', '2026-07-18', '2026-08-07', '2026-09-18', '2026-12-18'],
    contracts,
    fairIvSummary: {
      callsMedianResidual: 0.018,
      putsMedianResidual: -0.012,
      overallBias: 'calls slightly rich, puts slightly cheap',
    },
    timestamp: NOW(),
  };
}

// ---------------------------------------------------------------------------
// get_apex_levels
// ---------------------------------------------------------------------------
export function get_apex_levels(args?: ToolArgs): ApexLevels {
  const sym = String(args?.symbol ?? 'SPY').toUpperCase();
  const spot = 502.3;
  return {
    symbol: sym,
    spotPrice: spot,
    snapshotTime: NOW(),
    mode: args?.expiration ? 'single' : 'aggregate',
    expirationsUsed: ['2026-07-18', '2026-07-25', '2026-08-01'],
    availableExpirations: ['2026-07-18', '2026-07-25', '2026-08-01', '2026-08-15', '2026-09-19'],
    gammaFlip: 498.5,
    levels: [
      { strike: 505, score: 100, rank: 1, netGEX: 1_240_000_000, totalOI: 68_400, isAboveSpot: true },
      { strike: 495, score: 74, rank: 2, netGEX: -320_000_000, totalOI: 91_200, isAboveSpot: false },
      { strike: 510, score: 52, rank: 3, netGEX: 480_000_000, totalOI: 41_600, isAboveSpot: true },
      { strike: 490, score: 41, rank: 4, netGEX: -180_000_000, totalOI: 55_800, isAboveSpot: false },
      { strike: 500, score: 38, rank: 5, netGEX: 92_000_000, totalOI: 38_100, isAboveSpot: false },
    ],
  };
}

// ---------------------------------------------------------------------------
// get_politician_trades / get_politician_trades_by_ticker
// ---------------------------------------------------------------------------
export function get_politician_trades(args?: ToolArgs): PoliticianTrades {
  const tab = (args?.tab as string) ?? 'top_portfolios';
  return {
    success: true,
    tab,
    window_days: tab === 'most_active' ? 30 : 90,
    generated_at: NOW(),
    entries: [
      { name: 'A. Ramirez', party: 'Democrat', chamber: 'House', totalEstimated: 2_400_000, tradeCount: 18, uniqueTickers: 12, topTickers: ['NVDA', 'MSFT', 'GOOGL'], lastTradeDate: '2026-07-01' },
      { name: 'K. Whitfield', party: 'Republican', chamber: 'Senate', totalEstimated: 1_850_000, tradeCount: 9, uniqueTickers: 7, topTickers: ['XOM', 'CVX'], lastTradeDate: '2026-06-28' },
      { name: 'T. Boone', party: 'Republican', chamber: 'House', totalEstimated: 940_000, tradeCount: 24, uniqueTickers: 15, topTickers: ['AAPL', 'AMD', 'TSLA'], lastTradeDate: '2026-07-05' },
      { name: 'S. Nakamura', party: 'Democrat', chamber: 'House', totalEstimated: 610_000, tradeCount: 6, uniqueTickers: 5, topTickers: ['JPM'], lastTradeDate: '2026-06-20' },
    ],
  };
}

export function get_politician_trades_by_ticker(args?: ToolArgs): PoliticianTradesByTicker {
  const ticker = String(args?.ticker ?? 'NVDA').toUpperCase();
  return {
    success: true,
    ticker,
    period_days: 90,
    total_trades: 2,
    trades: [
      {
        id: `a-ramirez_${ticker.toLowerCase()}_2026-07-01_buy`,
        name: 'A. Ramirez', party: 'Democrat', chamber: 'House',
        state_abbreviation: 'CA', state_name: 'California',
        company: `${ticker} Corp`, ticker,
        trade_date: '2026-07-01T00:00:00.000Z', days_until_disclosure: 22,
        trade_type: 'buy', trade_amount: '100K-250K', value_at_purchase: '$128.40',
        updated_at: NOW(),
      },
      {
        id: `t-boone_${ticker.toLowerCase()}_2026-06-15_sell`,
        name: 'T. Boone', party: 'Republican', chamber: 'House',
        state_abbreviation: 'TX', state_name: 'Texas',
        company: `${ticker} Corp`, ticker,
        trade_date: '2026-06-15T00:00:00.000Z', days_until_disclosure: 30,
        trade_type: 'sell', trade_amount: '15K-50K', value_at_purchase: '$121.10',
        updated_at: NOW(),
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// get_institutional_activity
// ---------------------------------------------------------------------------
export function get_institutional_activity(args?: ToolArgs): InstitutionalActivity {
  const limit = typeof args?.limit === 'number' ? args.limit : 10;
  const flows = [
    { ticker: 'SOXL', sentiment: 'Bullish' as const, total_premium: 27_800_000, flow_count: 60 },
    { ticker: 'INTC', sentiment: 'Bullish' as const, total_premium: 20_900_000, flow_count: 40 },
    { ticker: 'MU', sentiment: 'Bullish' as const, total_premium: 16_200_000, flow_count: 35 },
    { ticker: 'PLTR', sentiment: 'Bullish' as const, total_premium: 12_400_000, flow_count: 28 },
    { ticker: 'IWM', sentiment: 'Bearish' as const, total_premium: 5_400_000, flow_count: 21 },
  ];
  return {
    flows: flows.slice(0, limit),
    trading_date: NOW(),
    is_current_day: true,
    timeframe: 'today',
  };
}

// ---------------------------------------------------------------------------
// get_dividend_calendar
// ---------------------------------------------------------------------------
export function get_dividend_calendar(args?: ToolArgs): DividendCalendar {
  const results = [
    { symbol: 'PNC', companyName: 'PNC Financial Services Group Inc', sector: 'Banking', exDate: '2026-07-20', payDate: '2026-08-05', dividendRate: 8, dividendYield: 3.18 },
    { symbol: 'CAT', companyName: 'Caterpillar Inc', sector: 'Machinery', exDate: '2026-07-20', payDate: '2026-08-19', dividendRate: 6.52, dividendYield: 0.7 },
    { symbol: 'LOW', companyName: "Lowe's Companies Inc", sector: 'Retail', exDate: '2026-07-22', payDate: '2026-08-05', dividendRate: 5, dividendYield: 2.41 },
    { symbol: 'PFE', companyName: 'Pfizer Inc', sector: 'Pharmaceuticals', exDate: '2026-07-24', payDate: '2026-09-01', dividendRate: 1.72, dividendYield: 7.09 },
    { symbol: 'O', companyName: 'Realty Income Corp', sector: 'Real Estate', exDate: '2026-07-31', payDate: '2026-08-14', dividendRate: 3.25, dividendYield: 5.1 },
  ];
  const limit = typeof args?.limit === 'number' ? args.limit : 200;
  const sliced = results.slice(0, limit);
  return { count: sliced.length, from: '2026-07-16', days: typeof args?.days === 'number' ? args.days : 60, results: sliced };
}

// ---------------------------------------------------------------------------
// get_long_term_quality
// ---------------------------------------------------------------------------
const QUALITY_ROWS: QualityRow[] = [
  { symbol: 'MU', companyName: 'Micron Technology Inc', sector: 'Semiconductors', qualityScore: 96, pe: 22.1, pb: 11.1, beta: 2.21, marketCap: 1_058_000_000_000, netMargin: 55.9, operatingMargin: 65.6, grossMargin: 72.6, roe: 70.6, roa: 49.9, revenueGrowthYoY: 167.0, epsGrowthYoY: 700.7, dividendYield: 0.51, dividendRate: 0.6, payoutRatio: 1.1, debtToEquity: 0.06, currentRatio: 3.42, interestCoverage: 20.1, week52High: 1255, week52Low: 103.4, updatedAt: NOW() },
  { symbol: 'AAPL', companyName: 'Apple Inc', sector: 'Technology', qualityScore: 81, pe: 39.2, pb: 45.1, beta: 1.1, marketCap: 4_624_000_000_000, netMargin: 27.2, operatingMargin: 32.6, grossMargin: 47.9, roe: 146.7, roa: 34.0, revenueGrowthYoY: 12.8, epsGrowthYoY: 29.0, dividendYield: 0.32, dividendRate: 1.08, payoutRatio: 12.7, debtToEquity: 0.8, currentRatio: 1.07, interestCoverage: 622.5, week52High: 323.5, week52Low: 201.5, updatedAt: NOW() },
  { symbol: 'JNJ', companyName: 'Johnson & Johnson', sector: 'Pharmaceuticals', qualityScore: 89, pe: 17.4, pb: 5.8, beta: 0.54, marketCap: 412_000_000_000, netMargin: 21.3, operatingMargin: 26.1, grossMargin: 68.2, roe: 33.4, roa: 12.7, revenueGrowthYoY: 6.1, epsGrowthYoY: 8.9, dividendYield: 3.1, dividendRate: 5.16, payoutRatio: 44.2, debtToEquity: 0.45, currentRatio: 1.34, interestCoverage: 28.6, week52High: 178.2, week52Low: 142.1, updatedAt: NOW() },
];

export function get_long_term_quality(args?: ToolArgs): QualityList | QualitySingle {
  if (args?.symbol) {
    const sym = String(args.symbol).toUpperCase();
    const row = QUALITY_ROWS.find((r) => r.symbol === sym) ?? { ...QUALITY_ROWS[0]!, symbol: sym };
    return { ...row, nextExDate: '2026-08-10', nextPayDate: '2026-08-24', nextEarningsDate: '2026-10-29', live: !QUALITY_ROWS.some((r) => r.symbol === sym) };
  }
  const limit = typeof args?.limit === 'number' ? args.limit : 100;
  return { count: QUALITY_ROWS.length, results: QUALITY_ROWS.slice(0, limit) };
}

// ---------------------------------------------------------------------------
// get_ipo_scanner
// ---------------------------------------------------------------------------
export function get_ipo_scanner(args?: ToolArgs): IpoUpcoming | IpoRecent | IpoRadar | IpoTransitions {
  const view = (args?.view as IpoScannerView) ?? 'upcoming';
  const asOf = NOW();
  if (view === 'recent') {
    return {
      data: [
        {
          id: 1076, company: 'DPC Holdings Ltd', companyKey: 'dpc', symbol: 'DPC', exchange: 'NYSE', status: 'priced',
          priceRange: '33.00', sharesOffered: 27_858_585, expectedDate: '2026-06-25', firstTradeDate: '2026-06-25',
          ipoPrice: 33, secForm: null, secFilingDate: null, sources: ['FINNHUB', 'NASDAQ'], sourceUrls: [],
          primaryLink: null, cik: null, accession: null, lifecycleStage: 'Calendar', currentBucket: 'Recent',
          withdrawn: false, firstSeenAt: '2026-05-28T10:00:00.000Z', lastSeenAt: asOf, updatedAt: asOf,
          currentPrice: 46.75, pctFromIpo: 41.67, pctFromFirstClose: -0.28, day1Volume: 18_650_348,
          avgVolume30d: 3_119_851, setupAttentionScore: 63, setupAttentionTier: 'MED', perfUpdatedAt: asOf,
        },
      ],
      asOf, sourceCount: 2,
    };
  }
  if (view === 'radar') {
    return {
      data: [
        { company: 'Nimbus AI', companyKey: 'nimbusai', estValuationB: 42, sector: 'AI infrastructure', evidenceScore: 84, evidenceCount: 12, lastSignalDate: asOf, topDrivers: ['confidential_filing', 'named_underwriters'], signalConfidentialFiling: 1, signalPublicFiling: 0, signalConfirmedIpoIntent: 0, signalTargetTiming: 1, signalValuationReported: 1, signalNamedUnderwriters: 1, signalMultipleCredibleReports: 1 },
      ],
      asOf, sourceCount: 1,
    };
  }
  if (view === 'transitions') {
    return {
      data: [
        { id: 1710, companyKey: 'descartes', company: 'Descartes Systems Group Inc', symbol: null, eventType: 'sec_filing', fromBucket: null, toBucket: null, meta: { form_type: 'F-1' }, occurredAt: asOf },
      ],
      asOf, sourceCount: 1,
    };
  }
  return {
    data: [
      { id: 6894, company: 'Csquare, Inc.', companyKey: 'csquare', symbol: 'CSQR', exchange: 'NYSE', status: 'expected', priceRange: '23.00-27.00', sharesOffered: 50_000_000, expectedDate: '2026-07-18', firstTradeDate: null, ipoPrice: null, secForm: null, secFilingDate: null, sources: ['FINNHUB', 'NASDAQ'], sourceUrls: [], primaryLink: null, cik: null, accession: null, lifecycleStage: 'Calendar', currentBucket: 'Upcoming', withdrawn: false, firstSeenAt: '2026-06-27T10:00:00.000Z', lastSeenAt: asOf, updatedAt: asOf },
    ],
    asOf, sourceCount: 2,
  };
}

// ---------------------------------------------------------------------------
// get_bounce_signals / get_bounce_score
// ---------------------------------------------------------------------------
function bounceIndicators(overbought: boolean): BounceSignals['signals'][number]['indicatorData'] {
  return {
    bbPctb: overbought ? 0.94 : 0.06, bbScore: 1, bbState: overbought ? 'overbought' : 'oversold',
    kcScore: 1, kcState: overbought ? 'above_upper' : 'below_lower',
    cciScore: 1, cciState: 'extended', cciValue: overbought ? 128.5 : -132.1,
    rsiScore: 1, rsiState: overbought ? 'overbought' : 'oversold', rsiValue: overbought ? 87.4 : 14.2,
    volRatio: 1.14, volScore: 0, volState: 'normal',
    macdScore: 0, macdState: 'neutral', signalDate: '2026-07-15',
    stochScore: 1, stochState: overbought ? 'overbought' : 'oversold',
    willrScore: 0, willrState: 'neutral', willrValue: overbought ? -51.9 : -8.6,
    rsiDivBonus: 0, stochDValue: overbought ? 100 : 2, stochKValue: overbought ? 100 : 2,
    compositeScore: 5, compositeYesterday: 1,
  };
}

export function get_bounce_signals(args?: ToolArgs): BounceSignals {
  const direction = (args?.direction as string) ?? 'all';
  const all = [
    { id: 13795, ticker: 'BABA', signalType: 'bounce_top' as const, price: 117.74, changePercent: 4.83, volume: 17_875_485, avgVolume: 15_049_434, indicatorData: bounceIndicators(true), source: 'leveraged', detectedAt: NOW() },
    { id: 13780, ticker: 'RIOT', signalType: 'bounce_bottom' as const, price: 9.12, changePercent: -6.4, volume: 22_340_112, avgVolume: 18_902_400, indicatorData: bounceIndicators(false), source: 'small-cap', detectedAt: NOW() },
  ];
  const signals = direction === 'top' ? all.filter((s) => s.signalType === 'bounce_top')
    : direction === 'bottom' ? all.filter((s) => s.signalType === 'bounce_bottom')
    : all;
  return { signals, total: signals.length, page: typeof args?.page === 'number' ? args.page : 1, pageSize: typeof args?.pageSize === 'number' ? args.pageSize : 50, hasMore: false };
}

export function get_bounce_score(args?: ToolArgs): BounceScore {
  const ticker = String(args?.symbol ?? 'AAPL').toUpperCase();
  return {
    ticker, price: 227.5, changePercent: 4.01, compositeScore: 4, compositeYesterday: 2,
    kcScore: 1, rsiScore: 1, rsiDivBonus: 0, stochScore: 1, bbScore: 0, macdScore: 0, volScore: 0, willrScore: 1, cciScore: 0,
    rsiValue: 80.3, stochKValue: 100, stochDValue: 100, bbPctb: 0.87, volRatio: 0.86, willrValue: -2.2, cciValue: 104.7,
    kcState: 'above_upper', rsiState: 'overbought', stochState: 'overbought', bbState: 'neutral', macdState: 'neutral', volState: 'normal', willrState: 'overbought', cciState: 'normal',
  };
}

// ---------------------------------------------------------------------------
// get_conviction
// ---------------------------------------------------------------------------
export function get_conviction(args?: ToolArgs): ConvictionMarket | ConvictionTicker {
  if (args?.symbol) {
    return {
      ticker: String(args.symbol).toUpperCase(),
      score: 55,
      breakdown: { watchlistMomentum: 53, chatSentiment: 57 },
      asOf: NOW(),
    };
  }
  const entry = (ticker: string, score: number, adds: number) => ({ ticker, score, adds24h: adds, removes24h: 0, net24h: adds });
  return {
    score: 80,
    breakdown: { watchlistMomentum: 98, chatSentiment: 56, discordReactions: 80 },
    topTickers: [entry('RKLB', 53, 2), entry('PLTR', 53, 2), entry('AAPL', 53, 2), entry('NFLX', 52, 1)],
    topAdds: [
      { ticker: 'PLTR', score: 63, adds24h: 2, removes24h: 0, net24h: 2, net7d: 8 },
      { ticker: 'NVDA', score: 58, adds24h: 1, removes24h: 0, net24h: 1, net7d: 5 },
    ],
    asOf: NOW(),
  };
}

// ---------------------------------------------------------------------------
// get_market_health
// ---------------------------------------------------------------------------
export const get_market_health: MarketHealth = {
  signals: [
    { id: 'risk_appetite_sphb_splv', label: 'SPHB / SPLV Ratio', category: 'RISK APPETITE', status: 'ALERT', summary: 'High-beta lagging defensive; risk appetite fading.', dataPoints: ['Ratio 1.944 vs 20d MA 2.002', '20d slope -4.7%'], asOf: NOW(), detail: { ratio: 1.94, ma20: 2.0, slope20Pct: -4.67 } },
    { id: 'credit_hyg_jnk', label: 'HYG / JNK Credit ETFs', category: 'CREDIT', status: 'CLEAR', summary: 'Both HY ETFs trading above 50d MA.', dataPoints: ['HYG 80.10 vs 50d MA 79.82', 'JNK 96.40 vs 50d MA 96.13'], asOf: NOW(), detail: { hygLast: 80.1, hygMa50: 79.82, jnkLast: 96.4, jnkMa50: 96.13 } },
    { id: 'vol_vix_spx_diverge', label: 'VIX vs SPX Divergence', category: 'VOL REGIME', status: 'CLEAR', summary: 'Vol regime aligned with tape direction.', dataPoints: ['VIX 5d -7.3% (now 15.67)', 'SPY 5d 1.3% (now 502.3)'], asOf: NOW(), detail: { vixLast: 15.67, vix5dPct: -7.28, spyLast: 502.3, spy5dPct: 1.26 } },
    { id: 'leadership_semis_failures', label: 'Semis Breakout Failures', category: 'LEADERSHIP', status: 'CLEAR', summary: 'No recent SMH breakout failures.', dataPoints: ['SMH last 590.77', 'Failures in last 10 sessions: 0'], asOf: NOW(), detail: { failures: 0, lastClose: 590.77 } },
  ],
  alertCount: 1,
  watchCount: 0,
  availableCount: 4,
  totalCount: 7,
  generatedAt: NOW(),
  compositeScore: { value: 1, max: 7, label: 'LOW' },
};

// ---------------------------------------------------------------------------
// get_hedge_analysis
// ---------------------------------------------------------------------------
export function get_hedge_analysis(args?: ToolArgs): HedgeAnalysis {
  const sym = String(args?.symbol ?? 'AAPL').toUpperCase();
  const spot = 227.5;
  return {
    symbol: sym,
    spot,
    expiration: '2026-08-28',
    dte: 44,
    downsideMove: 15.5,
    downsideBasis: 'expected_move',
    downsideDollars: 1550,
    hedges: [
      {
        kind: 'put_spread_collar',
        legs: [
          { type: 'put', side: 'long', strike: 220, qty: 1, premium: 4.7 },
          { type: 'put', side: 'short', strike: 205, qty: 1, premium: 1.35 },
          { type: 'call', side: 'short', strike: 240, qty: 1, premium: 4.05 },
        ],
        cost: -70,
        dollarsProtected: 1500,
        costPerDollarProtected: -0.05,
        breakevenAtExpiry: 227.7,
        positionDelta: 42.1,
        rationale: 'Buy the $220 / sell the $205 put spread and sell the $240 call — cheapest protection, floor stops working below $205',
      },
      {
        kind: 'collar',
        legs: [
          { type: 'put', side: 'long', strike: 220, qty: 1, premium: 4.7 },
          { type: 'call', side: 'short', strike: 240, qty: 1, premium: 4.05 },
        ],
        cost: 65,
        dollarsProtected: 1500,
        costPerDollarProtected: 0.04,
        breakevenAtExpiry: null,
        positionDelta: 33.9,
        rationale: 'Buy the $220 put and sell the $240 call — finances the downside floor by capping gains above $240',
      },
    ],
  };
}
