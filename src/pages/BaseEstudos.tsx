import { useState } from 'react'
import Layout from '../components/Layout'
import SchemaSlot from '../components/SchemaSlot'
import { getInvertersByBrand } from '../data/inverters'
import type { InverterSpec } from '../data/inverters'
import type { Brand } from '../types'

function Spec({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`font-semibold text-sm tabular-nums ${warn ? 'text-yellow-400' : 'text-slate-200'}`}>
        {value}
      </span>
    </div>
  )
}

function InverterCard({ inv }: { inv: InverterSpec }) {
  const [expanded, setExpanded] = useState(false)
  const schemaKey = `model_schema_${inv.id}`
  const hasUnconfirmed = inv.iMaxMppt === null || inv.notes.length > 0

  return (
    <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 active:bg-slate-700/50 transition-colors"
      >
        <div className="flex items-start gap-3 text-left">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-white font-bold text-base">{inv.model}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                inv.phaseType === 'mono' ? 'bg-sky-900 text-sky-300' : 'bg-purple-900 text-purple-300'
              }`}>
                {inv.phaseType === 'mono' ? '1F' : '3F'}
              </span>
              {hasUnconfirmed && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-900/60 text-yellow-400">
                  ⚠ Conferir
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm mt-0.5">{inv.powerKW} kW · {inv.numMppt} MPPT</p>
          </div>
        </div>
        <svg
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className={`text-slate-500 shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 px-4 py-4 flex flex-col gap-5">
          {/* Specs grid */}
          <div className="grid grid-cols-2 gap-3">
            <Spec label="Potência nominal" value={`${inv.powerKW} kW`} />
            <Spec label="Fase" value={inv.phaseType === 'mono' ? 'Monofásico' : 'Trifásico'} />
            <Spec label="Nº de MPPTs" value={String(inv.numMppt)} />
            <Spec
              label="Tensão máx. DC"
              value={`${inv.vMaxDC} V`}
              warn={inv.notes.some(n => n.toLowerCase().includes('vmaxdc') || n.toLowerCase().includes('tensão'))}
            />
            <Spec
              label="Corrente máx. / MPPT"
              value={inv.iMaxMppt !== null ? `${inv.iMaxMppt} A` : 'Conferir no manual'}
              warn={inv.iMaxMppt === null}
            />
            <Spec
              label="Strings / MPPT"
              value={inv.maxStringsPerMppt !== null ? String(inv.maxStringsPerMppt) : 'Conferir'}
              warn={inv.maxStringsPerMppt === null}
            />
          </div>

          {/* Compatible batteries */}
          <div>
            <p className="text-slate-500 text-xs mb-1.5">Baterias compatíveis</p>
            <ul className="flex flex-col gap-1">
              {inv.compatibleBatteries.map((b, i) => (
                <li key={i} className="text-slate-300 text-sm flex gap-2">
                  <span className="text-amber-500 shrink-0">·</span>{b}
                </li>
              ))}
            </ul>
          </div>

          {/* Compatible backup box */}
          <div>
            <p className="text-slate-500 text-xs mb-1.5">Backup Box compatível</p>
            <ul className="flex flex-col gap-1">
              {inv.compatibleBackupBox.map((b, i) => (
                <li key={i} className="text-slate-300 text-sm flex gap-2">
                  <span className="text-amber-500 shrink-0">·</span>{b}
                </li>
              ))}
            </ul>
          </div>

          {/* Notes to verify */}
          {inv.notes.length > 0 && (
            <div className="rounded-xl bg-yellow-900/20 border border-yellow-700/50 px-3 py-3 flex flex-col gap-1">
              <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">⚠ Conferir no manual</p>
              {inv.notes.map((n, i) => (
                <p key={i} className="text-yellow-300/80 text-xs leading-relaxed">· {n}</p>
              ))}
            </div>
          )}

          {/* Manual link */}
          {inv.manualUrl ? (
            <a
              href={inv.manualUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sky-400 hover:text-sky-300 transition-colors text-sm font-medium"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Manual oficial (PDF)
            </a>
          ) : (
            <p className="text-slate-600 text-xs italic">
              Manual não configurado — adicionar URL em src/data/inverters.ts
            </p>
          )}

          {/* Schema upload */}
          <div className="pt-1 border-t border-slate-700">
            <SchemaSlot schemaKey={schemaKey} label="Esquema de ligação do modelo" />
          </div>
        </div>
      )}
    </div>
  )
}

export default function BaseEstudos() {
  const [brand, setBrand] = useState<Brand>('huawei')
  const inverters = getInvertersByBrand(brand)

  return (
    <Layout title="Base de Estudos" showBack>
      <div className="flex flex-col gap-5 pt-2">
        <h2 className="text-white font-bold text-xl">Base de Estudos</h2>
        <p className="text-slate-400 text-sm -mt-2">
          Especificações de inversores híbridos. Valores marcados com ⚠ devem ser confirmados no manual antes de usar em campo.
        </p>

        {/* Brand toggle */}
        <div className="flex gap-3">
          {(['huawei', 'goodwe'] as Brand[]).map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`flex-1 rounded-xl py-3 font-semibold text-sm transition-all active:scale-95 border-2 ${
                brand === b
                  ? 'bg-amber-500 text-slate-900 border-amber-400'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
              }`}
            >
              {b === 'huawei' ? '🟧 Huawei' : '🟦 GoodWe'}
            </button>
          ))}
        </div>

        {/* Model cards */}
        <div className="flex flex-col gap-3">
          {inverters.map((inv) => (
            <InverterCard key={inv.id} inv={inv} />
          ))}
        </div>

        <p className="text-slate-600 text-xs text-center pb-2">
          Para adicionar/editar modelos: <span className="font-mono">src/data/inverters.ts</span>
        </p>
      </div>
    </Layout>
  )
}
