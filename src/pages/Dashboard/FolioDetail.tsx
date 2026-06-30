import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Trash2, Upload, ExternalLink, Copy, Check,
  CheckCircle2, AlertCircle, Clock, Save, X, FileCheck,
  Download, Share2,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { FileUploadZone } from '@/components/shared/FileUploadZone'
import { QRModal } from '@/components/shared/QRModal'
import {
  isSupabaseConfigured, uploadDocument, createDocument,
  deleteDocument, updateFolioStatus, updateFolioObservation,
  getDocumentUrl,
} from '@/lib/supabase'
import {
  updateMockFolioStatus, updateMockFolioObservation,
  addMockDocument, deleteMockDocument,
} from '@/lib/mock-data'
import {
  generatePublicUrl, copyToClipboard, formatDate, formatDateTime,
} from '@/lib/utils'
import {
  DOC_TYPE_LABELS, STATUS_CONFIG,
  type FolioStatus, type Folio, type FolioDocument, type DocType,
} from '@/types'
import { cn } from '@/lib/utils'

const DOC_TYPES: DocType[] = ['quality_cert', 'tech_sheet', 'safety_sheet', 'other']

const STATUS_OPTS: { value: FolioStatus; icon: React.ReactNode }[] = [
  { value: 'complete', icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> },
  { value: 'incomplete', icon: <AlertCircle className="h-3.5 w-3.5 text-red-500" /> },
  { value: 'pending', icon: <Clock className="h-3.5 w-3.5 text-amber-500" /> },
]

interface Props {
  folio: Folio | null
  open: boolean
  onClose: () => void
  onUpdated: () => void
}

export function FolioDetail({ folio, open, onClose, onUpdated }: Props) {
  const [uploadingType, setUploadingType] = useState<DocType | null>(null)
  const [newFile, setNewFile] = useState<File | null>(null)
  const [editingObs, setEditingObs] = useState(false)
  const [observation, setObservation] = useState('')
  const [savingObs, setSavingObs] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [copied, setCopied] = useState<'link' | 'share' | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [statusChanging, setStatusChanging] = useState(false)

  if (!folio) return null

  const documents = folio.documents ?? []
  const publicUrl = generatePublicUrl(folio.public_token)
  const statusLabel = STATUS_CONFIG[folio.status].label

  const handleStatusChange = async (status: FolioStatus) => {
    if (folio.status === status) return
    setStatusChanging(true)
    try {
      if (isSupabaseConfigured) await updateFolioStatus(folio.id, status)
      else { updateMockFolioStatus(folio.id, status); await new Promise(r => setTimeout(r, 150)) }
      toast.success('Estado actualizado')
      onUpdated()
    } catch { toast.error('Error al actualizar estado') }
    finally { setStatusChanging(false) }
  }

  const handleSaveObs = async () => {
    setSavingObs(true)
    try {
      if (isSupabaseConfigured) await updateFolioObservation(folio.id, observation)
      else { updateMockFolioObservation(folio.id, observation); await new Promise(r => setTimeout(r, 150)) }
      toast.success('Observación guardada')
      setEditingObs(false)
      onUpdated()
    } catch { toast.error('Error al guardar') }
    finally { setSavingObs(false) }
  }

  const handleUpload = async () => {
    if (!uploadingType || !newFile) return
    try {
      if (isSupabaseConfigured) {
        const path = await uploadDocument(folio.id, uploadingType, newFile)
        await createDocument({
          folio_id: folio.id, doc_type: uploadingType,
          doc_name: DOC_TYPE_LABELS[uploadingType],
          file_path: path, file_name: newFile.name, uploaded_by: 'internal',
        })
      } else {
        addMockDocument({
          id: `doc-${Date.now()}`, folio_id: folio.id, doc_type: uploadingType,
          doc_name: DOC_TYPE_LABELS[uploadingType],
          file_path: `${folio.id}/${uploadingType}/${newFile.name}`,
          file_name: newFile.name, uploaded_by: 'internal',
          created_at: new Date().toISOString(),
        })
        await new Promise(r => setTimeout(r, 300))
      }
      toast.success('Documento cargado')
      setUploadingType(null); setNewFile(null)
      onUpdated()
    } catch { toast.error('Error al cargar documento') }
  }

  const handleDelete = async (doc: FolioDocument) => {
    setDeletingId(doc.id)
    try {
      if (isSupabaseConfigured) await deleteDocument(doc.id, doc.file_path)
      else { deleteMockDocument(doc.id, folio.id); await new Promise(r => setTimeout(r, 200)) }
      toast.success('Documento eliminado')
      onUpdated()
    } catch { toast.error('Error al eliminar') }
    finally { setDeletingId(null) }
  }

  const handleCopyLink = async () => {
    await copyToClipboard(publicUrl)
    setCopied('link')
    toast.success('Enlace copiado')
    setTimeout(() => setCopied(null), 2000)
  }

  const handleShare = async () => {
    const text = `DocFlow — Documentos del material\n\nMaterial: ${folio.description}\nCódigo: ${folio.material_code}  ·  Lote: ${folio.lot || '—'}\nOC: ${folio.oc}  ·  Pos: ${folio.position || '—'}\nProveedor: ${folio.supplier_name}\nEstado: ${statusLabel}\n\nConsultar documentos:\n${publicUrl}`
    await copyToClipboard(text)
    setCopied('share')
    toast.success('Información y enlace copiados — listo para pegar')
    setTimeout(() => setCopied(null), 2500)
  }

  const getDocUrl = (doc: FolioDocument) =>
    isSupabaseConfigured ? getDocumentUrl(doc.file_path) : (doc.file_url || '#')

  const metaFields = [
    ['OC', folio.oc], ['Posición', folio.position || '—'], ['Código', folio.material_code],
    ['Lote', folio.lot || '—'], ['Cantidad', `${folio.quantity} ${folio.unit}`],
    ['Fecha', formatDate(folio.date)], ['Proveedor', folio.supplier_name],
    ['Email', folio.supplier_email || '—'], ['Creado', formatDateTime(folio.created_at)],
  ]

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        {/* max-w-3xl for more breathing room */}
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-8 text-base">
              <FileCheck className="h-4 w-4 text-zinc-400" />
              {folio.description}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Meta grid */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-3 rounded-xl bg-zinc-50 p-4 sm:grid-cols-4">
              {metaFields.map(([label, value]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
                  <p className="mt-0.5 text-sm text-zinc-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Status + Actions row */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-1.5 text-xs font-medium text-zinc-500">Estado</p>
                <div className="flex gap-1.5">
                  {STATUS_OPTS.map(opt => (
                    <button key={opt.value} type="button"
                      onClick={() => handleStatusChange(opt.value)}
                      disabled={statusChanging || folio.status === opt.value}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                        folio.status === opt.value
                          ? 'border-zinc-900 bg-zinc-900 text-white'
                          : 'border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50',
                      )}>
                      {opt.icon}
                      {STATUS_CONFIG[opt.value].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 text-xs">
                  {copied === 'link' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  Copiar link
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 text-xs">
                  {copied === 'share' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                  Compartir
                </Button>
                <Button variant="outline" size="sm" onClick={() => setQrOpen(true)} className="gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" /> QR
                </Button>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                    <ExternalLink className="h-3.5 w-3.5" /> Ver público
                  </Button>
                </a>
              </div>
            </div>

            {/* Documents */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-800">Documentos adjuntos</p>
                <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500">
                  {documents.length} archivo{documents.length !== 1 ? 's' : ''}
                </span>
              </div>

              {documents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-200 py-6 text-center">
                  <p className="text-sm text-zinc-400">Sin documentos adjuntos</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {documents.map(doc => (
                    <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-2.5 hover:bg-zinc-50">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                          <FileText className="h-4 w-4 text-red-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-800">{doc.file_name}</p>
                          <p className="text-[10px] text-zinc-400">
                            {DOC_TYPE_LABELS[doc.doc_type]} · {formatDate(doc.created_at)}
                            {doc.uploaded_by !== 'supplier' && ' · Interno'}
                          </p>
                        </div>
                      </div>
                      <div className="ml-3 flex shrink-0 items-center gap-1">
                        <a href={getDocUrl(doc)} target="_blank" rel="noopener noreferrer">
                          <button className="flex h-7 w-7 items-center justify-center rounded text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </a>
                        <button onClick={() => handleDelete(doc)} disabled={deletingId === doc.id}
                          className="flex h-7 w-7 items-center justify-center rounded text-zinc-300 hover:bg-red-50 hover:text-red-500 disabled:opacity-50">
                          {deletingId === doc.id
                            ? <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-300 border-t-transparent" />
                            : <Trash2 className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Upload new */}
              <div className="mt-3 rounded-xl border border-dashed border-zinc-200 p-3">
                <p className="mb-2 text-xs font-medium text-zinc-500">Cargar nuevo documento</p>
                {uploadingType ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{DOC_TYPE_LABELS[uploadingType]}</Badge>
                      <button onClick={() => { setUploadingType(null); setNewFile(null) }}
                        className="text-zinc-400 hover:text-zinc-600"><X className="h-3.5 w-3.5" /></button>
                    </div>
                    <FileUploadZone value={newFile} onChange={setNewFile} compact />
                    {newFile && (
                      <Button size="sm" onClick={handleUpload} className="gap-1.5">
                        <Upload className="h-3.5 w-3.5" /> Cargar documento
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {DOC_TYPES.map(type => (
                      <button key={type} onClick={() => setUploadingType(type)}
                        className="rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 transition-colors">
                        + {DOC_TYPE_LABELS[type]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Observation */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-800">Observaciones internas</p>
                {!editingObs && (
                  <button
                    onClick={() => { setEditingObs(true); setObservation(folio.observation || '') }}
                    className="text-xs text-zinc-400 hover:text-zinc-700">
                    {folio.observation ? 'Editar' : 'Agregar'}
                  </button>
                )}
              </div>
              {editingObs ? (
                <div className="space-y-2">
                  <Textarea value={observation} onChange={e => setObservation(e.target.value)}
                    placeholder="Observaciones internas..." rows={3} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveObs} disabled={savingObs}>
                      <Save className="h-3.5 w-3.5" /> Guardar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setEditingObs(false)}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-zinc-600">
                  {folio.observation || <span className="italic text-zinc-300">Sin observaciones</span>}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QRModal folio={folio} open={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  )
}
