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
    holiday     US market holiday (table below, 2026-2028)

Early-close days (1:00 PM ET) keep the ``open`` phase but close at 13:00 with a
"Half Day" label. The holiday/half-day tables are hardcoded and end in 2028 —
refresh them before then.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

TZ = ZoneInfo("America/New_York")

# US market full-closure holidays 2026-2028 (YYYY-MM-DD in ET).
HOLIDAYS = frozenset(
    {
        # 2026
        "2026-01-01",  # New Year's Day
        "2026-01-19",  # MLK Day
        "2026-02-16",  # Presidents' Day
        "2026-04-03",  # Good Friday
        "2026-05-25",  # Memorial Day
        "2026-06-19",  # Juneteenth
        "2026-07-03",  # Independence Day observed (Jul 4 is Sat)
        "2026-09-07",  # Labor Day
        "2026-11-26",  # Thanksgiving
        "2026-12-25",  # Christmas
        # 2027
        "2027-01-01",  # New Year's Day
        "2027-01-18",  # MLK Day
        "2027-02-15",  # Presidents' Day
        "2027-03-26",  # Good Friday
        "2027-05-31",  # Memorial Day
        "2027-06-18",  # Juneteenth observed (Jun 19 is Sat)
        "2027-07-05",  # Independence Day observed (Jul 4 is Sun)
        "2027-09-06",  # Labor Day
        "2027-11-25",  # Thanksgiving
        "2027-12-24",  # Christmas observed (Dec 25 is Sat)
        # 2028
        "2028-01-17",  # MLK Day (New Year Jan 1 is Sat — not observed)
        "2028-02-21",  # Presidents' Day
        "2028-04-14",  # Good Friday
        "2028-05-29",  # Memorial Day
        "2028-06-19",  # Juneteenth
        "2028-07-04",  # Independence Day
        "2028-09-04",  # Labor Day
        "2028-11-23",  # Thanksgiving
        "2028-12-25",  # Christmas
    }
)

# Early-close (1:00 PM ET) half-days 2026-2028 (YYYY-MM-DD in ET).
HALF_DAYS = frozenset(
    {
        "2026-11-27",  # Day after Thanksgiving
        "2026-12-24",  # Christmas Eve
        "2027-11-26",  # Day after Thanksgiving
        "2028-07-03",  # Day before Independence Day
        "2028-11-24",  # Day after Thanksgiving
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
    if date_str in HOLIDAYS:
        nxt = (et + timedelta(days=1)).date()
        return MarketPhase(
            "holiday", False, "Market Closed (Holiday)", _et_wall(nxt, 4, 0).isoformat()
        )

    total = et.hour * 60 + et.minute
    is_half_day = date_str in HALF_DAYS
    close = 13 * 60 if is_half_day else _CLOSE  # 13:00 on half-days, else 16:00

    if total < _PRE_OPEN:
        phase, is_open, label, nh, nm = "closed", False, "Market Closed", 4, 0
    elif total < _OPEN:
        phase, is_open, label, nh, nm = "premarket", False, "Pre-Market", 9, 30
    elif total < close:
        label = "Market Open (Half Day)" if is_half_day else "Market Open"
        nh = 13 if is_half_day else 16
        phase, is_open, nm = "open", True, 0
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
