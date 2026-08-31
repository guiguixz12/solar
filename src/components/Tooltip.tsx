import { useState, useEffect, useRef } from 'react'

interface Props {
  text: string
}

export default function Tooltip({ text }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    document.addEventListener('touchstart', handle)
    return () => {
      document.removeEventListener('mousedown', handle)
      document.removeEventListener('touchstart', handle)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Ajuda"
        className="w-5 h-5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center justify-center transition-colors shrink-0"
      >
        ?
      </button>
      {open && (
        <div className="absolute bottom-7 left-0 z-50 w-64 rounded-xl bg-slate-700 border border-slate-600 shadow-xl p-3 text-slate-200 text-sm leading-relaxed">
          {text}
          <div className="absolute -bottom-1.5 left-3 w-3 h-3 bg-slate-700 border-r border-b border-slate-600 rotate-45" />
        </div>
      )}
    </div>
  )
}
