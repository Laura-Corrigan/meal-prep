import React, { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Chips } from './ui'
import { DIETS } from '../domain/prefs'
import { PROTEINS, RECIPES } from '../data/recipes'
import { ALIASES, INGREDIENTS, ingredient } from '../data/ingredients'

const COMMON_DISLIKES = ['salmon-fillets', 'kidney-beans', 'peppers', 'avocados', 'asparagus', 'sweet-potatoes', 'mangetout', 'coconut-milk', 'peanut-butter', 'spinach']

function Section({ title, hint, children }) {
  return (
    <section className="py-5 border-b border-line last:border-0">
      <h3 className="font-sans text-[15px]">{title}</h3>
      {hint && <p className="text-sm text-ink-faint mt-0.5">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Segmented({ options, value, onChange }) {
  return (
    <div className="inline-flex bg-paper border border-line rounded-full p-1">
      {options.map(o => (
        <button key={o.id} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}
          className={`px-4 h-9 rounded-full text-sm font-medium transition ${value === o.id ? 'bg-ink text-white' : 'text-ink-soft'}`}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function PreferencesForm({ prefs, onChange }) {
  const [dislikeText, setDislikeText] = useState('')
  const set = (k, v) => onChange({ ...prefs, [k]: v })
  const toggle = (k, id) => set(k, prefs[k].includes(id) ? prefs[k].filter(x => x !== id) : [...prefs[k], id])

  const addDislike = () => {
    const t = dislikeText.trim().toLowerCase()
    if (!t) return
    const id = ALIASES[t] || Object.keys(INGREDIENTS).find(k => INGREDIENTS[k].name.toLowerCase().includes(t))
    if (id && !prefs.dislikes.includes(id)) set('dislikes', [...prefs.dislikes, id])
    setDislikeText('')
  }
  const dislikeOptions = [...new Set([...COMMON_DISLIKES, ...prefs.dislikes])]
    .map(id => ({ id, label: ingredient(id).name.replace(/^(Raw |Fresh )(.)/, (_, __, c) => c.toUpperCase()) }))

  return (
    <div>
      <Section title="How many of you?" hint="We cook double so there's lunch the next day.">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="inline-flex items-center bg-paper border border-line rounded-full">
            <button type="button" aria-label="Fewer people" onClick={() => set('people', Math.max(1, prefs.people - 1))} className="w-11 h-11 flex items-center justify-center"><Minus size={18} /></button>
            <span className="w-20 text-center font-semibold whitespace-nowrap">{prefs.people} {prefs.people === 1 ? 'person' : 'people'}</span>
            <button type="button" aria-label="More people" onClick={() => set('people', Math.min(6, prefs.people + 1))} className="w-11 h-11 flex items-center justify-center"><Plus size={18} /></button>
          </div>
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
            <input type="checkbox" checked={prefs.leftovers} onChange={e => set('leftovers', e.target.checked)} className="w-5 h-5 accent-tomato" />
            Leftovers for lunch
          </label>
        </div>
      </Section>

      <Section title="Dietary needs or allergies">
        <Chips options={DIETS} value={prefs.diet} onToggle={id => toggle('diet', id)} />
      </Section>

      <Section title="Anything you don't eat?" hint="We'll never suggest recipes with these.">
        <Chips options={dislikeOptions} value={prefs.dislikes} onToggle={id => toggle('dislikes', id)} />
        <form className="mt-3 flex gap-2" onSubmit={e => { e.preventDefault(); addDislike() }}>
          <input value={dislikeText} onChange={e => setDislikeText(e.target.value)} placeholder="Add another, e.g. mushrooms"
            className="flex-1 h-10 px-4 rounded-full bg-paper border border-line text-sm focus:outline-none focus:border-ink-faint" />
          <button className="btn-ghost btn-sm" type="submit">Add</button>
        </form>
      </Section>

      <Section title="Proteins you enjoy" hint="Untick anything you'd rather we skipped.">
        <Chips options={Object.entries(PROTEINS).filter(([id]) => RECIPES.some(r => r.protein === id)).map(([id, p]) => ({ id, label: p.label }))} value={prefs.proteins} onToggle={id => toggle('proteins', id)} />
      </Section>

      <Section title="Longest you'll cook on a weeknight">
        <Segmented options={[{ id: 30, label: '30 mins' }, { id: 45, label: '45 mins' }]} value={prefs.maxMins} onChange={v => set('maxMins', v)} />
      </Section>

      <Section title="Kitchen kit">
        <Chips options={[{ id: 'air-fryer', label: 'Air fryer' }, { id: 'oven', label: 'Oven' }]} value={prefs.equipment} onToggle={id => toggle('equipment', id)} />
      </Section>

      <Section title="Food budget">
        <Segmented options={[{ id: 'thrifty', label: 'Thrifty' }, { id: 'normal', label: 'Normal' }, { id: 'treat', label: 'Treat us' }]} value={prefs.budget} onChange={v => set('budget', v)} />
      </Section>
    </div>
  )
}
