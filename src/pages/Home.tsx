import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import HistoryList from '../components/HistoryList'
import { loadHistory } from '../utils/storage'
import type { HistoryEntry } from '../types'

function CalcCard({
  title,
  description,
  icon,
  accent,
  onClick,
}: {
  title: string
  description: string
  icon: React.ReactNode
  accent: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl border-2 ${accent} bg-slate-800 p-6 flex items-center gap-5 active:scale-[0.98] transition-transform text-left shadow-lg`}
    >
      <div className="text-4xl">{icon}</div>
      <div>
        <h2 className="text-white font-bold text-xl">{title}</h2>
        <p className="text-slate-400 text-sm mt-1">{description}</p>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-slate-500 ml-auto shrink-0">
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  )
}

export default function Home() {
  const navigate = useNavigate()
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  return (
    <Layout title="Início">
      <div className="flex flex-col gap-6 pt-2">
        {/* Brand */}
        <div className="text-center py-4">
          <h1 className="text-3xl font-bold text-white tracking-tight">SolarField</h1>
          <p className="text-slate-400 text-sm mt-1">Calculadora fotovoltaica offline</p>
        </div>

        {/* Main cards */}
        <div className="flex flex-col gap-4">
          <CalcCard
            title="String PV"
            description="Dimensionamento de string fotovoltaica e validação de tensão"
            icon={
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
                <rect x="2" y="8" width="6" height="9" rx="1"/>
                <rect x="9" y="5" width="6" height="12" rx="1"/>
                <rect x="16" y="2" width="6" height="15" rx="1"/>
                <path d="M5 12h4M11 8h5" strokeLinecap="round"/>
              </svg>
            }
            accent="border-amber-600 hover:border-amber-400"
            onClick={() => navigate('/string')}
          />
          <CalcCard
            title="Seção de Cabo"
            description="Queda de tensão e seção mínima (norma REBT)"
            icon={
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sky-400">
                <path d="M3 12h4l2-5 4 10 2-5h6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            accent="border-sky-600 hover:border-sky-400"
            onClick={() => navigate('/cable')}
          />
          <CalcCard
            title="Base de Estudos"
            description="Especificações de inversores Huawei e GoodWe, esquemas de ligação"
            icon={
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="9" y1="7" x2="15" y2="7" strokeLinecap="round"/>
                <line x1="9" y1="11" x2="15" y2="11" strokeLinecap="round"/>
              </svg>
            }
            accent="border-emerald-700 hover:border-emerald-500"
            onClick={() => navigate('/base-estudos')}
          />
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-slate-300 font-semibold text-base">Histórico recente</h3>
            {history.length > 0 && (
              <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">{history.length}/10</span>
            )}
          </div>
          <HistoryList
            history={history}
            onDelete={(id) => setHistory((h) => h.filter((e) => e.id !== id))}
          />
        </div>
      </div>
    </Layout>
  )
}
