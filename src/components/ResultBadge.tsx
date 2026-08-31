interface Props {
  ok: boolean
  warn?: boolean
  label: string
  value: string
  sub?: string
}

export default function ResultBadge({ ok, warn, label, value, sub }: Props) {
  const bg = ok ? 'bg-emerald-900/60 border-emerald-500' : warn ? 'bg-yellow-900/60 border-yellow-500' : 'bg-red-900/60 border-red-500'
  const text = ok ? 'text-emerald-300' : warn ? 'text-yellow-300' : 'text-red-300'
  const dot = ok ? 'bg-emerald-400' : warn ? 'bg-yellow-400' : 'bg-red-400'

  return (
    <div className={`rounded-2xl border-2 ${bg} p-4 flex flex-col gap-1`}>
      <div className="flex items-center gap-2">
        <span className={`inline-block w-3 h-3 rounded-full ${dot} shrink-0`} />
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-3xl font-bold tabular-nums ${text}`}>{value}</span>
      {sub && <span className="text-slate-400 text-sm">{sub}</span>}
    </div>
  )
}
