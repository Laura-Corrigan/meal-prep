// The agent's structured output contract. Any interpreter (the built-in rules,
// or an LLM later) must produce `{ ops: [...], message? }` in this shape; it is
// validated here before anything touches the plan.

import { DAYS, DAY_LABEL, emptyWeek } from '../domain/week'
import { PROTEINS } from '../data/recipes'
import { INGREDIENTS, ingredient } from '../data/ingredients'
import { getRecipe, lines, proteinFamily } from '../domain/recipes'
import { planDays } from './planner'

const FAMILIES = ['fish', 'red', 'poultry', 'veggie']
const isDay = d => DAYS.includes(d)
const isProtein = p => p in PROTEINS || FAMILIES.includes(p)

const CONSTRAINT_KEYS = {
  maxMins: v => Number.isFinite(v) && v >= 10 && v <= 120,
  proteins: v => Array.isArray(v) && v.every(isProtein),
  avoidProteins: v => Array.isArray(v) && v.every(isProtein),
  preferProteins: v => Array.isArray(v) && v.every(isProtein),
  mustUse: v => Array.isArray(v) && v.every(id => id in INGREDIENTS),
  cheaper: v => typeof v === 'boolean',
  maxCost: v => [1, 2, 3].includes(v),
  fun: v => typeof v === 'boolean',
}

function validConstraints(c) {
  if (c == null) return true
  if (typeof c !== 'object') return false
  return Object.entries(c).every(([k, v]) => CONSTRAINT_KEYS[k]?.(v))
}

const SCHEMAS = {
  mark_out: o => isDay(o.day),
  mark_in: o => isDay(o.day),
  set_meal: (o, state) => isDay(o.day) && !!getRecipe(o.recipeId, state),
  lock: o => isDay(o.day) && typeof o.locked === 'boolean',
  replan: o => (o.days === 'unlocked' || (Array.isArray(o.days) && o.days.length && o.days.every(isDay))) &&
    validConstraints(o.constraints) &&
    (o.dayConstraints == null || Object.entries(o.dayConstraints).every(([d, c]) => isDay(d) && validConstraints(c))),
  use_up: o => Array.isArray(o.ingredients) && o.ingredients.length && o.ingredients.every(id => id in INGREDIENTS),
  more_protein: o => isProtein(o.protein),
  avoid_protein: o => isProtein(o.protein),
  limit_time: o => Number.isFinite(o.maxMins) && o.maxMins >= 10 && o.maxMins <= 120,
  cheaper: () => true,
  switch_week: o => o.which === 'this' || o.which === 'next',
}

export function validateOps(raw, state) {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.ops)) return { ok: false, ops: [], errors: ['Malformed agent response'] }
  const ops = [], errors = []
  for (const o of raw.ops.slice(0, 10)) {
    const check = o && SCHEMAS[o.op]
    if (check && check(o, state)) ops.push(o)
    else errors.push(`Rejected op: ${JSON.stringify(o)}`)
  }
  return { ok: errors.length === 0, ops, errors, message: typeof raw.message === 'string' ? raw.message.slice(0, 280) : undefined }
}

// ---------------------------------------------------------------------------

const label = d => DAY_LABEL[d]
const matches = (recipe, p) => recipe && (recipe.protein === p || proteinFamily(recipe.protein) === p)
const proteinWord = p => (PROTEINS[p]?.label || { fish: 'fish', red: 'red meat', poultry: 'chicken', veggie: 'veggie' }[p] || p).toLowerCase()

/**
 * Apply validated ops to one week. Returns { week, summary: string[], switchTo? }.
 */
export function applyOps({ state, week: input, ops, today, rng }) {
  let week = structuredClone(input || emptyWeek())
  const summary = []
  let switchTo

  const recipeOn = d => (week.days[d].recipeId && !week.days[d].out ? getRecipe(week.days[d].recipeId, state) : null)
  const editable = d => !week.days[d].locked && !week.days[d].out

  const replan = (days, constraints = {}, dayConstraints = {}) => {
    if (!days.length) return []
    // Never hand back the meals we're replacing.
    const replaced = days.map(d => week.days[d].recipeId).filter(Boolean)
    const c = { ...constraints, exclude: [...(constraints.exclude || []), ...replaced] }
    const picks = planDays({ state, week, days, constraints: c, dayConstraints, today, rng })
    const changed = []
    for (const d of days) {
      if (!picks[d]) continue
      const before = week.days[d].recipeId
      week.days[d] = { recipeId: picks[d], locked: false, out: false }
      if (before !== picks[d]) changed.push(d)
    }
    return changed
  }
  const describe = days => days.map(d => `${label(d)}: ${getRecipe(week.days[d].recipeId, state)?.name}`)

  for (const o of ops) {
    switch (o.op) {
      case 'mark_out':
        week.days[o.day] = { recipeId: null, locked: false, out: true }
        summary.push(`${label(o.day)}: eating out`)
        break
      case 'mark_in': {
        week.days[o.day].out = false
        summary.push(...describe(replan([o.day])))
        break
      }
      case 'set_meal':
        week.days[o.day] = { recipeId: o.recipeId, locked: false, out: false }
        summary.push(...describe([o.day]))
        break
      case 'lock':
        week.days[o.day].locked = o.locked
        summary.push(`${label(o.day)} ${o.locked ? 'locked' : 'unlocked'}`)
        break
      case 'replan': {
        const days = o.days === 'unlocked' ? DAYS.filter(editable) : o.days
        // Explicitly named days are replanned even if they were out or locked.
        const changed = replan(days, o.constraints, o.dayConstraints)
        summary.push(...(changed.length ? describe(changed) : ['No better options — kept your plan']))
        break
      }
      case 'use_up': {
        for (const id of o.ingredients) {
          const name = ingredient(id).name.toLowerCase()
          const already = DAYS.find(d => lines(recipeOn(d) || { ingredients: [] }).some(l => l.id === id))
          if (already) { summary.push(`${label(already)} already uses ${name}`); continue }
          let done = false
          for (const d of DAYS.filter(editable)) {
            const pick = planDays({ state, week, days: [d], constraints: { mustUse: [id] }, today, rng: () => 0 })[d]
            if (pick && lines(getRecipe(pick, state)).some(l => l.id === id)) {
              week.days[d] = { recipeId: pick, locked: false, out: false }
              summary.push(`${label(d)}: ${getRecipe(pick, state).name} (uses ${name})`)
              done = true
              break
            }
          }
          if (!done) summary.push(`Couldn't find a recipe using ${name}`)
        }
        break
      }
      case 'more_protein': {
        const want = o.count || 2
        const have = DAYS.filter(d => matches(recipeOn(d), o.protein)).length
        const swap = DAYS.filter(d => editable(d) && !matches(recipeOn(d), o.protein)).slice(0, Math.max(0, want - have))
        const changed = replan(swap, {}, Object.fromEntries(swap.map(d => [d, { proteins: [o.protein] }])))
        summary.push(...(changed.length ? describe(changed) : [`Already ${have} ${proteinWord(o.protein)} meals this week`]))
        break
      }
      case 'avoid_protein': {
        const swap = DAYS.filter(d => editable(d) && matches(recipeOn(d), o.protein))
        const changed = replan(swap, { avoidProteins: [o.protein] })
        summary.push(...(changed.length ? describe(changed) : [`No ${proteinWord(o.protein)} to swap out`]))
        break
      }
      case 'limit_time': {
        const swap = DAYS.filter(d => editable(d) && (recipeOn(d)?.mins || 0) > o.maxMins)
        const changed = replan(swap, { maxMins: o.maxMins })
        summary.push(...(changed.length ? describe(changed) : [`Everything's already ${o.maxMins} mins or less`]))
        break
      }
      case 'cheaper': {
        const swap = DAYS.filter(d => editable(d) && (recipeOn(d)?.cost || 1) >= 2)
        const changed = replan(swap, { cheaper: true, maxCost: 1 })
        summary.push(...(changed.length ? describe(changed) : ['This week is already budget-friendly']))
        break
      }
      case 'switch_week':
        switchTo = o.which
        break
    }
  }
  return { week, summary, switchTo }
}
