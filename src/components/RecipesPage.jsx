import React, { useState } from 'react'
import { Clock, Heart, Search, Plus } from 'lucide-react'
import { useApp } from '../context'
import { PageHeader } from './Layout'
import { FoodImage } from './ui'
import AddRecipeSheet from './AddRecipeSheet'
import { allRecipes, keyComponents } from '../domain/recipes'
import { PROTEINS } from '../data/recipes'

export default function RecipesPage() {
  const { state, actions, openRecipe } = useApp()
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [adding, setAdding] = useState(false)
  const recipes = allRecipes(state)
  const proteins = Object.entries(PROTEINS).filter(([id]) => recipes.some(r => r.protein === id))
  const shown = recipes
    .filter(r => filter === 'all' || (filter === 'loved' ? state.ratings[r.id] === 'love' : r.protein === filter))
    .filter(r => !q || r.name.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div className="min-h-[100dvh] pb-28">
      <PageHeader title="Recipes" subtitle={`${recipes.length} in your rotation`}
        right={<button className="btn-primary btn-sm" onClick={() => setAdding(true)}><Plus size={16} /> Add</button>} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        <label className="mt-2 flex items-center gap-2 bg-mist rounded-full px-4 h-11">
          <Search size={17} className="text-ink-faint" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search recipes" aria-label="Search recipes"
            className="flex-1 min-w-0 bg-transparent text-[15px] placeholder:text-ink-faint focus:outline-none" />
        </label>
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
          {[['all', 'All'], ['loved', 'Loved'], ...proteins.map(([id, p]) => [id, p.label])].map(([id, label]) => (
            <button key={id} onClick={() => setFilter(id)} className={`${filter === id ? 'chip-on' : 'chip-off'} shrink-0`}>
              {id === 'loved' && <Heart size={14} />}{label}
            </button>
          ))}
        </div>

        <ul className="divide-y divide-line mt-2">
          {shown.map(r => {
            const loved = state.ratings[r.id] === 'love'
            const never = state.ratings[r.id] === 'nope'
            return (
              <li key={r.id} className={`py-3.5 flex items-center gap-4 ${never ? 'opacity-40' : ''}`}>
                <button onClick={() => openRecipe(r.id)} className="flex items-center gap-4 flex-1 min-w-0 text-left">
                  <FoodImage recipe={r} width={200} className="w-[72px] h-[72px] shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[16px] font-bold leading-snug">{r.name}</span>
                    <span className="flex items-center gap-1 text-[13px] text-ink-soft mt-1">
                      <Clock size={13} />{r.mins} mins · {keyComponents(r).slice(0, 2).join(' · ')}
                    </span>
                  </span>
                </button>
                <button className={`icon-btn !w-10 !h-10 ${loved ? '!bg-tomato-soft !text-tomato' : ''}`} aria-pressed={loved}
                  aria-label={loved ? `Unlove ${r.name}` : `Love ${r.name}`} onClick={() => actions.rate(r.id, 'love')}>
                  <Heart size={18} fill={loved ? 'currentColor' : 'none'} />
                </button>
              </li>
            )
          })}
          {!shown.length && <li className="py-16 text-center text-ink-faint">{filter === 'loved' ? 'Heart a recipe and it shows up here.' : 'No matches'}</li>}
        </ul>
      </main>
      <AddRecipeSheet open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}
