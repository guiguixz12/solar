import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  text: string
}

interface PopupPos {
  top: number
  left: number
  above: boolean
}

export default function Tooltip({ text }: Props) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<PopupPos>({ top: 0, left: 0, above: true })
  const btnRef = useRef<HTMLButtonElement>(null)
  const POPUP_W = 264

  function handleOpen() {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const spaceAbove = rect.top
    const above = spaceAbove > 140

    // Keep popup within horizontal viewport bounds
    const rawLeft = rect.left
    const left = Math.max(8, Math.min(rawLeft, window.innerWidth - POPUP_W - 8))

    setPos({
      top: above ? rect.top - 8 : rect.bottom + 8,
      left,
      above,
    })
    setOpen((v) => !v)
  }

  useEffect(() => {
    if (!open) return
    function close(e: MouseEvent | TouchEvent) {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [open])

  const popup = open
    ? createPortal(
        <div
          style={{
            position: 'fixed',
            top: pos.above ? undefined : pos.top,
            bottom: pos.above ? window.innerHeight - pos.top : undefined,
            left: pos.left,
            width: POPUP_W,
            zIndex: 9999,
          }}
          className="rounded-xl bg-slate-700 border border-slate-600 shadow-2xl p-3 text-slate-200 text-sm leading-relaxed"
        >
          {text}
          <div
            className={`absolute left-3 w-3 h-3 bg-slate-700 border-slate-600 ${
              pos.above
                ? '-bottom-1.5 border-r border-b rotate-45'
                : '-top-1.5 border-l border-t rotate-45'
            }`}
          />
        </div>,
        document.body,
      )
    : null

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        aria-label="Ajuda"
        className="w-5 h-5 rounded-full bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-slate-200 text-xs font-bold flex items-center justify-center transition-colors shrink-0"
      >
        ?
      </button>
      {popup}
    </>
  )
}
