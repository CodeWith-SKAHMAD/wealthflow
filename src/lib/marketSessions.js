// Standard forex/market trading session windows, defined in UTC hours.
// (Approximate consensus hours used by most session-tracker tools.)
export const SESSIONS = [
  { key: 'sydney', label: 'Sydney', startUTC: 22, endUTC: 7, color: '#c084fc' },
  { key: 'asia', label: 'Asia', startUTC: 0, endUTC: 9, color: '#3b82f6' },
  { key: 'london', label: 'London', startUTC: 7, endUTC: 16, color: '#14b8a6' },
  { key: 'newyork', label: 'New York', startUTC: 12, endUTC: 21, color: '#a78bfa' },
]

function utcHourFraction(date) {
  return date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600
}

function isWithin(hour, start, end) {
  if (start <= end) return hour >= start && hour < end
  return hour >= start || hour < end // wraps past midnight UTC
}

export function getActiveSessions(date = new Date()) {
  const hour = utcHourFraction(date)
  return SESSIONS.filter((s) => isWithin(hour, s.startUTC, s.endUTC))
}

export function isPeakVolume(date = new Date()) {
  return getActiveSessions(date).length >= 2
}

export function getCurrentSessionLabel(date = new Date()) {
  const active = getActiveSessions(date)
  if (active.length === 0) return 'Markets quiet'
  if (active.length >= 2) return active.map((s) => s.label).join(' + ') + ' overlap'
  return active[0].label + ' session'
}

/** Minutes until the next session boundary (open or close), for a countdown. */
export function minutesToNextBoundary(date = new Date()) {
  const hour = utcHourFraction(date)
  const boundaries = SESSIONS.flatMap((s) => [s.startUTC, s.endUTC])
  let best = Infinity
  for (const b of boundaries) {
    let diff = b - hour
    if (diff <= 0) diff += 24
    if (diff < best) best = diff
  }
  return Math.round(best * 60)
}

/** Position (0-100%) of "now" along a 24h (12AM-11PM) timeline, in the local timezone. */
export function nowPositionPct(date = new Date()) {
  const hour = date.getHours() + date.getMinutes() / 60
  return (hour / 24) * 100
}

/** Convert a UTC session window into local-time percentage span for the 24h timeline bar. */
export function sessionToLocalSpan(session, referenceDate = new Date()) {
  const offsetMinutes = referenceDate.getTimezoneOffset() // local = UTC - offset
  const offsetHours = -offsetMinutes / 60

  let start = (session.startUTC + offsetHours + 24) % 24
  let end = (session.endUTC + offsetHours + 24) % 24

  if (end <= start) {
    // wraps midnight locally — split into two segments by caller if needed
    return [
      { startPct: (start / 24) * 100, endPct: 100 },
      { startPct: 0, endPct: (end / 24) * 100 },
    ]
  }
  return [{ startPct: (start / 24) * 100, endPct: (end / 24) * 100 }]
}

export function getTimezoneAbbrev(date = new Date()) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZoneName: 'short' })
      .formatToParts(date)
    const tz = parts.find((p) => p.type === 'timeZoneName')
    return tz ? tz.value : ''
  } catch {
    return ''
  }
}
