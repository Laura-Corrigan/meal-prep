import React from 'react'
import { Clock, Lock, LockOpen, Repeat2, Users, Heart, ThumbsUp, ThumbsDown, Sandwich, ChefHat } from 'lucide-react'
import { useApp } from '../context'
import { FoodImage } from './ui'
import { getRecipe, indicators, keyComponents } from '../domain/recipes'
import { servings } from '../domain/prefs'
import { DAY_LABEL, DAY_SHORT, DAYS, dayDate } from '../domain/week'
import { sharedIngredients } from '../agent'
import { ingredient } from '../data/ingredients'

export function RatingButtons({ recipeId, size = 'sm' }) {
  const { state, actions } = useApp()
  const current = state.ratings[recipeId]
  const opts = [
    { id: 'love', label: 'Love it', Icon: Heart },
    { id: 'like', label: 'Would eat again', Icon: ThumbsUp },
    { id: 'nope', label: "Don't suggest again", Icon: ThumbsDown },
  ]
  return (
    <div className="flex gap-2 flex-wrap">
      {opts.map(({ id, label, Icon }) => {
        const on = current === id
        return (
          <button key={id} type="button" aria-pressed={on} title={label} onClick={() => actions.rate(recipeId, id)}
            className={`inline-flex items-center gap-1.5 rounded-full border transition ${size === 'lg' ? 'h-10 px-3.5 text-sm' : 'h-8 px-3 text-xs'} font-medium
              ${on ? (id === 'nope' ? 'bg-ink text-white border-ink' : 'bg-tomato text-white border-tomato') : 'bg-paper border-line text-ink-soft hover:border-ink-faint'}`}>
            <Icon size={size === 'lg' ? 16 : 14} fill={on && id === 'love' ? 'currentColor' : 'none'} />
            {size === 'lg' ? label : id === 'love' ? 'Love' : id === 'like' ? 'Again' : 'Never'}
          </button>
        )
      })}
    </div>
  )
}

export default function DayCard({ day }) {
  const { state, week, weekStart, thisWeek, today, actions, openRecipe, openSwap } = useApp()
  const slot = week.days[day]
  const recipe = slot.recipeId && !slot.out ? getRecipe(slot.recipeId, state) : null
  const date = dayDate(weekStart, day)
  const isCurrentWeek = weekStart === thisWeek
  const todayIdx = today.getDay() - 1
  const isToday = isCurrentWeek && DAYS[todayIdx] === day
  const isPast = isCurrentWeek ? DAYS.indexOf(day) < todayIdx : weekStart < thisWeek
  const askRating = recipe && (isPast || (isToday && today.getHours() >= 19)) && !state.ratings[recipe.id]

  const dayLabel = (
    <div className="flex items-center gap-2">
      <span className={`eyebrow whitespace-nowrap ${isToday ? 'text-tomato' : ''}`}>{DAY_SHORT[day]} {date.getDate()}</span>
      {isToday && <span className="badge bg-tomato text-white">Tonight</span>}
    </div>
  )

  if (!recipe) {
    return (
      <article className={`card p-4 flex items-center gap-4 ${isPast ? 'opacity-60' : ''}`}>
        <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-cream border border-dashed border-line flex items-center justify-center text-ink-faint shrink-0">
          <ChefHat size={24} />
        </div>
        <div className="flex-1 min-w-0">
          {dayLabel}
          <p className="font-display text-lg mt-0.5">{slot.out ? 'Eating out' : 'Nothing planned'}</p>
          <p className="text-sm text-ink-faint">{slot.out ? 'No cooking, no shopping.' : 'Pick something or let us suggest.'}</p>
        </div>
        <button className="btn-ghost btn-sm shrink-0" onClick={() => (slot.out ? actions.markIn(day) : openSwap(day))}>
          {slot.out ? 'Add meal' : 'Choose'}
        </button>
      </article>
    )
  }

  const shared = sharedIngredients(week, day, state).slice(0, 2)
  const yesterday = DAYS[DAYS.indexOf(day) - 1]
  const lunch = isToday && state.prefs.leftovers && yesterday && week.days[yesterday]?.recipeId && !week.days[yesterday].out
    ? getRecipe(week.days[yesterday].recipeId, state) : null

  return (
    <article className={`card overflow-hidden ${isToday ? 'ring-2 ring-tomato' : ''} ${isPast && !askRating ? 'opacity-70' : ''}`}>
      <div className="p-3 sm:p-4 flex gap-3.5 sm:gap-5">
        <button className="shrink-0" onClick={() => openRecipe(recipe.id)} aria-label={`Open ${recipe.name} recipe`}>
          <FoodImage recipe={recipe} width={320} className="w-[104px] h-[104px] sm:w-36 sm:h-36" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            {dayLabel}
            <button type="button" onClick={() => actions.toggleLock(day)} aria-pressed={slot.locked}
              aria-label={slot.locked ? `Unlock ${DAY_LABEL[day]}` : `Lock ${DAY_LABEL[day]}`}
              className={`-mt-1 -mr-1 w-8 h-8 rounded-full flex items-center justify-center ${slot.locked ? 'text-tomato bg-tomato-soft' : 'text-ink-faint hover:text-ink'}`}>
              {slot.locked ? <Lock size={15} /> : <LockOpen size={15} />}
            </button>
          </div>
          <button className="text-left block" onClick={() => openRecipe(recipe.id)}>
            <h3 className="text-[19px] sm:text-xl leading-snug font-semibold">{recipe.name}</h3>
          </button>
          <p className="text-[13px] text-ink-soft mt-1 flex items-center gap-x-3 gap-y-0.5 flex-wrap">
            <span className="inline-flex items-center gap-1"><Clock size={13} />{recipe.mins} mins{recipe.activeMins ? ` · ${recipe.activeMins} hands-on` : ''}</span>
            <span className="inline-flex items-center gap-1"><Users size={13} />Serves {servings(state.prefs)}</span>
          </p>
          <p className="text-[13px] text-ink-faint mt-0.5">{keyComponents(recipe).join(' · ')}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {indicators(recipe).map(t => <span key={t} className="badge bg-sage-soft text-sage">{t}</span>)}
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-4 -mt-0.5">
        <p className="text-sm text-ink-soft leading-snug line-clamp-2">{recipe.description}</p>
        {shared.length > 0 && (
          <p className="text-xs text-ink-faint mt-1.5">
            Shares {shared.map(s => `${ingredient(s.id).name.toLowerCase()} with ${DAY_SHORT[s.day]}`).join(', ')}
          </p>
        )}
        {lunch && (
          <p className="text-xs text-ink-soft mt-1.5 inline-flex items-center gap-1.5"><Sandwich size={13} /> Lunch: leftover {lunch.name}</p>
        )}
      </div>

      {askRating ? (
        <div className="px-3 sm:px-4 py-3 mt-2 border-t border-line flex items-center justify-between gap-2 flex-wrap bg-butter/50">
          <span className="text-sm font-medium">How was it?</span>
          <RatingButtons recipeId={recipe.id} />
        </div>
      ) : (
        <div className="px-3 sm:px-4 py-3 flex gap-2">
          <button className={isToday ? 'btn-primary btn-sm flex-1' : 'btn-ghost btn-sm flex-1'} onClick={() => openRecipe(recipe.id)}>
            {isToday ? 'Start cooking' : 'Recipe'}
          </button>
          {!isPast && (
            <button className="btn-ghost btn-sm flex-1" onClick={() => openSwap(day)}>
              <Repeat2 size={15} /> Swap
            </button>
          )}
        </div>
      )}
    </article>
  )
}
