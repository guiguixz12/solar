import { type InputHTMLAttributes } from 'react'
import Tooltip from './Tooltip'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  unit?: string
  help?: string
}

export default function Field({ label, unit, help, className, ...props }: Props) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-slate-400 text-sm font-medium">
        {label}
        {help && <Tooltip text={help} />}
      </span>
      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus-within:border-amber-500 transition-colors">
        <input
          {...props}
          className={`flex-1 bg-transparent text-white text-xl tabular-nums outline-none min-w-0 ${className ?? ''}`}
        />
        {unit && <span className="text-slate-500 text-sm shrink-0">{unit}</span>}
      </div>
    </label>
  )
}
