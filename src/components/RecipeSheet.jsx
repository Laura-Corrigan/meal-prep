import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Clock, Users, Check, Sun, ExternalLink } from 'lucide-react'
import { useApp } from '../context'
import { FoodImage } from './ui'
import { RatingButtons } from './DayCard'
import { getRecipe, lines, tags, keyComponents, RECIPE_SERVINGS } from '../domain/recipes'
import { servings } from '../domain/prefs'
import { ingredient } from '../data/ingredients'
import { formatQty } from '../domain/units'
import { DAYS, DAY_LABEL, DAY_SHORT } from '../domain/week'

// "1 red onion", "2 red onions"
function displayName(ing, qty) {
  const name = ing.name.toLowerCase()
  if (!ing.plural || qty == null || qty > 1) return name
  return name.replace(/oes$/, 'o').replace(/s$/, '')
}

// Put this recipe on a day of the week you're looking at.
function AddToWeek({ recipe }) {
  const { week, actions, setToast } = useApp()
  const onDays = DAYS.filter(d => week.days[d].recipeId === recipe.id)
  return (
    <section className="mt-8">
      <h2 className="text-[15px]">{onDays.length ? `On the plan for ${onDays.map(d => DAY_LABEL[d]).join(', ')}` : 'Add to the week'}</h2>
      <div className="grid grid-cols-5 gap-2 mt-3">
        {DAYS.map(d => {
          const on = onDays.includes(d)
          return (
            <button key={d} aria-pressed={on} disabled={on}
              onClick={() => { actions.setMeal(d, recipe.id); setToast({ title: `${recipe.name} on ${DAY_LABEL[d]}` }) }}
              className={`h-11 rounded-full text-sm font-bold transition ${on ? 'bg-ink text-white' : 'bg-mist text-ink-soft hover:bg-line'}`}>
              {DAY_SHORT[d]}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function sourceName(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host === 'bbcgoodfood.com' ? 'BBC Good Food' : host
  } catch { return 'the original' }
}

function useWakeLock(on) {
  const lock = useRef(null)
  useEffect(() => {
    if (!on || !('wakeLock' in navigator)) return
    let cancelled = false
    const acquire = () => navigator.wakeLock.request('screen').then(l => { if (cancelled) l.release(); else lock.current = l }).catch(() => {})
    acquire()
    const onVis = () => document.visibilityState === 'visible' && acquire()
    document.addEventListener('visibilitychange', onVis)
    return () => { cancelled = true; document.removeEventListener('visibilitychange', onVis); lock.current?.release().catch(() => {}); lock.current = null }
  }, [on])
}

export default function RecipeSheet({ recipeId, onClose }) {
  const { state } = useApp()
  const recipe = recipeId ? getRecipe(recipeId, state) : null
  const [got, setGot] = useState({})
  const [doneSteps, setDoneSteps] = useState({})
  const [awake, setAwake] = useState(false)
  useWakeLock(!!recipe && awake)

  useEffect(() => { setGot({}); setDoneSteps({}) }, [recipeId])
  useEffect(() => {
    if (!recipe) return
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [recipe, onClose])

  if (!recipe) return null
  const serves = servings(state.prefs)
  const factor = serves / RECIPE_SERVINGS
  const hasWakeLock = typeof navigator !== 'undefined' && 'wakeLock' in navigator

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto overscroll-contain anim-fade" role="dialog" aria-modal="true" aria-label={recipe.name}>
      <div className="max-w-2xl mx-auto pb-16">
        <div className="relative">
          <FoodImage recipe={recipe} width={900} eager rounded="rounded-none sm:rounded-b-3xl" className="w-full aspect-[4/3] sm:aspect-[16/9]" />
          <button onClick={onClose} aria-label="Back"
            className="absolute top-4 left-4 w-11 h-11 rounded-full bg-white shadow-lift flex items-center justify-center" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="px-5 sm:px-6">
          <h1 className="text-[28px] leading-tight mt-5">{recipe.name}</h1>
          <p className="text-[15px] text-ink-soft mt-2 leading-relaxed">{recipe.description}</p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-[15px]">
            <span className="inline-flex items-center gap-1.5 font-semibold"><Clock size={17} />{recipe.mins} mins{recipe.activeMins ? ` (${recipe.activeMins} hands-on)` : ''}</span>
            <span className="inline-flex items-center gap-1.5 font-semibold"><Users size={17} />
              Serves {serves}{state.prefs.leftovers ? ' (incl. lunch)' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags(recipe).map(t => <span key={t} className="badge bg-sage-soft text-sage">{t}</span>)}
          </div>
          <p className="text-sm text-ink-faint mt-3">
            {keyComponents(recipe).join(' · ')}
            {recipe.kcal && <> · approx. {recipe.kcal} kcal, {recipe.proteinG}g protein per serving</>}
          </p>

          {recipe.link?.url && (
            <a href={recipe.link.url} target="_blank" rel="noopener noreferrer"
              className="mt-5 flex items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3.5 hover:bg-line transition">
              <span>
                <span className="block font-bold">{recipe.link.similar ? 'Similar recipe' : 'Full recipe'} on {sourceName(recipe.link.url)}</span>
                <span className="block text-xs text-ink-faint">
                  {recipe.link.similar ? 'A related dish, if you want more detail or ideas' : 'More detail, tips and reviews'}
                </span>
              </span>
              <ExternalLink size={18} className="shrink-0" />
            </a>
          )}

          <section className="mt-7">
            <h2 className="text-xl">Ingredients</h2>
            <ul className="mt-2 divide-y divide-line">
              {lines(recipe).map((l, i) => {
                const ing = l.id ? ingredient(l.id) : null
                const qty = l.qty != null ? formatQty(l.qty * factor, ing?.unit) : ''
                const on = got[i]
                return (
                  <li key={i}>
                    <button onClick={() => setGot(g => ({ ...g, [i]: !g[i] }))} className="w-full flex items-center gap-3.5 py-3.5 text-left text-[15px]">
                      <span className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center ${on ? 'bg-ink border-ink text-white' : 'border-line'}`}>
                        {on && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className={`flex-1 ${on ? 'line-through text-ink-faint' : ''}`}>
                        {ing ? <>{qty && <strong className="font-semibold">{qty} </strong>}{displayName(ing, l.qty * factor)}</> : l.text}
                        {l.note && <span className="text-ink-faint">, {l.note}</span>}
                      </span>
                      {ing?.pantry && <span className="text-xs text-ink-faint">cupboard</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          <section className="mt-7">
            <div className="flex items-center justify-between">
              <h2 className="text-xl">Method</h2>
              {hasWakeLock && (
                <button onClick={() => setAwake(a => !a)} aria-pressed={awake}
                  className={awake ? 'chip-on' : 'chip-off'}><Sun size={14} /> {awake ? 'Screen stays on' : 'Keep screen on'}</button>
              )}
            </div>
            <ol className="mt-2 divide-y divide-line">
              {recipe.steps.map((s, i) => (
                <li key={i}>
                  <button onClick={() => setDoneSteps(d => ({ ...d, [i]: !d[i] }))}
                    className={`w-full text-left py-4 flex gap-4 transition ${doneSteps[i] ? 'opacity-40' : ''}`}>
                    <span className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-bold ${doneSteps[i] ? 'bg-sage text-white' : 'bg-ink text-white'}`}>
                      {doneSteps[i] ? <Check size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="text-[17px] leading-relaxed pt-0.5">{s}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <AddToWeek recipe={recipe} />

          <section className="mt-6 rounded-2xl border border-line p-5">
            <h2 className="text-[15px]">Would you have this again?</h2>
            <p className="text-sm text-ink-faint mt-0.5">Your ratings shape future weeks.</p>
            <div className="mt-3"><RatingButtons recipeId={recipe.id} size="lg" /></div>
          </section>

          {recipe.image?.credit && (
            <p className="text-xs text-ink-faint mt-6">Photo: {recipe.image.credit} on Unsplash</p>
          )}
        </div>
      </div>
    </div>
  )
}
