import { AMPACITY, COMMERCIAL_SECTIONS } from '../utils/cableCalc'
import type { ConductorMaterial } from '../types'

interface Props {
  material: ConductorMaterial
  highlightSection?: number
}

export default function AmperageTable({ material, highlightSection }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700">
      <div className="bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        Ampacidade — {material === 'copper' ? 'Cobre' : 'Alumínio'} XLPE, ar livre
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800/50 text-slate-400 text-xs">
            <th className="py-2 px-4 text-left font-medium">Seção (mm²)</th>
            <th className="py-2 px-4 text-right font-medium">I máx (A)</th>
          </tr>
        </thead>
        <tbody>
          {COMMERCIAL_SECTIONS.map((s) => {
            const amp = AMPACITY[s]
            const val = material === 'copper' ? amp.copper : amp.aluminum
            const isHighlight = s === highlightSection
            return (
              <tr
                key={s}
                className={isHighlight
                  ? 'bg-amber-900/40 border-l-2 border-amber-400'
                  : 'border-t border-slate-800 even:bg-slate-800/30'}
              >
                <td className={`py-2 px-4 font-mono tabular-nums ${isHighlight ? 'text-amber-300 font-bold' : 'text-slate-300'}`}>
                  {s}
                </td>
                <td className={`py-2 px-4 text-right font-mono tabular-nums ${isHighlight ? 'text-amber-300 font-bold' : val ? 'text-slate-300' : 'text-slate-600'}`}>
                  {val != null ? val : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
