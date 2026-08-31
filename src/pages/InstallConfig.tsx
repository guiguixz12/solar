import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import type { Brand, Phase, InstallOptions, StringInput, StringResult } from '../types'

interface LocationState {
  stringInput: StringInput
  stringResult: StringResult
}

type ToggleButtonProps = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToggleButton({ active, onClick, children }: ToggleButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-xl py-4 font-semibold text-sm transition-all active:scale-95 border-2 ${
        active
          ? 'bg-amber-500 text-slate-900 border-amber-400'
          : 'bg-slate-700 text-slate-300 border-transparent hover:border-slate-500'
      }`}
    >
      {children}
    </button>
  )
}

type CheckRowProps = {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  description: string
}

function CheckRow({ checked, onChange, label, description }: CheckRowProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full flex items-start gap-4 rounded-xl p-4 border-2 text-left transition-all active:scale-[0.98] ${
        checked ? 'border-amber-500 bg-amber-900/20' : 'border-slate-700 bg-slate-800/50'
      }`}
    >
      <span className={`mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked ? 'border-amber-400 bg-amber-500' : 'border-slate-600'
      }`}>
        {checked && (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-900">
            <path d="M2 7l4 4 6-6" />
          </svg>
        )}
      </span>
      <div>
        <p className={`font-semibold text-base ${checked ? 'text-amber-300' : 'text-slate-200'}`}>{label}</p>
        <p className="text-slate-500 text-sm mt-0.5">{description}</p>
      </div>
    </button>
  )
}

const STEP_LABELS = ['String PV', 'Configuração', 'Componentes']

function StepBar({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1 mb-2">
      {STEP_LABELS.map((label, i) => (
        <div key={i} className="flex items-center gap-1 flex-1 min-w-0">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            i < current ? 'bg-emerald-500 text-white' : i === current ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-500'
          }`}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={`text-xs truncate ${i === current ? 'text-amber-400' : 'text-slate-500'}`}>{label}</span>
          {i < STEP_LABELS.length - 1 && <div className="flex-1 h-px bg-slate-700 mx-1" />}
        </div>
      ))}
    </div>
  )
}

export { StepBar, STEP_LABELS }

export default function InstallConfig() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [brand, setBrand] = useState<Brand>('huawei')
  const [phase, setPhase] = useState<Phase>('mono')
  const [ccBox, setCcBox] = useState(false)
  const [caBox, setCaBox] = useState(false)
  const [battery, setBattery] = useState(false)

  if (!state?.stringResult) {
    navigate('/string', { replace: true })
    return null
  }

  function next() {
    const opts: InstallOptions = { brand, phase, ccBox, caBox, battery }
    navigate('/install/result', {
      state: {
        stringInput: state!.stringInput,
        stringResult: state!.stringResult,
        installOptions: opts,
      },
    })
  }

  return (
    <Layout title="Configuração" showBack>
      <div className="flex flex-col gap-5 pt-2">
        <StepBar current={1} />
        <h2 className="text-white font-bold text-xl">Configuração da Instalação</h2>

        {/* Brand */}
        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-3 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Marca do sistema</p>
          <div className="flex gap-3">
            <ToggleButton active={brand === 'huawei'} onClick={() => setBrand('huawei')}>
              🟧 Huawei
            </ToggleButton>
            <ToggleButton active={brand === 'goodwe'} onClick={() => setBrand('goodwe')}>
              🟦 GoodWe
            </ToggleButton>
          </div>
        </div>

        {/* Phase */}
        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-3 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Fase da instalação</p>
          <div className="flex gap-3">
            <ToggleButton active={phase === 'mono'} onClick={() => setPhase('mono')}>
              1F — Monofásico
            </ToggleButton>
            <ToggleButton active={phase === 'tri'} onClick={() => setPhase('tri')}>
              3F — Trifásico
            </ToggleButton>
          </div>
        </div>

        {/* Options */}
        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-3 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Componentes da instalação</p>
          <CheckRow
            checked={ccBox}
            onChange={setCcBox}
            label="Caixa CC"
            description="Proteção e combinador DC (fusíveis por string + DPS DC)"
          />
          <CheckRow
            checked={caBox}
            onChange={setCaBox}
            label="Caixa CA"
            description="Proteção e seccionamento AC (disjuntor + DPS AC)"
          />
          <CheckRow
            checked={battery}
            onChange={setBattery}
            label="Bateria + Backup Box"
            description="Armazenamento de energia e backup em caso de falha de rede"
          />
        </div>

        <button
          onClick={next}
          className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xl py-5 active:scale-95 transition-all shadow-lg shadow-amber-900/30"
        >
          Ver Componentes →
        </button>
      </div>
    </Layout>
  )
}
