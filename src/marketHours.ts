/**
 * marketHours.ts — US-equity market phase in Eastern Time, TZ-independent.
 *
 * Ported verbatim (behaviour-for-behaviour) from DaddyBoard's `marketHours.js`.
 * Uses `Intl.DateTimeFormat` with `timeZone:'America/New_York'` so it does NOT
 * depend on the host's TZ env var — safe in the browser and on a server in any
 * region.
 *
 * Phases (ET, weekdays):
 *   premarket   04:00–09:29
 *   open        09:30–15:59
 *   afterhours  16:00–19:59
 *   closed      20:00–03:59
 *   weekend     Sat / Sun
 *   holiday     US market holiday (approximate 2026 list)
 */

export type MarketPhaseName =
  | 'premarket'
  | 'open'
  | 'afterhours'
  | 'closed'
  | 'weekend'
  | 'holiday';

export interface MarketPhase {
  phase: MarketPhaseName;
  isOpen: boolean;
  label: string;
  /** ISO timestamp of the next phase boundary. */
  nextChangeAt: string;
}

/** Approximate 2026 US market holidays (YYYY-MM-DD in ET). */
const HOLIDAYS_2026 = new Set<string>([
  '2026-01-01', // New Year's Day
  '2026-01-19', // MLK Day
  '2026-02-16', // Presidents' Day
  '2026-04-03', // Good Friday
  '2026-05-25', // Memorial Day
  '2026-07-03', // Independence Day observed
  '2026-09-07', // Labor Day
  '2026-11-26', // Thanksgiving
  '2026-11-27', // Day after Thanksgiving (early close — treated as closed)
  '2026-12-25', // Christmas
]);

const TZ = 'America/New_York';

interface EasternComponents {
  year: number;
  month: number; // 1-based
  day: number;
  weekday: number; // 0=Sun … 6=Sat
  hour: number;
  minute: number;
  dateStr: string; // YYYY-MM-DD
}

/** Extract wall-clock components in Eastern Time. */
function getEasternComponents(now: Date): EasternComponents {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    weekday: 'short',
  });

  const parts = fmt.formatToParts(now);
  const get = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((p) => p.type === type)?.value ?? '0';

  const year = parseInt(get('year'), 10);
  const month = parseInt(get('month'), 10);
  const day = parseInt(get('day'), 10);
  const hour = parseInt(get('hour'), 10) % 24; // ET midnight can format as "24"
  const minute = parseInt(get('minute'), 10);
  const weekdayStr = get('weekday');
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const weekday = weekdayMap[weekdayStr] ?? now.getUTCDay();

  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return { year, month, day, weekday, hour, minute, dateStr: `${year}-${mm}-${dd}` };
}

/** Build a Date for a specific ET wall-clock time, accounting for the ET offset. */
function etWallClockToDate(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
): Date {
  const isoStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(
    hour,
  ).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
  const candidateUtc = new Date(`${isoStr}Z`); // treat as UTC first
  const etParts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(candidateUtc);
  const etH = parseInt(etParts.find((p) => p.type === 'hour')?.value ?? '0', 10) % 24;
  const etM = parseInt(etParts.find((p) => p.type === 'minute')?.value ?? '0', 10);
  const diffMs = (hour * 60 + minute - (etH * 60 + etM)) * 60 * 1000;
  return new Date(candidateUtc.getTime() + diffMs);
}

/** Returns the current market phase object. */
export function getMarketPhase(now: Date = new Date()): MarketPhase {
  const { year, month, day, weekday, hour, minute, dateStr } = getEasternComponents(now);

  // Weekend
  if (weekday === 0 || weekday === 6) {
    const daysToMon = weekday === 0 ? 1 : 2;
    const nextD = new Date(now);
    nextD.setUTCDate(nextD.getUTCDate() + daysToMon);
    const mon = getEasternComponents(nextD);
    const nextChangeAt = etWallClockToDate(mon.year, mon.month, mon.day, 4, 0);
    return {
      phase: 'weekend',
      isOpen: false,
      label: 'Market Closed (Weekend)',
      nextChangeAt: nextChangeAt.toISOString(),
    };
  }

  // Holiday
  if (HOLIDAYS_2026.has(dateStr)) {
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const t = getEasternComponents(tomorrow);
    const nextChangeAt = etWallClockToDate(t.year, t.month, t.day, 4, 0);
    return {
      phase: 'holiday',
      isOpen: false,
      label: 'Market Closed (Holiday)',
      nextChangeAt: nextChangeAt.toISOString(),
    };
  }

  // Weekday phases
  const totalMinutes = hour * 60 + minute;
  const PRE_OPEN = 4 * 60; // 04:00
  const OPEN = 9 * 60 + 30; // 09:30
  const CLOSE = 16 * 60; // 16:00
  const AFTER_END = 20 * 60; // 20:00

  let phase: MarketPhaseName;
  let isOpen: boolean;
  let label: string;
  let nextHour: number;
  let nextMinute: number;

  if (totalMinutes < PRE_OPEN) {
    phase = 'closed';
    isOpen = false;
    label = 'Market Closed';
    nextHour = 4;
    nextMinute = 0;
  } else if (totalMinutes < OPEN) {
    phase = 'premarket';
    isOpen = false;
    label = 'Pre-Market';
    nextHour = 9;
    nextMinute = 30;
  } else if (totalMinutes < CLOSE) {
    phase = 'open';
    isOpen = true;
    label = 'Market Open';
    nextHour = 16;
    nextMinute = 0;
  } else if (totalMinutes < AFTER_END) {
    phase = 'afterhours';
    isOpen = false;
    label = 'After Hours';
    nextHour = 20;
    nextMinute = 0;
  } else {
    // 20:00–23:59 — next change is tomorrow's premarket at 04:00 ET.
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const t = getEasternComponents(tomorrow);
    const nextChangeAt = etWallClockToDate(t.year, t.month, t.day, 4, 0);
    return {
      phase: 'closed',
      isOpen: false,
      label: 'Market Closed',
      nextChangeAt: nextChangeAt.toISOString(),
    };
  }

  const nextChangeAt = etWallClockToDate(year, month, day, nextHour, nextMinute);
  return { phase, isOpen, label, nextChangeAt: nextChangeAt.toISOString() };
}

/** Convenience: is the US equity market in its regular session right now? */
export function isMarketOpen(now: Date = new Date()): boolean {
  return getMarketPhase(now).isOpen;
}
