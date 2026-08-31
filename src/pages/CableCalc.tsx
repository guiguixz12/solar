import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import Field from '../components/Field'
import ResultBadge from '../components/ResultBadge'
import AmperageTable from '../components/AmperageTable'
import Tooltip from '../components/Tooltip'
import { calcCable, cableLabel } from '../utils/cableCalc'
import { saveEntry } from '../utils/storage'
import type { CableInput, CableResult, SystemVoltage, SystemType, ConductorMaterial } from '../types'

const DEFAULT: CableInput = {
  current: 10,
  distance: 15,
  systemVoltage: '48',
  systemType: 'DC',
  maxDropPct: 1.5,
  material: 'copper',
}

type SelectProps = {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  help?: string
}

function SelectField({ label, value, onChange, options, help }: SelectProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-center gap-2 text-slate-400 text-sm font-medium">
        {label}
        {help && <Tooltip text={help} />}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-white text-lg rounded-xl px-4 py-3 outline-none focus:border-sky-500 transition-colors"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  )
}

export default function CableCalc() {
  const [input, setInput] = useState<CableInput>(DEFAULT)
  const [result, setResult] = useState<CableResult | null>(null)
  const [saved, setSaved] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  function set<K extends keyof CableInput>(field: K, value: CableInput[K]) {
    setInput((prev) => ({ ...prev, [field]: value }))
    setResult(null)
    setSaved(false)
  }

  function setNum(field: keyof CableInput, value: string) {
    set(field, parseFloat(value) || 0 as CableInput[typeof field])
  }

  function handleVoltageChange(v: string) {
    const voltage = v as SystemVoltage
    const isDC = ['12', '24', '48'].includes(v)
    set('systemVoltage', voltage)
    set('systemType', isDC ? 'DC' : input.systemType === 'DC' ? 'AC1' : input.systemType)
    set('maxDropPct', isDC ? 1.5 : 3)
  }

  function calculate() {
    const r = calcCable(input)
    setResult(r)
    setSaved(false)
  }

  function save() {
    if (!result) return
    saveEntry({
      id: crypto.randomUUID(),
      type: 'cable',
      timestamp: Date.now(),
      label: cableLabel(input, result),
      input,
      result,
    })
    setSaved(true)
  }

  const isDC = input.systemType === 'DC'
  const voltageOptions: { value: SystemVoltage; label: string }[] = [
    { value: '12', label: '12 V DC' },
    { value: '24', label: '24 V DC' },
    { value: '48', label: '48 V DC' },
    { value: '230', label: '230 V AC' },
    { value: '400', label: '400 V AC' },
  ]

  return (
    <Layout title="Seção de Cabo" showBack>
      <div className="flex flex-col gap-5 pt-2">
        <h2 className="text-white font-bold text-xl">Dimensionamento de Cabo</h2>

        {result && (
          <div ref={resultRef} className="flex flex-col gap-3">
            <ResultBadge
              ok
              label="Seção mínima comercial"
              value={`${result.sectionCommercial} mm²`}
              sub={`Seção calculada ${result.sectionCalc.toFixed(2)} mm² · arredondada para a série comercial acima`}
            />
            <ResultBadge
              ok={result.dropPct <= input.maxDropPct}
              warn={result.dropPct > input.maxDropPct * 0.9 && result.dropPct <= input.maxDropPct}
              label="Queda de tensão real"
              value={`${result.dropPct.toFixed(2)}%`}
              sub={`${result.dropV.toFixed(2)} V — limite REBT ${input.maxDropPct}%`}
            />
            <ResultBadge
              ok={result.ampacityOk}
              label="Ampacidade"
              value={`${result.ampacityMax} A máx`}
              sub={result.ampacityMax > 0 ? `Circuito ${input.current} A — ${result.ampacityOk ? 'dentro da capacidade' : 'EXCEDE — aumentar seção'}` : 'Sem dado para este material'}
            />
            <button
              onClick={save}
              disabled={saved}
              className="w-full rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 font-medium py-3 active:scale-95 transition-all text-sm"
            >
              {saved ? '✓ Salvo no histórico' : 'Salvar no histórico'}
            </button>
          </div>
        )}

        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Parâmetros do Circuito</p>
          <Field
            label="Corrente do circuito"
            unit="A"
            type="number"
            step="0.1"
            min="0"
            value={input.current}
            onChange={(e) => setNum('current', e.target.value)}
            help="Corrente que vai circular no cabo. Para strings DC use o Isc do painel. Para circuitos AC use a corrente nominal da carga."
          />
          <Field
            label="Distância (ida)"
            unit="m"
            type="number"
            step="0.5"
            min="0"
            value={input.distance}
            onChange={(e) => setNum('distance', e.target.value)}
            help="Comprimento do cabo de um só lado — não some a volta. A fórmula já multiplica por 2 internamente para contar o circuito completo."
          />
          <SelectField
            label="Tensão do sistema"
            value={input.systemVoltage}
            onChange={handleVoltageChange}
            options={voltageOptions}
            help="Tensão nominal do circuito. Escolha DC para sistemas fotovoltaicos e baterias. 230 V AC para monofásico, 400 V AC para trifásico (rede)."
          />
          {!isDC && (
            <SelectField
              label="Tipo de circuito AC"
              value={input.systemType}
              onChange={(v) => set('systemType', v as SystemType)}
              options={[
                { value: 'AC1', label: 'Monofásico (1F)' },
                { value: 'AC3', label: 'Trifásico (3F)' },
              ]}
              help="Monofásico: dois condutores (fase + neutro), usado em tomadas e cargas domésticas. Trifásico: três fases, usado em motores e cargas industriais."
            />
          )}
          <Field
            label="Queda de tensão máxima admitida"
            unit="%"
            type="number"
            step="0.1"
            min="0.1"
            max="10"
            value={input.maxDropPct}
            onChange={(e) => setNum('maxDropPct', e.target.value)}
            help="Limite de queda de tensão segundo a norma REBT (Espanha). Para circuitos DC: 1,5%. Para circuitos AC: 3% (ITC-BT-19). Pode ajustar se o projeto exigir menor perda."
          />
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-4 border border-slate-700">
          <p className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider font-semibold">
            Material do Condutor
            <Tooltip text="Cobre (κ=56) tem maior condutividade — seção menor para a mesma corrente. Alumínio (κ=35) é mais barato e mais leve, mas precisa de seção maior. Para instalações FV o cobre é o mais comum." />
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['copper', 'aluminum'] as ConductorMaterial[]).map((m) => (
              <button
                key={m}
                onClick={() => set('material', m)}
                className={`rounded-xl py-4 font-semibold text-sm transition-all active:scale-95 ${
                  input.material === m
                    ? 'bg-sky-600 text-white border-2 border-sky-400'
                    : 'bg-slate-700 text-slate-300 border-2 border-transparent hover:border-slate-500'
                }`}
              >
                {m === 'copper' ? '🟤 Cobre' : '⚪ Alumínio'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={calculate}
          className="w-full rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xl py-5 active:scale-95 transition-all shadow-lg shadow-sky-900/30"
        >
          Calcular
        </button>

        <button
          onClick={() => setShowTable((v) => !v)}
          className="text-slate-400 hover:text-slate-200 text-sm underline underline-offset-2 transition-colors py-1"
        >
          {showTable ? 'Ocultar tabela de ampacidade' : 'Ver tabela de ampacidade'}
        </button>
        {showTable && (
          <AmperageTable material={input.material} highlightSection={result?.sectionCommercial} />
        )}
      </div>
    </Layout>
  )
}
