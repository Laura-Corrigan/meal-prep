import React, { useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { useApp } from '../context'
import { Sheet } from './ui'
import { EXAMPLES } from '../agent'

// Plain-English changes to the plan ("we're out Thursday"). Tucked behind the
// Ask button so the week stays the main thing on screen.
export default function AskSheet({ open, onClose }) {
  const { actions } = useApp()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  const send = async value => {
    const v = (value ?? text).trim()
    if (!v || busy) return
    setBusy(true)
    const ok = await actions.askAgent(v)
    setBusy(false)
    if (ok) { setText(''); onClose() }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Change the plan">
      <div className="px-5 pb-6">
        <form onSubmit={e => { e.preventDefault(); send() }}
          className="flex items-center gap-2 bg-mist rounded-full pl-5 pr-1.5 h-14">
          <input autoFocus value={text} onChange={e => setText(e.target.value)} enterKeyHint="send"
            placeholder="e.g. we're out Thursday" aria-label="What should we change?"
            className="flex-1 min-w-0 bg-transparent text-base placeholder:text-ink-faint focus:outline-none" />
          <button type="submit" aria-label="Send" disabled={!text.trim() || busy}
            className="w-11 h-11 rounded-full bg-ink text-white flex items-center justify-center disabled:opacity-25 transition">
            <ArrowUp size={20} />
          </button>
        </form>
        <p className="eyebrow mt-5 mb-2">Try</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(e => <button key={e} onClick={() => send(e)} className="chip-off">{e}</button>)}
        </div>
      </div>
    </Sheet>
  )
}
