import React from 'react'
import { Check, Settings2, Shuffle, ShoppingBasket, ArrowRight } from 'lucide-react'
import { useApp } from '../context'
import DayCard from './DayCard'
import AgentBar from './AgentBar'
import { DAYS, addDays, weekRangeLabel, todayKey } from '../domain/week'
import { getRecipe } from '../domain/recipes'
import { buildShoppingList } from '../domain/shopping'

function Step({ done, children }) {
  return (
    <li className="flex items-center gap-2.5 text-[15px]">
      <span className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? 'bg-sage text-white' : 'border-2 border-line'}`}>
        {done && <Check size={13} strokeWidth={3} />}
      </span>
      <span className={done ? 'text-ink' : 'text-ink-soft'}>{children}</span>
    </li>
  )
}

function WeekStatus() {
  const { state, week, weekStart, thisWeek, today, actions, go, openRecipe } = useApp()
  const meals = DAYS.filter(d => week.days[d].recipeId && !week.days[d].out).length
  const out = DAYS.filter(d => week.days[d].out).length
  const empty = DAYS.filter(d => !week.days[d].recipeId && !week.days[d].out)
  const planned = empty.length === 0
  const items = buildShoppingList(week, state).toBuy.length
  const tonight = weekStart === thisWeek && todayKey(today) && week.days[todayKey(today)]
  const tonightRecipe = tonight?.recipeId && !tonight.out ? getRecipe(tonight.recipeId, state) : null

  let next
  if (!planned) next = { label: `Fill ${empty.length === 1 ? 'the gap' : `${empty.length} gaps`}`, run: () => actions.replanDays(empty) }
  else if (!week.approved) next = { label: 'Approve this plan', hint: 'Then we\'ll build the shopping list.', run: () => { actions.approve(true); go('shopping') } }
  else if (!week.tesco?.done) next = { label: 'Do the Tesco shop', hint: `${items} items · about 5 mins`, run: () => go('shopping'), Icon: ShoppingBasket }
  else if (tonightRecipe) next = { label: `Tonight: ${tonightRecipe.name}`, run: () => openRecipe(tonightRecipe.id) }

  return (
    <section className="card p-5">
      <div className="flex items-baseline justify-between">
        <p className="eyebrow">{weekStart === thisWeek ? 'This week' : 'Next week'}</p>
        {week.approved && <button className="text-sm font-medium text-ink-soft underline underline-offset-2" onClick={() => go('shopping')}>Shopping list</button>}
      </div>
      <ul className="mt-3 space-y-2">
        <Step done={planned}>{meals} meal{meals === 1 ? '' : 's'} planned{out ? ` · ${out} night${out > 1 ? 's' : ''} out` : ''}</Step>
        <Step done={week.approved}>Shopping list {week.approved ? 'ready' : ''}</Step>
        <Step done={week.tesco?.done}>{week.tesco?.done ? 'Tesco order placed' : 'Tesco order'}</Step>
      </ul>
      {next ? (
        <div className="mt-4">
          <button className="btn-primary w-full h-12 text-base" onClick={next.run}>
            {next.Icon && <next.Icon size={18} />}{next.label}<ArrowRight size={18} />
          </button>
          {next.hint && <p className="text-center text-xs text-ink-faint mt-2">{next.hint}</p>}
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-soft">All set. Enjoy the week.</p>
      )}
    </section>
  )
}

export default function Home() {
  const { week, weekStart, setWeekStart, thisWeek, actions, go } = useApp()
  const nextWeek = addDays(thisWeek, 7)
  const editable = weekStart >= thisWeek

  return (
    <div className="min-h-[100dvh] pb-40">
      <header className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <p className="font-display text-lg font-semibold text-tomato">What's for tea?</p>
        <button aria-label="Settings" onClick={() => go('settings')} className="w-10 h-10 rounded-full flex items-center justify-center text-ink-soft hover:bg-paper">
          <Settings2 size={20} />
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="mt-4 mb-5 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-[32px] leading-none font-semibold">{weekStart === thisWeek ? 'This week' : weekStart === nextWeek ? 'Next week' : 'Past week'}</h1>
            <p className="text-ink-faint mt-1.5">Mon–Fri · {weekRangeLabel(weekStart)}</p>
          </div>
          <div className="inline-flex bg-paper border border-line rounded-full p-1 text-sm">
            {[[thisWeek, 'This'], [nextWeek, 'Next']].map(([start, label]) => (
              <button key={start} onClick={() => setWeekStart(start)} aria-pressed={weekStart === start}
                className={`px-3.5 h-8 rounded-full font-medium transition ${weekStart === start ? 'bg-ink text-white' : 'text-ink-soft'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {editable && <WeekStatus />}

        <div className="mt-5 space-y-3">
          {DAYS.map(day => <DayCard key={`${weekStart}-${day}`} day={day} />)}
        </div>

        {editable && (
          <div className="mt-5 flex gap-2">
            <button className="btn-ghost flex-1" onClick={actions.generateWeek}>
              <Shuffle size={16} /> Shuffle unlocked
            </button>
            {!week.approved
              ? <button className="btn-dark flex-1" onClick={() => { actions.approve(true); go('shopping') }}>Approve plan</button>
              : <button className="btn-ghost flex-1" onClick={() => go('shopping')}><ShoppingBasket size={16} /> Shopping list</button>}
          </div>
        )}
        {editable && <p className="text-center text-xs text-ink-faint mt-3">Lock the meals you definitely want, then shuffle the rest.</p>}
      </main>

      {editable && <AgentBar />}
    </div>
  )
}
