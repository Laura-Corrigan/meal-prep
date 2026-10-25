// Quantity formatting and conversion between the units recipes use.

const CONVERT = {
  kg: ['g', 1000], g: ['g', 1],
  l: ['ml', 1000], litre: ['ml', 1000], litres: ['ml', 1000], ml: ['ml', 1],
  tbsp: ['tbsp', 1], tsp: ['tsp', 1],
}

// Convert qty in `from` to the ingredient's base unit where that makes sense.
export function toBase(qty, from, base) {
  if (!from || from === base) return qty
  const [fu, fm] = CONVERT[from] || [from, 1]
  const [bu, bm] = CONVERT[base] || [base, 1]
  if (fu === bu) return (qty * fm) / bm
  if (fu === 'tsp' && bu === 'tbsp') return (qty * fm) / 3 / bm
  if (fu === 'tbsp' && bu === 'tsp') return (qty * fm * 3) / bm
  return null // incompatible
}

const nice = n => {
  if (n >= 10) return String(Math.round(n))
  const r = Math.round(n * 4) / 4
  const whole = Math.floor(r)
  const frac = { 0.25: '¼', 0.5: '½', 0.75: '¾' }[r - whole] || ''
  return whole === 0 && frac ? frac : `${whole}${frac}`
}

// Human quantity, e.g. 1300 g -> "1.3kg", 3 clove -> "3 cloves"
export function formatQty(qty, unit) {
  if (qty == null) return ''
  switch (unit) {
    case 'g': return qty >= 1000 ? `${+(qty / 1000).toFixed(2)}kg` : `${Math.round(qty)}g`
    case 'ml': return qty >= 1000 ? `${+(qty / 1000).toFixed(2)}L` : `${Math.round(qty)}ml`
    case 'clove': return `${nice(qty)} clove${qty > 1 ? 's' : ''}`
    case 'cm': return `${nice(qty)}cm`
    case 'tin': return `${nice(qty)} tin${qty > 1 ? 's' : ''}`
    case 'pouch': return `${nice(qty)} pouch${qty > 1 ? 'es' : ''}`
    case 'handful': return `${nice(qty)} handful${qty > 1 ? 's' : ''}`
    case 'tbsp': case 'tsp': return `${nice(qty)} ${unit}`
    default: return nice(qty)
  }
}
