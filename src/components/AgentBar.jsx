import React, { useRef, useState } from 'react'
import { ArrowUp, Sparkles } from 'lucide-react'
import { useApp } from '../context'
import { EXAMPLES } from '../agent'

export default function AgentBar() {
  const { actions } = useApp()
  const [text, setText] = useState('')
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const input = useRef(null)

  const send = async value => {
    const v = (value ?? text).trim()
    if (!v || busy) return
    setBusy(true)
    const ok = await actions.askAgent(v)
    setBusy(false)
    if (ok) { setText(''); setOpen(false); input.current?.blur() }
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-3 pb-safe pointer-events-auto">
        {open && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 anim-fade">
            {EXAMPLES.map(e => (
              <button key={e} onMouseDown={ev => ev.preventDefault()} onClick={() => send(e)}
                className="chip-off shrink-0 shadow-card">{e}</button>
            ))}
          </div>
        )}
        <form onSubmit={e => { e.preventDefault(); send() }}
          className="flex items-center gap-2 bg-paper rounded-full shadow-lift border border-line pl-4 pr-1.5 h-14 mb-1">
          <Sparkles size={18} className="text-tomato shrink-0" />
          <input
            ref={input} value={text} onChange={e => setText(e.target.value)}
            onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Ask for changes, e.g. “we’re out Thursday”"
            aria-label="Ask the meal planner"
            className="flex-1 min-w-0 bg-transparent text-[15px] placeholder:text-ink-faint focus:outline-none"
            enterKeyHint="send"
          />
          <button type="submit" aria-label="Send" disabled={!text.trim() || busy}
            className="w-11 h-11 rounded-full bg-tomato text-white flex items-center justify-center disabled:opacity-30 transition">
            <ArrowUp size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
