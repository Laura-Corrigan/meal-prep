import { CATEGORIES, ingredient } from '../data/ingredients'
import { getRecipe, lines, RECIPE_SERVINGS } from './recipes'
import { servings } from './prefs'
import { DAYS, DAY_SHORT, weekRangeLabel } from './week'
import { formatQty } from './units'
import { choosePacks, describePicks } from '../tesco/packs'

export const isPantry = (id, state) => state.pantry?.[id] ?? !!ingredient(id).pantry

// Total ingredient needs for the week, merged across meals.
export function weekNeeds(week, state) {
  const factor = servings(state.prefs) / RECIPE_SERVINGS
  const needs = new Map()
  for (const day of DAYS) {
    const slot = week.days[day]
    if (!slot || slot.out || !slot.recipeId) continue
    const recipe = getRecipe(slot.recipeId, state)
    if (!recipe) continue
    for (const l of lines(recipe)) {
      const key = l.id || `text:${l.text.toLowerCase()}`
      const cur = needs.get(key) || { key, id: l.id, text: l.text, qty: 0, days: [] }
      if (l.qty != null) cur.qty += l.qty * factor
      if (!cur.days.includes(day)) cur.days.push(day)
      needs.set(key, cur)
    }
  }
  return [...needs.values()]
}

export function buildShoppingList(week, state) {
  const toBuy = [], have = [], pantry = []
  for (const n of weekNeeds(week, state)) {
    const ing = n.id ? ingredient(n.id) : { name: n.text, cat: 'other', unit: null }
    const item = {
      id: n.key,
      name: ing.name,
      cat: ing.cat,
      qty: n.qty,
      qtyText: n.qty ? formatQty(n.qty, ing.unit) : '',
      days: n.days,
      daysText: n.days.map(d => DAY_SHORT[d]).join(', '),
      search: ing.search || ing.name,
    }
    const choice = n.qty ? choosePacks(n.qty, ing.packs) : null
    item.packText = describePicks(choice)
    item.packCount = choice ? choice.picks.reduce((s, p) => s + p.count, 0) : 1

    if (n.id && isPantry(n.id, state) && !week.need?.[n.key]) pantry.push(item)
    else if (week.have?.[n.key]) have.push(item)
    else toBuy.push(item)
  }

  const groups = CATEGORIES
    .map(c => ({ ...c, items: toBuy.filter(i => i.cat === c.id).sort((a, b) => a.name.localeCompare(b.name)) }))
    .filter(g => g.items.length)

  return { groups, toBuy, have, pantry }
}

export function shoppingListText(week, state) {
  const { groups } = buildShoppingList(week, state)
  const out = [`Shopping · ${weekRangeLabel(week.start)}`, '']
  for (const g of groups) {
    out.push(g.label.toUpperCase())
    g.items.forEach(i => out.push(`☐ ${i.name}${i.packText ? ` — ${i.packText}` : ''}`))
    out.push('')
  }
  return out.join('\n').trim()
}
