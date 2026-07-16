"""fixtures.py — realistic, typed demo fixtures.

Ported from @traderdaddy/sdk's mock/fixtures.ts, covering all 24 MCP tools:
    get_market_stats, get_unusual_activity, get_gex_overview, get_gex_ticker,
    get_sector_flow, get_put_call_ratios, get_iv_rank, get_earnings_flow,
    get_economic_calendar, run_screener, get_strategy_ideas, get_edge_xray,
    get_apex_levels, get_politician_trades, get_politician_trades_by_ticker,
    get_institutional_activity, get_dividend_calendar, get_long_term_quality,
    get_ipo_scanner, get_bounce_signals, get_bounce_score, get_conviction,
    get_market_health, get_hedge_analysis

Each name matches a tool; callables take the tool ``args`` dict. Values are
deep-copied by ``MockTransport`` before return, so mutating a result is safe.
"""

from __future__ import annotations

import random
from datetime import datetime, timezone
from typing import Any


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# --- get_market_stats -------------------------------------------------------
get_market_stats = {
    "spy_put_call_ratio": 0.78,
    "qqq_put_call_ratio": 0.65,
    "iwm_put_call_ratio": 1.12,
    "spy_sentiment": "Bullish",
    "qqq_sentiment": "Bullish",
    "iwm_sentiment": "Bearish",
    "largest_trade_premium": 3_840_000,
    "largest_trade_symbol": "NVDA260710C00185000",
    "largest_trade_strike": 185,
    "largest_trade_expiry": "07/10/26",
    "largest_trade_type": "CALL",
    "tradingDate": "2026-07-07",
    "timestamp": _now(),
    "marketOpen": True,
}


# --- get_unusual_activity ---------------------------------------------------
_UA_ROWS = [
    {
        "id": "ua-001", "tradeTime": "2026-07-07T13:45:22Z",
        "ticker": "NVDA", "type": "CALL", "premium": 3_840_000, "volume": 4200, "openInterest": 18900,
        "sentiment": "Bullish", "sentimentConfidence": "high", "score": 94,
        "tradeType": "sweep", "executionSpeed": "fast", "vsOI": 22.2, "vsADV": 380.1,
        "flowDescription": "Aggressive sweep across 7 exchanges — institutional accumulation pattern",
        "tier": "LEGENDARY", "tierColor": "#f59e0b", "tierDescription": "Top 5% unusual flow",
        "repeatCount": 3, "clusterId": "cl-nvda-1", "convictionLevel": "ultra-high",
        "isRepeatFlow": True, "sentimentAction": "bought calls", "sentimentLabel": "Bullish Conviction",
        "sentimentDescription": "Large call sweep — buyer is paying for upside exposure aggressively",
        "sentimentExplanation": "CALL bought on ask signals directional conviction, not hedging",
        "isDivergentFlow": False, "moneynessPct": 2.4, "moneynessBucket": "OTM",
    },
    {
        "id": "ua-002", "tradeTime": "2026-07-07T13:42:07Z",
        "ticker": "SPY", "type": "PUT", "premium": 2_150_000, "volume": 9100, "openInterest": 42000,
        "sentiment": "Bearish", "sentimentConfidence": "high", "score": 87,
        "tradeType": "block", "executionSpeed": "normal", "vsOI": 21.7, "vsADV": 210.3,
        "flowDescription": "Sizable put block — large hedge or directional short bet ahead of FOMC",
        "tier": "ELITE", "tierColor": "#8b5cf6", "tierDescription": "Top 10% unusual flow",
        "repeatCount": 1, "clusterId": None, "convictionLevel": "high",
        "isRepeatFlow": False, "sentimentAction": "bought puts", "sentimentLabel": "Bearish Conviction",
        "sentimentDescription": "Put block bought on ask — downside protection or directional bet",
        "sentimentExplanation": "PUT bought on ask at market close time suggests macro hedge",
        "isDivergentFlow": False, "moneynessPct": -1.8, "moneynessBucket": "OTM",
    },
    {
        "id": "ua-003", "tradeTime": "2026-07-07T13:38:55Z",
        "ticker": "TSLA", "type": "CALL", "premium": 1_920_000, "volume": 6800, "openInterest": 31200,
        "sentiment": "Bullish", "sentimentConfidence": "high", "score": 89,
        "tradeType": "sweep", "executionSpeed": "fast", "vsOI": 21.8, "vsADV": 295.4,
        "flowDescription": "Multi-leg sweep — aggressive call buying ahead of earnings catalyst",
        "tier": "ELITE", "tierColor": "#8b5cf6", "tierDescription": "Top 10% unusual flow",
        "repeatCount": 2, "clusterId": "cl-tsla-1", "convictionLevel": "high",
        "isRepeatFlow": True, "sentimentAction": "bought calls", "sentimentLabel": "Bullish Conviction",
        "sentimentDescription": "Repeated call sweeps confirm institutional accumulation",
        "sentimentExplanation": "CALL bought on ask, repeat flow = rising conviction",
        "isDivergentFlow": False, "moneynessPct": 3.1, "moneynessBucket": "OTM",
    },
    {
        "id": "ua-004", "tradeTime": "2026-07-07T13:35:11Z",
        "ticker": "AAPL", "type": "CALL", "premium": 1_340_000, "volume": 3100, "openInterest": 22400,
        "sentiment": "Bullish", "sentimentConfidence": "high", "score": 81,
        "tradeType": "block", "executionSpeed": "normal", "vsOI": 13.8, "vsADV": 142.7,
        "flowDescription": "Institutional call block — quiet accumulation before product event",
        "tier": "NOTABLE", "tierColor": "#3b82f6", "tierDescription": "Top 20% unusual flow",
        "repeatCount": 1, "clusterId": None, "convictionLevel": "medium",
        "isRepeatFlow": False, "sentimentAction": "bought calls", "sentimentLabel": "Bullish",
        "sentimentDescription": "Call block signals bullish positioning or overwrite rollout",
        "sentimentExplanation": "CALL bought slightly above mid — directional lean",
        "isDivergentFlow": False, "moneynessPct": 1.2, "moneynessBucket": "OTM",
    },
    {
        "id": "ua-005", "tradeTime": "2026-07-07T13:30:44Z",
        "ticker": "AMD", "type": "CALL", "premium": 975_000, "volume": 2800, "openInterest": 14900,
        "sentiment": "Bullish", "sentimentConfidence": "high", "score": 78,
        "tradeType": "sweep", "executionSpeed": "fast", "vsOI": 18.8, "vsADV": 188.2,
        "flowDescription": "Call sweep on pullback — smart money buying dip in semis",
        "tier": "NOTABLE", "tierColor": "#3b82f6", "tierDescription": "Top 20% unusual flow",
        "repeatCount": 1, "clusterId": None, "convictionLevel": "medium",
        "isRepeatFlow": False, "sentimentAction": "bought calls", "sentimentLabel": "Bullish",
        "sentimentDescription": "Sweep on bid side — opportunistic upside capture",
        "sentimentExplanation": "CALL bought on pullback, sweep pattern = urgency",
        "isDivergentFlow": False, "moneynessPct": 2.8, "moneynessBucket": "OTM",
    },
    {
        "id": "ua-006", "tradeTime": "2026-07-07T13:27:18Z",
        "ticker": "META", "type": "CALL", "premium": 2_610_000, "volume": 5400, "openInterest": 28700,
        "sentiment": "Bullish", "sentimentConfidence": "high", "score": 92,
        "tradeType": "sweep", "executionSpeed": "fast", "vsOI": 18.8, "vsADV": 312.5,
        "flowDescription": "Massive call sweep — AI infrastructure play, near 52-week high",
        "tier": "LEGENDARY", "tierColor": "#f59e0b", "tierDescription": "Top 5% unusual flow",
        "repeatCount": 2, "clusterId": "cl-meta-1", "convictionLevel": "ultra-high",
        "isRepeatFlow": True, "sentimentAction": "bought calls", "sentimentLabel": "Bullish Conviction",
        "sentimentDescription": "Repeat call sweeps — size and speed signal institutional intent",
        "sentimentExplanation": "CALL sweep on ask repeated = persistent buy interest",
        "isDivergentFlow": False, "moneynessPct": 1.5, "moneynessBucket": "OTM",
    },
]

_UA_BULL = [r for r in _UA_ROWS if r["sentiment"] == "Bullish"]
_UA_BEAR = [r for r in _UA_ROWS if r["sentiment"] == "Bearish"]

get_unusual_activity = {
    "data": _UA_ROWS,
    "total": len(_UA_ROWS),
    "aggregates": {
        "totalPremium": sum(r["premium"] for r in _UA_ROWS),
        "bullishPremium": sum(r["premium"] for r in _UA_BULL),
        "bearishPremium": sum(r["premium"] for r in _UA_BEAR),
        "bullishCount": len(_UA_BULL),
        "bearishCount": len(_UA_BEAR),
        "avgScore": round(sum(r["score"] for r in _UA_ROWS) / len(_UA_ROWS), 1),
        "topTicker": "NVDA",
        "topPremium": 3_840_000,
    },
    "filters": {"ticker": None, "direction": None, "minPremium": None, "limit": 25},
    "timestamp": _now(),
}


# --- get_gex_overview / get_gex_ticker --------------------------------------
def _make_gex_symbol(sym: str, total_gex: float, bias: str) -> dict[str, Any]:
    by_strike = []
    for i, strike in enumerate([470, 480, 490, 500, 510, 520, 530]):
        by_strike.append(
            {
                "strike": strike,
                "callGex": round((i - 2) * 1.2e9 + 2e9),
                "putGex": round((3 - i) * 0.9e9 - 1.5e9),
                "netGex": round((i - 2) * 0.8e9 + 0.5e9),
                "callOi": 12000 + i * 800,
                "putOi": 9000 + (6 - i) * 700,
                "callGamma": round(0.008 + i * 0.002, 4),
                "putGamma": round(0.009 - i * 0.0015, 4),
                "distanceFromSpot": round(((strike - 499) / 499) * 100, 2),
                "isAboveSpot": strike >= 499,
            }
        )
    return {
        "symbol": sym,
        "totalGEX": total_gex,
        "callGex": total_gex * 0.62,
        "putGex": total_gex * -0.38,
        "netGex": total_gex,
        "flipPoint": 487,
        "bias": bias,
        "byStrike": by_strike,
    }


get_gex_overview = {
    "SPY": _make_gex_symbol("SPY", 4.8e9, "LONG_GAMMA"),
    "QQQ": _make_gex_symbol("QQQ", 2.1e9, "LONG_GAMMA"),
    "SPX": _make_gex_symbol("SPX", 11.4e9, "LONG_GAMMA"),
    "marketSummary": {
        "totalGEX": 18.3e9,
        "bias": "LONG_GAMMA",
        "interpretation": (
            "Market makers are net long gamma. Expect mean reversion and "
            "dampened volatility."
        ),
    },
}


def get_gex_ticker(args: dict[str, Any] | None = None) -> dict[str, Any]:
    sym = str((args or {}).get("symbol", "NVDA")).upper()
    base = 1.2e9 if sym == "NVDA" else 0.8e9
    by_strike = []
    for i, strike in enumerate([100, 110, 120, 130, 140]):
        by_strike.append(
            {
                "strike": strike,
                "callGex": base * (0.3 + i * 0.1),
                "putGex": -base * (0.25 - i * 0.04),
                "netGex": base * (0.05 + i * 0.06),
                "callOi": 5000 + i * 400,
                "putOi": 4000 + (4 - i) * 350,
                "callGamma": 0.012 + i * 0.003,
                "putGamma": 0.011 - i * 0.002,
                "distanceFromSpot": round(((strike - 125) / 125) * 100, 2),
                "isAboveSpot": strike >= 125,
            }
        )
    return {
        "symbol": sym,
        "totalGEX": base * 1.4,
        "callGex": base * 0.9,
        "putGex": -base * 0.5,
        "netGex": base * 1.4,
        "flipPoint": 118,
        "bias": "LONG_GAMMA",
        "byStrike": by_strike,
        "proxy": {"symbol": "NQ", "scaleFactor": 0.24} if sym == "QQQ" else None,
    }


# --- get_sector_flow --------------------------------------------------------
def _sector(sym, name, flow_net, chg, side, sent, conv, cp, cyl) -> dict[str, Any]:
    return {
        "sym": sym, "name": name, "flowNet": flow_net, "chgPct": chg,
        "flowSide": side, "sentiment": sent, "avgConviction": conv, "cpRatio": cp,
        "cylinders": cyl, "last": 480.0,
        "sparkline": [478, 479, 481, 480, 482, 483, 481, 482, 484, 483],
        "sentimentSpark": [(sent - 50) * 0.8 + i for i in range(10)],
        "hasEtf": True, "pills": [],
    }


get_sector_flow = {
    "window": "today",
    "macro": {
        "label": "Risk-On",
        "description": (
            "Smart money is broadly buying calls across mega-cap tech. Rotation "
            "away from defensives."
        ),
        "riskOnScore": 74,
        "dominantSector": "Technology",
        "dominantFlow": "calls",
    },
    "sectors": [
        _sector("XLK", "Technology", 4_200_000, 1.82, "calls", 78, 83, 0.61, "bullish"),
        _sector("XLY", "Consumer Discretionary", 2_100_000, 0.94, "calls", 65, 71, 0.74, None),
        _sector("XLF", "Financials", 1_800_000, 0.72, "calls", 62, 68, 0.80, None),
        _sector("XLE", "Energy", -980_000, -0.65, "puts", 38, 61, 1.42, "bearish"),
        _sector("XLV", "Health Care", 420_000, 0.21, "calls", 54, 59, 0.98, None),
    ],
    "subsectors": [
        _sector("SMH", "Semiconductors", 3_100_000, 2.14, "calls", 82, 88, 0.55, "bullish"),
        _sector("IGV", "Software", 1_200_000, 1.02, "calls", 68, 72, 0.72, None),
    ],
    "thematic": [
        _sector("KWEB", "China Tech", -420_000, -0.82, "puts", 36, 62, 1.52, "bearish"),
        _sector("ARKK", "Disruptive Innovation", 380_000, 1.10, "calls", 61, 65, 0.82, None),
    ],
    "technicals": {"bullish": ["XLK", "SMH", "XLY", "XLC"], "bearish": ["XLE", "XLRE"]},
    "walls": {"events": []},
    "generatedAt": _now(),
}


# --- get_put_call_ratios ----------------------------------------------------
def get_put_call_ratios(args: dict[str, Any] | None = None) -> dict[str, Any]:
    ticker = str((args or {}).get("ticker", "SPY")).upper()
    return {
        "ticker": ticker,
        "putCallRatio": 0.78,
        "expirationDate": "2026-07-11",
        "putVolume": 124_800,
        "callVolume": 160_000,
        "sentiment": "Bullish",
        "dataSource": "volume",
    }


# --- get_iv_rank ------------------------------------------------------------
def get_iv_rank(args: dict[str, Any] | None = None) -> dict[str, Any]:
    sym = str((args or {}).get("symbol", "NVDA")).upper()
    rank_map = {"NVDA": 72, "SPY": 34, "QQQ": 38, "TSLA": 81, "AAPL": 28, "META": 55, "AMD": 67}
    rank = rank_map.get(sym, 50)
    if rank > 60:
        note = (
            "Premium is elevated vs history — favor selling strategies "
            "(CSPs, credit spreads, covered calls)"
        )
    elif rank < 30:
        note = (
            "Premium is depressed vs history — favor buying strategies "
            "(long calls/puts, debit spreads)"
        )
    else:
        note = "IV is near its historical median — no strong edge to buyers or sellers"
    return {
        "symbol": sym,
        "ivRank": rank,
        "ivPercentile": rank + 5,
        "currentIV": round(0.35 + rank / 200, 3),
        "ivMin52w": 0.24,
        "ivMax52w": 0.82,
        "interpretation": "rich" if rank > 60 else "cheap" if rank < 30 else "neutral",
        "note": note,
    }


# --- get_earnings_flow ------------------------------------------------------
get_earnings_flow = {
    "earnings": [
        {
            "event": {
                "symbol": "TSLA", "earningsDate": "2026-07-15", "earningsTime": "AMC",
                "expectedMovePct": 8.4, "expectedMovePrice": 22.5, "realizedMovePct": None,
                "realizedDirection": None, "preEarningsClose": None, "postEarningsOpen": None,
                "preEarningsFlowCount": 14, "preEarningsPremium": 4_200_000,
                "preEarningsBullishPct": 72, "preEarningsSentiment": "Bullish",
                "consensusConfidence": "high", "epsEstimate": 0.72, "revenueEstimate": 25_800_000_000,
                "sector": "Consumer Discretionary", "marketCapUsd": 900_000_000_000,
                "lastEarningsOutcome": "beat",
            },
            "flows": [
                {"daysBeforeEarnings": 8, "signalWindow": "1w", "signalWeight": 0.8, "premium": 1_920_000, "sentiment": "Bullish", "unusualScore": 89, "tradeType": "sweep", "contractType": "CALL", "moneyness": "OTM"},
                {"daysBeforeEarnings": 3, "signalWindow": "3d", "signalWeight": 1.0, "premium": 2_280_000, "sentiment": "Bullish", "unusualScore": 94, "tradeType": "sweep", "contractType": "CALL", "moneyness": "OTM"},
            ],
            "summary": {"direction": "Bullish", "confidence": "high", "note": "Strong call accumulation in final stretch"},
        },
        {
            "event": {
                "symbol": "NFLX", "earningsDate": "2026-07-16", "earningsTime": "AMC",
                "expectedMovePct": 6.2, "expectedMovePrice": 42.0, "realizedMovePct": None,
                "realizedDirection": None, "preEarningsClose": None, "postEarningsOpen": None,
                "preEarningsFlowCount": 8, "preEarningsPremium": 1_800_000,
                "preEarningsBullishPct": 60, "preEarningsSentiment": "Neutral",
                "consensusConfidence": "medium", "epsEstimate": 5.1, "revenueEstimate": 10_500_000_000,
                "sector": "Communication Services", "marketCapUsd": 280_000_000_000,
                "lastEarningsOutcome": "beat",
            },
            "flows": [
                {"daysBeforeEarnings": 5, "signalWindow": "1w", "signalWeight": 0.6, "premium": 900_000, "sentiment": "Bullish", "unusualScore": 74, "tradeType": "block", "contractType": "CALL", "moneyness": "OTM"},
                {"daysBeforeEarnings": 2, "signalWindow": "3d", "signalWeight": 0.8, "premium": 900_000, "sentiment": "Neutral", "unusualScore": 68, "tradeType": "block", "contractType": "PUT", "moneyness": "OTM"},
            ],
            "summary": {"direction": "Mixed", "confidence": "medium", "note": "Straddle-like positioning — market uncertain on direction"},
        },
        {
            "event": {
                "symbol": "AMZN", "earningsDate": "2026-07-30", "earningsTime": "AMC",
                "expectedMovePct": 5.8, "expectedMovePrice": 12.0, "realizedMovePct": None,
                "realizedDirection": None, "preEarningsClose": None, "postEarningsOpen": None,
                "preEarningsFlowCount": 6, "preEarningsPremium": 2_100_000,
                "preEarningsBullishPct": 81, "preEarningsSentiment": "Bullish",
                "consensusConfidence": "high", "epsEstimate": 1.34, "revenueEstimate": 155_000_000_000,
                "sector": "Consumer Discretionary", "marketCapUsd": 2_100_000_000_000,
                "lastEarningsOutcome": "beat",
            },
            "flows": [
                {"daysBeforeEarnings": 24, "signalWindow": "1m", "signalWeight": 0.5, "premium": 2_100_000, "sentiment": "Bullish", "unusualScore": 86, "tradeType": "sweep", "contractType": "CALL", "moneyness": "OTM"},
            ],
            "summary": {"direction": "Bullish", "confidence": "medium", "note": "Early call sweeps — smart money positioning ahead of AWS print"},
        },
    ],
    "count": 3,
    "days": 7,
    "timestamp": _now(),
}


# --- get_economic_calendar --------------------------------------------------
get_economic_calendar = {
    "dateFrom": "2026-07-06",
    "dateTo": "2026-07-10",
    "totalEvents": 6,
    "events": [
        {"date": "2026-07-07", "time": "08:30", "event": "ISM Services PMI", "impact": "high", "forecast": "53.4", "previous": "52.9", "actual": None, "country": "US"},
        {"date": "2026-07-08", "time": "08:30", "event": "Initial Jobless Claims", "impact": "medium", "forecast": "225K", "previous": "219K", "actual": None, "country": "US"},
        {"date": "2026-07-09", "time": "08:30", "event": "CPI (MoM)", "impact": "high", "forecast": "0.2%", "previous": "0.1%", "actual": None, "country": "US"},
        {"date": "2026-07-09", "time": "08:30", "event": "CPI (YoY)", "impact": "high", "forecast": "2.9%", "previous": "3.0%", "actual": None, "country": "US"},
        {"date": "2026-07-10", "time": "10:00", "event": "Michigan Sentiment", "impact": "medium", "forecast": "68.5", "previous": "67.2", "actual": None, "country": "US"},
        {"date": "2026-07-10", "time": "14:00", "event": "Federal Budget Balance", "impact": "low", "forecast": "-$215B", "previous": "-$228B", "actual": None, "country": "US"},
    ],
}


# --- run_screener -----------------------------------------------------------
_SCREENER_RESULTS: dict[str, list[dict[str, Any]]] = {
    "daily-cuts": [
        {"ticker": "NVDA", "name": "NVIDIA Corp", "price": 128.45, "change": 2.34, "changePct": 1.85, "volume": 42_100_000, "avgVolume": 31_800_000, "relVol": 1.32, "score": 94, "sector": "Technology", "setup": "Leveraged Trend", "edgeScore": 87},
        {"ticker": "META", "name": "Meta Platforms", "price": 622.8, "change": 8.2, "changePct": 1.33, "volume": 18_400_000, "avgVolume": 14_200_000, "relVol": 1.3, "score": 91, "sector": "Communication Services", "setup": "CSP Wheel", "edgeScore": 82},
        {"ticker": "TSLA", "name": "Tesla Inc", "price": 268.1, "change": 5.4, "changePct": 2.06, "volume": 88_200_000, "avgVolume": 62_100_000, "relVol": 1.42, "score": 88, "sector": "Consumer Discretionary", "setup": "LEAPS", "edgeScore": 79},
        {"ticker": "AMD", "name": "Advanced Micro Devices", "price": 154.3, "change": 3.1, "changePct": 2.05, "volume": 28_900_000, "avgVolume": 21_400_000, "relVol": 1.35, "score": 85, "sector": "Technology", "setup": "Leveraged Ignition", "edgeScore": 76},
        {"ticker": "AMZN", "name": "Amazon.com", "price": 208.7, "change": 2.9, "changePct": 1.41, "volume": 31_200_000, "avgVolume": 24_600_000, "relVol": 1.27, "score": 83, "sector": "Consumer Discretionary", "setup": "LEAPS", "edgeScore": 74},
    ],
    "momentum": [
        {"ticker": "NVDA", "price": 128.45, "change": 2.34, "changePct": 1.85, "score": 94, "sector": "Technology"},
        {"ticker": "AVGO", "price": 188.2, "change": 3.8, "changePct": 2.06, "score": 88, "sector": "Technology"},
        {"ticker": "TSM", "price": 214.6, "change": 4.2, "changePct": 2.0, "score": 86, "sector": "Technology"},
    ],
    "csp-wheel": [
        {"ticker": "META", "price": 622.8, "change": 8.2, "changePct": 1.33, "score": 91, "sector": "Communication Services", "weeklyRoc": 1.42},
        {"ticker": "AAPL", "price": 211.5, "change": 1.8, "changePct": 0.86, "score": 82, "sector": "Technology", "weeklyRoc": 1.18},
        {"ticker": "MSFT", "price": 432.1, "change": 3.4, "changePct": 0.79, "score": 79, "sector": "Technology", "weeklyRoc": 1.08},
    ],
    "volatility-squeeze": [
        {"ticker": "PLTR", "price": 28.4, "change": 0.6, "changePct": 2.16, "score": 83, "sector": "Technology"},
        {"ticker": "SOFI", "price": 14.2, "change": 0.35, "changePct": 2.53, "score": 78, "sector": "Financials"},
    ],
}


def run_screener(args: dict[str, Any] | None = None) -> dict[str, Any]:
    key = str((args or {}).get("screener", "daily-cuts"))
    rows = _SCREENER_RESULTS.get(key, _SCREENER_RESULTS["daily-cuts"])
    limit = (args or {}).get("limit")
    results = rows[:limit] if isinstance(limit, int) else rows
    return {
        "screener": {"id": key, "name": key.replace("-", " ").title()},
        "results": results,
        "tickers": [r["ticker"] for r in results],
        "count": len(rows),
        "returned": len(results),
        "timestamp": _now(),
    }


# --- get_strategy_ideas -----------------------------------------------------
def get_strategy_ideas(args: dict[str, Any] | None = None) -> dict[str, Any]:
    sym = str((args or {}).get("symbol", "NVDA")).upper()
    return {
        "symbol": sym,
        "direction": "bullish",
        "derivedFromTechnicals": True,
        "structures": [
            {
                "archetype": "bull_put_spread", "rank": 1, "score": 88,
                "legs": [
                    {"type": "PUT", "side": "sell", "qty": 1, "strike": 120, "premium": 3.4, "delta": -0.28},
                    {"type": "PUT", "side": "buy", "qty": 1, "strike": 115, "premium": 1.8, "delta": -0.18},
                ],
                "maxProfit": 160, "maxLoss": 340, "breakevens": [118.4], "pop": 0.72,
                "capitalAtRisk": 340, "expiration": "2026-08-07", "dte": 31,
                "rationale": f"Sell the 120/115 put spread on {sym}. Collects $1.60 credit with 72% POP. Structure benefits from continued upside or sideways action. Risk is defined.",
                "earningsInWindow": False,
            },
            {
                "archetype": "long_call", "rank": 2, "score": 79,
                "legs": [{"type": "CALL", "side": "buy", "qty": 1, "strike": 130, "premium": 4.2, "delta": 0.42}],
                "maxProfit": None, "maxLoss": 420, "breakevens": [134.2], "pop": 0.42,
                "capitalAtRisk": 420, "expiration": "2026-08-07", "dte": 31,
                "rationale": f"Long the 130 call on {sym}. Directional leverage with defined risk. IV rank at 72 makes this slightly expensive but flow confirms the bull thesis.",
                "earningsInWindow": False,
            },
            {
                "archetype": "covered_call", "rank": 3, "score": 71,
                "legs": [
                    {"type": "STOCK", "side": "buy", "qty": 100, "strike": None, "premium": 128.45, "delta": 1.0},
                    {"type": "CALL", "side": "sell", "qty": 1, "strike": 132, "premium": 2.8, "delta": 0.38},
                ],
                "maxProfit": 635, "maxLoss": 12565, "breakevens": [125.65], "pop": 0.62,
                "capitalAtRisk": 12845, "expiration": "2026-08-07", "dte": 31,
                "rationale": f"Covered call on {sym} at the 132 strike. Generates 2.2% monthly income. Capped upside above 132 — appropriate if mildly bullish or looking for income on existing position.",
                "earningsInWindow": False,
            },
        ],
        "timestamp": _now(),
    }


# --- get_edge_xray ----------------------------------------------------------
def get_edge_xray(args: dict[str, Any] | None = None) -> dict[str, Any]:
    sym = str((args or {}).get("symbol", "NVDA")).upper()
    spot = 128.45
    contracts = []
    for strike in [115, 120, 125, 128, 130, 135, 140]:
        for typ in ("CALL", "PUT"):
            residual = round((random.random() - 0.45) * 0.08, 4)
            delta = (
                round(0.7 - (strike / spot) * 0.5, 3)
                if typ == "CALL"
                else round(-0.3 + (strike / spot) * 0.2, 3)
            )
            contracts.append(
                {
                    "strike": strike,
                    "type": typ,
                    "mid": round(random.random() * 5 + 1, 2),
                    "iv": round(0.35 + random.random() * 0.2, 3),
                    "delta": delta,
                    "residual": residual,
                    "verdict": "rich" if residual > 0.02 else "cheap" if residual < -0.02 else "fair",
                }
            )
    return {
        "symbol": sym,
        "spot": spot,
        "expiration": "2026-08-07",
        "dte": 31,
        "availableExpirations": ["2026-07-11", "2026-07-18", "2026-08-07", "2026-09-18", "2026-12-18"],
        "contracts": contracts,
        "fairIvSummary": {
            "callsMedianResidual": 0.018,
            "putsMedianResidual": -0.012,
            "overallBias": "calls slightly rich, puts slightly cheap",
        },
        "timestamp": _now(),
    }


# --- get_apex_levels ---------------------------------------------------------
def get_apex_levels(args: dict[str, Any] | None = None) -> dict[str, Any]:
    sym = str((args or {}).get("symbol", "SPY")).upper()
    return {
        "symbol": sym,
        "spotPrice": 502.3,
        "snapshotTime": _now(),
        "mode": "single" if (args or {}).get("expiration") else "aggregate",
        "expirationsUsed": ["2026-07-18", "2026-07-25", "2026-08-01"],
        "availableExpirations": ["2026-07-18", "2026-07-25", "2026-08-01", "2026-08-15", "2026-09-19"],
        "gammaFlip": 498.5,
        "levels": [
            {"strike": 505, "score": 100, "rank": 1, "netGEX": 1_240_000_000, "totalOI": 68_400, "isAboveSpot": True},
            {"strike": 495, "score": 74, "rank": 2, "netGEX": -320_000_000, "totalOI": 91_200, "isAboveSpot": False},
            {"strike": 510, "score": 52, "rank": 3, "netGEX": 480_000_000, "totalOI": 41_600, "isAboveSpot": True},
            {"strike": 490, "score": 41, "rank": 4, "netGEX": -180_000_000, "totalOI": 55_800, "isAboveSpot": False},
            {"strike": 500, "score": 38, "rank": 5, "netGEX": 92_000_000, "totalOI": 38_100, "isAboveSpot": False},
        ],
    }


# --- get_politician_trades / get_politician_trades_by_ticker ----------------
def get_politician_trades(args: dict[str, Any] | None = None) -> dict[str, Any]:
    tab = str((args or {}).get("tab", "top_portfolios"))
    return {
        "success": True,
        "tab": tab,
        "window_days": 30 if tab == "most_active" else 90,
        "generated_at": _now(),
        "entries": [
            {"name": "A. Ramirez", "party": "Democrat", "chamber": "House", "totalEstimated": 2_400_000, "tradeCount": 18, "uniqueTickers": 12, "topTickers": ["NVDA", "MSFT", "GOOGL"], "lastTradeDate": "2026-07-01"},
            {"name": "K. Whitfield", "party": "Republican", "chamber": "Senate", "totalEstimated": 1_850_000, "tradeCount": 9, "uniqueTickers": 7, "topTickers": ["XOM", "CVX"], "lastTradeDate": "2026-06-28"},
            {"name": "T. Boone", "party": "Republican", "chamber": "House", "totalEstimated": 940_000, "tradeCount": 24, "uniqueTickers": 15, "topTickers": ["AAPL", "AMD", "TSLA"], "lastTradeDate": "2026-07-05"},
            {"name": "S. Nakamura", "party": "Democrat", "chamber": "House", "totalEstimated": 610_000, "tradeCount": 6, "uniqueTickers": 5, "topTickers": ["JPM"], "lastTradeDate": "2026-06-20"},
        ],
    }


def get_politician_trades_by_ticker(args: dict[str, Any] | None = None) -> dict[str, Any]:
    ticker = str((args or {}).get("ticker", "NVDA")).upper()
    return {
        "success": True,
        "ticker": ticker,
        "period_days": 90,
        "total_trades": 2,
        "trades": [
            {
                "id": f"a-ramirez_{ticker.lower()}_2026-07-01_buy",
                "name": "A. Ramirez", "party": "Democrat", "chamber": "House",
                "state_abbreviation": "CA", "state_name": "California",
                "company": f"{ticker} Corp", "ticker": ticker,
                "trade_date": "2026-07-01T00:00:00.000Z", "days_until_disclosure": 22,
                "trade_type": "buy", "trade_amount": "100K-250K", "value_at_purchase": "$128.40",
                "updated_at": _now(),
            },
            {
                "id": f"t-boone_{ticker.lower()}_2026-06-15_sell",
                "name": "T. Boone", "party": "Republican", "chamber": "House",
                "state_abbreviation": "TX", "state_name": "Texas",
                "company": f"{ticker} Corp", "ticker": ticker,
                "trade_date": "2026-06-15T00:00:00.000Z", "days_until_disclosure": 30,
                "trade_type": "sell", "trade_amount": "15K-50K", "value_at_purchase": "$121.10",
                "updated_at": _now(),
            },
        ],
    }


# --- get_institutional_activity ----------------------------------------------
def get_institutional_activity(args: dict[str, Any] | None = None) -> dict[str, Any]:
    limit = (args or {}).get("limit", 10)
    flows = [
        {"ticker": "SOXL", "sentiment": "Bullish", "total_premium": 27_800_000, "flow_count": 60},
        {"ticker": "INTC", "sentiment": "Bullish", "total_premium": 20_900_000, "flow_count": 40},
        {"ticker": "MU", "sentiment": "Bullish", "total_premium": 16_200_000, "flow_count": 35},
        {"ticker": "PLTR", "sentiment": "Bullish", "total_premium": 12_400_000, "flow_count": 28},
        {"ticker": "IWM", "sentiment": "Bearish", "total_premium": 5_400_000, "flow_count": 21},
    ]
    return {
        "flows": flows[:limit],
        "trading_date": _now(),
        "is_current_day": True,
        "timeframe": "today",
    }


# --- get_dividend_calendar ----------------------------------------------------
def get_dividend_calendar(args: dict[str, Any] | None = None) -> dict[str, Any]:
    results = [
        {"symbol": "PNC", "companyName": "PNC Financial Services Group Inc", "sector": "Banking", "exDate": "2026-07-20", "payDate": "2026-08-05", "dividendRate": 8, "dividendYield": 3.18},
        {"symbol": "CAT", "companyName": "Caterpillar Inc", "sector": "Machinery", "exDate": "2026-07-20", "payDate": "2026-08-19", "dividendRate": 6.52, "dividendYield": 0.7},
        {"symbol": "LOW", "companyName": "Lowe's Companies Inc", "sector": "Retail", "exDate": "2026-07-22", "payDate": "2026-08-05", "dividendRate": 5, "dividendYield": 2.41},
        {"symbol": "PFE", "companyName": "Pfizer Inc", "sector": "Pharmaceuticals", "exDate": "2026-07-24", "payDate": "2026-09-01", "dividendRate": 1.72, "dividendYield": 7.09},
        {"symbol": "O", "companyName": "Realty Income Corp", "sector": "Real Estate", "exDate": "2026-07-31", "payDate": "2026-08-14", "dividendRate": 3.25, "dividendYield": 5.1},
    ]
    limit = (args or {}).get("limit", 200)
    sliced = results[:limit]
    return {"count": len(sliced), "from": "2026-07-16", "days": (args or {}).get("days", 60), "results": sliced}


# --- get_long_term_quality ----------------------------------------------------
_QUALITY_ROWS = [
    {"symbol": "MU", "companyName": "Micron Technology Inc", "sector": "Semiconductors", "qualityScore": 96, "pe": 22.1, "pb": 11.1, "beta": 2.21, "marketCap": 1_058_000_000_000, "netMargin": 55.9, "operatingMargin": 65.6, "grossMargin": 72.6, "roe": 70.6, "roa": 49.9, "revenueGrowthYoY": 167.0, "epsGrowthYoY": 700.7, "dividendYield": 0.51, "dividendRate": 0.6, "payoutRatio": 1.1, "debtToEquity": 0.06, "currentRatio": 3.42, "interestCoverage": 20.1, "week52High": 1255, "week52Low": 103.4, "updatedAt": _now()},
    {"symbol": "AAPL", "companyName": "Apple Inc", "sector": "Technology", "qualityScore": 81, "pe": 39.2, "pb": 45.1, "beta": 1.1, "marketCap": 4_624_000_000_000, "netMargin": 27.2, "operatingMargin": 32.6, "grossMargin": 47.9, "roe": 146.7, "roa": 34.0, "revenueGrowthYoY": 12.8, "epsGrowthYoY": 29.0, "dividendYield": 0.32, "dividendRate": 1.08, "payoutRatio": 12.7, "debtToEquity": 0.8, "currentRatio": 1.07, "interestCoverage": 622.5, "week52High": 323.5, "week52Low": 201.5, "updatedAt": _now()},
    {"symbol": "JNJ", "companyName": "Johnson & Johnson", "sector": "Pharmaceuticals", "qualityScore": 89, "pe": 17.4, "pb": 5.8, "beta": 0.54, "marketCap": 412_000_000_000, "netMargin": 21.3, "operatingMargin": 26.1, "grossMargin": 68.2, "roe": 33.4, "roa": 12.7, "revenueGrowthYoY": 6.1, "epsGrowthYoY": 8.9, "dividendYield": 3.1, "dividendRate": 5.16, "payoutRatio": 44.2, "debtToEquity": 0.45, "currentRatio": 1.34, "interestCoverage": 28.6, "week52High": 178.2, "week52Low": 142.1, "updatedAt": _now()},
]


def get_long_term_quality(args: dict[str, Any] | None = None) -> dict[str, Any]:
    args = args or {}
    if args.get("symbol"):
        sym = str(args["symbol"]).upper()
        row = next((r for r in _QUALITY_ROWS if r["symbol"] == sym), None)
        if row is None:
            row = {**_QUALITY_ROWS[0], "symbol": sym}
        return {
            **row,
            "nextExDate": "2026-08-10",
            "nextPayDate": "2026-08-24",
            "nextEarningsDate": "2026-10-29",
            "live": not any(r["symbol"] == sym for r in _QUALITY_ROWS),
        }
    limit = args.get("limit", 100)
    return {"count": len(_QUALITY_ROWS), "results": _QUALITY_ROWS[:limit]}


# --- get_ipo_scanner -----------------------------------------------------------
def get_ipo_scanner(args: dict[str, Any] | None = None) -> dict[str, Any]:
    args = args or {}
    view = args.get("view", "upcoming")
    as_of = _now()
    if view == "recent":
        return {
            "data": [
                {
                    "id": 1076, "company": "DPC Holdings Ltd", "companyKey": "dpc", "symbol": "DPC", "exchange": "NYSE", "status": "priced",
                    "priceRange": "33.00", "sharesOffered": 27_858_585, "expectedDate": "2026-06-25", "firstTradeDate": "2026-06-25",
                    "ipoPrice": 33, "secForm": None, "secFilingDate": None, "sources": ["FINNHUB", "NASDAQ"], "sourceUrls": [],
                    "primaryLink": None, "cik": None, "accession": None, "lifecycleStage": "Calendar", "currentBucket": "Recent",
                    "withdrawn": False, "firstSeenAt": "2026-05-28T10:00:00.000Z", "lastSeenAt": as_of, "updatedAt": as_of,
                    "currentPrice": 46.75, "pctFromIpo": 41.67, "pctFromFirstClose": -0.28, "day1Volume": 18_650_348,
                    "avgVolume30d": 3_119_851, "setupAttentionScore": 63, "setupAttentionTier": "MED", "perfUpdatedAt": as_of,
                },
            ],
            "asOf": as_of, "sourceCount": 2,
        }
    if view == "radar":
        return {
            "data": [
                {"company": "Nimbus AI", "companyKey": "nimbusai", "estValuationB": 42, "sector": "AI infrastructure", "evidenceScore": 84, "evidenceCount": 12, "lastSignalDate": as_of, "topDrivers": ["confidential_filing", "named_underwriters"], "signalConfidentialFiling": 1, "signalPublicFiling": 0, "signalConfirmedIpoIntent": 0, "signalTargetTiming": 1, "signalValuationReported": 1, "signalNamedUnderwriters": 1, "signalMultipleCredibleReports": 1},
            ],
            "asOf": as_of, "sourceCount": 1,
        }
    if view == "transitions":
        return {
            "data": [
                {"id": 1710, "companyKey": "descartes", "company": "Descartes Systems Group Inc", "symbol": None, "eventType": "sec_filing", "fromBucket": None, "toBucket": None, "meta": {"form_type": "F-1"}, "occurredAt": as_of},
            ],
            "asOf": as_of, "sourceCount": 1,
        }
    return {
        "data": [
            {"id": 6894, "company": "Csquare, Inc.", "companyKey": "csquare", "symbol": "CSQR", "exchange": "NYSE", "status": "expected", "priceRange": "23.00-27.00", "sharesOffered": 50_000_000, "expectedDate": "2026-07-18", "firstTradeDate": None, "ipoPrice": None, "secForm": None, "secFilingDate": None, "sources": ["FINNHUB", "NASDAQ"], "sourceUrls": [], "primaryLink": None, "cik": None, "accession": None, "lifecycleStage": "Calendar", "currentBucket": "Upcoming", "withdrawn": False, "firstSeenAt": "2026-06-27T10:00:00.000Z", "lastSeenAt": as_of, "updatedAt": as_of},
        ],
        "asOf": as_of, "sourceCount": 2,
    }


# --- get_bounce_signals / get_bounce_score ------------------------------------
def _bounce_indicators(overbought: bool) -> dict[str, Any]:
    return {
        "bbPctb": 0.94 if overbought else 0.06, "bbScore": 1, "bbState": "overbought" if overbought else "oversold",
        "kcScore": 1, "kcState": "above_upper" if overbought else "below_lower",
        "cciScore": 1, "cciState": "extended", "cciValue": 128.5 if overbought else -132.1,
        "rsiScore": 1, "rsiState": "overbought" if overbought else "oversold", "rsiValue": 87.4 if overbought else 14.2,
        "volRatio": 1.14, "volScore": 0, "volState": "normal",
        "macdScore": 0, "macdState": "neutral", "signalDate": "2026-07-15",
        "stochScore": 1, "stochState": "overbought" if overbought else "oversold",
        "willrScore": 0, "willrState": "neutral", "willrValue": -51.9 if overbought else -8.6,
        "rsiDivBonus": 0, "stochDValue": 100 if overbought else 2, "stochKValue": 100 if overbought else 2,
        "compositeScore": 5, "compositeYesterday": 1,
    }


def get_bounce_signals(args: dict[str, Any] | None = None) -> dict[str, Any]:
    args = args or {}
    direction = args.get("direction", "all")
    all_signals = [
        {"id": 13795, "ticker": "BABA", "signalType": "bounce_top", "price": 117.74, "changePercent": 4.83, "volume": 17_875_485, "avgVolume": 15_049_434, "indicatorData": _bounce_indicators(True), "source": "leveraged", "detectedAt": _now()},
        {"id": 13780, "ticker": "RIOT", "signalType": "bounce_bottom", "price": 9.12, "changePercent": -6.4, "volume": 22_340_112, "avgVolume": 18_902_400, "indicatorData": _bounce_indicators(False), "source": "small-cap", "detectedAt": _now()},
    ]
    if direction == "top":
        signals = [s for s in all_signals if s["signalType"] == "bounce_top"]
    elif direction == "bottom":
        signals = [s for s in all_signals if s["signalType"] == "bounce_bottom"]
    else:
        signals = all_signals
    return {"signals": signals, "total": len(signals), "page": args.get("page", 1), "pageSize": args.get("pageSize", 50), "hasMore": False}


def get_bounce_score(args: dict[str, Any] | None = None) -> dict[str, Any]:
    ticker = str((args or {}).get("symbol", "AAPL")).upper()
    return {
        "ticker": ticker, "price": 227.5, "changePercent": 4.01, "compositeScore": 4, "compositeYesterday": 2,
        "kcScore": 1, "rsiScore": 1, "rsiDivBonus": 0, "stochScore": 1, "bbScore": 0, "macdScore": 0, "volScore": 0, "willrScore": 1, "cciScore": 0,
        "rsiValue": 80.3, "stochKValue": 100, "stochDValue": 100, "bbPctb": 0.87, "volRatio": 0.86, "willrValue": -2.2, "cciValue": 104.7,
        "kcState": "above_upper", "rsiState": "overbought", "stochState": "overbought", "bbState": "neutral", "macdState": "neutral", "volState": "normal", "willrState": "overbought", "cciState": "normal",
    }


# --- get_conviction -------------------------------------------------------------
def get_conviction(args: dict[str, Any] | None = None) -> dict[str, Any]:
    args = args or {}
    if args.get("symbol"):
        return {
            "ticker": str(args["symbol"]).upper(),
            "score": 55,
            "breakdown": {"watchlistMomentum": 53, "chatSentiment": 57},
            "asOf": _now(),
        }

    def entry(ticker: str, score: int, adds: int) -> dict[str, Any]:
        return {"ticker": ticker, "score": score, "adds24h": adds, "removes24h": 0, "net24h": adds}

    return {
        "score": 80,
        "breakdown": {"watchlistMomentum": 98, "chatSentiment": 56, "discordReactions": 80},
        "topTickers": [entry("RKLB", 53, 2), entry("PLTR", 53, 2), entry("AAPL", 53, 2), entry("NFLX", 52, 1)],
        "topAdds": [
            {"ticker": "PLTR", "score": 63, "adds24h": 2, "removes24h": 0, "net24h": 2, "net7d": 8},
            {"ticker": "NVDA", "score": 58, "adds24h": 1, "removes24h": 0, "net24h": 1, "net7d": 5},
        ],
        "asOf": _now(),
    }


# --- get_market_health -----------------------------------------------------------
get_market_health = {
    "signals": [
        {"id": "risk_appetite_sphb_splv", "label": "SPHB / SPLV Ratio", "category": "RISK APPETITE", "status": "ALERT", "summary": "High-beta lagging defensive; risk appetite fading.", "dataPoints": ["Ratio 1.944 vs 20d MA 2.002", "20d slope -4.7%"], "asOf": _now(), "detail": {"ratio": 1.94, "ma20": 2.0, "slope20Pct": -4.67}},
        {"id": "credit_hyg_jnk", "label": "HYG / JNK Credit ETFs", "category": "CREDIT", "status": "CLEAR", "summary": "Both HY ETFs trading above 50d MA.", "dataPoints": ["HYG 80.10 vs 50d MA 79.82", "JNK 96.40 vs 50d MA 96.13"], "asOf": _now(), "detail": {"hygLast": 80.1, "hygMa50": 79.82, "jnkLast": 96.4, "jnkMa50": 96.13}},
        {"id": "vol_vix_spx_diverge", "label": "VIX vs SPX Divergence", "category": "VOL REGIME", "status": "CLEAR", "summary": "Vol regime aligned with tape direction.", "dataPoints": ["VIX 5d -7.3% (now 15.67)", "SPY 5d 1.3% (now 502.3)"], "asOf": _now(), "detail": {"vixLast": 15.67, "vix5dPct": -7.28, "spyLast": 502.3, "spy5dPct": 1.26}},
        {"id": "leadership_semis_failures", "label": "Semis Breakout Failures", "category": "LEADERSHIP", "status": "CLEAR", "summary": "No recent SMH breakout failures.", "dataPoints": ["SMH last 590.77", "Failures in last 10 sessions: 0"], "asOf": _now(), "detail": {"failures": 0, "lastClose": 590.77}},
    ],
    "alertCount": 1,
    "watchCount": 0,
    "availableCount": 4,
    "totalCount": 7,
    "generatedAt": _now(),
    "compositeScore": {"value": 1, "max": 7, "label": "LOW"},
}


# --- get_hedge_analysis -----------------------------------------------------------
def get_hedge_analysis(args: dict[str, Any] | None = None) -> dict[str, Any]:
    sym = str((args or {}).get("symbol", "AAPL")).upper()
    spot = 227.5
    return {
        "symbol": sym,
        "spot": spot,
        "expiration": "2026-08-28",
        "dte": 44,
        "downsideMove": 15.5,
        "downsideBasis": "expected_move",
        "downsideDollars": 1550,
        "hedges": [
            {
                "kind": "put_spread_collar",
                "legs": [
                    {"type": "put", "side": "long", "strike": 220, "qty": 1, "premium": 4.7},
                    {"type": "put", "side": "short", "strike": 205, "qty": 1, "premium": 1.35},
                    {"type": "call", "side": "short", "strike": 240, "qty": 1, "premium": 4.05},
                ],
                "cost": -70,
                "dollarsProtected": 1500,
                "costPerDollarProtected": -0.05,
                "breakevenAtExpiry": 227.7,
                "positionDelta": 42.1,
                "rationale": "Buy the $220 / sell the $205 put spread and sell the $240 call — cheapest protection, floor stops working below $205",
            },
            {
                "kind": "collar",
                "legs": [
                    {"type": "put", "side": "long", "strike": 220, "qty": 1, "premium": 4.7},
                    {"type": "call", "side": "short", "strike": 240, "qty": 1, "premium": 4.05},
                ],
                "cost": 65,
                "dollarsProtected": 1500,
                "costPerDollarProtected": 0.04,
                "breakevenAtExpiry": None,
                "positionDelta": 33.9,
                "rationale": "Buy the $220 put and sell the $240 call — finances the downside floor by capping gains above $240",
            },
        ],
    }
