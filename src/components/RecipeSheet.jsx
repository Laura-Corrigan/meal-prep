import React, { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Clock, Users, Check, Sun } from 'lucide-react'
import { useApp } from '../context'
import { FoodImage } from './ui'
import { RatingButtons } from './DayCard'
import { getRecipe, lines, tags, keyComponents, RECIPE_SERVINGS } from '../domain/recipes'
import { servings } from '../domain/prefs'
import { ingredient } from '../data/ingredients'
import { formatQty } from '../domain/units'

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
    <div className="fixed inset-0 z-50 bg-cream overflow-y-auto overscroll-contain anim-fade" role="dialog" aria-modal="true" aria-label={recipe.name}>
      <div className="max-w-2xl mx-auto pb-16">
        <div className="relative">
          <FoodImage recipe={recipe} width={900} eager rounded="sm:rounded-b-3xl" className="w-full aspect-[4/3] sm:aspect-[16/9]" />
          <button onClick={onClose} aria-label="Back"
            className="absolute top-4 left-4 w-11 h-11 rounded-full bg-paper/90 backdrop-blur shadow-card flex items-center justify-center" style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
            <ArrowLeft size={20} />
          </button>
        </div>

        <div className="px-5 sm:px-6">
          <h1 className="text-[30px] leading-tight font-semibold mt-5">{recipe.name}</h1>
          <p className="text-ink-soft mt-2">{recipe.description}</p>

          <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-[15px]">
            <span className="inline-flex items-center gap-1.5"><Clock size={17} className="text-tomato" />{recipe.mins} mins</span>
            <span className="inline-flex items-center gap-1.5"><Users size={17} className="text-tomato" />
              Serves {serves}{state.prefs.leftovers ? ' (incl. lunch)' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags(recipe).map(t => <span key={t} className="badge bg-sage-soft text-sage">{t}</span>)}
          </div>
          <p className="text-sm text-ink-faint mt-3">
            {keyComponents(recipe).join(' · ')}
            {recipe.kcal && <> · approx. {recipe.kcal} kcal, {recipe.proteinG}g protein per serving</>}
          </p>

          <section className="mt-7">
            <h2 className="text-xl font-semibold">Ingredients</h2>
            <ul className="mt-3 card divide-y divide-line">
              {lines(recipe).map((l, i) => {
                const ing = l.id ? ingredient(l.id) : null
                const qty = l.qty != null ? formatQty(l.qty * factor, ing?.unit) : ''
                const on = got[i]
                return (
                  <li key={i}>
                    <button onClick={() => setGot(g => ({ ...g, [i]: !g[i] }))} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                      <span className={`w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center ${on ? 'bg-sage border-sage text-white' : 'border-line'}`}>
                        {on && <Check size={12} strokeWidth={3} />}
                      </span>
                      <span className={`flex-1 ${on ? 'line-through text-ink-faint' : ''}`}>
                        {ing ? <>{qty && <strong className="font-semibold">{qty} </strong>}{ing.name.toLowerCase()}</> : l.text}
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
              <h2 className="text-xl font-semibold">Method</h2>
              {hasWakeLock && (
                <button onClick={() => setAwake(a => !a)} aria-pressed={awake}
                  className={awake ? 'chip-on' : 'chip-off'}><Sun size={14} /> {awake ? 'Screen stays on' : 'Keep screen on'}</button>
              )}
            </div>
            <ol className="mt-3 space-y-3">
              {recipe.steps.map((s, i) => (
                <li key={i}>
                  <button onClick={() => setDoneSteps(d => ({ ...d, [i]: !d[i] }))}
                    className={`w-full text-left card p-4 flex gap-4 transition ${doneSteps[i] ? 'opacity-50' : ''}`}>
                    <span className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center font-semibold ${doneSteps[i] ? 'bg-sage text-white' : 'bg-tomato-soft text-tomato'}`}>
                      {doneSteps[i] ? <Check size={16} strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="text-[17px] leading-relaxed pt-0.5">{s}</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8 card p-5">
            <h2 className="font-sans text-[15px] font-semibold">Would you have this again?</h2>
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
