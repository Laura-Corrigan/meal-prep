import { describe, it, expect } from 'vitest'
import { choosePacks, describePicks } from './tesco/packs'
import { buildShoppingList } from './domain/shopping'
import { emptyWeek, planningWeekStart, DAYS } from './domain/week'
import { DEFAULT_PREFS, isAllowed } from './domain/prefs'
import { RECIPES } from './data/recipes'
import { INGREDIENTS } from './data/ingredients'
import { planDays } from './agent/planner'
import { interpretRules } from './agent/rules'
import { validateOps, applyOps } from './agent/ops'
import { getRecipe, lines } from './domain/recipes'
import { tesco } from './tesco/provider'

const baseState = (over = {}) => ({ prefs: { ...DEFAULT_PREFS }, ratings: {}, pantry: {}, weeks: {}, customRecipes: [], ...over })
const seeded = (seed = 1) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
const MON = new Date(2026, 9, 12) // Monday 12 Oct 2026

describe('recipe data', () => {
  it('only references known ingredients and fits 15–45 mins', () => {
    for (const r of RECIPES) {
      for (const l of r.ingredients) expect(INGREDIENTS[l[0]], `${r.id}: ${l[0]}`).toBeTruthy()
      expect(r.mins).toBeGreaterThanOrEqual(15)
      expect(r.mins).toBeLessThanOrEqual(45)
      expect(r.steps.length).toBeLessThanOrEqual(6)
    }
    expect(new Set(RECIPES.map(r => r.id)).size).toBe(RECIPES.length)
  })
})

describe('packs', () => {
  it('maps 400g chicken breast to a real pack, not a search string', () => {
    expect(describePicks(choosePacks(400, INGREDIENTS['chicken-breast'].packs))).toBe('650g')
  })
  it('buys a 3-pack of peppers rather than three loose', () => {
    expect(describePicks(choosePacks(3, INGREDIENTS.peppers.packs))).toBe('mixed 3 pack')
  })
  it('combines packs for bigger needs', () => {
    expect(choosePacks(1300, INGREDIENTS['chicken-breast'].packs).spare).toBeLessThan(100)
  })
})

describe('shopping list', () => {
  it('merges the same ingredient across days and excludes pantry staples', () => {
    const week = emptyWeek('2026-10-12')
    week.days.mon.recipeId = 'chicken-fajitas'      // 3 peppers
    week.days.thu.recipeId = 'beef-chilli'          // 1 pepper
    const list = buildShoppingList(week, baseState())
    const peppers = list.toBuy.find(i => i.id === 'peppers')
    expect(peppers.qty).toBe(4)
    expect(peppers.daysText).toBe('Mon, Thu')
    expect(list.toBuy.some(i => i.id === 'olive-oil')).toBe(false)
    expect(list.pantry.some(i => i.id === 'cumin')).toBe(true)
    expect(list.groups[0].label).toBe('Fruit & veg')
  })
  it('moves "already have" items out of the buy list', () => {
    const week = emptyWeek('2026-10-12')
    week.days.mon.recipeId = 'chicken-fajitas'
    week.have = { avocados: true }
    const list = buildShoppingList(week, baseState())
    expect(list.toBuy.some(i => i.id === 'avocados')).toBe(false)
    expect(list.have.map(i => i.id)).toContain('avocados')
  })
  it('skips eating-out days', () => {
    const week = emptyWeek('2026-10-12')
    week.days.mon = { recipeId: 'chicken-fajitas', out: true, locked: false }
    expect(buildShoppingList(week, baseState()).toBuy).toHaveLength(0)
  })
})

describe('planner', () => {
  it('plans five different meals with protein variety', () => {
    const state = baseState()
    const picks = planDays({ state, week: emptyWeek('2026-10-12'), days: DAYS, today: MON, rng: seeded(3) })
    const recipes = DAYS.map(d => getRecipe(picks[d], state))
    expect(new Set(recipes.map(r => r.id)).size).toBe(5)
    expect(new Set(recipes.map(r => r.protein)).size).toBeGreaterThanOrEqual(3)
  })
  it('never suggests a rejected recipe or disliked ingredient', () => {
    const state = baseState({ ratings: { 'chicken-fajitas': 'nope' }, prefs: { ...DEFAULT_PREFS, dislikes: ['salmon-fillets'] } })
    for (let s = 1; s < 30; s++) {
      const picks = planDays({ state, week: emptyWeek('2026-10-12'), days: DAYS, today: MON, rng: seeded(s) })
      for (const id of Object.values(picks)) {
        expect(id).not.toBe('chicken-fajitas')
        expect(lines(getRecipe(id, state)).some(l => l.id === 'salmon-fillets')).toBe(false)
      }
    }
  })
  it('respects dietary rules', () => {
    const state = baseState({ prefs: { ...DEFAULT_PREFS, diet: ['vegetarian'] } })
    expect(RECIPES.filter(r => isAllowed(r, state.prefs)).every(r => r.protein === 'veggie')).toBe(true)
  })
  it('favours loved recipes over time', () => {
    const loved = baseState({ ratings: { 'miso-cod': 'love' } })
    const count = st => Array.from({ length: 40 }, (_, s) =>
      Object.values(planDays({ state: st, week: emptyWeek('2026-10-12'), days: DAYS, today: MON, rng: seeded(s + 1) }))).flat()
      .filter(id => id === 'miso-cod').length
    expect(count(loved)).toBeGreaterThan(count(baseState()))
  })
  it('keeps locked meals', () => {
    const week = emptyWeek('2026-10-12')
    week.days.mon = { recipeId: 'tuna-jackets', locked: true, out: false }
    const res = applyOps({ state: baseState(), week, ops: [{ op: 'replan', days: 'unlocked' }], today: MON, rng: seeded(2) })
    expect(res.week.days.mon.recipeId).toBe('tuna-jackets')
    expect(DAYS.slice(1).every(d => res.week.days[d].recipeId)).toBe(true)
  })
})

describe('agent commands', () => {
  const run = (text, week) => {
    const state = baseState()
    const parsed = validateOps(interpretRules(text, { state, today: MON }), state)
    return { parsed, ...(parsed.ops.length ? applyOps({ state, week, ops: parsed.ops.filter(o => o.op !== 'switch_week'), today: MON, rng: seeded(5) }) : {}) }
  }
  const fullWeek = () => {
    const w = emptyWeek('2026-10-12')
    const ids = ['chicken-fajitas', 'teriyaki-chicken-bowls', 'beef-chilli', 'chicken-pesto-pasta', 'chicken-burrito-bowls']
    DAYS.forEach((d, i) => { w.days[d].recipeId = ids[i] })
    return w
  }

  it("we're out Thursday", () => {
    const r = run("We're out Thursday", fullWeek())
    expect(r.week.days.thu.out).toBe(true)
  })
  it('give us more fish', () => {
    const r = run('Give us more fish next week', fullWeek())
    expect(r.parsed.ops[0]).toEqual({ op: 'switch_week', which: 'next' })
    const fish = DAYS.filter(d => ['salmon', 'cod', 'prawns', 'tuna'].includes(getRecipe(r.week.days[d].recipeId).protein))
    expect(fish.length).toBeGreaterThanOrEqual(2)
  })
  it('nothing over 30 minutes', () => {
    const r = run('Nothing over 30 minutes', fullWeek())
    DAYS.forEach(d => expect(getRecipe(r.week.days[d].recipeId).mins).toBeLessThanOrEqual(30))
  })
  it('use up the broccoli', () => {
    const r = run('Use up the broccoli', fullWeek())
    expect(DAYS.some(d => lines(getRecipe(r.week.days[d].recipeId)).some(l => ['broccoli'].includes(l.id)))).toBe(true)
  })
  it("we've got chicken and peppers that need using", () => {
    expect(interpretRules("We've got chicken and peppers that need using", { today: MON }).ops[0].ingredients)
      .toEqual(expect.arrayContaining(['chicken-breast', 'peppers']))
  })
  it("I don't fancy Monday's meal", () => {
    const r = run("I don't fancy Monday's meal", fullWeek())
    expect(r.week.days.mon.recipeId).not.toBe('chicken-fajitas')
  })
  it('make Friday something fun', () => {
    const r = run('Make Friday something fun', fullWeek())
    expect(getRecipe(r.week.days.fri.recipeId).fun).toBe(true)
  })
  it('make it cheaper', () => {
    const w = fullWeek(); w.days.tue.recipeId = 'honey-garlic-salmon'
    const r = run('Make next week cheaper', w)
    expect(getRecipe(r.week.days.tue.recipeId).cost).toBeLessThan(3)
  })
  it('rejects invalid structured output', () => {
    const v = validateOps({ ops: [{ op: 'mark_out', day: 'sun' }, { op: 'set_meal', day: 'mon', recipeId: 'nope' }, { op: 'drop_tables' }] }, baseState())
    expect(v.ops).toHaveLength(0)
    expect(v.errors).toHaveLength(3)
  })
})

describe('weeks & tesco', () => {
  it('plans next week at the weekend', () => {
    expect(planningWeekStart(new Date(2026, 9, 10))).toBe('2026-10-12') // Saturday
    expect(planningWeekStart(new Date(2026, 9, 14))).toBe('2026-10-12') // Wednesday
  })
  it('builds Tesco links and parses pasted product links', () => {
    expect(tesco.searchUrl('chicken breast')).toBe('https://www.tesco.com/groceries/en-GB/search?query=chicken%20breast')
    expect(tesco.parseProductLink('https://www.tesco.com/groceries/en-GB/products/254656543?foo')).toBe('254656543')
    expect(tesco.linkFor({ id: 'peppers', search: 'mixed peppers' }, { peppers: '123' })).toMatch(/products\/123$/)
  })
})

import { parseIngredientLine } from './domain/parse'
describe('custom recipe parser', () => {
  it('maps common lines onto the catalogue', () => {
    expect(parseIngredientLine('400g chicken breast, sliced')).toEqual(['chicken-breast', 400, 'sliced'])
    expect(parseIngredientLine('1kg beef mince')).toEqual(['beef-mince', 1000])
    expect(parseIngredientLine('2 peppers')).toEqual(['peppers', 2])
    expect(parseIngredientLine('3 cloves garlic')).toEqual(['garlic', 3])
    expect(parseIngredientLine('1 tin chickpeas')).toEqual(['chickpeas', 1])
  })
  it('keeps unknown lines as text', () => {
    expect(parseIngredientLine('200g halloumi')).toEqual({ text: '200g halloumi' })
  })
})

describe('friday', () => {
  it('is usually something fun', () => {
    const state = baseState()
    let fun = 0
    for (let s = 1; s <= 50; s++) {
      const picks = planDays({ state, week: emptyWeek('2026-10-12'), days: DAYS, today: MON, rng: seeded(s) })
      if (getRecipe(picks.fri, state).fun) fun++
    }
    expect(fun).toBeGreaterThanOrEqual(35)
  })
})

describe('pack wording', () => {
  it('prefers multipacks for small counts and reads naturally', () => {
    expect(describePicks(choosePacks(3, INGREDIENTS.tuna.packs))).toBe('4 × 145g')
    expect(describePicks(choosePacks(2, INGREDIENTS.limes.packs))).toBe('2 loose')
    expect(describePicks(choosePacks(4, INGREDIENTS.peppers.packs))).toBe('mixed 3 pack + loose')
  })
})

describe('variety', () => {
  it('only ever doubles up on chicken, and never three times', () => {
    const state = baseState()
    let otherRepeats = 0
    for (let s = 1; s <= 50; s++) {
      const picks = planDays({ state, week: emptyWeek('2026-10-12'), days: DAYS, today: MON, rng: seeded(s) })
      const proteins = DAYS.map(d => getRecipe(picks[d], state).protein)
      const counts = proteins.reduce((m, p) => ({ ...m, [p]: (m[p] || 0) + 1 }), {})
      expect(Math.max(...Object.values(counts))).toBeLessThanOrEqual(2)
      otherRepeats += Object.entries(counts).filter(([p, n]) => p !== 'chicken' && n > 1).length
    }
    expect(otherRepeats).toBeLessThanOrEqual(2)
  })
})
