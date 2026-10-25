// Agent entry point. Interpreters are swappable: each returns the structured
// `{ ops, message }` contract from ./ops.js, which is always validated before
// it can change the plan. Today only the built-in rules interpreter is wired
// up; an LLM-backed interpreter (via a server-side endpoint so no API key
// reaches the browser) can be added to INTERPRETERS and will fall back to the
// rules if it errors or returns something invalid.

import { interpretRules } from './rules'
import { validateOps } from './ops'

const INTERPRETERS = [
  { id: 'rules', interpret: async (text, ctx) => interpretRules(text, ctx) },
]

export async function interpret(text, ctx) {
  for (const { interpret: run } of INTERPRETERS) {
    try {
      const raw = await run(text, ctx)
      const result = validateOps(raw, ctx.state)
      if (result.ops.length || result.message) return result
    } catch (e) {
      console.warn('Agent interpreter failed, falling back', e)
    }
  }
  return { ok: false, ops: [], message: "Sorry, I couldn't work that out." }
}

export { applyOps } from './ops'
export { planDays, suggestionsFor, sharedIngredients } from './planner'
export { EXAMPLES } from './rules'
