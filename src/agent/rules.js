// Built-in natural-language interpreter. Turns everyday requests into the
// structured ops defined in ./ops.js. Deliberately small and predictable.

import { DAYS } from '../domain/week'
import { ALIASES, INGREDIENTS } from '../data/ingredients'
import { allRecipes } from '../domain/recipes'

const DAY_WORDS = [
  ['mon', /\bmon(day)?s?\b/], ['tue', /\btue(s|sday)?s?\b/], ['wed', /\bwed(s|nesday)?s?\b/],
  ['thu', /\bthu(r|rs|rsday)?s?\b/], ['fri', /\bfri(day)?s?\b/],
]

const PROTEIN_WORDS = [
  ['fish', /\b(fish|seafood|pescatarian)\b/], ['salmon', /\bsalmon\b/], ['cod', /\bcod\b/], ['prawns', /\b(prawns?|shrimp)\b/],
  ['chicken', /\bchicken\b/], ['turkey', /\bturkey\b/], ['beef', /\bbeef|steak\b/], ['lamb', /\blamb\b/], ['pork', /\b(pork|sausages?)\b/],
  ['red', /\bred meat\b/], ['veggie', /\b(veggie|vegetarian|meat[- ]free|plant[- ]based|meatless)\b/],
]

export const EXAMPLES = [
  "We're out Thursday", 'More fish next week', 'Nothing over 30 minutes', 'Use up the broccoli',
  'Make Friday something fun', 'Make it cheaper', "I don't fancy Monday's meal", 'Plan next week',
]

function findDays(t, today) {
  const days = DAY_WORDS.filter(([, re]) => re.test(t)).map(([d]) => d)
  const dow = today.getDay()
  if (/\b(today|tonight)\b/.test(t) && dow >= 1 && dow <= 5) days.push(DAYS[dow - 1])
  if (/\btomorrow\b/.test(t) && dow >= 0 && dow <= 4) days.push(DAYS[dow])
  return [...new Set(days)]
}

const findProteins = t => PROTEIN_WORDS.filter(([, re]) => re.test(t)).map(([p]) => p)
  .filter((p, _, all) => !(p === 'fish' && all.some(x => ['salmon', 'cod', 'prawns'].includes(x))))

function findIngredients(t) {
  const found = new Set()
  const names = Object.entries(ALIASES).sort((a, b) => b[0].length - a[0].length)
  let rest = ` ${t} `
  for (const [word, id] of names) {
    const re = new RegExp(`\\b${word.replace(/[-]/g, '[- ]')}\\b`)
    if (re.test(rest)) { found.add(id); rest = rest.replace(re, ' ') }
  }
  for (const [id, ing] of Object.entries(INGREDIENTS)) {
    if (!ing.pantry && rest.includes(ing.name.toLowerCase())) found.add(id)
  }
  return [...found]
}

function findMinutes(t) {
  const m = t.match(/(\d{2,3})\s*(m|min|mins|minutes)\b/)
  if (m) return Number(m[1])
  if (/\b(quick|quicker|faster|fast|speedy|short on time)\b/.test(t)) return 25
  return null
}

function findRecipe(t, state) {
  const words = t.replace(/[^a-z ]/g, ' ').split(/\s+/).filter(w => w.length > 3)
  let best = null, bestHits = 1
  for (const r of allRecipes(state)) {
    const name = r.name.toLowerCase()
    const hits = words.filter(w => name.includes(w)).length
    if (hits > bestHits) { best = r; bestHits = hits }
  }
  return best
}

export function interpretRules(text, { state, today = new Date() } = {}) {
  const t = ` ${String(text || '').toLowerCase().replace(/[’']/g, "'")} `
  const days = findDays(t, today)
  const proteins = findProteins(t)
  const mins = findMinutes(t)
  const ops = []

  // Eating out / no meal needed
  if (/\b(out|eating out|away|no (meal|dinner|cooking)|don'?t need|takeaway|not (in|home|cooking)|skip)\b/.test(t) && !/\buse (it )?up\b/.test(t)) {
    if (!days.length) return { ops: [], message: 'Which day are you out?' }
    days.forEach(day => ops.push({ op: 'mark_out', day }))
    return { ops }
  }

  // "We're in on Thursday after all"
  if (/\b(in after all|cooking after all|back in|we're in)\b/.test(t) && days.length) {
    days.forEach(day => ops.push({ op: 'mark_in', day }))
    return { ops }
  }

  // Lock / keep
  if (/\b(lock|keep)\b/.test(t) && days.length) {
    days.forEach(day => ops.push({ op: 'lock', day, locked: !/\bunlock\b/.test(t) }))
    return { ops }
  }
  if (/\bunlock\b/.test(t) && days.length) {
    days.forEach(day => ops.push({ op: 'lock', day, locked: false }))
    return { ops }
  }

  // Use up ingredients
  if (/\b(use (it |them )?up|need(s)? using|needs? to be used|got (some )?.+ (to|that) use|leftover|left over)\b/.test(t)) {
    const ingredients = findIngredients(t)
    if (!ingredients.length) return { ops: [], message: "I couldn't tell which ingredients — try 'use up the broccoli'." }
    return { ops: [{ op: 'use_up', ingredients }] }
  }

  const nextWeek = /\bnext week\b/.test(t)
  if (nextWeek) ops.push({ op: 'switch_week', which: 'next' })

  // Specific recipe on a day: "chicken katsu on wednesday"
  const recipe = days.length === 1 && /\b(have|put|make|want|cook|do)\b/.test(t) ? findRecipe(t, state) : null
  if (recipe) return { ops: [...ops, { op: 'set_meal', day: days[0], recipeId: recipe.id }] }

  // Fun night
  if (/\b(fun|treat|fakeaway|exciting|special|takeaway[- ]style)\b/.test(t)) {
    const target = days.length ? days : ['fri']
    return { ops: [...ops, { op: 'replan', days: target, dayConstraints: Object.fromEntries(target.map(d => [d, { fun: true }])) }] }
  }

  // Day-specific swap: "don't fancy monday", "swap tuesday", "vegetarian wednesday", "something quick thursday"
  if (days.length && (/\b(fancy|swap|change|different|replace|something else|another|instead|not keen|bored)\b/.test(t) || proteins.length || mins)) {
    const c = {}
    if (proteins.length && !/\b(no|not|without|less)\b/.test(t)) c.proteins = proteins
    if (proteins.length && /\b(no|not|without|less)\b/.test(t)) c.avoidProteins = proteins
    if (mins) c.maxMins = mins
    return { ops: [...ops, { op: 'replan', days, dayConstraints: Object.fromEntries(days.map(d => [d, c])) }] }
  }

  // Week-wide adjustments
  if (/\b(cheap|cheaper|budget|save money|less expensive|skint)\b/.test(t)) ops.push({ op: 'cheaper' })
  if (mins && /\b(nothing|no|max|under|less than|longer than|over|quick|quicker|faster)\b/.test(t)) ops.push({ op: 'limit_time', maxMins: mins })
  if (proteins.length && /\b(more|extra|another)\b/.test(t)) proteins.forEach(p => ops.push({ op: 'more_protein', protein: p, count: 2 }))
  if (proteins.length && /\b(less|fewer|no|without|avoid|not so much)\b/.test(t)) proteins.forEach(p => ops.push({ op: 'avoid_protein', protein: p }))

  const hasChange = ops.some(o => o.op !== 'switch_week')
  if (!hasChange && /\b(plan|regenerate|new|shuffle|refresh|start again|redo|suggest|ideas)\b/.test(t)) {
    ops.push({ op: 'replan', days: 'unlocked' })
  } else if (nextWeek && !hasChange) {
    ops.push({ op: 'replan', days: 'unlocked' })
  }

  if (!ops.length || (ops.length === 1 && ops[0].op === 'switch_week' && !nextWeek)) {
    return { ops: [], message: `Not sure what to change. Try “${EXAMPLES[0]}” or “${EXAMPLES[1]}”.` }
  }
  return { ops }
}
