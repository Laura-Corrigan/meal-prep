// Choose the cheapest-feeling combination of supermarket packs that covers a
// required quantity: least waste first, then fewest packs.
//
// packs: [[size, label], ...] in the ingredient's base unit.
// Returns { picks: [{ size, label, count }], total, spare } or null.
export function choosePacks(need, packs) {
  if (!packs?.length || !(need > 0)) return null
  const sizes = [...packs].sort((a, b) => b[0] - a[0])
  const smallest = sizes[sizes.length - 1][0]
  let best = null

  const consider = counts => {
    const total = counts.reduce((s, c, i) => s + c * sizes[i][0], 0)
    if (total < need - 1e-9) return
    const n = counts.reduce((s, c) => s + c, 0)
    // Each extra pack costs something too (more to carry, worse value than a
    // multipack), so prefer fewer packs unless that means real waste.
    const score = (total - need) + n * Math.max(need * 0.15, smallest * 0.6)
    if (!best || score < best.score - 1e-9) best = { score, counts: [...counts], total }
  }

  const walk = (i, counts) => {
    if (i === sizes.length) return consider(counts)
    const max = Math.min(30, Math.ceil(need / sizes[i][0]) + 1)
    for (let c = 0; c <= max; c++) { counts[i] = c; walk(i + 1, counts) }
  }
  walk(0, new Array(sizes.length).fill(0))
  if (!best) return null

  return {
    picks: best.counts.map((count, i) => ({ size: sizes[i][0], label: sizes[i][1], count })).filter(p => p.count > 0),
    total: best.total,
    spare: best.total - need,
  }
}

export function describePicks(choice) {
  if (!choice) return ''
  return choice.picks.map(p => {
    if (p.count === 1) return p.label
    if (p.label === 'loose') return `${p.count} loose`
    if (p.label === 'single') return `${p.count} singles`
    return `${p.count} × ${p.label}`
  }).join(' + ')
}
