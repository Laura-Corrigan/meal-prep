import React from 'react'
import { Clock, Lock, LockOpen, Repeat2, Users, Heart, ThumbsUp, ThumbsDown, Eye, UtensilsCrossed, Plus } from 'lucide-react'
import { useApp } from '../context'
import { FoodImage } from './ui'
import { getRecipe, indicators } from '../domain/recipes'
import { servings } from '../domain/prefs'
import { DAY_LABEL, DAY_SHORT, DAYS, dayDate } from '../domain/week'

export function RatingButtons({ recipeId, size = 'sm' }) {
  const { state, actions } = useApp()
  const current = state.ratings[recipeId]
  const opts = [
    { id: 'love', label: 'Love it', short: 'Love', Icon: Heart },
    { id: 'like', label: 'Would eat again', short: 'Again', Icon: ThumbsUp },
    { id: 'nope', label: "Don't suggest again", short: 'Never', Icon: ThumbsDown },
  ]
  return (
    <div className="flex gap-2 flex-wrap">
      {opts.map(({ id, label, short, Icon }) => {
        const on = current === id
        return (
          <button key={id} type="button" aria-pressed={on} title={label} onClick={() => actions.rate(recipeId, id)}
            className={`inline-flex items-center gap-1.5 rounded-full transition font-semibold ${size === 'lg' ? 'h-10 px-4 text-sm' : 'h-8 px-3 text-xs'}
              ${on ? (id === 'nope' ? 'bg-ink text-white' : 'bg-tomato text-white') : 'bg-mist text-ink-soft hover:bg-line'}`}>
            <Icon size={size === 'lg' ? 16 : 14} fill={on && id === 'love' ? 'currentColor' : 'none'} />
            {size === 'lg' ? label : short}
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
    <p className="text-[12px] font-bold uppercase tracking-[.06em] text-ink-faint whitespace-nowrap">
      {DAY_SHORT[day]} {date.getDate()}
      {isToday && <span className="text-tomato"> · Tonight</span>}
    </p>
  )

  if (!recipe) {
    return (
      <li className={`py-4 flex items-center gap-4 ${isPast ? 'opacity-50' : ''}`}>
        <div className="w-[88px] h-[88px] rounded-2xl bg-mist flex items-center justify-center text-ink-faint shrink-0">
          <UtensilsCrossed size={24} />
        </div>
        <div className="flex-1 min-w-0">
          {dayLabel}
          <h3 className="text-[17px] leading-snug mt-0.5">{slot.out ? 'Eating out' : 'Nothing planned'}</h3>
          <p className="text-[13px] text-ink-faint mt-0.5">{slot.out ? 'No cooking tonight' : 'Pick a recipe'}</p>
        </div>
        {!isPast && (
          <button className="btn-ghost btn-sm shrink-0" onClick={() => (slot.out ? actions.markIn(day) : openSwap(day))}>
            <Plus size={15} /> {slot.out ? 'Add meal' : 'Choose'}
          </button>
        )}
      </li>
    )
  }

  const tag = indicators(recipe)[0]

  return (
    <li className={`py-4 flex gap-4 ${isPast && !askRating ? 'opacity-50' : ''}`}>
      <button className="shrink-0" onClick={() => openRecipe(recipe.id)} aria-label={`Open ${recipe.name} recipe`}>
        <FoodImage recipe={recipe} width={240} className="w-[88px] h-[88px] sm:w-28 sm:h-28" />
      </button>
      <div className="flex-1 min-w-0">
        {dayLabel}
        <button className="text-left block w-full" onClick={() => openRecipe(recipe.id)}>
          <h3 className="text-[17px] leading-snug mt-0.5">{recipe.name}</h3>
        </button>
        <p className="text-[13px] text-ink-soft mt-1 flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1"><Clock size={13} />{recipe.mins} mins</span>
          <span className="inline-flex items-center gap-1"><Users size={13} />{servings(state.prefs)}</span>
          {tag && <span className="badge bg-sage-soft text-sage">{tag}</span>}
        </p>

        {askRating ? (
          <div className="mt-2.5">
            <p className="text-[13px] font-semibold mb-1.5">How was it?</p>
            <RatingButtons recipeId={recipe.id} />
          </div>
        ) : (
          <div className="mt-2.5 flex items-center gap-2">
            {isToday ? (
              <button className="btn-accent btn-sm" onClick={() => openRecipe(recipe.id)}>Start cooking</button>
            ) : (
              <button className="icon-btn" aria-label={`View ${recipe.name}`} onClick={() => openRecipe(recipe.id)}><Eye size={17} /></button>
            )}
            {!isPast && (
              <>
                <button className="icon-btn" aria-label={`Swap ${DAY_LABEL[day]}`} onClick={() => openSwap(day)}><Repeat2 size={17} /></button>
                <button className={`icon-btn ${slot.locked ? '!bg-ink !text-white' : ''}`} onClick={() => actions.toggleLock(day)} aria-pressed={slot.locked}
                  aria-label={slot.locked ? `Unlock ${DAY_LABEL[day]}` : `Lock ${DAY_LABEL[day]}`}>
                  {slot.locked ? <Lock size={16} /> : <LockOpen size={16} />}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
