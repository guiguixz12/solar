import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import Field from '../components/Field'
import ResultBadge from '../components/ResultBadge'
import { StepBar } from './InstallConfig'
import { calcString, stringLabel } from '../utils/stringCalc'
import { saveEntry, loadHistory } from '../utils/storage'
import { getInvertersByBrand, getInverterById } from '../data/inverters'
import type { StringInput, StringResult, Brand } from '../types'

const DEFAULT: StringInput = {
  voc: 40.2,
  coefTemp: -0.29,
  isc: 10.5,
  tempMin: -10,
  vMaxInverter: 1000,
  iMaxMppt: 15,
  numModules: 20,
  numStrings: 1,
}

function pct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

export default function StringCalc() {
  const navigate = useNavigate()
  const [input, setInput] = useState<StringInput>(DEFAULT)
  const [result, setResult] = useState<StringResult | null>(null)
  const [saved, setSaved] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)
  const [selectedBrand, setSelectedBrand] = useState<Brand | ''>('')
  const [selectedModelId, setSelectedModelId] = useState<string>('')

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [result])

  function set(field: keyof StringInput, value: string) {
    setInput((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }))
    setResult(null)
    setSaved(false)
  }

  function handleBrandChange(brand: Brand | '') {
    setSelectedBrand(brand)
    setSelectedModelId('')
  }

  function handleModelChange(modelId: string) {
    setSelectedModelId(modelId)
    if (!modelId) return
    const inv = getInverterById(modelId)
    if (!inv) return
    setInput((prev) => ({
      ...prev,
      vMaxInverter: inv.vMaxDC,
      ...(inv.iMaxMppt !== null ? { iMaxMppt: inv.iMaxMppt } : {}),
    }))
    setResult(null)
    setSaved(false)
  }

  function calculate() {
    const r = calcString(input)
    setResult(r)
    setSaved(false)
  }

  function save() {
    if (!result) return
    const history = loadHistory()
    if (history.length >= 10) history.pop()
    saveEntry({
      id: crypto.randomUUID(),
      type: 'string',
      timestamp: Date.now(),
      label: stringLabel(input, result),
      input,
      result,
    })
    setSaved(true)
  }

  return (
    <Layout title="String PV" showBack>
      <div className="flex flex-col gap-5 pt-2">
        <StepBar current={0} />
        <h2 className="text-white font-bold text-xl">Dimensionamento de String</h2>

        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Dados do Painel (datasheet)</p>
          <Field
            label="Voc"
            unit="V"
            type="number"
            step="0.1"
            value={input.voc}
            onChange={(e) => set('voc', e.target.value)}
            help="Tensão de circuito aberto do painel em condições padrão (STC, 25 °C). Encontre na ficha técnica do painel — normalmente entre 30 V e 50 V."
          />
          <Field
            label="Coeficiente de temperatura de Voc"
            unit="%/°C"
            type="number"
            step="0.01"
            value={input.coefTemp}
            onChange={(e) => set('coefTemp', e.target.value)}
            help="Variação do Voc por grau Celsius. Valor negativo (ex: -0,29 %/°C) — quanto mais frio, maior o Voc. Está na ficha técnica do painel."
          />
          <Field
            label="Isc"
            unit="A"
            type="number"
            step="0.01"
            value={input.isc}
            onChange={(e) => set('isc', e.target.value)}
            help="Corrente de curto-circuito do painel em STC. É a corrente máxima que o painel pode gerar. Está na ficha técnica."
          />
        </div>

        {/* Inverter pre-fill */}
        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Pré-preenchimento — Inversor</p>

          <label className="flex flex-col gap-1.5">
            <span className="text-slate-400 text-sm font-medium">Marca</span>
            <select
              value={selectedBrand}
              onChange={(e) => handleBrandChange(e.target.value as Brand | '')}
              className="bg-slate-800 border border-slate-700 text-white text-lg rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition-colors"
            >
              <option value="">— Manual (sem pré-preenchimento)</option>
              <option value="huawei">🟧 Huawei</option>
              <option value="goodwe">🟦 GoodWe</option>
            </select>
          </label>

          {selectedBrand && (
            <label className="flex flex-col gap-1.5">
              <span className="text-slate-400 text-sm font-medium">Modelo</span>
              <select
                value={selectedModelId}
                onChange={(e) => handleModelChange(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white text-lg rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">— Seleccionar modelo</option>
                {getInvertersByBrand(selectedBrand).map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.model} ({inv.powerKW} kW)
                    {inv.iMaxMppt === null ? ' ⚠' : ''}
                  </option>
                ))}
              </select>
              {selectedModelId && getInverterById(selectedModelId)?.iMaxMppt === null && (
                <p className="text-yellow-400 text-xs">
                  ⚠ Corrente máx. MPPT não confirmada — verifique no manual e ajuste o campo abaixo.
                </p>
              )}
            </label>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Local e Inversor</p>
          <Field
            label="Temperatura mínima do local"
            unit="°C"
            type="number"
            step="1"
            value={input.tempMin}
            onChange={(e) => set('tempMin', e.target.value)}
            help="Temperatura mínima histórica do local da instalação. Quanto mais frio, maior fica o Voc — e maior o risco de danificar o inversor. Use -10 °C se não souber."
          />
          <Field
            label="Tensão máxima do inversor"
            unit="V"
            type="number"
            step="1"
            value={input.vMaxInverter}
            onChange={(e) => set('vMaxInverter', e.target.value)}
            help="Tensão DC máxima admissível na entrada do inversor. Nunca pode ser ultrapassada — pode destruir o inversor. Está na ficha técnica do inversor (ex: 1000 V ou 1500 V)."
          />
          <Field
            label="Corrente máxima por MPPT"
            unit="A"
            type="number"
            step="0.1"
            value={input.iMaxMppt}
            onChange={(e) => set('iMaxMppt', e.target.value)}
            help="Corrente DC máxima que cada entrada MPPT do inversor suporta. Este limite é por MPPT individual — se o inversor tiver 2 MPPTs, cada um tem o seu próprio limite. Está na ficha técnica do inversor."
          />
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-4 flex flex-col gap-4 border border-slate-700">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">String a testar</p>
          <Field
            label="Número de módulos em série"
            unit="un"
            type="number"
            step="1"
            min="1"
            value={input.numModules}
            onChange={(e) => set('numModules', e.target.value)}
            help="Quantidade de painéis ligados em série nesta string. A tensão da string é Voc × número de módulos — esse é o valor que não pode exceder a tensão máxima do inversor."
          />
          <Field
            label="Strings em paralelo no mesmo MPPT"
            unit="un"
            type="number"
            step="1"
            min="1"
            value={input.numStrings}
            onChange={(e) => set('numStrings', e.target.value)}
            help="Quantas strings estão ligadas em paralelo na mesma entrada MPPT. A corrente total no MPPT é Isc × este número — não pode exceder a corrente máxima por MPPT do inversor."
          />
        </div>

        <button
          onClick={calculate}
          className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xl py-5 active:scale-95 transition-all shadow-lg shadow-amber-900/30"
        >
          Calcular
        </button>

        {result && (
          <div ref={resultRef} className="flex flex-col gap-3">
            <ResultBadge
              ok={result.voltageOk}
              label="Tensão da String"
              value={`${result.stringVoltage.toFixed(1)} V`}
              sub={`Voc corrigida ${result.vocCorrected.toFixed(2)} V/módulo · margem ${pct(result.voltageMarginPct)} · máx ${result.numModulesMax} módulos`}
            />
            <div className="rounded-2xl border border-slate-700 bg-slate-800/60 px-4 py-3 flex items-center justify-between">
              <span className="text-slate-400 text-sm">Corrente por string (Isc)</span>
              <span className="text-slate-200 font-mono font-bold text-lg tabular-nums">{input.isc.toFixed(2)} A</span>
            </div>
            <ResultBadge
              ok={result.currentOk}
              label={`Corrente total no MPPT${input.numStrings > 1 ? ` (${input.numStrings} strings)` : ''}`}
              value={`${result.totalMpptCurrent.toFixed(2)} A`}
              sub={`Limite por MPPT: ${input.iMaxMppt} A · margem ${pct(result.currentMarginPct)}${input.numStrings > 1 ? ' · limite é por MPPT, não pelo inversor inteiro' : ''}`}
            />
            <div className={`rounded-2xl border-2 p-4 text-center font-bold text-2xl ${result.ok ? 'border-emerald-500 text-emerald-300 bg-emerald-900/40' : 'border-red-500 text-red-300 bg-red-900/40'}`}>
              {result.ok ? '✓ STRING OK' : '✗ STRING INVÁLIDA'}
            </div>
            {result.ok && (
              <button
                onClick={() => navigate('/install/config', { state: { stringInput: input, stringResult: result, selectedModelId } })}
                className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg py-4 active:scale-95 transition-all shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                Continuar para configuração
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>
            )}
            <button
              onClick={save}
              disabled={saved}
              className="w-full rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-40 text-slate-200 font-medium py-3 active:scale-95 transition-all text-sm"
            >
              {saved ? '✓ Salvo no histórico' : 'Salvar só a string no histórico'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}
