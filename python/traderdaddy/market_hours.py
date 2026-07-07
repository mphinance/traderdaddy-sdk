"""market_hours.py — US-equity market phase in Eastern Time, TZ-independent.

Port of @traderdaddy/sdk's marketHours.ts. Uses ``zoneinfo`` so it does NOT
depend on the host's TZ env var — safe on a server in any region (e.g. a Home
Assistant box).

Phases (ET, weekdays):
    premarket   04:00-09:29
    open        09:30-15:59
    afterhours  16:00-19:59
    closed      20:00-03:59
    weekend     Sat / Sun
    holiday     US market holiday (approximate 2026 list)
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/New_York")

# Approximate 2026 US market holidays (YYYY-MM-DD in ET).
HOLIDAYS_2026 = frozenset(
    {
        "2026-01-01",  # New Year's Day
        "2026-01-19",  # MLK Day
        "2026-02-16",  # Presidents' Day
        "2026-04-03",  # Good Friday
        "2026-05-25",  # Memorial Day
        "2026-07-03",  # Independence Day observed
        "2026-09-07",  # Labor Day
        "2026-11-26",  # Thanksgiving
        "2026-11-27",  # Day after Thanksgiving (early close — treated as closed)
        "2026-12-25",  # Christmas
    }
)

_PRE_OPEN = 4 * 60  # 04:00
_OPEN = 9 * 60 + 30  # 09:30
_CLOSE = 16 * 60  # 16:00
_AFTER_END = 20 * 60  # 20:00


@dataclass(frozen=True)
class MarketPhase:
    phase: str
    is_open: bool
    label: str
    #: ISO timestamp of the next phase boundary.
    next_change_at: str


def _et_wall(d: date, hour: int, minute: int) -> datetime:
    """A tz-aware ET wall-clock datetime for the given date and time."""
    return datetime(d.year, d.month, d.day, hour, minute, tzinfo=TZ)


def get_market_phase(now: datetime | None = None) -> MarketPhase:
    """Return the current market phase."""
    et = (now or datetime.now(tz=TZ)).astimezone(TZ)
    weekday = et.weekday()  # Mon=0 … Sun=6
    date_str = et.strftime("%Y-%m-%d")

    # Weekend
    if weekday >= 5:
        days_to_mon = 7 - weekday  # Sat->2, Sun->1
        nxt = (et + timedelta(days=days_to_mon)).date()
        return MarketPhase(
            "weekend", False, "Market Closed (Weekend)", _et_wall(nxt, 4, 0).isoformat()
        )

    # Holiday
    if date_str in HOLIDAYS_2026:
        nxt = (et + timedelta(days=1)).date()
        return MarketPhase(
            "holiday", False, "Market Closed (Holiday)", _et_wall(nxt, 4, 0).isoformat()
        )

    total = et.hour * 60 + et.minute

    if total < _PRE_OPEN:
        phase, is_open, label, nh, nm = "closed", False, "Market Closed", 4, 0
    elif total < _OPEN:
        phase, is_open, label, nh, nm = "premarket", False, "Pre-Market", 9, 30
    elif total < _CLOSE:
        phase, is_open, label, nh, nm = "open", True, "Market Open", 16, 0
    elif total < _AFTER_END:
        phase, is_open, label, nh, nm = "afterhours", False, "After Hours", 20, 0
    else:
        # 20:00-23:59 — next change is tomorrow's premarket at 04:00 ET.
        nxt = (et + timedelta(days=1)).date()
        return MarketPhase(
            "closed", False, "Market Closed", _et_wall(nxt, 4, 0).isoformat()
        )

    return MarketPhase(phase, is_open, label, _et_wall(et.date(), nh, nm).isoformat())


def is_market_open(now: datetime | None = None) -> bool:
    """Is the US equity market in its regular session right now?"""
    return get_market_phase(now).is_open
