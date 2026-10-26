import React, { useState } from 'react'
import { Check, ChevronDown, Copy, ShoppingBasket, Sparkles, CircleCheck } from 'lucide-react'
import { useApp } from '../context'
import { PageHeader, BottomAction } from './Layout'
import { buildShoppingList, shoppingListText } from '../domain/shopping'
import { CATEGORIES } from '../data/ingredients'
import { DAYS, weekRangeLabel } from '../domain/week'
import { claudeBasketPrompt } from '../tesco/claudePrompt'

function ItemRow({ item, have, onToggle }) {
  return (
    <li>
      <button onClick={onToggle} aria-pressed={have} className="w-full flex items-center gap-3.5 py-3.5 text-left">
        <span className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition ${have ? 'bg-ink text-white' : 'border-2 border-line'}`}>
          {have && <Check size={14} strokeWidth={3} />}
        </span>
        <span className="flex-1 min-w-0">
          <span className={`block text-[15px] font-semibold ${have ? 'line-through text-ink-faint' : ''}`}>{item.name}</span>
          <span className="block text-[12px] text-ink-faint mt-0.5">{item.qtyText && <>{item.qtyText} · </>}{item.daysText}</span>
        </span>
        {item.packText && !have && <span className="text-[13px] font-semibold text-ink-soft text-right shrink-0 max-w-[38%]">{item.packText}</span>}
      </button>
    </li>
  )
}

export default function ShoppingPage() {
  const { state, week, weekStart, actions, go, setToast } = useApp()
  const [showPantry, setShowPantry] = useState(false)
  const list = buildShoppingList(week, state)
  const meals = DAYS.filter(d => week.days[d].recipeId && !week.days[d].out).length
  const all = [...list.toBuy, ...list.have]
  const haveIds = new Set(list.have.map(i => i.id))
  const groups = CATEGORIES
    .map(c => ({ ...c, items: all.filter(i => i.cat === c.id).sort((a, b) => a.name.localeCompare(b.name)) }))
    .filter(g => g.items.length)

  const sendToClaude = async () => {
    if (!week.approved) actions.approve(true)
    const items = groups.flatMap(g => g.items).filter(i => !haveIds.has(i.id))
    const text = claudeBasketPrompt(items, { remembered: state.tescoProducts, weekLabel: weekRangeLabel(weekStart) })
    try {
      await navigator.clipboard.writeText(text)
      setToast({ title: 'Copied for Claude in Chrome', lines: ['Paste it into the Claude side panel in Chrome, logged into tesco.com. Then pick a slot and pay.'] })
    } catch { setToast({ title: "Couldn't copy on this device" }) }
  }

  const copy = async () => {
    try { await navigator.clipboard.writeText(shoppingListText(week, state)); setToast({ title: 'Shopping list copied' }) }
    catch { setToast({ title: "Couldn't copy on this device" }) }
  }

  return (
    <div className="min-h-[100dvh] pb-60">
      <PageHeader
        title="Shopping list"
        subtitle={`${weekRangeLabel(weekStart)} · ${meals} dinner${meals === 1 ? '' : 's'}`}
        right={all.length > 0 && <button className="icon-btn !w-10 !h-10" aria-label="Copy list" onClick={copy}><Copy size={17} /></button>}
      />

      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        {all.length === 0 ? (
          <div className="text-center py-24 text-ink-faint">
            <ShoppingBasket size={36} className="mx-auto mb-3 opacity-50" />
            <p>Plan some meals and the list builds itself.</p>
          </div>
        ) : (
          <>
            {!week.approved && (
              <div className="mt-2 rounded-2xl bg-mist p-4 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Happy with this week's meals?</p>
                <button className="btn-primary btn-sm" onClick={() => actions.approve(true)}>Approve</button>
              </div>
            )}
            <p className="text-sm text-ink-soft mt-4">
              <strong className="text-ink">{list.toBuy.length} to buy.</strong> Tick anything you already have.
            </p>

            {groups.map(g => (
              <section key={g.id} className="mt-6">
                <h2 className="text-[15px]">{g.label}</h2>
                <ul className="divide-y divide-line border-b border-line">
                  {g.items.map(i => <ItemRow key={i.id} item={i} have={haveIds.has(i.id)} onToggle={() => actions.toggleHave(i.id)} />)}
                </ul>
              </section>
            ))}

            {list.pantry.length > 0 && (
              <section className="mt-6">
                <button onClick={() => setShowPantry(o => !o)} className="w-full flex items-center justify-between py-2 text-left">
                  <span>
                    <span className="block text-[15px] font-bold">From the cupboard ({list.pantry.length})</span>
                    <span className="block text-[12px] text-ink-faint">Staples we assume you have. Tap any you've run out of.</span>
                  </span>
                  <ChevronDown size={18} className={`transition ${showPantry ? 'rotate-180' : ''}`} />
                </button>
                {showPantry && (
                  <ul className="divide-y divide-line">
                    {list.pantry.map(i => (
                      <li key={i.id}>
                        <button onClick={() => actions.toggleNeed(i.id)} className="w-full flex items-center justify-between py-3 text-left">
                          <span className="text-[15px]">{i.name}</span><span className="text-[12px] font-semibold text-ink-faint">Add to list</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
            <p className="text-[12px] text-ink-faint mt-6">Pack sizes are typical Tesco sizes and may vary slightly.</p>
          </>
        )}
      </main>

      {list.toBuy.length > 0 && (
        <BottomAction>
          {week.tesco?.done ? (
            <div className="flex items-center justify-between gap-3 rounded-full bg-sage-soft pl-5 pr-2 h-14 shadow-lift">
              <span className="inline-flex items-center gap-2 font-bold text-sage"><CircleCheck size={18} /> Tesco order placed</span>
              <button className="btn-ghost btn-sm !bg-white" onClick={() => actions.tescoDone(false)}>Undo</button>
            </div>
          ) : (
            <>
              <button className="btn-primary w-full h-14 text-base shadow-lift" onClick={sendToClaude}>
                <Sparkles size={18} /> Copy for Claude in Chrome
              </button>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <button className="btn-ghost btn-sm !h-11" onClick={() => { if (!week.approved) actions.approve(true); go('tesco') }}>
                  <ShoppingBasket size={15} /> One by one
                </button>
                <button className="btn-ghost btn-sm !h-11" onClick={() => actions.tescoDone(true)}>
                  <Check size={15} /> Order placed
                </button>
              </div>
            </>
          )}
        </BottomAction>
      )}
    </div>
  )
}
