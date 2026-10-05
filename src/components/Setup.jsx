import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useApp } from '../context'
import PreferencesForm from './PreferencesForm'
import { DEFAULT_PREFS } from '../domain/prefs'

export default function Setup() {
  const { actions } = useApp()
  const [prefs, setPrefs] = useState({ ...DEFAULT_PREFS })

  return (
    <div className="min-h-[100dvh] bg-cream">
      <div className="max-w-xl mx-auto px-5 pt-10 pb-32">
        <p className="eyebrow text-tomato">What's for tea?</p>
        <h1 className="text-[34px] leading-tight font-semibold mt-2">Weeknight dinners, sorted in five minutes.</h1>
        <p className="text-ink-soft mt-3">
          A few quick questions, then we'll suggest Monday to Friday and build your Tesco list. You can change all of this later.
        </p>
        <div className="mt-4">
          <PreferencesForm prefs={prefs} onChange={setPrefs} />
        </div>
      </div>
      <div className="fixed bottom-0 inset-x-0 bg-cream/90 backdrop-blur border-t border-line">
        <div className="max-w-xl mx-auto px-5 py-3 pb-safe">
          <button className="btn-primary w-full h-12 text-base" onClick={() => actions.finishSetup(prefs)}>
            Plan our week <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
