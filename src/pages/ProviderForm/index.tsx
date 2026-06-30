import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import QRCode from 'qrcode'
import {
  FileStack, ArrowRight, ArrowLeft, Send, CheckCircle2,
  Building2, Mail, User, Loader2, ExternalLink, Copy,
  Download, Printer, Check, QrCode as QrIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ItemsGrid } from './ItemsGrid'
import {
  isSupabaseConfigured, uploadDocument, createFolio, createDocument,
} from '@/lib/supabase'
import { addMockFolios } from '@/lib/mock-data'
import { generatePublicUrl, copyToClipboard } from '@/lib/utils'
import { DOC_TYPE_LABELS, STATUS_CONFIG, type SubmissionRow, type DocType, type Folio } from '@/types'

const supplierSchema = z.object({
  name: z.string().min(2, 'Ingresa el nombre del proveedor'),
  email: z.string().email('Ingresa un email válido').or(z.literal('')),
})
type SupplierData = z.infer<typeof supplierSchema>

const STEPS = ['Proveedor', 'Materiales', 'Confirmar']

const slide = {
  enter: (d: number) => ({ x: d * 60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: -d * 60, opacity: 0 }),
}

function createRow(): SubmissionRow {
  return {
    id: crypto.randomUUID(), oc: '', position: '', material_code: '', lot: '',
    description: '', quantity: '', unit: '', date: new Date().toISOString().split('T')[0],
    observation: '', documents: {},
  }
}

export default function ProviderForm() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [rows, setRows] = useState<SubmissionRow[]>([createRow()])
  const [submitting, setSubmitting] = useState(false)
  const [createdFolios, setCreatedFolios] = useState<Folio[]>([])
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({})
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<SupplierData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { name: '', email: '' },
  })

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  // Generate QR data URLs when confirmation screen loads
  useEffect(() => {
    if (step !== 3 || createdFolios.length === 0) return
    const gen = async () => {
      const urls: Record<string, string> = {}
      for (const f of createdFolios) {
        try {
          urls[f.id] = await QRCode.toDataURL(generatePublicUrl(f.public_token), {
            width: 300, margin: 2, color: { dark: '#09090b', light: '#ffffff' },
          })
        } catch {}
      }
      setQrUrls(urls)
    }
    gen()
  }, [step, createdFolios])

  const validateRows = () => {
    if (rows.some(r => !r.oc || !r.material_code || !r.description)) {
      toast.error('Completa OC, Código y Descripción en todos los ítems')
      return false
    }
    return true
  }

  const handleNext = handleSubmit(() => { go(step + 1) })

  const submitForm = async () => {
    setSubmitting(true)
    const supplier = getValues()
    const folios: Folio[] = []

    try {
      for (const row of rows) {
        const base = {
          oc: row.oc, position: row.position, material_code: row.material_code,
          lot: row.lot, description: row.description,
          quantity: parseFloat(row.quantity) || 0, unit: row.unit, date: row.date,
          supplier_name: supplier.name, supplier_email: supplier.email || undefined,
          observation: row.observation || undefined, status: 'pending' as const,
        }

        let folio: Folio

        if (isSupabaseConfigured) {
          folio = await createFolio(base)
          for (const [docType, file] of Object.entries(row.documents)) {
            if (file instanceof File) {
              const path = await uploadDocument(folio.id, docType, file)
              await createDocument({
                folio_id: folio.id, doc_type: docType as DocType,
                doc_name: DOC_TYPE_LABELS[docType as DocType],
                file_path: path, file_name: file.name, uploaded_by: 'supplier',
              })
            }
          }
        } else {
          await new Promise(r => setTimeout(r, 200))
          const id = `folio-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
          folio = {
            ...base,
            id,
            public_token: `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            documents: Object.entries(row.documents)
              .filter(([, f]) => f instanceof File)
              .map(([dt, f], i) => ({
                id: `doc-new-${i}`, folio_id: id, doc_type: dt as DocType,
                doc_name: DOC_TYPE_LABELS[dt as DocType],
                file_path: `${id}/${dt}/${(f as File).name}`,
                file_name: (f as File).name, uploaded_by: 'supplier',
                created_at: new Date().toISOString(),
              })),
          }
        }
        folios.push(folio)
      }

      if (!isSupabaseConfigured) addMockFolios(folios)
      setCreatedFolios(folios)
      go(3)
    } catch (err) {
      console.error(err)
      toast.error('Error al enviar. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyLink = async (id: string, token: string) => {
    await copyToClipboard(generatePublicUrl(token))
    setCopiedId(id)
    toast.success('Enlace copiado al portapapeles')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleShareFolio = async (folio: Folio) => {
    const url = generatePublicUrl(folio.public_token)
    const text = `DocFlow — Documentos del material\n\nMaterial: ${folio.description}\nCódigo: ${folio.material_code}  ·  Lote: ${folio.lot || '—'}\nOC: ${folio.oc}  ·  Pos: ${folio.position || '—'}\nProveedor: ${folio.supplier_name}\n\nVer documentos:\n${url}`
    await copyToClipboard(text)
    toast.success('Información y enlace copiados')
  }

  const handleDownloadQR = (folio: Folio) => {
    const url = qrUrls[folio.id]
    if (!url) return
    const a = document.createElement('a')
    a.download = `QR-${folio.material_code}-${folio.lot || folio.id.slice(-5)}.png`
    a.href = url
    a.click()
  }

  const handlePrintQR = (folio: Folio) => {
    const url = qrUrls[folio.id]
    if (!url) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<html><head><title>QR — ${folio.material_code}</title>
    <style>
      body{font-family:Inter,sans-serif;display:flex;flex-direction:column;align-items:center;padding:32px;background:#fff}
      h1{font-size:15px;font-weight:700;margin-bottom:4px;text-align:center}
      p{font-size:11px;color:#71717a;text-align:center;margin:2px 0}
      img{display:block;margin:16px auto;border:1px solid #e4e4e7;border-radius:8px;padding:10px}
      .url{font-size:8px;color:#d4d4d8;word-break:break-all;max-width:260px;text-align:center;margin-top:8px}
    </style></head>
    <body>
      <h1>${folio.description}</h1>
      <p>Código: ${folio.material_code} · Lote: ${folio.lot || '—'}</p>
      <p>OC: ${folio.oc} · Pos: ${folio.position || '—'}</p>
      <img src="${url}" width="200"/>
      <p class="url">${generatePublicUrl(folio.public_token)}</p>
    </body></html>`)
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900">
            <FileStack className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">Carga de Documentos</h1>
          <p className="mt-1 text-sm text-zinc-500">Adjunta los documentos de los materiales entregados</p>
        </motion.div>

        {step < 3 && (
          <div className="mb-8 flex justify-center">
            <div className="flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-all ${
                      i < step ? 'bg-zinc-900 text-white' : i === step
                        ? 'border-2 border-zinc-900 text-zinc-900' : 'border border-zinc-200 text-zinc-400'}`}>
                      {i < step ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <span className={`text-xs ${i === step ? 'font-medium text-zinc-900' : 'text-zinc-400'}`}>{label}</span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`h-px w-10 ${i < step ? 'bg-zinc-900' : 'bg-zinc-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>

            {/* Step 0 – Supplier */}
            {step === 0 && (
              <motion.div key="s0" custom={direction} variants={slide}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}>
                <div className="mx-auto max-w-md">
                  <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-base font-semibold text-zinc-900">Identificación del proveedor</h2>
                    <p className="mb-5 text-sm text-zinc-500">Estos datos quedarán registrados en cada folio creado.</p>
                    <form onSubmit={handleNext} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">Razón social / Nombre *</Label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                          <Input id="name" placeholder="Empresa Proveedora SAC" className="pl-9" {...register('name')} />
                        </div>
                        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email de contacto <span className="text-zinc-400">(opcional)</span></Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                          <Input id="email" type="email" placeholder="ventas@empresa.com" className="pl-9" {...register('email')} />
                        </div>
                        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                      </div>
                      <Button type="submit" className="w-full">
                        Continuar <ArrowRight className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 1 – Items */}
            {step === 1 && (
              <motion.div key="s1" custom={direction} variants={slide}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}>
                <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-zinc-900">Ítems y documentos</h2>
                      <p className="mt-0.5 text-sm text-zinc-500">Una fila por material. Puedes incluir ítems de distintas OC.</p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-zinc-100 bg-zinc-50 px-2.5 py-1">
                      <User className="h-3 w-3 text-zinc-400" />
                      <span className="text-xs text-zinc-600">{getValues('name')}</span>
                    </div>
                  </div>
                  <ItemsGrid rows={rows} onChange={setRows} />
                  <div className="mt-5 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => go(0)}>
                      <ArrowLeft className="h-4 w-4" /> Atrás
                    </Button>
                    <Button onClick={() => { if (validateRows()) go(2) }}>
                      Revisar envío <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2 – Review */}
            {step === 2 && (
              <motion.div key="s2" custom={direction} variants={slide}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.22, ease: 'easeInOut' }}>
                <div className="mx-auto max-w-2xl">
                  <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-1 text-base font-semibold text-zinc-900">Resumen del envío</h2>
                    <p className="mb-5 text-sm text-zinc-500">Revisa antes de enviar. Se creará un folio independiente por cada ítem.</p>
                    <div className="mb-4 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">Proveedor</p>
                      <p className="mt-0.5 text-sm font-medium text-zinc-900">{getValues('name')}</p>
                      {getValues('email') && <p className="text-xs text-zinc-500">{getValues('email')}</p>}
                    </div>
                    <div className="space-y-2">
                      {rows.map((row, i) => {
                        const dc = Object.values(row.documents).filter(Boolean).length
                        return (
                          <div key={row.id} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">{i + 1}</span>
                                <p className="truncate text-sm font-medium text-zinc-900">
                                  {row.description || <span className="text-zinc-400">Sin descripción</span>}
                                </p>
                              </div>
                              <p className="mt-0.5 text-xs text-zinc-500">
                                OC {row.oc || '—'} · Pos {row.position || '—'} · {row.material_code || '—'} · Lote {row.lot || '—'}
                              </p>
                            </div>
                            <span className={`ml-3 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              dc > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                              {dc} doc{dc !== 1 ? 's' : ''}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-6 flex items-center justify-between">
                      <Button variant="ghost" size="sm" onClick={() => go(1)}>
                        <ArrowLeft className="h-4 w-4" /> Atrás
                      </Button>
                      <Button onClick={submitForm} disabled={submitting}>
                        {submitting
                          ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                          : <><Send className="h-4 w-4" /> Enviar {rows.length} folio{rows.length !== 1 ? 's' : ''}</>}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 – Success */}
            {step === 3 && (
              <motion.div key="s3" custom={direction} variants={slide}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.3, ease: 'easeOut' }}>
                <div className="mx-auto max-w-2xl">
                  <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col items-center px-6 pt-8 pb-5 text-center border-b border-zinc-100 bg-emerald-50/40">
                      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
                        className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </motion.div>
                      <h2 className="text-base font-semibold text-zinc-900">¡Documentos enviados correctamente!</h2>
                      <p className="mt-1.5 text-sm text-zinc-500 max-w-md">
                        Se registraron <strong>{createdFolios.length}</strong> folios. A continuación encontrarás el código QR y el enlace de consulta para cada material.
                      </p>
                      <p className="mt-1 text-xs text-zinc-400">
                        Descarga o imprime el QR para pegarlo en el material antes del envío.
                      </p>
                    </div>

                    {/* Folio list */}
                    <div className="divide-y divide-zinc-100">
                      {createdFolios.map((folio, i) => (
                        <motion.div key={folio.id}
                          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.06 }}
                          className="flex gap-4 p-5">

                          {/* QR */}
                          <div className="shrink-0 flex flex-col items-center gap-1.5">
                            {qrUrls[folio.id]
                              ? <img src={qrUrls[folio.id]} alt="QR" className="h-[88px] w-[88px] rounded-lg border border-zinc-200 p-1" />
                              : <div className="h-[88px] w-[88px] rounded-lg border border-zinc-200 flex items-center justify-center bg-zinc-50">
                                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600" />
                                </div>}
                            <div className="flex gap-1">
                              <button onClick={() => handleDownloadQR(folio)} disabled={!qrUrls[folio.id]}
                                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-40 transition-colors">
                                <Download className="h-2.5 w-2.5" /> QR
                              </button>
                              <button onClick={() => handlePrintQR(folio)} disabled={!qrUrls[folio.id]}
                                className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 disabled:opacity-40 transition-colors">
                                <Printer className="h-2.5 w-2.5" /> Imprimir
                              </button>
                            </div>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-900 truncate">{folio.description}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">
                              {folio.material_code} · OC {folio.oc} · Lote {folio.lot || '—'}
                            </p>
                            <p className="text-xs text-zinc-500">Proveedor: {folio.supplier_name}</p>

                            <div className="mt-2.5 rounded-lg border border-zinc-100 bg-zinc-50 px-3 py-2">
                              <p className="text-[10px] text-zinc-400 mb-1">Enlace de consulta de documentos</p>
                              <p className="text-xs font-mono text-zinc-600 truncate">
                                {generatePublicUrl(folio.public_token)}
                              </p>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <button
                                onClick={() => handleCopyLink(folio.id, folio.public_token)}
                                className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
                                {copiedId === folio.id
                                  ? <Check className="h-3 w-3 text-emerald-500" />
                                  : <Copy className="h-3 w-3" />}
                                Copiar enlace
                              </button>
                              <button
                                onClick={() => handleShareFolio(folio)}
                                className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
                                <QrIcon className="h-3 w-3" />
                                Compartir info
                              </button>
                              <a href={generatePublicUrl(folio.public_token)} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50 transition-colors">
                                <ExternalLink className="h-3 w-3" />
                                Ver documentos
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="border-t border-zinc-100 px-6 py-4 text-center">
                      <Button variant="outline" onClick={() => {
                        setStep(0); setRows([createRow()]); setCreatedFolios([]); setQrUrls({}); setDirection(1)
                      }}>
                        Hacer otro envío
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <footer className="border-t border-zinc-100 py-4 text-center">
        <p className="text-xs text-zinc-400">DocFlow — Gestión Documental de Materiales</p>
      </footer>
    </div>
  )
}
