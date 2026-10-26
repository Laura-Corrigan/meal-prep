// Turns the week's shopping list into instructions for Claude in Chrome, which
// fills the Tesco basket in the user's own logged-in browser. Tesco has no
// basket API, so this is the most automatic route available; the user still
// picks the delivery slot and pays.

import { tesco } from './provider'

const CHECK = /\s*\(check: ([^)]+)\)/i

export function claudeBasketPrompt(items, { remembered = {}, weekLabel = '' } = {}) {
  const lines = items.map((item, i) => {
    const note = item.name.match(CHECK)
    const name = item.name.replace(CHECK, '')
    let line = `${i + 1}. ${name} – ${item.packText || '1'}`
    if (remembered[item.id]) line += ` (use this exact product: ${tesco.productUrl(remembered[item.id])})`
    if (note) line += ` (must be ${note[1]}: check the ingredients, and tell me if nothing qualifies)`
    return line
  })
  return [
    `Please add these items to my Tesco basket on tesco.com (I'm logged in)${weekLabel ? ` for the week of ${weekLabel}` : ''}.`,
    'For each one, search Tesco, pick the closest sensible match in the pack size shown, and add the number of packs shown ("2 × 500g" means two 500g packs).',
    "Don't check out and don't change my delivery slot. When you're done, list anything you couldn't find, substituted or weren't sure about.",
    '',
    ...lines,
  ].join('\n')
}
