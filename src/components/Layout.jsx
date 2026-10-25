import React from 'react'
import { CalendarDays, ListChecks, BookOpen } from 'lucide-react'
import { useApp } from '../context'

const TABS = [
  { id: 'home', label: 'This week', Icon: CalendarDays },
  { id: 'shopping', label: 'Shopping list', Icon: ListChecks },
  { id: 'recipes', label: 'Recipes', Icon: BookOpen },
]

export const TAB_PAGES = TABS.map(t => t.id)

export function TabBar() {
  const { page, go } = useApp()
  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-line pb-safe" aria-label="Main">
      <div className="max-w-2xl mx-auto grid grid-cols-3">
        {TABS.map(({ id, label, Icon }) => {
          const on = page === id
          return (
            <button key={id} onClick={() => go(id)} aria-current={on ? 'page' : undefined}
              className={`h-16 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${on ? 'text-ink' : 'text-ink-faint'}`}>
              <Icon size={22} strokeWidth={on ? 2.4 : 1.8} />
              {label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

// The one thing to do next, pinned just above the tab bar.
export function BottomAction({ children }) {
  return (
    <div className="fixed inset-x-0 z-20 bottom-[calc(4rem+env(safe-area-inset-bottom))] pointer-events-none">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pb-3 pointer-events-auto bg-gradient-to-t from-white via-white/95 to-white/0 pt-6">
        {children}
      </div>
    </div>
  )
}

export function PageHeader({ title, subtitle, left, right }) {
  return (
    <header className="max-w-2xl mx-auto px-4 sm:px-6 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
      <div className="flex items-center gap-2 min-h-[44px]">
        {left}
        <h1 className="flex-1 min-w-0 text-[28px] leading-tight truncate">{title}</h1>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
      {subtitle && <p className="text-sm text-ink-faint mt-0.5">{subtitle}</p>}
    </header>
  )
}
