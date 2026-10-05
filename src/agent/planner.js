// Rule-based meal planner. Always available (no network), and the safety net
// whenever a smarter planner fails. Picks one recipe per requested day by
// scoring every allowed recipe against the rest of the week.

import { allRecipes, getRecipe, lines, proteinFamily, RECIPE_SERVINGS } from '../domain/recipes'
import { isAllowed, servings } from '../domain/prefs'
import { DAYS, dayDate, isoDate } from '../domain/week'
import { ingredient } from '../data/ingredients'
import { choosePacks } from '../tesco/packs'

const PERISHABLE = new Set(['veg', 'meat', 'dairy', 'bakery'])
const UBIQUITOUS = new Set(['garlic', 'onions', 'red-onion', 'ginger', 'limes', 'lemons'])

// recipeId -> days since we last ate it (past meals only)
export function recentMeals(state, today) {
  const todayIso = isoDate(today)
  const out = new Map()
  for (const week of Object.values(state.weeks || {})) {
    for (const day of DAYS) {
      const slot = week.days?.[day]
      if (!slot?.recipeId || slot.out) continue
      const date = dayDate(week.start, day)
      const iso = isoDate(date)
      if (iso >= todayIso) continue
      const ago = Math.round((today - date) / 86400000)
      if (!out.has(slot.recipeId) || out.get(slot.recipeId) > ago) out.set(slot.recipeId, ago)
    }
  }
  return out
}

const matchesProtein = (recipe, list) => list.some(p => p === recipe.protein || p === proteinFamily(recipe.protein))

// Leftover quantities from rounding the week's needs up to whole packs.
function spareFromPacks(recipes, factor) {
  const need = {}
  recipes.forEach(r => lines(r).forEach(l => {
    if (!l.id || l.qty == null) return
    const ing = ingredient(l.id)
    if (!PERISHABLE.has(ing.cat) || ing.pantry || UBIQUITOUS.has(l.id)) return
    need[l.id] = (need[l.id] || 0) + l.qty * factor
  }))
  const spare = {}
  for (const [id, q] of Object.entries(need)) {
    const c = choosePacks(q, ingredient(id).packs)
    if (c && c.spare > 0) spare[id] = c.spare
  }
  return spare
}

export function scoreRecipe(recipe, ctx) {
  const { chosen, ratings, recent, day, c, spare, factor, prefs } = ctx
  let s = 1
  const notes = []

  const rating = ratings[recipe.id]
  if (rating === 'love') s += 1.2
  if (rating === 'like') s += 0.5

  const ago = recent.get(recipe.id)
  if (ago != null) {
    const soft = rating === 'love' ? 0.4 : 1
    if (ago <= 7) s -= 2 * soft
    else if (ago <= 14) s -= 1 * soft
    else if (ago <= 21) s -= 0.4 * soft
  }

  for (const other of chosen) {
    if (other.protein === recipe.protein) s -= proteinFamily(recipe.protein) === 'poultry' ? 2 : 3.5
    else if (proteinFamily(other.protein) === proteinFamily(recipe.protein) && proteinFamily(recipe.protein) !== 'poultry') s -= 0.6
    if (other.cuisine === recipe.cuisine) s -= 0.5
    if (other.carb === recipe.carb) s -= 0.35
  }

  if (recipe.mins >= 20 && recipe.mins <= 35) s += 0.3
  if (recipe.mins > 40) s -= 0.3
  if (recipe.proteinG >= 35) s += 0.2

  if (day === 'fri' && recipe.fun) s += 1.6
  if (c.fun) s += recipe.fun ? 3 : -1

  const cheaper = c.cheaper || prefs.budget === 'thrifty'
  if (cheaper) s += recipe.cost === 1 ? (c.cheaper ? 1.2 : 0.5) : recipe.cost === 3 ? (c.cheaper ? -1.5 : -0.5) : 0
  if (prefs.budget === 'treat' && recipe.cost === 3) s += 0.3

  if (c.preferProteins?.length && matchesProtein(recipe, c.preferProteins)) s += 2.5

  const ids = new Set(lines(recipe).map(l => l.id))
  for (const m of c.mustUse || []) if (ids.has(m)) s += 2.5

  // Ingredient efficiency: reward recipes that use up spare from packs
  // we're already buying this week.
  let reuse = 0
  for (const l of lines(recipe)) {
    if (!l.id || !spare[l.id]) continue
    reuse += 0.4 * Math.min(1, spare[l.id] / (l.qty * factor))
    notes.push(l.id)
  }
  s += Math.min(1, reuse)

  return { score: s, reuses: notes }
}

/**
 * Fill `days` of `week`, keeping every other day as-is.
 * constraints: global { maxMins, proteins, avoidProteins, preferProteins, mustUse, cheaper, fun, exclude }
 * dayConstraints: { fri: { fun: true }, ... } merged over the global ones for that day.
 */
export function planDays({ state, week, days, constraints = {}, dayConstraints = {}, today = new Date(), rng = Math.random }) {
  const prefs = state.prefs
  const ratings = state.ratings || {}
  const recent = recentMeals(state, today)
  const factor = servings(prefs) / RECIPE_SERVINGS
  const library = allRecipes(state)
  const result = {}

  const kept = DAYS.filter(d => !days.includes(d))
    .map(d => week.days[d]).filter(s => s?.recipeId && !s.out)
    .map(s => getRecipe(s.recipeId, state)).filter(Boolean)

  // Constrained days first so they get first pick.
  const order = [...days].sort((a, b) => Object.keys(dayConstraints[b] || {}).length - Object.keys(dayConstraints[a] || {}).length)
  const chosen = [...kept]

  for (const day of order) {
    const c = { ...constraints, ...(dayConstraints[day] || {}) }
    const used = new Set(chosen.map(r => r.id))
    const base = library.filter(r => !used.has(r.id) && !(c.exclude || []).includes(r.id) && isAllowed(r, prefs, ratings))
    const strict = base.filter(r =>
      (!c.maxMins || r.mins <= c.maxMins) &&
      (!c.proteins?.length || matchesProtein(r, c.proteins)) &&
      (!c.avoidProteins?.length || !matchesProtein(r, c.avoidProteins)))
    const pool = strict.length ? strict : base
    if (!pool.length) { result[day] = null; continue }

    const spare = spareFromPacks(chosen, factor)
    const scored = pool
      .map(r => ({ r, ...scoreRecipe(r, { chosen, ratings, recent, day, c, spare, factor, prefs }) }))
      .sort((a, b) => b.score - a.score)

    // Weighted pick among the best few so "regenerate" gives variety.
    const top = scored.slice(0, 4)
    const weights = top.map(x => Math.exp((x.score - top[0].score) / 0.6))
    let roll = rng() * weights.reduce((a, b) => a + b, 0)
    let pick = top[0]
    for (let i = 0; i < top.length; i++) { roll -= weights[i]; if (roll <= 0) { pick = top[i]; break } }

    result[day] = pick.r.id
    chosen.push(pick.r)
  }
  return result
}

// Ranked alternatives for one day (used by the Swap sheet).
export function suggestionsFor({ state, week, day, count = 3, today = new Date() }) {
  const prefs = state.prefs
  const ratings = state.ratings || {}
  const factor = servings(prefs) / RECIPE_SERVINGS
  const others = DAYS.filter(d => d !== day).map(d => week.days[d]).filter(s => s?.recipeId && !s.out)
    .map(s => getRecipe(s.recipeId, state)).filter(Boolean)
  const current = week.days[day]?.recipeId
  const spare = spareFromPacks(others, factor)
  const recent = recentMeals(state, today)
  return allRecipes(state)
    .filter(r => r.id !== current && !others.some(o => o.id === r.id) && isAllowed(r, prefs, ratings))
    .map(r => ({ recipe: r, ...scoreRecipe(r, { chosen: others, ratings, recent, day, c: {}, spare, factor, prefs }) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

// For the card: which other days share a (non-trivial) fresh ingredient.
export function sharedIngredients(week, day, state) {
  const slot = week.days[day]
  if (!slot?.recipeId || slot.out) return []
  const recipe = getRecipe(slot.recipeId, state)
  if (!recipe) return []
  const mine = new Set(lines(recipe).filter(l => l.id && PERISHABLE.has(ingredient(l.id).cat) && !UBIQUITOUS.has(l.id)).map(l => l.id))
  const out = []
  for (const d of DAYS) {
    if (d === day) continue
    const s = week.days[d]
    if (!s?.recipeId || s.out) continue
    const r = getRecipe(s.recipeId, state)
    lines(r || { ingredients: [] }).forEach(l => {
      if (mine.has(l.id) && !out.some(o => o.id === l.id)) out.push({ id: l.id, day: d })
    })
  }
  return out
}
