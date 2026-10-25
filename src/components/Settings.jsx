import React, { useState } from 'react'
import { ArrowLeft, Copy, Trash2, Plus } from 'lucide-react'
import { useApp } from '../context'
import PreferencesForm from './PreferencesForm'
import AddRecipeSheet from './AddRecipeSheet'
import { INGREDIENTS } from '../data/ingredients'
import { isPantry } from '../domain/shopping'
import { syncEnabled } from '../store/sync'

function Card({ title, hint, children }) {
  return (
    <section className="card p-5 mt-4">
      <h2 className="text-lg">{title}</h2>
      {hint && <p className="text-sm text-ink-faint mt-0.5">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  )
}

const PANTRY_CANDIDATES = Object.entries(INGREDIENTS)
  .filter(([, i]) => i.pantry || ['cupboard'].includes(i.cat))
  .sort((a, b) => a[1].name.localeCompare(b[1].name))

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
          <h1 className="text-xl">Settings</h1>
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
      <AddRecipeSheet open={adding} onClose={() => setAdding(false)} />
    </div>
  )
}
