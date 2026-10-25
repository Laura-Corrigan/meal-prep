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

// A shared link (?h=<id>) joins this phone to an existing household.
function linkedHousehold() {
  const h = new URLSearchParams(location.search).get('h')
  if (!h || h.length < 20) return null
  const url = new URL(location.href)
  url.searchParams.delete('h')
  history.replaceState(null, '', url)
  return h
}

export function useAppState() {
  const [state, setState] = useState(() => {
    const local = loadLocal() || defaultState()
    const joined = linkedHousehold()
    return joined && joined !== local.householdId ? { ...local, householdId: joined, updatedAt: 0 } : local
  })
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
    } catch {
      setSync('offline')
    }
  }, [])

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
    const fresh = { ...defaultState(), householdId: newId() }
    saveLocal(fresh)
    setState(fresh)
  }, [])

  return { state, update, updateWeek, reset, sync, refresh }
}
