import { useState, useEffect, useRef } from 'react'
import { saveSchema, getSchema, deleteSchema } from '../utils/idbStorage'

interface Props {
  schemaKey: string
  label?: string
}

export default function SchemaSlot({ schemaKey, label = 'Esquema de ligação' }: Props) {
  const [blob, setBlob] = useState<Blob | null>(null)
  const [url, setUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    getSchema(schemaKey).then((b) => {
      if (b) {
        objectUrl = URL.createObjectURL(b)
        setBlob(b)
        setUrl(objectUrl)
      }
    })
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [schemaKey])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    await saveSchema(schemaKey, file)
    if (url) URL.revokeObjectURL(url)
    const newUrl = URL.createObjectURL(file)
    setBlob(file)
    setUrl(newUrl)
  }

  async function handleDelete() {
    await deleteSchema(schemaKey)
    if (url) URL.revokeObjectURL(url)
    setBlob(null)
    setUrl(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const isImage = blob?.type.startsWith('image/')

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-slate-300 font-medium text-sm">{label}</p>
        {blob && (
          <button onClick={handleDelete} className="text-red-400 hover:text-red-300 text-xs underline underline-offset-2 transition-colors">
            Remover
          </button>
        )}
      </div>

      {blob && url ? (
        <div className="rounded-xl overflow-hidden border-2 border-emerald-600 bg-slate-800">
          {isImage ? (
            <img src={url} alt="Esquema" className="w-full object-contain max-h-72" />
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-4 text-emerald-300 hover:text-emerald-200 transition-colors"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="shrink-0">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
                <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p className="font-semibold text-sm">PDF carregado</p>
                <p className="text-xs text-slate-400">Toque para abrir</p>
              </div>
            </a>
          )}
          <div className="px-3 py-1.5 bg-slate-800/80 flex items-center justify-between">
            <span className="text-emerald-400 text-xs">✓ Guardado localmente</span>
            <button onClick={() => fileRef.current?.click()} className="text-slate-400 hover:text-slate-200 text-xs underline underline-offset-2">
              Substituir
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-slate-600 hover:border-amber-500 bg-slate-800/40 hover:bg-amber-900/10 transition-all py-6 flex flex-col items-center gap-1.5 active:scale-[0.98]"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-500">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round"/>
          </svg>
          <p className="text-slate-400 text-sm font-medium">Carregar esquema</p>
          <p className="text-slate-600 text-xs">Imagem ou PDF</p>
        </button>
      )}

      <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFile} />
    </div>
  )
}
