import { useEffect, useRef, useState, useCallback } from 'react'
import QRCode from 'qrcode'
import { Download, Printer, QrCode } from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { generatePublicUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Folio } from '@/types'

const QR_SIZE = 240  // canvas pixel size

interface QRModalProps {
  folio: Folio | null
  open: boolean
  onClose: () => void
}

export function QRModal({ folio, open, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string>('')
  const [ready, setReady] = useState(false)

  const renderQR = useCallback(async () => {
    if (!folio || !canvasRef.current) return
    const url = generatePublicUrl(folio.public_token)
    try {
      await QRCode.toCanvas(canvasRef.current, url, {
        width: QR_SIZE,
        margin: 2,
        color: { dark: '#09090b', light: '#ffffff' },
      })
      const du = await QRCode.toDataURL(url, {
        width: 400, margin: 2,
        color: { dark: '#09090b', light: '#ffffff' },
      })
      setDataUrl(du)
      setReady(true)
    } catch (e) {
      console.error('QR error', e)
    }
  }, [folio])

  useEffect(() => {
    if (!open || !folio) {
      setReady(false)
      setDataUrl('')
      return
    }
    // 220ms: enough for the Radix dialog animation (~150ms) + paint
    const t = setTimeout(renderQR, 220)
    return () => clearTimeout(t)
  }, [open, folio, renderQR])

  if (!folio) return null

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.download = `QR-${folio.material_code}-${folio.lot || folio.id.slice(0, 6)}.png`
    a.href = dataUrl
    a.click()
  }

  const handlePrint = () => {
    if (!dataUrl) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`
      <html><head><title>QR — ${folio.material_code}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Inter, sans-serif; display: flex; flex-direction: column; align-items: center;
               justify-content: center; min-height: 100vh; padding: 32px; background: #fff; }
        h1 { font-size: 16px; font-weight: 700; color: #09090b; margin-bottom: 4px; text-align: center; }
        p { font-size: 12px; color: #71717a; text-align: center; margin: 2px 0; }
        img { display: block; margin: 20px auto; border: 1px solid #e4e4e7; border-radius: 8px; padding: 12px; }
        .url { font-size: 9px; color: #d4d4d8; word-break: break-all; max-width: 280px; text-align: center; margin-top: 8px; }
      </style></head>
      <body>
        <h1>${folio.description}</h1>
        <p>Código: ${folio.material_code} &nbsp;·&nbsp; Lote: ${folio.lot || '—'}</p>
        <p>OC: ${folio.oc} &nbsp;·&nbsp; Pos: ${folio.position || '—'}</p>
        <img src="${dataUrl}" width="220" />
        <p class="url">${generatePublicUrl(folio.public_token)}</p>
      </body></html>
    `)
    w.document.close()
    w.focus()
    w.print()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <QrCode className="h-4 w-4 text-zinc-500" />
            Código QR del Folio
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-1">
          {/*
            Fixed-size container prevents layout shift.
            Canvas is pre-sized to QR_SIZE so toCanvas doesn't cause a jump.
            Opacity transition hides the blank canvas until the QR is drawn.
          */}
          <div className="relative overflow-hidden rounded-xl border border-zinc-100 bg-white p-3 shadow-sm"
            style={{ width: QR_SIZE + 24, height: QR_SIZE + 24 }}>
            <canvas
              ref={canvasRef}
              width={QR_SIZE}
              height={QR_SIZE}
              className={cn(
                'block transition-opacity duration-200',
                ready ? 'opacity-100' : 'opacity-0',
              )}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-700" />
              </div>
            )}
          </div>

          <div className="w-full space-y-0.5 text-center">
            <p className="text-sm font-medium text-zinc-900 leading-snug">{folio.description}</p>
            <p className="text-xs text-zinc-500">{folio.material_code} · Lote {folio.lot || '—'}</p>
            <p className="text-xs text-zinc-400">OC {folio.oc} · Pos {folio.position || '—'}</p>
          </div>

          <p className="max-w-full break-all text-center text-[10px] leading-tight text-zinc-300">
            {generatePublicUrl(folio.public_token)}
          </p>

          <div className="flex w-full gap-2">
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs"
              onClick={handleDownload} disabled={!ready}>
              <Download className="h-3.5 w-3.5" /> Descargar
            </Button>
            <Button variant="outline" size="sm" className="flex-1 gap-1.5 text-xs"
              onClick={handlePrint} disabled={!ready}>
              <Printer className="h-3.5 w-3.5" /> Imprimir
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
