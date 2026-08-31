import type { HistoryEntry, StringResult, CableResult } from '../types'
import { deleteEntry } from '../utils/storage'

interface Props {
  history: HistoryEntry[]
  onDelete: (id: string) => void
}

function entryColor(entry: HistoryEntry) {
  if (entry.type === 'string') {
    return (entry.result as StringResult).ok ? 'border-emerald-600' : 'border-red-600'
  }
  const r = entry.result as CableResult
  return r.ampacityOk ? 'border-emerald-600' : 'border-yellow-600'
}

function entryIcon(entry: HistoryEntry) {
  if (entry.type === 'string') {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400 shrink-0">
        <rect x="2" y="7" width="4" height="10" rx="1"/><rect x="10" y="4" width="4" height="13" rx="1"/><rect x="18" y="2" width="4" height="15" rx="1"/>
        <path d="M4 12h6M12 8h6"/>
      </svg>
    )
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-sky-400 shrink-0">
      <path d="M5 12h14M12 5v14" strokeLinecap="round"/>
    </svg>
  )
}

export default function HistoryList({ history, onDelete }: Props) {
  if (history.length === 0) {
    return (
      <div className="text-center text-slate-500 py-8 text-sm">
        Nenhum cálculo salvo ainda.
      </div>
    )
  }

  return (
    <ul className="flex flex-col gap-2">
      {history.map((entry) => (
        <li
          key={entry.id}
          className={`flex items-center gap-3 rounded-xl border-l-4 ${entryColor(entry)} bg-slate-800 px-4 py-3`}
        >
          {entryIcon(entry)}
          <div className="flex-1 min-w-0">
            <p className="text-slate-200 text-sm font-medium truncate">{entry.label}</p>
            <p className="text-slate-500 text-xs">
              {new Date(entry.timestamp).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>
          <button
            onClick={() => {
              deleteEntry(entry.id)
              onDelete(entry.id)
            }}
            aria-label="Deletar"
            className="text-slate-600 hover:text-red-400 active:scale-90 transition-all p-1 rounded"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
            </svg>
          </button>
        </li>
      ))}
    </ul>
  )
}
