import React, { useState } from 'react'
import { ArrowLeft, Check, ExternalLink, Info, Link2, PartyPopper, SkipForward } from 'lucide-react'
import { useApp } from '../context'
import { buildShoppingList } from '../domain/shopping'
import { tesco } from '../tesco/provider'
import { CATEGORIES } from '../data/ingredients'

export default function TescoFlow() {
  const { state, week, actions, back, go, setToast } = useApp()
  const items = buildShoppingList(week, state).groups.flatMap(g => g.items)
  const status = week.tesco?.added || {}
  const [focus, setFocus] = useState(null)
  const [pasting, setPasting] = useState(false)
  const [link, setLink] = useState('')

  const pending = items.filter(i => !status[i.id])
  const current = items.find(i => i.id === focus && !status[i.id]) || pending[0]
  const done = items.length - pending.length
  const remembered = id => state.tescoProducts?.[id]

  const mark = (item, v) => { actions.tescoAdded(item.id, v); setFocus(null); setPasting(false); setLink('') }
  const saveLink = item => {
    const pid = tesco.parseProductLink(link)
    if (!pid) { setToast({ title: "That doesn't look like a Tesco product link" }); return }
    actions.rememberProduct(item.id, pid)
    setToast({ title: `We'll go straight to this product next time` })
    setPasting(false); setLink('')
  }

  return (
    <div className="min-h-[100dvh] pb-16">
      <header className="sticky top-0 z-20 bg-cream/90 backdrop-blur border-b border-line">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
          <button aria-label="Back" onClick={back} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center hover:bg-paper"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold leading-none">Tesco shop</h1>
            <p className="text-xs text-ink-faint mt-1">{done} of {items.length} done</p>
          </div>
        </div>
        <div className="h-1 bg-line"><div className="h-1 bg-sage transition-all" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} /></div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6">
        {done === 0 && (
          <div className="mt-4 flex gap-3 text-sm text-ink-soft bg-paper border border-line rounded-2xl p-4">
            <Info size={18} className="shrink-0 mt-0.5 text-ink-faint" />
            <p>Tesco doesn't let other apps fill your basket, so we open each item in Tesco for you. Sign in to Tesco first, add the item, then come back and tap <strong>Added</strong>.</p>
          </div>
        )}

        {current ? (
          <section className="card p-5 mt-4 anim-rise" key={current.id}>
            <p className="eyebrow">{CATEGORIES.find(c => c.id === current.cat)?.label}</p>
            <h2 className="text-2xl font-semibold mt-1">{current.name}</h2>
            <p className="text-ink-soft mt-1">
              {current.packText ? <>Buy <strong className="text-ink">{current.packText}</strong></> : 'Buy 1'}
              {current.qtyText && <span className="text-ink-faint"> · need {current.qtyText}</span>}
            </p>
            <p className="text-sm text-ink-faint mt-0.5">For {current.daysText}</p>

            <a href={tesco.linkFor(current, state.tescoProducts)} target="_blank" rel="noopener noreferrer"
              className="btn-primary w-full h-12 text-base mt-5">
              {remembered(current.id) ? 'Open your usual product' : 'Find in Tesco'} <ExternalLink size={17} />
            </a>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button className="btn-dark" onClick={() => mark(current, true)}><Check size={17} /> Added</button>
              <button className="btn-ghost" onClick={() => mark(current, 'skip')}><SkipForward size={16} /> Skip</button>
            </div>

            {!pasting ? (
              <button className="text-sm text-ink-faint mt-4 inline-flex items-center gap-1.5 underline underline-offset-2" onClick={() => setPasting(true)}>
                <Link2 size={14} /> {remembered(current.id) ? 'Change your usual product' : 'Always buy a specific product?'}
              </button>
            ) : (
              <form className="mt-4" onSubmit={e => { e.preventDefault(); saveLink(current) }}>
                <p className="text-xs text-ink-faint mb-2">Paste the product link from Tesco (Share → Copy link).</p>
                <div className="flex gap-2">
                  <input autoFocus value={link} onChange={e => setLink(e.target.value)} placeholder="https://www.tesco.com/…/products/…"
                    className="flex-1 min-w-0 h-10 px-4 rounded-full bg-paper border border-line text-sm focus:outline-none focus:border-ink-faint" />
                  <button className="btn-dark btn-sm" type="submit">Save</button>
                </div>
              </form>
            )}
          </section>
        ) : (
          <section className="card p-6 mt-4 text-center anim-rise">
            <PartyPopper size={32} className="mx-auto text-tomato" />
            <h2 className="text-2xl font-semibold mt-2">{week.tesco?.done ? 'Order placed' : 'Basket built'}</h2>
            {!week.tesco?.done ? (
              <>
                <p className="text-ink-soft mt-2">Check out in Tesco and choose a <strong>Monday morning</strong> delivery slot.</p>
                <a href={tesco.basketUrl()} target="_blank" rel="noopener noreferrer" className="btn-ghost w-full mt-5">Open Tesco basket <ExternalLink size={16} /></a>
                <button className="btn-primary w-full h-12 mt-2" onClick={() => { actions.tescoDone(true); go('home') }}>I've placed the order</button>
                <p className="text-xs text-ink-faint mt-3">We can't see your Tesco account, so we only know what you tell us.</p>
              </>
            ) : (
              <>
                <p className="text-ink-soft mt-2">Marked as placed. Enjoy the week!</p>
                <button className="btn-ghost w-full mt-5" onClick={() => actions.tescoDone(false)}>Not placed yet</button>
              </>
            )}
          </section>
        )}

        <section className="mt-6">
          <h2 className="eyebrow mb-2">Everything</h2>
          <ul className="card divide-y divide-line">
            {items.map(i => {
              const s = status[i.id]
              return (
                <li key={i.id}>
                  <button onClick={() => { if (s) actions.tescoAdded(i.id, false); setFocus(i.id) }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left ${current?.id === i.id ? 'bg-butter/60' : ''}`}>
                    <span className={`w-5 h-5 rounded-full shrink-0 flex items-center justify-center ${s === true ? 'bg-sage text-white' : s === 'skip' ? 'bg-line text-ink-faint' : 'border-2 border-line'}`}>
                      {s === true && <Check size={12} strokeWidth={3} />}{s === 'skip' && <SkipForward size={10} />}
                    </span>
                    <span className={`flex-1 ${s ? 'text-ink-faint' : ''}`}>{i.name}</span>
                    <span className="text-xs text-ink-faint">{i.packText}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </main>
    </div>
  )
}
