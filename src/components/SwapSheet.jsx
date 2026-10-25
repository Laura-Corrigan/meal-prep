import React, { useMemo, useState } from 'react'
import { Shuffle, UtensilsCrossed, Search, Heart } from 'lucide-react'
import { useApp } from '../context'
import { Sheet, FoodImage } from './ui'
import { suggestionsFor } from '../agent'
import { allRecipes, getRecipe, keyComponents } from '../domain/recipes'
import { isAllowed } from '../domain/prefs'
import { DAY_LABEL, DAYS } from '../domain/week'
import { PROTEINS } from '../data/recipes'
import { ingredient } from '../data/ingredients'

function RecipeRow({ recipe, note, onPick, loved }) {
  return (
    <button onClick={onPick} className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-paper text-left transition">
      <FoodImage recipe={recipe} width={160} className="w-16 h-16" rounded="rounded-xl" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold leading-snug flex items-center gap-1.5">
          {recipe.name}{loved && <Heart size={13} className="text-tomato shrink-0" fill="currentColor" />}
        </p>
        <p className="text-sm text-ink-faint">{recipe.mins} mins · {keyComponents(recipe).join(' · ')}</p>
        {note && <p className="text-xs text-sage mt-0.5">{note}</p>}
      </div>
    </button>
  )
}

export default function SwapSheet({ day, onClose }) {
  const { state, week, today, actions } = useApp()
  const [browsing, setBrowsing] = useState(false)
  const [q, setQ] = useState('')
  const [protein, setProtein] = useState('all')

  const suggestions = useMemo(() => (day ? suggestionsFor({ state, week, day, today }) : []), [day, state, week, today])
  const taken = new Set(DAYS.filter(d => d !== day).map(d => week.days[d].recipeId))
  const library = allRecipes(state)
    .filter(r => isAllowed(r, { ...state.prefs, maxMins: 999 }, state.ratings) && !taken.has(r.id))
    .filter(r => protein === 'all' || r.protein === protein)
    .filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  const close = () => { setBrowsing(false); setQ(''); setProtein('all'); onClose() }
  const pick = id => { actions.setMeal(day, id); close() }
  const current = day && week.days[day].recipeId ? getRecipe(week.days[day].recipeId, state) : null

  return (
    <Sheet open={!!day} onClose={close} title={day ? `${current ? 'Swap' : 'Choose'} ${DAY_LABEL[day]}` : ''} full={browsing}>
      {day && !browsing && (
        <div className="px-5 pb-6">
          {current && <p className="text-sm text-ink-faint -mt-1 mb-3">Currently: {current.name}</p>}
          <p className="eyebrow mb-1">Good fits for this week</p>
          <div className="-mx-2">
            {suggestions.map(s => (
              <RecipeRow key={s.recipe.id} recipe={s.recipe} loved={state.ratings[s.recipe.id] === 'love'}
                note={s.reuses.length ? `Uses spare ${ingredient(s.reuses[0]).name.toLowerCase()}` : null}
                onPick={() => pick(s.recipe.id)} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button className="btn-ghost" onClick={() => { actions.regenerateDay(day); close() }}><Shuffle size={16} /> Surprise me</button>
            <button className="btn-ghost" onClick={() => setBrowsing(true)}><Search size={16} /> Browse all</button>
          </div>
          <button className="btn-ghost w-full mt-2" onClick={() => { actions.markOut(day); close() }}>
            <UtensilsCrossed size={16} /> Eating out / no meal needed
          </button>
        </div>
      )}

      {day && browsing && (
        <div className="px-5 pb-6">
          <div className="sticky top-0 bg-cream pt-1 pb-3 z-10">
            <input autoFocus value={q} onChange={e => setQ(e.target.value)} placeholder="Search recipes"
              className="w-full h-11 px-4 rounded-full bg-paper border border-line focus:outline-none focus:border-ink-faint" />
            <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-5 px-5">
              {[['all', 'All'], ...Object.entries(PROTEINS).filter(([id]) => allRecipes(state).some(r => r.protein === id)).map(([id, p]) => [id, p.label])].map(([id, label]) => (
                <button key={id} onClick={() => setProtein(id)} className={`${protein === id ? 'chip-on' : 'chip-off'} shrink-0`}>{label}</button>
              ))}
            </div>
          </div>
          <div className="-mx-2">
            {library.map(r => <RecipeRow key={r.id} recipe={r} loved={state.ratings[r.id] === 'love'} onPick={() => pick(r.id)} />)}
            {!library.length && <p className="text-center text-ink-faint py-10">No matches</p>}
          </div>
        </div>
      )}
    </Sheet>
  )
}
