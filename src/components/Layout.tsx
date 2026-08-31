import { useNavigate, useLocation } from 'react-router-dom'
import { type ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  showBack?: boolean
}

export default function Layout({ title, children, showBack = false }: Props) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-svh bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700 flex items-center gap-3 px-4 py-3">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="text-slate-300 hover:text-white active:scale-95 transition-transform p-1 rounded-lg"
            aria-label="Voltar"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-amber-400" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
          </svg>
          <span className="text-amber-400 font-bold text-lg tracking-tight">SolarField</span>
        </div>
        {location.pathname !== '/' && (
          <span className="text-slate-400 text-sm ml-1">/ {title}</span>
        )}
      </header>

      {/* Content */}
      <main className="flex-1 p-4 max-w-lg mx-auto w-full pb-8">
        {children}
      </main>
    </div>
  )
}
