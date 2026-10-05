// Weeks are keyed by their Monday ("2026-10-12") so history stays stable.

export const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri']
export const DAY_LABEL = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday' }
export const DAY_SHORT = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri' }

const pad = n => String(n).padStart(2, '0')
export const isoDate = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseIso = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const addDays = (iso, n) => { const d = parseIso(iso); d.setDate(d.getDate() + n); return isoDate(d) }

export function mondayOf(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const dow = d.getDay() // 0 Sun
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1))
  return isoDate(d)
}

// The week we're focused on: during Mon–Fri it's this week; at the weekend
// we're planning next week (delivery arrives Monday).
export function planningWeekStart(today) {
  const dow = today.getDay()
  const monday = mondayOf(today)
  return dow === 0 || dow === 6 ? addDays(monday, 7) : monday
}

export const dayDate = (weekStart, day) => parseIso(addDays(weekStart, DAYS.indexOf(day)))

export function weekRangeLabel(weekStart) {
  const s = parseIso(weekStart)
  const e = parseIso(addDays(weekStart, 4))
  const m = d => d.toLocaleDateString('en-GB', { month: 'short' })
  return s.getMonth() === e.getMonth()
    ? `${s.getDate()}–${e.getDate()} ${m(e)}`
    : `${s.getDate()} ${m(s)} – ${e.getDate()} ${m(e)}`
}

// Which weekday key is "today" (null at weekends).
export function todayKey(today) {
  const dow = today.getDay()
  return dow >= 1 && dow <= 5 ? DAYS[dow - 1] : null
}

export function emptyWeek(start) {
  return {
    start,
    days: Object.fromEntries(DAYS.map(d => [d, { recipeId: null, locked: false, out: false }])),
    approved: false,
    have: {},     // ingredientId -> true: already in the fridge/cupboard this week
    need: {},     // pantry ingredientId -> true: pantry staple we've run out of
    tesco: { added: {}, done: false },
  }
}
