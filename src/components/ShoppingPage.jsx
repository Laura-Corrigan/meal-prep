import React, { useState } from 'react'
import { ArrowLeft, Check, ChevronDown, Copy, ShoppingBasket, ArrowRight } from 'lucide-react'
import { useApp } from '../context'
import { buildShoppingList, shoppingListText } from '../domain/shopping'
import { DAYS, weekRangeLabel } from '../domain/week'

function ItemRow({ item, onToggle, have }) {
  return (
    <li>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${have ? 'line-through text-ink-faint' : ''}`}>{item.name}</p>
          <p className="text-xs text-ink-faint mt-0.5">
            {item.qtyText && <>{item.qtyText} · </>}{item.daysText}
          </p>
        </div>
        {item.packText && !have && <span className="text-sm text-ink-soft text-right shrink-0 max-w-[40%]">{item.packText}</span>}
        <span className={`h-8 px-3 rounded-full text-xs font-semibold shrink-0 inline-flex items-center gap-1 border ${have ? 'bg-sage text-white border-sage' : 'border-line text-ink-faint'}`}>
          {have ? <><Check size={13} strokeWidth={3} /> Have</> : 'Have it'}
        </span>
      </button>
    </li>
  )
}

function Collapsible({ title, count, hint, children }) {
  const [open, setOpen] = useState(false)
  if (!count) return null
  return (
    <section className="mt-6">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between py-2">
        <span className="text-left">
          <span className="font-semibold">{title} ({count})</span>
          {hint && <span className="block text-xs text-ink-faint">{hint}</span>}
        </span>
        <ChevronDown size={18} className={`transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <ul className="card divide-y divide-line mt-1">{children}</ul>}
    </section>
  )
}

export default function ShoppingPage() {
  const { state, week, weekStart, actions, back, go, setToast } = useApp()
  const list = buildShoppingList(week, state)
  const meals = DAYS.filter(d => week.days[d].recipeId && !week.days[d].out).length

  const copy = async () => {
    try { await navigator.clipboard.writeText(shoppingListText(week, state)); setToast({ title: 'Shopping list copied' }) }
    catch { setToast({ title: "Couldn't copy on this device" }) }
  }

  return (
    <div className="min-h-[100dvh] pb-32">
      <header className="sticky top-0 z-20 bg-cream/90 backdrop-blur border-b border-line">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button aria-label="Back" onClick={back} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-paper"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold leading-none">Shopping list</h1>
            <p className="text-xs text-ink-faint mt-1">{meals} dinners · {weekRangeLabel(weekStart)}</p>
          </div>
          <button aria-label="Copy list" onClick={copy} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-paper text-ink-soft"><Copy size={18} /></button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        {!week.approved && meals > 0 && (
          <div className="mt-4 card p-4 flex items-center justify-between gap-3 bg-butter">
            <p className="text-sm">This plan isn't approved yet.</p>
            <button className="btn-dark btn-sm" onClick={() => actions.approve(true)}>Approve</button>
          </div>
        )}

        {list.toBuy.length === 0 && list.have.length === 0 ? (
          <div className="text-center py-20 text-ink-faint">
            <ShoppingBasket size={36} className="mx-auto mb-3 opacity-50" />
            <p>Plan some meals and the list builds itself.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-ink-soft mt-5">
              <strong className="text-ink">{list.toBuy.length} items to buy.</strong> Tap anything you've already got.
            </p>
            {list.groups.map(g => (
              <section key={g.id} className="mt-5">
                <h2 className="eyebrow mb-2">{g.label}</h2>
                <ul className="card divide-y divide-line">
                  {g.items.map(i => <ItemRow key={i.id} item={i} onToggle={() => actions.toggleHave(i.id)} />)}
                </ul>
              </section>
            ))}
            <Collapsible title="Already have" count={list.have.length}>
              {list.have.map(i => <ItemRow key={i.id} item={i} have onToggle={() => actions.toggleHave(i.id)} />)}
            </Collapsible>
            <Collapsible title="From the cupboard" count={list.pantry.length} hint="Staples we assume you have. Tap any you've run out of.">
              {list.pantry.map(i => (
                <li key={i.id}>
                  <button onClick={() => actions.toggleNeed(i.id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
                    <span>{i.name}</span><span className="text-xs text-ink-faint">Need to buy</span>
                  </button>
                </li>
              ))}
            </Collapsible>
            <p className="text-xs text-ink-faint mt-6">Pack sizes are typical Tesco sizes and may vary slightly.</p>
          </>
        )}
      </main>

      {list.toBuy.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-cream/90 backdrop-blur border-t border-line z-20">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 pb-safe">
            <button className="btn-primary w-full h-12 text-base" onClick={() => { if (!week.approved) actions.approve(true); go('tesco') }}>
              {week.tesco?.done ? 'Tesco shop done · review' : `Shop at Tesco · ${list.toBuy.length} items`} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
