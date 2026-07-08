"""types.py — TypedDicts mirroring every TraderDaddy Pro MCP tool response.

These mirror the shapes in @traderdaddy/sdk's types.ts (and the shapes the mock
fixtures satisfy). Responses arrive as JSON, so these are ``TypedDict``s over
the decoded ``dict`` — zero runtime overhead, full IDE/type-checker support.
Open-ended string enums are typed as ``str``.
"""

from __future__ import annotations

from typing import Literal, NotRequired, TypedDict

OptionType = Literal["CALL", "PUT"]
FlowSide = Literal["calls", "puts"]


# --- get_market_stats -------------------------------------------------------
# NOTE: this legacy tool's live payload is snake_case and carries no overall
# sentiment index, bull/bear ratio, or alert count — mirror the actual wire
# shape so mock stays byte-identical to live. Derive any composite from the
# three index P/C ratios + sentiments.
class MarketStats(TypedDict):
    spy_put_call_ratio: float
    qqq_put_call_ratio: float
    iwm_put_call_ratio: float
    spy_sentiment: str
    qqq_sentiment: str
    iwm_sentiment: str
    largest_trade_premium: float
    largest_trade_symbol: str
    largest_trade_strike: float
    largest_trade_expiry: str
    largest_trade_type: OptionType
    tradingDate: str
    timestamp: str
    marketOpen: bool


# --- get_unusual_activity ---------------------------------------------------
class UnusualActivityRow(TypedDict):
    id: str
    tradeTime: str
    ticker: str
    type: OptionType
    premium: float
    volume: int
    openInterest: int
    sentiment: str
    sentimentConfidence: str
    score: float
    tradeType: str
    executionSpeed: str
    vsOI: float
    vsADV: float
    flowDescription: str
    tier: str
    tierColor: str
    tierDescription: str
    repeatCount: int
    clusterId: str | None
    convictionLevel: str
    isRepeatFlow: bool
    sentimentAction: str
    sentimentLabel: str
    sentimentDescription: str
    sentimentExplanation: str
    isDivergentFlow: bool
    moneynessPct: float
    moneynessBucket: str


class UnusualActivityAggregates(TypedDict):
    totalPremium: float
    bullishPremium: float
    bearishPremium: float
    bullishCount: int
    bearishCount: int
    avgScore: float
    topTicker: str
    topPremium: float


class UnusualActivityFilters(TypedDict):
    ticker: str | None
    direction: str | None
    minPremium: float | None
    limit: int | None


class UnusualActivity(TypedDict):
    data: list[UnusualActivityRow]
    total: int
    aggregates: UnusualActivityAggregates
    filters: UnusualActivityFilters
    timestamp: str


# --- get_gex_overview / get_gex_ticker --------------------------------------
class GexStrike(TypedDict):
    strike: float
    callGex: float
    putGex: float
    netGex: float
    callOi: int
    putOi: int
    callGamma: float
    putGamma: float
    distanceFromSpot: float
    isAboveSpot: bool


class GexSymbol(TypedDict):
    symbol: str
    totalGEX: float
    callGex: float
    putGex: float
    netGex: float
    flipPoint: float
    bias: str
    byStrike: list[GexStrike]


class GexMarketSummary(TypedDict):
    totalGEX: float
    bias: str
    interpretation: str


class GexProxy(TypedDict):
    symbol: str
    scaleFactor: float


class GexTicker(GexSymbol):
    proxy: GexProxy | None


# get_gex_overview keys per-index GexSymbol by symbol alongside `marketSummary`.
GexOverview = dict  # {"marketSummary": GexMarketSummary, "SPY": GexSymbol, ...}


# --- get_sector_flow --------------------------------------------------------
class Sector(TypedDict):
    sym: str
    name: str
    flowNet: float
    chgPct: float
    flowSide: FlowSide
    sentiment: float
    avgConviction: float
    cpRatio: float
    cylinders: str | None
    last: float
    sparkline: list[float]
    sentimentSpark: list[float]
    hasEtf: bool
    pills: list


class SectorMacro(TypedDict):
    label: str
    description: str
    riskOnScore: float
    dominantSector: str
    dominantFlow: FlowSide


class SectorFlow(TypedDict):
    window: str
    macro: SectorMacro
    sectors: list[Sector]
    subsectors: list[Sector]
    thematic: list[Sector]
    technicals: dict
    walls: dict
    generatedAt: str


# --- get_put_call_ratios ----------------------------------------------------
class PutCallRatios(TypedDict):
    ticker: str
    putCallRatio: float
    expirationDate: str
    putVolume: int
    callVolume: int
    sentiment: str
    dataSource: str


# --- get_iv_rank ------------------------------------------------------------
class IvRank(TypedDict):
    symbol: str
    ivRank: float
    ivPercentile: float
    currentIV: float
    ivMin52w: float
    ivMax52w: float
    interpretation: str
    note: str


# --- run_screener -----------------------------------------------------------
class ScreenerResultRow(TypedDict):
    ticker: str
    name: NotRequired[str]
    price: float
    change: float
    changePct: float
    volume: NotRequired[int]
    avgVolume: NotRequired[int]
    relVol: NotRequired[float]
    score: float
    sector: str
    setup: NotRequired[str]
    edgeScore: NotRequired[float]
    weeklyRoc: NotRequired[float]


class ScreenerResult(TypedDict):
    screener: dict
    results: list[ScreenerResultRow]
    tickers: list[str]
    count: int
    returned: int
    timestamp: str


# --- get_strategy_ideas -----------------------------------------------------
class StrategyLeg(TypedDict):
    type: Literal["CALL", "PUT", "STOCK"]
    side: Literal["buy", "sell"]
    qty: int
    strike: float | None
    premium: float
    delta: float


class StrategyStructure(TypedDict):
    archetype: str
    rank: int
    score: float
    legs: list[StrategyLeg]
    maxProfit: float | None
    maxLoss: float
    breakevens: list[float]
    pop: float
    capitalAtRisk: float
    expiration: str
    dte: int
    rationale: str
    earningsInWindow: bool


class StrategyIdeas(TypedDict):
    symbol: str
    direction: str
    derivedFromTechnicals: bool
    structures: list[StrategyStructure]
    timestamp: str


# --- get_edge_xray ----------------------------------------------------------
class EdgeXrayContract(TypedDict):
    strike: float
    type: OptionType
    mid: float
    iv: float
    delta: float
    residual: float
    verdict: str


class EdgeXray(TypedDict):
    symbol: str
    spot: float
    expiration: str
    dte: int
    availableExpirations: list[str]
    contracts: list[EdgeXrayContract]
    fairIvSummary: dict
    timestamp: str


# --- get_earnings_flow ------------------------------------------------------
class EarningsEvent(TypedDict):
    symbol: str
    earningsDate: str
    earningsTime: str
    expectedMovePct: float
    expectedMovePrice: float
    realizedMovePct: float | None
    realizedDirection: str | None
    preEarningsClose: float | None
    postEarningsOpen: float | None
    preEarningsFlowCount: int
    preEarningsPremium: float
    preEarningsBullishPct: float
    preEarningsSentiment: str
    consensusConfidence: str
    epsEstimate: float
    revenueEstimate: float
    sector: str
    marketCapUsd: float
    lastEarningsOutcome: str


class EarningsFlowLeg(TypedDict):
    daysBeforeEarnings: int
    signalWindow: str
    signalWeight: float
    premium: float
    sentiment: str
    unusualScore: float
    tradeType: str
    contractType: OptionType
    moneyness: str


class EarningsFlowItem(TypedDict):
    event: EarningsEvent
    flows: list[EarningsFlowLeg]
    summary: dict


class EarningsFlow(TypedDict):
    earnings: list[EarningsFlowItem]
    count: int
    days: int
    timestamp: str


# --- get_economic_calendar --------------------------------------------------
class EconomicEvent(TypedDict):
    date: str
    time: str
    event: str
    impact: str
    forecast: str | None
    previous: str | None
    actual: str | None
    country: str


class EconomicCalendar(TypedDict):
    dateFrom: str
    dateTo: str
    totalEvents: int
    events: list[EconomicEvent]
