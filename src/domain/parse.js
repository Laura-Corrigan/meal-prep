import { ALIASES, INGREDIENTS, ingredient } from '../data/ingredients'
import { toBase } from './units'

const UNIT = '(kg|g|ml|l|litres?|tbsp|tsp|cloves?|tins?|cans?|cm|handfuls?)'
const LINE = new RegExp(`^(\\d+(?:\\.\\d+)?|½|¼|¾)\\s*${UNIT}?\\.?\\s*(?:of\\s+)?(.+)$`, 'i')
const FRACTIONS = { '½': 0.5, '¼': 0.25, '¾': 0.75 }
const SINGULAR = { cloves: 'clove', tins: 'tin', cans: 'tin', can: 'tin', handfuls: 'handful', litres: 'l', litre: 'l' }

function matchIngredient(name) {
  const n = name.toLowerCase().replace(/\(.*?\)/g, '').trim()
  if (ALIASES[n]) return ALIASES[n]
  const byName = Object.entries(INGREDIENTS).find(([, i]) => i.name.toLowerCase() === n)
  if (byName) return byName[0]
  const words = Object.keys(ALIASES).sort((a, b) => b.length - a.length)
  return ALIASES[words.find(w => new RegExp(`\\b${w}\\b`).test(n))] || null
}

// "400g chicken breast, sliced" -> ['chicken-breast', 400, 'sliced']
// Anything we can't confidently map stays as free text for the shopping list.
export function parseIngredientLine(raw) {
  const line = raw.trim()
  if (!line) return null
  const m = line.match(LINE)
  const [main, ...rest] = (m ? m[3] : line).split(',')
  const note = rest.join(',').trim() || undefined
  const id = matchIngredient(main)
  if (!id) return { text: line }
  if (!m) return [id, null, note]
  const qty = FRACTIONS[m[1]] ?? Number(m[1])
  const unit = m[2] ? (SINGULAR[m[2].toLowerCase()] || m[2].toLowerCase()) : null
  const base = ingredient(id).unit
  const converted = unit ? toBase(qty, unit === 'clove' ? 'clove' : unit, base) : qty
  if (converted == null) return { text: line }
  return note ? [id, converted, note] : [id, converted]
}
