import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppContext } from './context'
import { useAppState } from './store/useAppState'
import { addDays, emptyWeek, mondayOf, parseIso, planningWeekStart } from './domain/week'
import { applyOps, interpret } from './agent'
import { getRecipe } from './domain/recipes'
import Setup from './components/Setup'
import Home from './components/Home'
import RecipeSheet from './components/RecipeSheet'
import SwapSheet from './components/SwapSheet'
import ShoppingPage from './components/ShoppingPage'
import TescoFlow from './components/TescoFlow'
import Settings from './components/Settings'
import RecipesPage from './components/RecipesPage'
import AskSheet from './components/AskSheet'
import { TabBar, TAB_PAGES } from './components/Layout'
import { Toast } from './components/ui'

// ?today=2026-10-10 lets us test weekend/weekday behaviour.
function getToday() {
  const o = new URLSearchParams(location.search).get('today')
  return o && /^\d{4}-\d{2}-\d{2}$/.test(o) ? parseIso(o) : new Date()
}

export default function App() {
  const { state, update, updateWeek, reset, sync } = useAppState()
  const today = useMemo(getToday, [])
  const thisWeek = mondayOf(today)
  const [weekStart, setWeekStart] = useState(() => planningWeekStart(today))
  // Plans can reference recipes that have since been removed: treat those days as empty.
  const week = useMemo(() => {
    const w = state.weeks[weekStart] || emptyWeek(weekStart)
    const days = Object.fromEntries(Object.entries(w.days).map(([d, slot]) =>
      [d, slot.recipeId && !getRecipe(slot.recipeId, state) ? { ...slot, recipeId: null, locked: false } : slot]))
    return { ...w, days }
  }, [state, weekStart])

  const [page, setPage] = useState('home')         // tabs: home | shopping | recipes; pages: tesco | settings
  const [recipeId, setRecipeId] = useState(null)   // recipe sheet
  const [swapDay, setSwapDay] = useState(null)     // swap sheet
  const [askOpen, setAskOpen] = useState(false)    // plain-English changes
  const [toast, setToast] = useState(null)
  const closeToast = useCallback(() => setToast(null), [])

  // Phone back button closes the top sheet/page instead of leaving the app:
  // every open layer owns one history entry.
  // Tabs are the base level; full-screen pages and sheets stack on top.
  const depth = (TAB_PAGES.includes(page) ? 0 : 1) + (swapDay ? 1 : 0) + (recipeId ? 1 : 0) + (askOpen ? 1 : 0)
  const pushedDepth = useRef(0)
  useEffect(() => {
    while (pushedDepth.current < depth) { history.pushState({ depth: pushedDepth.current + 1 }, ''); pushedDepth.current++ }
    pushedDepth.current = Math.min(pushedDepth.current, depth)
  }, [depth])
  const closeTop = useCallback(() => {
    if (recipeId) setRecipeId(null)
    else if (askOpen) setAskOpen(false)
    else if (swapDay) setSwapDay(null)
    else if (page === 'tesco') setPage('shopping')
    else if (page === 'settings') setPage('home')
  }, [recipeId, askOpen, swapDay, page])
  useEffect(() => {
    const onPop = () => { pushedDepth.current = Math.max(0, pushedDepth.current - 1); closeTop() }
    addEventListener('popstate', onPop)
    return () => removeEventListener('popstate', onPop)
  }, [closeTop])
  const back = useCallback(() => (pushedDepth.current > 0 ? history.back() : closeTop()), [closeTop])

  // ---- plan actions --------------------------------------------------------

  const withUndo = useCallback((start, title, lines, mutate) => {
    const before = state.weeks[start]
    mutate()
    setToast({
      title, lines,
      undo: () => update(s => {
        const weeks = { ...s.weeks }
        if (before) weeks[start] = before; else delete weeks[start]
        return { ...s, weeks }
      }),
    })
  }, [state.weeks, update])

  const runOps = useCallback((ops, start = weekStart, title) => {
    const base = state.weeks[start] || emptyWeek(start)
    const res = applyOps({ state, week: base, ops, today })
    if (JSON.stringify(res.week.days) === JSON.stringify(base.days)) setToast({ title, lines: res.summary })
    else withUndo(start, title, res.summary, () => updateWeek(start, () => res.week))
    return res
  }, [state, weekStart, today, withUndo, updateWeek])

  const actions = useMemo(() => ({
    generateWeek: () => runOps([{ op: 'replan', days: 'unlocked' }], weekStart, 'New suggestions'),
    regenerateDay: day => runOps([{ op: 'replan', days: [day] }]),
    replanDays: days => runOps([{ op: 'replan', days }]),
    setMeal: (day, recipeId) => runOps([{ op: 'set_meal', day, recipeId }]),
    markOut: day => runOps([{ op: 'mark_out', day }]),
    markIn: day => runOps([{ op: 'mark_in', day }]),
    toggleLock: day => updateWeek(weekStart, w => ({ ...w, days: { ...w.days, [day]: { ...w.days[day], locked: !w.days[day].locked } } })),
    approve: (v = true) => updateWeek(weekStart, w => ({ ...w, approved: v })),
    rate: (id, rating) => update(s => {
      const ratings = { ...s.ratings }
      if (ratings[id] === rating) delete ratings[id]; else ratings[id] = rating
      return { ...s, ratings }
    }),
    toggleHave: key => updateWeek(weekStart, w => ({ ...w, have: { ...w.have, [key]: !w.have?.[key] } })),
    toggleNeed: key => updateWeek(weekStart, w => ({ ...w, need: { ...w.need, [key]: !w.need?.[key] } })),
    setPantry: (id, keep) => update(s => ({ ...s, pantry: { ...s.pantry, [id]: keep } })),
    tescoAdded: (key, v) => updateWeek(weekStart, w => ({ ...w, tesco: { ...w.tesco, added: { ...w.tesco?.added, [key]: v } } })),
    tescoDone: v => updateWeek(weekStart, w => ({ ...w, tesco: { ...w.tesco, done: v } })),
    rememberProduct: (id, pid) => update(s => ({ ...s, tescoProducts: { ...s.tescoProducts, [id]: pid } })),
    setPrefs: prefs => update(s => ({ ...s, prefs })),
    addRecipe: recipe => update(s => ({ ...s, customRecipes: [...s.customRecipes, recipe] })),
    removeRecipe: id => update(s => ({ ...s, customRecipes: s.customRecipes.filter(r => r.id !== id) })),

    finishSetup: prefs => {
      const draft = applyOps({ state: { ...state, prefs }, week: emptyWeek(weekStart), ops: [{ op: 'replan', days: 'unlocked' }], today })
      update(s => ({ ...s, prefs, onboarded: true, weeks: { ...s.weeks, [weekStart]: draft.week } }))
    },

    askAgent: async text => {
      const result = await interpret(text, { state, today, weekStart })
      if (!result.ops.length) { setToast({ title: result.message || 'Nothing to change' }); return false }
      let ops = result.ops, start = weekStart
      const sw = ops.find(o => o.op === 'switch_week')
      if (sw) {
        start = sw.which === 'next' ? addDays(thisWeek, 7) : thisWeek
        setWeekStart(start)
        ops = ops.filter(o => o.op !== 'switch_week')
      }
      if (!ops.length) return true
      runOps(ops, start, result.message)
      return true
    },
  }), [runOps, update, updateWeek, weekStart, state, today, thisWeek])

  // A brand-new planning week gets a draft automatically: one less thing to do.
  useEffect(() => {
    if (state.onboarded && !state.weeks[weekStart] && weekStart >= thisWeek) {
      const draft = applyOps({ state, week: emptyWeek(weekStart), ops: [{ op: 'replan', days: 'unlocked' }], today })
      updateWeek(weekStart, () => draft.week)
    }
  }, [state.onboarded, weekStart]) // eslint-disable-line react-hooks/exhaustive-deps

  const ctx = {
    state, week, weekStart, setWeekStart, thisWeek, today, sync, actions,
    page, openRecipe: setRecipeId, openSwap: setSwapDay, openAsk: () => setAskOpen(true),
    go: p => { setPage(p); window.scrollTo(0, 0) }, back, setToast, reset,
  }

  if (!state.onboarded) {
    return <AppContext.Provider value={ctx}><Setup /></AppContext.Provider>
  }

  return (
    <AppContext.Provider value={ctx}>
      {page === 'home' && <Home />}
      {page === 'shopping' && <ShoppingPage />}
      {page === 'recipes' && <RecipesPage />}
      {page === 'tesco' && <TescoFlow />}
      {page === 'settings' && <Settings />}
      {TAB_PAGES.includes(page) && <TabBar />}
      <RecipeSheet recipeId={recipeId} onClose={back} />
      <SwapSheet day={swapDay} onClose={back} />
      <AskSheet open={askOpen} onClose={back} />
      <Toast toast={toast} onClose={closeToast} />
    </AppContext.Provider>
  )
}

