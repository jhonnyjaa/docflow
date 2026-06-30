import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, FileText, X } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'

interface FileUploadZoneProps {
  value?: File | null
  onChange: (file: File | null) => void
  label?: string
  compact?: boolean
}

/** Truncates a filename keeping extension visible: "documento_muy_lar...pdf" */
function truncateFilename(name: string, maxLen = 30): string {
  const dotIdx = name.lastIndexOf('.')
  if (dotIdx <= 0) {
    return name.length > maxLen ? name.slice(0, maxLen - 3) + '...' : name
  }
  const ext = name.slice(dotIdx)        // ".pdf"
  const base = name.slice(0, dotIdx)    // "documento_muy_largo"
  if (name.length <= maxLen) return name
  const keep = maxLen - ext.length - 3  // chars to keep from base
  return keep > 0 ? base.slice(0, keep) + '...' + ext : '...' + ext
}

export function FileUploadZone({
  value,
  onChange,
  label = 'Arrastra un PDF o haz clic',
  compact = false,
}: FileUploadZoneProps) {
  const onDrop = useCallback((accepted: File[]) => {
    if (accepted[0]) onChange(accepted[0])
  }, [onChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  })

  if (value) {
    const shortName = truncateFilename(value.name, compact ? 26 : 32)
    return (
      <div className="flex w-full items-center justify-between gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-emerald-800" title={value.name}>{shortName}</p>
            <p className="text-[10px] text-emerald-600">{formatFileSize(value.size)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onChange(null) }}
          className="ml-1 shrink-0 rounded-full p-0.5 text-emerald-600 hover:bg-emerald-100"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'w-full cursor-pointer rounded-lg border-2 border-dashed transition-colors',
        isDragActive
          ? 'border-zinc-400 bg-zinc-50'
          : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50',
        compact ? 'px-3 py-2' : 'px-4 py-3',
      )}
    >
      <input {...getInputProps()} />
      <div className="flex items-center gap-2 text-zinc-400">
        <UploadCloud className={compact ? 'h-4 w-4 shrink-0' : 'h-5 w-5 shrink-0'} />
        <div className="min-w-0">
          <p className={cn('truncate', compact ? 'text-xs' : 'text-sm')}>{label}</p>
          {!compact && <p className="text-[11px] text-zinc-400">PDF hasta 20MB</p>}
        </div>
      </div>
    </div>
  )
}
