import { RECIPES, PROTEINS, CARBS, METHODS } from '../data/recipes'
import { ingredient } from '../data/ingredients'

export const RECIPE_SERVINGS = 4

export function allRecipes(state) {
  return [...RECIPES, ...(state?.customRecipes || [])]
}

export function getRecipe(id, state) {
  return allRecipes(state).find(r => r.id === id) || null
}

// Ingredient lines as objects. Custom recipes may contain free-text lines
// (`{ text }`) that couldn't be matched to the catalogue.
export function lines(recipe) {
  return recipe.ingredients.map(l => Array.isArray(l) ? { id: l[0], qty: l[1], note: l[2] } : l)
}

const SUPPORTING_VEG = new Set(['onions', 'red-onion', 'garlic', 'ginger', 'limes', 'lemons', 'spring-onions', 'coriander'])
const CARB_VEG = new Set(['potatoes', 'new-potatoes', 'baking-potatoes'])

export function vegLines(recipe) {
  return lines(recipe).filter(l => l.id && ingredient(l.id).cat === 'veg' && !SUPPORTING_VEG.has(l.id) && !CARB_VEG.has(l.id))
}

export function recipeFlags(recipe) {
  const flags = new Set()
  lines(recipe).forEach(l => l.id && (ingredient(l.id).flags || []).forEach(f => flags.add(f)))
  return flags
}

// Lightweight nutrition indicators: no tracking, just a feel for the meal.
export function indicators(recipe) {
  const veg = vegLines(recipe).length
  const out = []
  if (recipe.proteinG >= 35) out.push('High protein')
  if (veg >= 3) out.push('Lots of veg')
  else if (recipe.proteinG >= 20 && recipe.carb && veg >= 1) out.push('Balanced')
  return out
}

// "Chicken • Rice • Broccoli"
export function keyComponents(recipe) {
  const parts = [PROTEINS[recipe.protein]?.label, CARBS[recipe.carb]]
  const v = vegLines(recipe)[0]
  if (v) parts.push(ingredient(v.id).name.replace(/^(Fine |Baby |Mixed )(.)/, (_, __, c) => c.toUpperCase()))
  return parts.filter(Boolean)
}

export function tags(recipe) {
  const t = []
  if (METHODS[recipe.method]) t.push(METHODS[recipe.method])
  if (recipe.mins <= 20) t.push(`${recipe.mins} mins`)
  return [...t, ...indicators(recipe)]
}

export const proteinFamily = p => PROTEINS[p]?.family || p
