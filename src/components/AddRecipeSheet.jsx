import React, { useState } from 'react'
import { useApp } from '../context'
import { Sheet } from './ui'
import { PROTEINS } from '../data/recipes'
import { parseIngredientLine } from '../domain/parse'
import { DAYS, DAY_SHORT } from '../domain/week'

const CARB_OF = {
  rice: 'rice', arborio: 'rice', pasta: 'pasta', spaghetti: 'pasta', orzo: 'pasta',
  'egg-noodles': 'noodles', 'rice-noodles': 'noodles', udon: 'noodles', 'wok-noodles': 'noodles',
  potatoes: 'potatoes', 'new-potatoes': 'potatoes', 'baking-potatoes': 'potatoes', 'sweet-potatoes': 'potatoes',
  tortillas: 'wraps', 'taco-kit': 'wraps', 'fajita-kit': 'wraps', pittas: 'bread', flatbreads: 'bread',
  baguette: 'bread', 'garlic-dough-balls': 'bread', 'burger-buns': 'bread', croutons: 'bread', couscous: 'couscous',
}

const EMPTY = { name: '', mins: 30, protein: 'chicken', days: [], ingredients: '', steps: '', link: '' }

export default function AddRecipeSheet({ open, onClose }) {
  const { actions, setToast } = useApp()
  const [f, setF] = useState(EMPTY)
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  const toggleDay = d => set('days', f.days.includes(d) ? f.days.filter(x => x !== d) : [...f.days, d])

  const lines = f.ingredients.split('\n').map(parseIngredientLine).filter(Boolean)
  const matched = lines.filter(Array.isArray).length

  const save = () => {
    const carb = lines.filter(Array.isArray).map(l => CARB_OF[l[0]]).find(Boolean) || null
    actions.addRecipe({
      id: `custom-${Date.now()}`, custom: true, name: f.name.trim(), description: '',
      mins: Number(f.mins) || 30, protein: f.protein, cuisine: 'other', carb, method: 'hob', cost: 2,
      onlyDays: f.days.length && f.days.length < DAYS.length ? DAYS.filter(d => f.days.includes(d)) : undefined,
      link: /^https?:\/\//.test(f.link.trim()) ? { url: f.link.trim(), similar: false } : undefined,
      ingredients: lines,
      steps: f.steps.split('\n').map(s => s.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean),
    })
    setToast({ title: `${f.name.trim()} added`, lines: ['It’ll start appearing in your weekly plans.'] })
    setF(EMPTY)
    onClose()
  }

  const field = 'w-full px-4 py-3 rounded-2xl bg-mist text-[15px] placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-ink/10'
  const label = 'block text-[13px] font-bold mb-1.5'

  return (
    <Sheet open={open} onClose={onClose} title="Add a recipe"
      footer={<button className="btn-primary w-full" disabled={!f.name.trim() || !lines.length} onClick={save}>Save recipe</button>}>
      <div className="px-5 pb-6 space-y-4">
        <div>
          <label className={label} htmlFor="r-name">Name</label>
          <input id="r-name" className={field} placeholder="e.g. Steak salad" value={f.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={label} htmlFor="r-protein">Main protein</label>
            <select id="r-protein" className={field} value={f.protein} onChange={e => set('protein', e.target.value)}>
              {Object.entries(PROTEINS).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label className={label} htmlFor="r-mins">Minutes</label>
            <input id="r-mins" className={field} type="number" inputMode="numeric" min={5} max={120} value={f.mins} onChange={e => set('mins', e.target.value)} />
          </div>
        </div>
        <div>
          <p className={label}>Which nights?</p>
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => set('days', [])} className={f.days.length ? 'chip-off' : 'chip-on'}>Any</button>
            {DAYS.map(d => (
              <button key={d} type="button" aria-pressed={f.days.includes(d)} onClick={() => toggleDay(d)}
                className={f.days.includes(d) ? 'chip-on' : 'chip-off'}>{DAY_SHORT[d]}</button>
            ))}
          </div>
        </div>
        <div>
          <label className={label} htmlFor="r-ing">Ingredients <span className="font-medium text-ink-faint">· for 4 servings, one per line</span></label>
          <textarea id="r-ing" className={field} rows={7} value={f.ingredients} onChange={e => set('ingredients', e.target.value)}
            placeholder={'4 sirloin steaks\n1 cucumber\n250g cooked beetroot\n1 tbsp honey'} />
          {lines.length > 0 && (
            <p className="text-[12px] text-ink-faint mt-1.5">
              {matched} of {lines.length} matched to shopping-list items{matched < lines.length ? '. The rest go on the list as written.' : '.'}
            </p>
          )}
        </div>
        <div>
          <label className={label} htmlFor="r-steps">Steps <span className="font-medium text-ink-faint">· one per line</span></label>
          <textarea id="r-steps" className={field} rows={5} value={f.steps} onChange={e => set('steps', e.target.value)} />
        </div>
        <div>
          <label className={label} htmlFor="r-link">Recipe link <span className="font-medium text-ink-faint">· optional, e.g. BBC Good Food</span></label>
          <input id="r-link" className={field} type="url" inputMode="url" placeholder="https://" value={f.link} onChange={e => set('link', e.target.value)} />
        </div>
      </div>
    </Sheet>
  )
}
