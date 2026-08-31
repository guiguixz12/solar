import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { StepBar } from './InstallConfig'
import { getInverterById } from '../data/inverters'
import { loadHistory, saveEntry } from '../utils/storage'
import { stringLabel } from '../utils/stringCalc'
import type { StringInput, StringResult, InstallOptions } from '../types'

interface LocationState {
  stringInput: StringInput
  stringResult: StringResult
  installOptions: InstallOptions
  selectedModelId?: string
}

const BW = 58   // block width
const BH = 56   // block height
const GAP = 22  // gap between blocks (arrow space)
const PAD = 8   // horizontal padding

interface DiagBlock {
  id: string
  fill: string
  stroke: string
  title: string
  sub1: string
  sub2?: string
  missing?: boolean
}

function Arrow({
  x0, x1, y, isDC, label,
}: {
  x0: number; x1: number; y: number; isDC: boolean; label?: string
}) {
  const color = isDC ? '#d97706' : '#0284c7'
  const labelColor = isDC ? '#fbbf24' : '#38bdf8'
  const midX = (x0 + x1) / 2
  return (
    <g>
      <line x1={x0} y1={y} x2={x1 - 7} y2={y} stroke={color} strokeWidth={2} />
      <polygon
        points={`${x1},${y} ${x1 - 8},${y - 4} ${x1 - 8},${y + 4}`}
        fill={color}
      />
      {label && (
        <text
          x={midX}
          y={y + 13}
          textAnchor="middle"
          fontSize={6}
          fill={labelColor}
          fontFamily="monospace"
        >
          {label}
        </text>
      )}
    </g>
  )
}

function Block({ block, cx, ry }: { block: DiagBlock; cx: number; ry: number }) {
  const bx = cx - BW / 2
  return (
    <g>
      <rect
        x={bx} y={ry} width={BW} height={BH} rx={6}
        fill={block.fill}
        stroke={block.stroke}
        strokeWidth={1.5}
        strokeDasharray={block.missing ? '4,3' : undefined}
      />
      <text x={cx} y={ry + 17} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#f1f5f9" fontFamily="sans-serif">
        {block.title}
      </text>
      <text x={cx} y={ry + 29} textAnchor="middle" fontSize={7} fill="#94a3b8" fontFamily="sans-serif">
        {block.sub1}
      </text>
      {block.sub2 && (
        <text x={cx} y={ry + 41} textAnchor="middle" fontSize={6.5} fill="#64748b" fontFamily="sans-serif">
          {block.sub2}
        </text>
      )}
      {block.missing && (
        <text x={cx} y={ry + 52} textAnchor="middle" fontSize={9} fill="#94a3b8" fontFamily="monospace">
          ?
        </text>
      )}
    </g>
  )
}

function UnifilarSVG({
  blocks,
  invIdx,
  xs,
  invX,
  dcLabel,
  acLabel,
  battery,
  svgW,
  svgH,
  ry,
}: {
  blocks: DiagBlock[]
  invIdx: number
  xs: number[]
  invX: number
  dcLabel: string
  acLabel: string
  battery: boolean
  svgW: number
  svgH: number
  ry: number
}) {
  const batLineTop = ry + BH
  const batTop = batLineTop + 24
  const batH = 52

  return (
    <svg
      viewBox={`0 0 ${svgW} ${svgH}`}
      width="100%"
      style={{ display: 'block' }}
    >
      <rect width={svgW} height={svgH} fill="#0f172a" rx={8} />

      {blocks.map((block, i) => {
        const cx = xs[i]
        const isDC = i <= invIdx
        const isFirstArrow = i === 1
        const isFirstAC = i === invIdx + 1
        const arrowLabel = isFirstArrow ? dcLabel : isFirstAC ? acLabel : undefined

        return (
          <g key={block.id}>
            {i > 0 && (
              <Arrow
                x0={xs[i - 1] + BW / 2}
                x1={cx - BW / 2}
                y={ry + BH / 2}
                isDC={isDC}
                label={arrowLabel}
              />
            )}
            <Block block={block} cx={cx} ry={ry} />
          </g>
        )
      })}

      {battery && (
        <g>
          <line
            x1={invX} y1={batLineTop} x2={invX} y2={batTop}
            stroke="#10b981" strokeWidth={2}
          />
          <polygon
            points={`${invX},${batTop} ${invX - 5},${batTop - 8} ${invX + 5},${batTop - 8}`}
            fill="#10b981"
          />
          <rect
            x={invX - BW / 2} y={batTop} width={BW} height={batH}
            rx={6} fill="#052e16" stroke="#10b981" strokeWidth={1.5}
          />
          <text x={invX} y={batTop + 16} textAnchor="middle" fontSize={8} fontWeight="bold" fill="#f0fdf4" fontFamily="sans-serif">
            Bateria
          </text>
          <text x={invX} y={batTop + 28} textAnchor="middle" fontSize={7} fill="#4ade80" fontFamily="sans-serif">
            + Backup Box
          </text>
          <text x={invX} y={batTop + 40} textAnchor="middle" fontSize={6.5} fill="#16a34a" fontFamily="sans-serif">
            armazenamento
          </text>
        </g>
      )}
    </svg>
  )
}

const BRAND_LABEL: Record<string, string> = { huawei: 'Huawei', goodwe: 'GoodWe' }
const PHASE_LABEL: Record<string, string> = { mono: 'Monofásico', tri: 'Trifásico' }

export default function InstallDiagram() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null
  const [saved, setSaved] = useState(false)

  if (!state?.installOptions) {
    navigate('/string', { replace: true })
    return null
  }

  const { stringInput, stringResult, installOptions, selectedModelId } = state
  const { brand, phase, ccBox, caBox, battery } = installOptions

  const inv = selectedModelId ? getInverterById(selectedModelId) : null

  const cableSection = useMemo(() => {
    const history = loadHistory()
    const entry = history.find((e) => e.type === 'cable')
    if (!entry) return null
    const r = entry.result as { section?: number }
    return r.section ?? null
  }, [])

  const missingData = !stringResult || !inv

  const numModules = stringInput?.numModules ?? 0
  const numStrings = stringInput?.numStrings ?? 1
  const isc = stringInput?.isc ?? 0
  const vocCorr = stringResult?.vocCorrected ?? null

  const dcVolt = vocCorr != null ? `${(vocCorr * numModules).toFixed(0)}V` : '?V'
  const dcCurr = isc > 0 ? `${(isc * numStrings).toFixed(1)}A` : '?A'
  const dcLabel = `${dcVolt}/${dcCurr}`

  const acVolt = phase === 'mono' ? '230V' : '400V'
  const acPhase = phase === 'mono' ? '1F' : '3F'
  const cablePart = cableSection != null ? ` ${cableSection}mm²` : ''
  const acLabel = `${acVolt} ${acPhase}${cablePart}`

  const modelLabel = inv
    ? inv.model.length > 9 ? inv.model.slice(0, 8) + '…' : inv.model
    : BRAND_LABEL[brand]

  const invSub2 = inv ? `${inv.numMppt} MPPT` : undefined

  const blocks: DiagBlock[] = []

  blocks.push({
    id: 'panels',
    fill: '#78350f',
    stroke: '#d97706',
    title: 'Painéis FV',
    sub1: numModules > 0 ? `${numModules}mód × ${numStrings}str` : '? × ?',
    sub2: vocCorr != null ? `Voc ${vocCorr.toFixed(1)}V/mód` : undefined,
    missing: numModules === 0,
  })

  if (ccBox) {
    blocks.push({
      id: 'ccbox',
      fill: '#431407',
      stroke: '#ea580c',
      title: 'Caixa CC',
      sub1: 'Fusível + DPS DC',
    })
  }

  const invIdx = blocks.length

  blocks.push({
    id: 'inverter',
    fill: '#0c3455',
    stroke: '#0284c7',
    title: modelLabel,
    sub1: PHASE_LABEL[phase],
    sub2: invSub2,
    missing: !inv,
  })

  if (caBox) {
    blocks.push({
      id: 'cabox',
      fill: '#2e1065',
      stroke: '#7c3aed',
      title: 'Caixa CA',
      sub1: 'Fusível + DPS AC',
    })
  }

  blocks.push({
    id: 'grid',
    fill: '#1e293b',
    stroke: '#475569',
    title: 'Rede',
    sub1: 'Elétrica',
    sub2: acVolt,
  })

  const N = blocks.length
  const ry = 32
  const svgW = PAD + N * BW + (N - 1) * GAP + PAD
  const batExtra = battery ? 24 + 52 + 8 : 0
  const svgH = ry + BH + 28 + batExtra

  const xs = blocks.map((_, i) => PAD + i * (BW + GAP) + BW / 2)
  const invX = xs[invIdx]

  function handleSave() {
    saveEntry({
      id: crypto.randomUUID(),
      type: 'string',
      timestamp: Date.now(),
      label: `Esquema · ${stringLabel(stringInput, stringResult)} · ${BRAND_LABEL[brand]} · ${PHASE_LABEL[phase]}`,
      input: stringInput,
      result: stringResult,
      installOptions,
    })
    setSaved(true)
  }

  return (
    <Layout title="Esquema" showBack>
      <div className="flex flex-col gap-5 pt-2">
        <StepBar current={3} />
        <h2 className="text-white font-bold text-xl">Esquema Unifilar</h2>

        {missingData && (
          <div className="rounded-xl bg-yellow-900/20 border border-yellow-700/50 px-3 py-3 flex flex-col gap-1">
            <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">⚠ Dados incompletos</p>
            {!stringResult && (
              <p className="text-yellow-300/80 text-xs">· Resultado de string não disponível — tensão/corrente mostradas como "?"</p>
            )}
            {!inv && (
              <p className="text-yellow-300/80 text-xs">· Modelo de inversor não selecionado — o esquema mostra apenas a marca</p>
            )}
            {cableSection === null && (
              <p className="text-yellow-300/80 text-xs">· Secção de cabo não calculada — faça o cálculo em "Seção de Cabo" para aparecer no esquema</p>
            )}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-slate-700">
          <UnifilarSVG
            blocks={blocks}
            invIdx={invIdx}
            xs={xs}
            invX={invX}
            dcLabel={dcLabel}
            acLabel={acLabel}
            battery={battery}
            svgW={svgW}
            svgH={svgH}
            ry={ry}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-amber-500 rounded-full block" />
            Circuito DC
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-6 h-0.5 bg-sky-500 rounded-full block" />
            Circuito AC
          </span>
          {battery && (
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-0.5 bg-emerald-500 rounded-full block" />
              Bateria
            </span>
          )}
        </div>

        {/* Data summary */}
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 flex flex-col gap-2">
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Dados do esquema</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-slate-500 text-xs">Módulos em série</span>
              <p className="text-slate-200 font-semibold">{numModules > 0 ? numModules : '—'}</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Strings em paralelo</span>
              <p className="text-slate-200 font-semibold">{numStrings}</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Tensão DC</span>
              <p className="text-slate-200 font-semibold font-mono">{dcVolt}</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Corrente DC</span>
              <p className="text-slate-200 font-semibold font-mono">{dcCurr}</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Inversor</span>
              <p className="text-slate-200 font-semibold">{inv?.model ?? BRAND_LABEL[brand]}</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs">Secção cabo</span>
              <p className="text-slate-200 font-semibold font-mono">
                {cableSection != null ? `${cableSection} mm²` : '—'}
              </p>
            </div>
          </div>
        </div>

        <p className="text-slate-600 text-xs text-center leading-relaxed">
          Esquema lógico gerado a partir dos cálculos — não substitui o manual do fabricante para pinagem física dos terminais.
        </p>

        <button
          onClick={handleSave}
          disabled={saved}
          className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-lg py-5 active:scale-95 transition-all"
        >
          {saved ? '✓ Esquema guardado no histórico' : 'Salvar esquema no histórico'}
        </button>
      </div>
    </Layout>
  )
}
