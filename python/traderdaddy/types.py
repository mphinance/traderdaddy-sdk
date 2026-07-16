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


# --- get_apex_levels ---------------------------------------------------------
class ApexLevel(TypedDict):
    strike: float
    score: float
    rank: int
    netGEX: float
    totalOI: int
    isAboveSpot: bool


class ApexLevels(TypedDict):
    symbol: str
    spotPrice: float
    snapshotTime: str
    mode: str
    expirationsUsed: list[str]
    availableExpirations: list[str]
    gammaFlip: float
    levels: list[ApexLevel]


# --- get_politician_trades / get_politician_trades_by_ticker ----------------
class PoliticianPortfolioEntry(TypedDict):
    name: str
    party: str
    chamber: str
    totalEstimated: float
    tradeCount: int
    uniqueTickers: int
    topTickers: list[str]
    lastTradeDate: str


class PoliticianTrades(TypedDict):
    success: bool
    tab: str
    window_days: int
    generated_at: str
    entries: list[PoliticianPortfolioEntry]


class PoliticianTrade(TypedDict):
    id: str
    name: str
    party: str
    chamber: str
    state_abbreviation: str
    state_name: str
    company: str
    ticker: str
    trade_date: str
    days_until_disclosure: int
    trade_type: str
    trade_amount: str
    value_at_purchase: str
    updated_at: str


class PoliticianTradesByTicker(TypedDict):
    success: bool
    ticker: str
    period_days: int
    total_trades: int
    trades: list[PoliticianTrade]


# --- get_institutional_activity ----------------------------------------------
class InstitutionalFlow(TypedDict):
    ticker: str
    sentiment: str
    total_premium: float
    flow_count: int


class InstitutionalActivity(TypedDict):
    flows: list[InstitutionalFlow]
    trading_date: str
    is_current_day: bool
    timeframe: str


# --- get_dividend_calendar ----------------------------------------------------
class DividendEvent(TypedDict):
    symbol: str
    companyName: str
    sector: str
    exDate: str
    payDate: str
    dividendRate: float
    dividendYield: float


class DividendCalendar(TypedDict):
    count: int
    from_: NotRequired[str]  # 'from' is a Python keyword; wire key is still "from"
    days: int
    results: list[DividendEvent]


# --- get_long_term_quality ----------------------------------------------------
class QualityRow(TypedDict):
    symbol: str
    companyName: str
    sector: str
    qualityScore: float
    pe: float
    pb: float
    beta: float
    marketCap: float
    netMargin: float
    operatingMargin: float
    grossMargin: float
    roe: float
    roa: float
    revenueGrowthYoY: float
    epsGrowthYoY: float
    dividendYield: float | None
    dividendRate: float
    payoutRatio: float | None
    debtToEquity: float
    currentRatio: float
    interestCoverage: float
    week52High: float
    week52Low: float
    updatedAt: str


class QualityList(TypedDict):
    count: int
    results: list[QualityRow]


class QualitySingle(QualityRow):
    nextExDate: str | None
    nextPayDate: str | None
    nextEarningsDate: str | None
    live: bool


# --- get_ipo_scanner -----------------------------------------------------------
class IpoUpcomingRow(TypedDict):
    id: int
    company: str
    companyKey: str
    symbol: str | None
    exchange: str
    status: str
    priceRange: str | None
    sharesOffered: int | None
    expectedDate: str | None
    firstTradeDate: str | None
    ipoPrice: float | None
    secForm: str | None
    secFilingDate: str | None
    sources: list[str]
    sourceUrls: list[str]
    primaryLink: str | None
    cik: str | None
    accession: str | None
    lifecycleStage: str
    currentBucket: str
    withdrawn: bool
    firstSeenAt: str
    lastSeenAt: str
    updatedAt: str


class IpoRecentRow(IpoUpcomingRow):
    currentPrice: float | None
    pctFromIpo: float | None
    pctFromFirstClose: float | None
    day1Volume: int | None
    avgVolume30d: float | None
    setupAttentionScore: float | None
    setupAttentionTier: str | None
    perfUpdatedAt: str | None


class IpoRadarRow(TypedDict):
    company: str
    companyKey: str
    estValuationB: float | None
    sector: str | None
    evidenceScore: float
    evidenceCount: int
    lastSignalDate: str
    topDrivers: list[str]
    signalConfidentialFiling: int
    signalPublicFiling: int
    signalConfirmedIpoIntent: int
    signalTargetTiming: int
    signalValuationReported: int
    signalNamedUnderwriters: int
    signalMultipleCredibleReports: int


class IpoTransitionEvent(TypedDict):
    id: int
    companyKey: str
    company: str
    symbol: str | None
    eventType: str
    fromBucket: str | None
    toBucket: str | None
    meta: dict
    occurredAt: str


class IpoUpcoming(TypedDict):
    data: list[IpoUpcomingRow]
    asOf: str
    sourceCount: int


class IpoRecent(TypedDict):
    data: list[IpoRecentRow]
    asOf: str
    sourceCount: int


class IpoRadar(TypedDict):
    data: list[IpoRadarRow]
    asOf: str
    sourceCount: int


class IpoTransitions(TypedDict):
    data: list[IpoTransitionEvent]
    asOf: str
    sourceCount: int


# --- get_bounce_signals / get_bounce_score ------------------------------------
class BounceIndicatorData(TypedDict):
    bbPctb: float
    bbScore: float
    bbState: str
    kcScore: float
    kcState: str
    cciScore: float
    cciState: str
    cciValue: float
    rsiScore: float
    rsiState: str
    rsiValue: float
    volRatio: float
    volScore: float
    volState: str
    macdScore: float
    macdState: str
    signalDate: str
    stochScore: float
    stochState: str
    willrScore: float
    willrState: str
    willrValue: float
    rsiDivBonus: float
    stochDValue: float
    stochKValue: float
    compositeScore: float
    compositeYesterday: float


class BounceSignal(TypedDict):
    id: int
    ticker: str
    signalType: str
    price: float
    changePercent: float
    volume: int
    avgVolume: float
    indicatorData: BounceIndicatorData
    source: str
    detectedAt: str


class BounceSignals(TypedDict):
    signals: list[BounceSignal]
    total: int
    page: int
    pageSize: int
    hasMore: bool


class BounceScore(TypedDict):
    ticker: str
    price: float
    changePercent: float
    compositeScore: float
    compositeYesterday: float
    kcScore: float
    rsiScore: float
    rsiDivBonus: float
    stochScore: float
    bbScore: float
    macdScore: float
    volScore: float
    willrScore: float
    cciScore: float
    rsiValue: float
    stochKValue: float
    stochDValue: float
    bbPctb: float
    volRatio: float
    willrValue: float
    cciValue: float
    kcState: str
    rsiState: str
    stochState: str
    bbState: str
    macdState: str
    volState: str
    willrState: str
    cciState: str


# --- get_conviction -------------------------------------------------------------
class ConvictionTickerEntry(TypedDict):
    ticker: str
    score: float
    adds24h: int
    removes24h: int
    net24h: int


class ConvictionTopAdd(ConvictionTickerEntry):
    net7d: int


class ConvictionMarket(TypedDict):
    score: float
    breakdown: dict
    topTickers: list[ConvictionTickerEntry]
    topAdds: list[ConvictionTopAdd]
    asOf: str


class ConvictionTicker(TypedDict):
    ticker: str
    score: float
    breakdown: dict
    asOf: str


# --- get_market_health -----------------------------------------------------------
class MarketHealthSignal(TypedDict):
    id: str
    label: str
    category: str
    status: str
    summary: str
    dataPoints: list[str]
    asOf: str
    detail: dict


class MarketHealth(TypedDict):
    signals: list[MarketHealthSignal]
    alertCount: int
    watchCount: int
    availableCount: int
    totalCount: int
    generatedAt: str
    compositeScore: dict


# --- get_hedge_analysis -----------------------------------------------------------
class HedgeLeg(TypedDict):
    type: str
    side: str
    strike: float
    qty: int
    premium: float


class HedgeStructure(TypedDict):
    kind: str
    legs: list[HedgeLeg]
    cost: float
    dollarsProtected: float
    costPerDollarProtected: float
    breakevenAtExpiry: float | None
    positionDelta: float
    rationale: str


class HedgeAnalysis(TypedDict):
    symbol: str
    spot: NotRequired[float]
    expiration: NotRequired[str]
    dte: NotRequired[int]
    downsideMove: NotRequired[float]
    downsideBasis: NotRequired[str]
    downsideDollars: NotRequired[float]
    hedges: NotRequired[list[HedgeStructure]]
    error: NotRequired[str]
