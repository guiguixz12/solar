import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Layout from '../components/Layout'
import { StepBar } from './InstallConfig'
import { getComponents, schemaKey } from '../config/components'
import { saveSchema, getSchema, deleteSchema } from '../utils/idbStorage'
import { saveEntry } from '../utils/storage'
import { stringLabel } from '../utils/stringCalc'
import type { InstallOptions, StringInput, StringResult } from '../types'

interface LocationState {
  stringInput: StringInput
  stringResult: StringResult
  installOptions: InstallOptions
}

const BRAND_LABEL: Record<string, string> = { huawei: '🟧 Huawei', goodwe: '🟦 GoodWe' }
const PHASE_LABEL: Record<string, string> = { mono: 'Monofásico', tri: 'Trifásico' }

export default function InstallResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [schemaBlob, setSchemaBlob] = useState<Blob | null>(null)
  const [schemaUrl, setSchemaUrl] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!state?.installOptions) {
    navigate('/string', { replace: true })
    return null
  }

  const { stringInput, stringResult, installOptions } = state
  const { brand, phase, ccBox, caBox, battery } = installOptions
  const key = schemaKey(brand, phase, { ccBox, caBox, battery })
  const components = getComponents(brand, phase, { ccBox, caBox, battery })

  // Load existing schema from IndexedDB
  useEffect(() => {
    getSchema(key).then((blob) => {
      if (blob) {
        setSchemaBlob(blob)
        setSchemaUrl(URL.createObjectURL(blob))
      }
    })
    return () => {
      if (schemaUrl) URL.revokeObjectURL(schemaUrl)
    }
  }, [key])

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await saveSchema(key, file)
    if (schemaUrl) URL.revokeObjectURL(schemaUrl)
    setSchemaBlob(file)
    setSchemaUrl(URL.createObjectURL(file))
  }

  async function handleDeleteSchema() {
    await deleteSchema(key)
    if (schemaUrl) URL.revokeObjectURL(schemaUrl)
    setSchemaBlob(null)
    setSchemaUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

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

  const isImage = schemaBlob?.type.startsWith('image/')

  return (
    <Layout title="Componentes" showBack>
      <div className="flex flex-col gap-5 pt-2">
        <StepBar current={2} />
        <h2 className="text-white font-bold text-xl">Lista de Componentes</h2>

        {/* Config summary badge */}
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

        {/* Component list */}
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

        {/* Schema upload slot */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-slate-300 font-semibold text-base">Esquema de ligação</p>
            {schemaBlob && (
              <button
                onClick={handleDeleteSchema}
                className="text-red-400 hover:text-red-300 text-xs underline underline-offset-2 transition-colors"
              >
                Remover
              </button>
            )}
          </div>

          {schemaBlob && schemaUrl ? (
            <div className="rounded-2xl overflow-hidden border-2 border-emerald-600 bg-slate-800">
              {isImage ? (
                <img src={schemaUrl} alt="Esquema de ligação" className="w-full object-contain max-h-80" />
              ) : (
                <a
                  href={schemaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-5 text-emerald-300 hover:text-emerald-200 transition-colors"
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div>
                    <p className="font-semibold">PDF carregado</p>
                    <p className="text-xs text-slate-400">Toque para abrir</p>
                  </div>
                </a>
              )}
              <div className="px-4 py-2 bg-slate-800/80 flex items-center justify-between">
                <span className="text-emerald-400 text-xs font-medium">✓ Esquema guardado localmente</span>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-slate-400 hover:text-slate-200 text-xs underline underline-offset-2"
                >
                  Substituir
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-slate-600 hover:border-amber-500 bg-slate-800/50 hover:bg-amber-900/10 transition-all py-8 flex flex-col items-center gap-2 active:scale-[0.98]"
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
              </svg>
              <p className="text-slate-400 font-medium text-sm">Carregar esquema de ligação</p>
              <p className="text-slate-600 text-xs">Imagem ou PDF do manual de instalação</p>
            </button>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-slate-600 text-xs text-center">
            Guardado no dispositivo — disponível offline para esta combinação exata
          </p>
        </div>

        {/* Save to history */}
        <button
          onClick={handleSave}
          disabled={saved}
          className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-lg py-5 active:scale-95 transition-all"
        >
          {saved ? '✓ Configuração guardada no histórico' : 'Guardar configuração no histórico'}
        </button>
      </div>
    </Layout>
  )
}
