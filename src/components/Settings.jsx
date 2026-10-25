import React, { useState } from 'react'
import { ArrowLeft, Copy, Trash2, Plus } from 'lucide-react'
import { useApp } from '../context'
import PreferencesForm from './PreferencesForm'
import { Sheet } from './ui'
import { INGREDIENTS } from '../data/ingredients'
import { PROTEINS } from '../data/recipes'
import { isPantry } from '../domain/shopping'
import { parseIngredientLine } from '../domain/parse'
import { syncEnabled } from '../store/sync'

function Card({ title, hint, children }) {
  return (
    <section className="card p-5 mt-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="text-sm text-ink-faint mt-0.5">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

const PANTRY_CANDIDATES = Object.entries(INGREDIENTS)
  .filter(([, i]) => i.pantry || ['cupboard'].includes(i.cat))
  .sort((a, b) => a[1].name.localeCompare(b[1].name))

function AddRecipe({ open, onClose }) {
  const { actions, setToast } = useApp()
  const [f, setF] = useState({ name: '', mins: 30, protein: 'chicken', ingredients: '', steps: '' })
  const set = (k, v) => setF(x => ({ ...x, [k]: v }))
  const save = () => {
    const ingredients = f.ingredients.split('\n').map(parseIngredientLine).filter(Boolean)
    actions.addRecipe({
      id: `custom-${Date.now()}`, custom: true, name: f.name.trim(), description: '',
      mins: Number(f.mins) || 30, protein: f.protein, cuisine: 'other', carb: null, method: 'hob', cost: 2,
      ingredients, steps: f.steps.split('\n').map(s => s.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean),
    })
    setToast({ title: `${f.name} added to your recipes` })
    setF({ name: '', mins: 30, protein: 'chicken', ingredients: '', steps: '' })
    onClose()
  }
  const input = 'w-full px-4 py-3 rounded-2xl bg-paper border border-line focus:outline-none focus:border-ink-faint'
  return (
    <Sheet open={open} onClose={onClose} title="Add a recipe"
      footer={<button className="btn-primary w-full" disabled={!f.name.trim() || !f.ingredients.trim()} onClick={save}>Save recipe</button>}>
      <div className="px-5 pb-5 space-y-3">
        <input className={input} placeholder="Recipe name" value={f.name} onChange={e => set('name', e.target.value)} />
        <div className="flex gap-2">
          <select className={input} value={f.protein} onChange={e => set('protein', e.target.value)}>
            {Object.entries(PROTEINS).map(([id, p]) => <option key={id} value={id}>{p.label}</option>)}
          </select>
          <input className={input} type="number" inputMode="numeric" min={5} max={120} value={f.mins} onChange={e => set('mins', e.target.value)} aria-label="Minutes" />
        </div>
        <textarea className={input} rows={6} placeholder={'Ingredients for 4, one per line\n500g chicken breast, sliced\n2 peppers\n1 tin chopped tomatoes'} value={f.ingredients} onChange={e => set('ingredients', e.target.value)} />
        <textarea className={input} rows={5} placeholder="Steps, one per line" value={f.steps} onChange={e => set('steps', e.target.value)} />
      </div>
    </Sheet>
  )
}

export default function Settings() {
  const { state, actions, back, sync, reset } = useApp()
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareLink = `${location.origin}${location.pathname}?h=${state.householdId}`

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(shareLink); setCopied(true); setTimeout(() => setCopied(false), 2000) } catch { /* ignore */ }
  }

  return (
    <div className="min-h-[100dvh] pb-16">
      <header className="sticky top-0 z-20 bg-cream/90 backdrop-blur border-b border-line">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button aria-label="Back" onClick={back} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-paper"><ArrowLeft size={20} /></button>
          <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        <Card title="Your preferences" hint="Changes apply to new suggestions.">
          <PreferencesForm prefs={state.prefs} onChange={actions.setPrefs} />
        </Card>

        <Card title="Share with your partner" hint={syncEnabled ? 'Open this link on the other phone once and you’ll both see the same plan.' : 'Sync isn’t configured, so this plan lives on this device only.'}>
          {syncEnabled && (
            <>
              <button className="btn-ghost w-full" onClick={copyLink}><Copy size={16} /> {copied ? 'Link copied' : 'Copy household link'}</button>
              <p className="text-xs text-ink-faint mt-2">
                Status: {{ synced: 'Synced', saving: 'Saving…', offline: 'Offline — will sync later', connecting: 'Connecting…' }[sync] || sync}.
                Keep the link private; anyone with it can edit your plan.
              </p>
            </>
          )}
        </Card>

        <Card title="Cupboard staples" hint="We leave these off the shopping list unless you say you've run out.">
          <div className="flex flex-wrap gap-2">
            {PANTRY_CANDIDATES.map(([id, i]) => {
              const on = isPantry(id, state)
              return (
                <button key={id} aria-pressed={on} onClick={() => actions.setPantry(id, !on)} className={on ? 'chip-on' : 'chip-off'}>{i.name}</button>
              )
            })}
          </div>
        </Card>

        <Card title="Your own recipes">
          {state.customRecipes.length === 0 && <p className="text-sm text-ink-faint">Add family favourites and they'll join the rotation.</p>}
          <ul className="divide-y divide-line">
            {state.customRecipes.map(r => (
              <li key={r.id} className="flex items-center justify-between py-2.5">
                <span>{r.name} <span className="text-ink-faint text-sm">· {r.mins} mins</span></span>
                <button aria-label={`Delete ${r.name}`} onClick={() => confirm(`Delete ${r.name}?`) && actions.removeRecipe(r.id)} className="text-ink-faint hover:text-tomato p-2"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
          <button className="btn-ghost w-full mt-3" onClick={() => setAdding(true)}><Plus size={16} /> Add a recipe</button>
        </Card>

        <button className="text-sm text-ink-faint underline underline-offset-2 mt-8 block mx-auto"
          onClick={() => confirm('Start again? This clears your plans, ratings and preferences on this device.') && reset()}>
          Start again from scratch
        </button>
      </main>
      <AddRecipe open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}
