import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import SchemaSlot from '../components/SchemaSlot'
import { StepBar } from './InstallConfig'
import { getComponents, schemaKey } from '../config/components'
import { saveEntry } from '../utils/storage'
import { stringLabel } from '../utils/stringCalc'
import type { InstallOptions, StringInput, StringResult } from '../types'

interface LocationState {
  stringInput: StringInput
  stringResult: StringResult
  installOptions: InstallOptions
  selectedModelId?: string
}

const BRAND_LABEL: Record<string, string> = { huawei: '🟧 Huawei', goodwe: '🟦 GoodWe' }
const PHASE_LABEL: Record<string, string> = { mono: 'Monofásico', tri: 'Trifásico' }

export default function InstallResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const [saved, setSaved] = useState(false)

  if (!state?.installOptions) {
    navigate('/string', { replace: true })
    return null
  }

  const { stringInput, stringResult, installOptions } = state
  const { brand, phase, ccBox, caBox, battery } = installOptions
  const key = schemaKey(brand, phase, { ccBox, caBox, battery })
  const components = getComponents(brand, phase, { ccBox, caBox, battery })

  function handleSave() {
    saveEntry({
      id: crypto.randomUUID(),
      type: 'string',
      timestamp: Date.now(),
      label: `${stringLabel(stringInput, stringResult)} · ${BRAND_LABEL[brand]} · ${PHASE_LABEL[phase]}`,
      input: stringInput,
      result: stringResult,
      installOptions,
    })
    setSaved(true)
  }

  return (
    <Layout title="Componentes" showBack>
      <div className="flex flex-col gap-5 pt-2">
        <StepBar current={2} />
        <h2 className="text-white font-bold text-xl">Lista de Componentes</h2>

        <div className="flex flex-wrap gap-2">
          {[
            BRAND_LABEL[brand],
            PHASE_LABEL[phase],
            ccBox && 'Caixa CC',
            caBox && 'Caixa CA',
            battery && 'Bateria + Backup',
          ].filter(Boolean).map((tag) => (
            <span key={String(tag)} className="bg-slate-700 text-slate-300 text-xs font-medium px-3 py-1 rounded-full">
              {String(tag)}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          {components.map((item, i) => (
            <div key={i} className="bg-slate-800 rounded-xl px-4 py-3 border border-slate-700">
              <div className="flex items-start gap-3">
                <span className="mt-1 w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div>
                  <p className="text-slate-100 font-semibold text-sm">{item.name}</p>
                  {item.note && <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{item.note}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        <SchemaSlot schemaKey={key} label="Esquema de ligação desta configuração" />
        <p className="text-slate-600 text-xs text-center -mt-1">
          Guardado no dispositivo — reaparece automaticamente nesta combinação exacta
        </p>

        <button
          onClick={() =>
            navigate('/install/diagram', {
              state: {
                stringInput,
                stringResult,
                installOptions,
                selectedModelId: state.selectedModelId,
              },
            })
          }
          className="w-full rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-lg py-5 active:scale-95 transition-all shadow-lg shadow-sky-900/30 flex items-center justify-center gap-2"
        >
          Ver Esquema Unifilar
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>

        <button
          onClick={handleSave}
          disabled={saved}
          className="w-full rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 font-medium py-3 active:scale-95 transition-all text-sm"
        >
          {saved ? '✓ Configuração guardada no histórico' : 'Guardar configuração no histórico'}
        </button>
      </div>
    </Layout>
  )
}
