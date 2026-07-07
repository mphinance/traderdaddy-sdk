"""market_hours tests — fixed ET datetimes, TZ-independent."""

from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from traderdaddy import get_market_phase, is_market_open

ET = ZoneInfo("America/New_York")


def _et(y, mo, d, h, mi):
    return datetime(y, mo, d, h, mi, tzinfo=ET)


def test_regular_session_open():
    # Tue 2026-07-07 11:00 ET — regular session.
    assert is_market_open(_et(2026, 7, 7, 11, 0)) is True
    assert get_market_phase(_et(2026, 7, 7, 11, 0)).phase == "open"


def test_premarket():
    p = get_market_phase(_et(2026, 7, 7, 8, 0))
    assert p.phase == "premarket"
    assert p.is_open is False


def test_afterhours():
    p = get_market_phase(_et(2026, 7, 7, 17, 30))
    assert p.phase == "afterhours"
    assert p.is_open is False


def test_overnight_closed():
    p = get_market_phase(_et(2026, 7, 7, 2, 0))
    assert p.phase == "closed"


def test_weekend():
    # Sat 2026-07-11.
    p = get_market_phase(_et(2026, 7, 11, 12, 0))
    assert p.phase == "weekend"
    assert p.is_open is False


def test_holiday():
    # 2026-07-03 Independence Day observed.
    p = get_market_phase(_et(2026, 7, 3, 11, 0))
    assert p.phase == "holiday"
    assert p.is_open is False


def test_next_change_at_is_iso():
    p = get_market_phase(_et(2026, 7, 7, 11, 0))
    # 16:00 ET boundary, ISO-formatted with offset.
    assert p.next_change_at.startswith("2026-07-07T16:00")
