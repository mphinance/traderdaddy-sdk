"""fixtures.py — realistic, typed demo fixtures.

Ported from @traderdaddy/sdk's mock/fixtures.ts, scoped to the six tools the
Home Assistant integration consumes:
    get_market_stats, get_unusual_activity, get_gex_overview, get_gex_ticker,
    get_sector_flow, get_put_call_ratios, get_iv_rank

Each name matches a tool; callables take the tool ``args`` dict. Values are
deep-copied by ``MockTransport`` before return, so mutating a result is safe.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


# --- get_market_stats -------------------------------------------------------
get_market_stats = {
    "tradingDate": "2026-07-07",
    "marketOpen": True,
    "timestamp": _now(),
    "putCallRatioSPY": 0.78,
    "putCallRatioQQQ": 0.65,
    "putCallRatioIWM": 1.12,
    "overallSentiment": "Bullish",
    "sentimentScore": 72,
    "dominantFlow": "calls",
    "totalFlowPremium": 4_820_000,
    "largestTrade": {
        "ticker": "NVDA",
        "type": "CALL",
        "premium": 3_840_000,
        "sentiment": "Bullish",
        "tradeType": "sweep",
        "score": 94,
    },
    "totalBullishPremium": 31_200_000,
    "totalBearishPremium": 12_400_000,
    "bullishBearishRatio": 2.52,
    "activeAlerts": 7,
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


# --- get_iv_rank (no TS fixture — added for the HA demo) ---------------------
def get_iv_rank(args: dict[str, Any] | None = None) -> dict[str, Any]:
    sym = str((args or {}).get("symbol", "SPY")).upper()
    return {
        "symbol": sym,
        "ivRank": 34.2,
        "ivPercentile": 41.0,
        "currentIV": 0.182,
        "ivMin52w": 0.11,
        "ivMax52w": 0.38,
        "interpretation": "neutral",
        "note": "IV sits mid-range for its 52-week window — neither rich nor cheap.",
    }
