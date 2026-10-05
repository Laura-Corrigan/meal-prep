import { PROTEINS } from '../data/recipes'
import { recipeFlags, lines } from './recipes'

export const DEFAULT_PREFS = {
  people: 2,
  leftovers: true,          // cook double so there's lunch tomorrow
  diet: [],                 // vegetarian | pescatarian | dairy-free | gluten-free | nut-free
  dislikes: [],             // ingredient ids
  proteins: Object.keys(PROTEINS),
  maxMins: 45,
  equipment: ['air-fryer', 'oven'],
  budget: 'normal',         // thrifty | normal | treat
}

export const DIETS = [
  { id: 'vegetarian', label: 'Vegetarian', excludes: ['meat', 'fish'] },
  { id: 'pescatarian', label: 'Pescatarian', excludes: ['meat'] },
  { id: 'dairy-free', label: 'Dairy-free', excludes: ['dairy'] },
  { id: 'gluten-free', label: 'Gluten-free', excludes: ['gluten'] },
  { id: 'nut-free', label: 'Nut allergy', excludes: ['nuts'] },
]

export const servings = prefs => (prefs.people || 2) * (prefs.leftovers ? 2 : 1)

// Hard rules: things we must never suggest.
export function isAllowed(recipe, prefs, ratings = {}) {
  if (ratings[recipe.id] === 'nope') return false
  if (recipe.mins > (prefs.maxMins || 45)) return false
  if (prefs.proteins?.length && !prefs.proteins.includes(recipe.protein)) return false
  const flags = recipeFlags(recipe)
  for (const d of prefs.diet || []) {
    const rule = DIETS.find(x => x.id === d)
    if (rule?.excludes.some(f => flags.has(f))) return false
  }
  const ids = new Set(lines(recipe).map(l => l.id))
  if ((prefs.dislikes || []).some(id => ids.has(id))) return false
  if (recipe.method === 'air-fryer' && !prefs.equipment?.includes('air-fryer') && !prefs.equipment?.includes('oven')) return false
  if (recipe.method === 'tray-bake' && !prefs.equipment?.includes('oven')) return false
  return true
}
