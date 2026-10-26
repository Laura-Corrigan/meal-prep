import { useCallback, useEffect, useRef, useState } from 'react'
import { DEFAULT_PREFS } from '../domain/prefs'
import { emptyWeek } from '../domain/week'
import { pull, push, syncEnabled } from './sync'

const KEY = 'whats-for-tea:v2'

const newId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(24))
  return Array.from(bytes, b => (b % 36).toString(36)).join('')
}

export function defaultState() {
  return {
    version: 2,
    householdId: newId(),
    onboarded: false,
    prefs: { ...DEFAULT_PREFS },
    ratings: {},        // recipeId -> love | like | nope
    pantry: {},         // ingredientId -> true (we keep it) | false (not a staple for us)
    customRecipes: [],
    weeks: {},          // weekStart -> week
    tescoProducts: {},  // ingredientId -> remembered Tesco product id
    updatedAt: 0,
  }
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...defaultState(), ...JSON.parse(raw) }
  } catch { /* storage unavailable or corrupt: start fresh */ }
  return null
}

function saveLocal(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* private mode etc. */ }
}

// The household id also lives in the address (?h=<id>). Phones can wipe a
// site's saved data (private browsing, in-app browsers, blocked cookies), so
// a bookmark or home-screen icon carrying the id can always find the plan
// again in the cloud. Sharing that link is also how a second phone joins.
function linkedHousehold() {
  const h = new URLSearchParams(location.search).get('h')
  return h && h.length >= 20 ? h : null
}

function putHouseholdInAddress(id) {
  try {
    const url = new URL(location.href)
    if (url.searchParams.get('h') === id) return
    url.searchParams.set('h', id)
    history.replaceState(history.state, '', url)
  } catch { /* ignore */ }
}

export function useAppState() {
  const [boot] = useState(() => {
    const local = loadLocal()
    const joined = linkedHousehold()
    const base = local || defaultState()
    // Joining a different household (a shared link, or this device lost its
    // data): set this device's own plan aside entirely and show nothing until
    // the shared plan has loaded, so nothing stale can be saved over it.
    const switching = !!joined && joined !== base.householdId
    const state = switching ? { ...defaultState(), householdId: joined } : base
    return { state, restoring: syncEnabled && !!joined && (switching || !local?.onboarded) }
  })
  const [state, setState] = useState(boot.state)
  const [restoring, setRestoring] = useState(boot.restoring)
  const [loadFailed, setLoadFailed] = useState(false)
  const [sync, setSync] = useState(syncEnabled ? 'connecting' : 'local')
  const pushTimer = useRef(null)
  const latest = useRef(state)
  latest.current = state

  const schedulePush = useCallback(next => {
    if (!syncEnabled) return
    clearTimeout(pushTimer.current)
    pushTimer.current = setTimeout(async () => {
      setSync('saving')
      try { await push(next.householdId, next); setSync('synced') } catch { setSync('offline') }
    }, 1200)
  }, [])

  const refresh = useCallback(async () => {
    if (!syncEnabled) return
    const mine = latest.current
    setLoadFailed(false)
    try {
      const remote = await pull(mine.householdId)
      if (remote && (remote.updatedAt || 0) > (mine.updatedAt || 0)) {
        const merged = { ...defaultState(), ...remote, householdId: mine.householdId }
        saveLocal(merged)
        setState(merged)
      } else if (!remote || (mine.updatedAt || 0) > (remote.updatedAt || 0)) {
        if (mine.onboarded) await push(mine.householdId, mine)
      }
      setSync('synced')
      setRestoring(false)
    } catch {
      setSync('offline')
      // Still waiting on a shared plan: keep the app locked rather than
      // falling through to setup, which would create a competing plan.
      if (!latest.current.onboarded && linkedHousehold()) setLoadFailed(true)
      else setRestoring(false)
    }
  }, [])

  // Once set up, keep the household in the address so bookmarks and
  // home-screen icons always reopen this plan.
  useEffect(() => {
    if (state.onboarded && syncEnabled) putHouseholdInAddress(state.householdId)
  }, [state.onboarded, state.householdId])

  useEffect(() => {
    refresh()
    const onVisible = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  const update = useCallback(fn => {
    setState(prev => {
      const next = { ...fn(prev), updatedAt: Date.now() }
      saveLocal(next)
      schedulePush(next)
      return next
    })
  }, [schedulePush])

  const updateWeek = useCallback((start, fn) => {
    update(s => ({ ...s, weeks: { ...s.weeks, [start]: fn(s.weeks[start] || emptyWeek(start)) } }))
  }, [update])

  const reset = useCallback(() => {
    try { const url = new URL(location.href); url.searchParams.delete('h'); history.replaceState(history.state, '', url) } catch { /* ignore */ }
    const fresh = { ...defaultState(), householdId: newId() }
    saveLocal(fresh)
    setState(fresh)
  }, [])

  return { state, update, updateWeek, reset, sync, refresh, restoring, loadFailed }
}
