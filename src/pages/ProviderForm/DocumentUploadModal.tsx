import { FileText, X, Check } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FileUploadZone } from '@/components/shared/FileUploadZone'
import { Button } from '@/components/ui/button'
import { DOC_TYPE_LABELS, type DocType, type RowDocuments } from '@/types'

const DOC_TYPES: DocType[] = ['quality_cert', 'tech_sheet', 'safety_sheet', 'other']

interface DocumentUploadModalProps {
  open: boolean
  onClose: () => void
  rowIndex: number
  materialCode: string
  description: string
  documents: RowDocuments
  onChange: (docType: DocType, file: File | null) => void
}

export function DocumentUploadModal({
  open,
  onClose,
  rowIndex,
  materialCode,
  description,
  documents,
  onChange,
}: DocumentUploadModalProps) {
  const uploadedCount = Object.values(documents).filter(Boolean).length

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-zinc-500" />
            Documentos — Ítem {rowIndex + 1}
          </DialogTitle>
          {(materialCode || description) && (
            <p className="text-xs text-zinc-500">
              {materialCode && <span className="font-medium text-zinc-700">{materialCode}</span>}
              {materialCode && description && ' · '}
              {description}
            </p>
          )}
        </DialogHeader>

        <div className="space-y-3 py-1">
          {DOC_TYPES.map((docType) => (
            <div key={docType} className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-zinc-700">
                  {DOC_TYPE_LABELS[docType]}
                </span>
                {documents[docType] && (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                )}
              </div>
              <FileUploadZone
                value={documents[docType]}
                onChange={(file) => onChange(docType, file)}
                label="Arrastra el PDF o haz clic"
                compact
              />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-zinc-500">
            {uploadedCount} documento{uploadedCount !== 1 ? 's' : ''} cargado{uploadedCount !== 1 ? 's' : ''}
          </span>
          <Button size="sm" onClick={onClose}>
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
