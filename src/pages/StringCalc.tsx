import { useState, useEffect, useRef } from 'react'
import Layout from '../components/Layout'
import Field from '../components/Field'
import ResultBadge from '../components/ResultBadge'
import { calcString, stringLabel } from '../utils/stringCalc'
import { saveEntry, loadHistory } from '../utils/storage'
import type { StringInput, StringResult } from '../types'

const DEFAULT: StringInput = {
  voc: 40.2,
  coefTemp: -0.29,
  isc: 10.5,
  tempMin: -10,
  vMaxInverter: 1000,
  iMaxMppt: 15,
  numModules: 20,
}

function pct(n: number) {
  return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`
}

export default function StringCalc() {
  const [input, setInput] = useState<StringInput>(DEFAULT)
  const [result, setResult] = useState<StringResult | null>(null)
  const [saved, setSaved] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

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
        <h2 className="text-white font-bold text-xl">Dimensionamento de String</h2>

        {result && (
          <div ref={resultRef} className="flex flex-col gap-3">
            <ResultBadge
              ok={result.voltageOk}
              label="Tensão da String"
              value={`${result.stringVoltage.toFixed(1)} V`}
              sub={`Voc corrigida ${result.vocCorrected.toFixed(2)} V/módulo · margem ${pct(result.voltageMarginPct)} · máx ${input.numModules > 0 ? result.numModulesMax : '—'} módulos`}
            />
            <ResultBadge
              ok={result.currentOk}
              label="Corrente Isc"
              value={`${input.isc.toFixed(2)} A`}
              sub={`Máx MPPT ${input.iMaxMppt} A · margem ${pct(result.currentMarginPct)}`}
            />
            <div className={`rounded-2xl border-2 p-4 text-center font-bold text-2xl ${result.ok ? 'border-emerald-500 text-emerald-300 bg-emerald-900/40' : 'border-red-500 text-red-300 bg-red-900/40'}`}>
              {result.ok ? '✓ STRING OK' : '✗ STRING INVÁLIDA'}
            </div>
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
            help="Corrente DC máxima que cada entrada MPPT do inversor suporta. O Isc do painel não pode ultrapassar este valor. Está na ficha técnica do inversor."
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
        </div>

        <button
          onClick={calculate}
          className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xl py-5 active:scale-95 transition-all shadow-lg shadow-amber-900/30"
        >
          Calcular
        </button>
      </div>
    </Layout>
  )
}
