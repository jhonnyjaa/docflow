import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import QRCode from 'qrcode'
import {
  FileStack, FileText, Download, ExternalLink,
  Package, Hash, Building2, Calendar, Tag,
  AlertCircle, QrCode, Printer,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { isSupabaseConfigured, getFolioByToken, getDocumentUrl } from '@/lib/supabase'
import { getMockFolioByToken } from '@/lib/mock-data'
import { formatDate, generatePublicUrl } from '@/lib/utils'
import { DOC_TYPE_LABELS } from '@/types'
import type { Folio, FolioDocument } from '@/types'

export default function FolioPublic() {
  const { token } = useParams<{ token: string }>()
  const [folio, setFolio] = useState<Folio | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [qrVisible, setQrVisible] = useState(false)

  useEffect(() => {
    if (!token) { setNotFound(true); setLoading(false); return }

    const load = async () => {
      try {
        const data = isSupabaseConfigured
          ? await getFolioByToken(token)
          : getMockFolioByToken(token)

        if (!data) { setNotFound(true) }
        else { setFolio(data) }
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [token])

  useEffect(() => {
    if (!folio || !qrVisible || !canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, generatePublicUrl(folio.public_token), {
      width: 200,
      margin: 2,
      color: { dark: '#09090b', light: '#ffffff' },
    })
  }, [folio, qrVisible])

  const getDocUrl = (doc: FolioDocument) => {
    if (isSupabaseConfigured) return getDocumentUrl(doc.file_path)
    return doc.file_url || '#'
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
          <p className="text-sm text-zinc-400">Cargando folio...</p>
        </div>
      </div>
    )
  }

  if (notFound || !folio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-7 w-7 text-red-500" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Folio no encontrado</h1>
            <p className="mt-1 text-sm text-zinc-500">
              El enlace no es válido o el folio no existe.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const documents = folio.documents || []

  return (
    <div className="min-h-screen bg-zinc-50 py-10 px-4">
      <div className="mx-auto max-w-xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6 flex items-center justify-center">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
                <FileStack className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900">DocFlow</p>
                <p className="text-[10px] text-zinc-400">Consulta de documentos</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400 mb-1">
                    Folio de Material
                  </p>
                  <h1 className="text-lg font-semibold text-zinc-900 leading-tight">
                    {folio.description}
                  </h1>
                  <p className="mt-1 text-sm text-zinc-500">
                    {folio.material_code}
                  </p>
                </div>
                <StatusBadge status={folio.status} />
              </div>
            </div>

            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
                {[
                  { icon: Hash, label: 'OC', value: folio.oc },
                  { icon: Hash, label: 'Posición', value: folio.position || '—' },
                  { icon: Tag, label: 'Lote', value: folio.lot || '—' },
                  { icon: Package, label: 'Cantidad', value: `${folio.quantity} ${folio.unit}` },
                  { icon: Building2, label: 'Proveedor', value: folio.supplier_name },
                  { icon: Calendar, label: 'Fecha', value: formatDate(folio.date) },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <Icon className="h-3 w-3 text-zinc-400" />
                      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{label}</p>
                    </div>
                    <p className="text-sm text-zinc-800">{value}</p>
                  </div>
                ))}
              </div>

              {folio.observation && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-amber-600 mb-0.5">Observación</p>
                  <p className="text-sm text-amber-800">{folio.observation}</p>
                </div>
              )}
            </div>

            <div className="border-t border-zinc-100 px-6 py-4">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-zinc-900">
                  Documentos adjuntos
                </h2>
                <span className="text-xs text-zinc-400">
                  {documents.length} archivo{documents.length !== 1 ? 's' : ''}
                </span>
              </div>

              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 py-8 text-center">
                  <FileText className="mx-auto mb-2 h-8 w-8 text-zinc-200" />
                  <p className="text-sm text-zinc-400">Sin documentos disponibles</p>
                  <p className="mt-0.5 text-xs text-zinc-300">El proveedor aún no ha cargado documentos</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc, i) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center justify-between rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 hover:bg-zinc-100 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                          <FileText className="h-4 w-4 text-red-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-800 truncate">
                            {DOC_TYPE_LABELS[doc.doc_type]}
                          </p>
                          <p className="text-[10px] text-zinc-400 truncate">{doc.file_name}</p>
                        </div>
                      </div>
                      <a
                        href={getDocUrl(doc)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-3 shrink-0"
                      >
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                          <Download className="h-3.5 w-3.5" />
                          Abrir
                        </Button>
                      </a>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-zinc-100 px-6 py-4">
              <button
                onClick={() => setQrVisible(v => !v)}
                className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <QrCode className="h-3.5 w-3.5" />
                {qrVisible ? 'Ocultar QR' : 'Ver código QR de este folio'}
              </button>

              {qrVisible && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-4 flex flex-col items-center gap-3"
                >
                  <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
                    <canvas ref={canvasRef} className="block" />
                  </div>
                  <p className="text-[10px] text-zinc-300 text-center break-all max-w-xs">
                    {generatePublicUrl(folio.public_token)}
                  </p>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir
                  </button>
                </motion.div>
              )}
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] text-zinc-300">
            Este folio es de solo lectura. Para gestionar documentos, accede al sistema interno.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
