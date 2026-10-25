import React from 'react'
import { Check, ChevronLeft, ChevronRight, Settings2, Shuffle, Sparkles, ShoppingBasket } from 'lucide-react'
import { useApp } from '../context'
import DayCard from './DayCard'
import { PageHeader, BottomAction } from './Layout'
import { DAYS, addDays, weekRangeLabel, todayKey } from '../domain/week'
import { getRecipe } from '../domain/recipes'
import { buildShoppingList } from '../domain/shopping'

function Step({ done, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] font-semibold ${done ? 'text-ink' : 'text-ink-faint'}`}>
      <span className={`w-[18px] h-[18px] rounded-full flex items-center justify-center ${done ? 'bg-sage text-white' : 'border-2 border-line'}`}>
        {done && <Check size={11} strokeWidth={3.5} />}
      </span>
      {children}
    </span>
  )
}

function useNextStep() {
  const { state, week, weekStart, thisWeek, today, actions, go, openRecipe } = useApp()
  const empty = DAYS.filter(d => !week.days[d].recipeId && !week.days[d].out)
  const items = buildShoppingList(week, state).toBuy.length
  const tonight = weekStart === thisWeek && todayKey(today) && week.days[todayKey(today)]
  const tonightRecipe = tonight?.recipeId && !tonight.out ? getRecipe(tonight.recipeId, state) : null

  if (empty.length) return { label: `Fill ${empty.length === 1 ? 'the gap' : `${empty.length} gaps`}`, run: () => actions.replanDays(empty) }
  if (!week.approved) return { label: 'Approve & build shopping list', run: () => { actions.approve(true); go('shopping') } }
  if (!week.tesco?.done) return { label: `Shop at Tesco · ${items} items`, run: () => go('shopping'), Icon: ShoppingBasket }
  if (tonightRecipe) return { label: `Tonight: ${tonightRecipe.name}`, run: () => openRecipe(tonightRecipe.id), accent: true }
  return null
}

export default function Home() {
  const { week, weekStart, setWeekStart, thisWeek, actions, go, openAsk } = useApp()
  const nextWeek = addDays(thisWeek, 7)
  const editable = weekStart >= thisWeek
  const meals = DAYS.filter(d => week.days[d].recipeId && !week.days[d].out).length
  const out = DAYS.filter(d => week.days[d].out).length
  const planned = DAYS.every(d => week.days[d].recipeId || week.days[d].out)
  const next = useNextStep()
  const label = weekStart === thisWeek ? 'This week' : weekStart === nextWeek ? 'Next week' : 'Past week'

  return (
    <div className="min-h-[100dvh] pb-44">
      <PageHeader
        title={weekRangeLabel(weekStart)}
        subtitle={`${label} · ${meals} dinner${meals === 1 ? '' : 's'}${out ? ` · ${out} out` : ''}`}
        right={<>
          <button className="icon-btn !w-10 !h-10" aria-label="Previous week" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft size={19} /></button>
          <button className="icon-btn !w-10 !h-10" aria-label="Next week" disabled={weekStart >= nextWeek}
            onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight size={19} /></button>
          <button className="icon-btn !w-10 !h-10" aria-label="Settings" onClick={() => go('settings')}><Settings2 size={18} /></button>
        </>}
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        {editable && (
          <div className="flex items-center justify-between gap-3 py-3 border-y border-line mt-2">
            <div className="flex items-center gap-4 flex-wrap">
              <Step done={planned}>Planned</Step>
              <Step done={week.approved}>List</Step>
              <Step done={week.tesco?.done}>Tesco</Step>
            </div>
            <button onClick={openAsk} className="chip-off !h-8 !px-3 shrink-0">
              <Sparkles size={14} className="text-tomato" /> Ask
            </button>
          </div>
        )}

        <ul className="divide-y divide-line">
          {DAYS.map(day => <DayCard key={`${weekStart}-${day}`} day={day} />)}
        </ul>

        {editable && (
          <div className="border-t border-line pt-4 flex items-center justify-between gap-3">
            <p className="text-[13px] text-ink-faint">Lock what you want to keep, shuffle the rest.</p>
            <button className="btn-ghost btn-sm shrink-0" onClick={actions.generateWeek}><Shuffle size={15} /> Shuffle</button>
          </div>
        )}
      </main>

      {editable && next && (
        <BottomAction>
          <button className={`${next.accent ? 'btn-accent' : 'btn-primary'} w-full h-14 text-base shadow-lift`} onClick={next.run}>
            {next.Icon && <next.Icon size={18} />}{next.label}
          </button>
        </BottomAction>
      )}
    </div>
  )
}
