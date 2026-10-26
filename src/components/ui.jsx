import React, { useEffect, useState } from 'react'
import { X, UtensilsCrossed } from 'lucide-react'

// Bottom sheet on mobile, centred dialog on larger screens.
export function Sheet({ open, onClose, title, children, full = false, footer }) {
  useEffect(() => {
    if (!open) return
    const onKey = e => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 anim-fade" onClick={onClose} />
      <div
        role="dialog" aria-modal="true" aria-label={title}
        className={`relative w-full sm:max-w-xl bg-white anim-rise flex flex-col ${full ? 'h-[100dvh] sm:h-[92vh] sm:rounded-3xl' : 'max-h-[88dvh] rounded-t-3xl sm:rounded-3xl'} overflow-hidden`}
      >
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h2 className="text-xl font-extrabold">{title}</h2>
            <IconButton label="Close" onClick={onClose}><X size={20} /></IconButton>
          </div>
        )}
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="border-t border-line bg-paper px-5 py-3 pb-safe">{footer}</div>}
      </div>
    </div>
  )
}

export function IconButton({ label, onClick, children, className = '', active = false }) {
  return (
    <button
      type="button" aria-label={label} title={label} onClick={onClick}
      className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center transition active:scale-95 ${active ? 'bg-ink text-white' : 'bg-paper border border-line text-ink-soft hover:text-ink'} ${className}`}
    >
      {children}
    </button>
  )
}

const unsplash = (src, w) => `${src}?auto=format&fit=crop&w=${w}&q=70`

export function FoodImage({ recipe, className = '', width = 400, rounded = 'rounded-2xl', eager = false }) {
  const [failed, setFailed] = useState(null)
  if (!recipe?.image?.src || failed === recipe.image.src) {
    return (
      <div className={`${className} ${rounded} bg-mist flex items-center justify-center text-ink-faint`}>
        <UtensilsCrossed size={28} />
      </div>
    )
  }
  const isUnsplash = recipe.image.src.includes('images.unsplash.com')
  const src = isUnsplash ? unsplash(recipe.image.src, width) : recipe.image.src
  const srcSet = isUnsplash && width >= 800 ? [600, 900, 1200].map(w => `${unsplash(recipe.image.src, w)} ${w}w`).join(', ') : undefined
  return (
    <img
      key={src} src={src} srcSet={srcSet} sizes={srcSet ? '(min-width: 672px) 672px, 100vw' : undefined}
      alt={recipe.name} loading={eager ? 'eager' : 'lazy'} fetchpriority={eager ? 'high' : undefined}
      onError={() => setFailed(recipe.image.src)}
      className={`${className} ${rounded} object-cover bg-mist`}
    />
  )
}

export function Chips({ options, value, onToggle, multi = true }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => {
        const on = multi ? value.includes(o.id) : value === o.id
        return (
          <button key={o.id} type="button" aria-pressed={on} onClick={() => onToggle(o.id)} className={on ? 'chip-on' : 'chip-off'}>
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, toast.undo ? 7000 : 4000)
    return () => clearTimeout(t)
  }, [toast, onClose])
  if (!toast) return null
  return (
    <div className="fixed left-0 right-0 top-[max(0.75rem,env(safe-area-inset-top))] z-[60] flex justify-center px-4 pointer-events-none">
      <div role="status" className="pointer-events-auto anim-rise max-w-md w-full bg-ink text-white rounded-2xl shadow-lift px-4 py-3 flex items-start gap-3">
        <div className="flex-1 text-sm leading-relaxed">
          {toast.title && <p className="font-semibold">{toast.title}</p>}
          {toast.lines?.slice(0, 4).map((l, i) => <p key={i} className="text-white/80">{l}</p>)}
        </div>
        {toast.undo && (
          <button onClick={() => { toast.undo(); onClose() }} className="text-sm font-semibold text-butter underline underline-offset-2 shrink-0 py-0.5">
            Undo
          </button>
        )}
      </div>
    </div>
  )
}
