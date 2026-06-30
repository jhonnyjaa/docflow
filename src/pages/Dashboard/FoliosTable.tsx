import { useState, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import {
  ChevronUp, ChevronDown, ChevronsUpDown, Eye, QrCode,
  Copy, Check, FileText, Share2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { formatDate, copyToClipboard, generatePublicUrl } from '@/lib/utils'
import { STATUS_CONFIG } from '@/types'
import { cn } from '@/lib/utils'
import type { Folio } from '@/types'

interface Props {
  folios: Folio[]
  onViewFolio: (folio: Folio) => void
  onQR: (folio: Folio) => void
  globalFilter: string
}

function SortIcon({ sorted }: { sorted: false | 'asc' | 'desc' }) {
  if (!sorted) return <ChevronsUpDown className="h-3 w-3 text-zinc-300" />
  return sorted === 'asc'
    ? <ChevronUp className="h-3 w-3 text-zinc-600" />
    : <ChevronDown className="h-3 w-3 text-zinc-600" />
}

const PAGE_SIZES = [20, 50, 100]

export function FoliosTable({ folios, onViewFolio, onQR, globalFilter }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [sharedId, setSharedId] = useState<string | null>(null)
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 })

  const handleCopy = async (folio: Folio) => {
    await copyToClipboard(generatePublicUrl(folio.public_token))
    setCopiedId(folio.id)
    toast.success('Enlace copiado')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleShare = async (folio: Folio) => {
    const url = generatePublicUrl(folio.public_token)
    const text = `DocFlow — Documentos del material\n\nMaterial: ${folio.description}\nCódigo: ${folio.material_code}  ·  Lote: ${folio.lot || '—'}\nOC: ${folio.oc}  ·  Pos: ${folio.position || '—'}\nProveedor: ${folio.supplier_name}\nEstado: ${STATUS_CONFIG[folio.status].label}\n\nConsultar documentos:\n${url}`
    await copyToClipboard(text)
    setSharedId(folio.id)
    toast.success('Información copiada — listo para pegar')
    setTimeout(() => setSharedId(null), 2500)
  }

  const columns: ColumnDef<Folio>[] = useMemo(() => [
    {
      accessorKey: 'oc',
      header: 'OC',
      size: 120,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs text-zinc-700">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'position',
      header: 'Pos.',
      size: 55,
      cell: ({ getValue }) => (
        <span className="text-xs text-zinc-500">{(getValue() as string) || '—'}</span>
      ),
    },
    {
      accessorKey: 'material_code',
      header: 'Código',
      size: 90,
      cell: ({ getValue }) => (
        <span className="font-mono text-xs font-medium text-zinc-800">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      size: 210,
      cell: ({ getValue }) => (
        <span className="text-sm text-zinc-700 line-clamp-2">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'lot',
      header: 'Lote',
      size: 110,
      cell: ({ getValue }) => (
        <span className="text-xs text-zinc-500">{(getValue() as string) || '—'}</span>
      ),
    },
    {
      accessorKey: 'supplier_name',
      header: 'Proveedor',
      size: 140,
      cell: ({ getValue }) => (
        <span className="text-xs text-zinc-700">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'quantity',
      header: 'Cant.',
      size: 80,
      cell: ({ row }) => (
        <span className="text-xs text-zinc-600">{row.original.quantity} {row.original.unit}</span>
      ),
    },
    {
      accessorKey: 'date',
      header: 'Fecha',
      size: 100,
      cell: ({ getValue }) => (
        <span className="text-xs text-zinc-500">{formatDate(getValue() as string)}</span>
      ),
    },
    {
      id: 'docs',
      header: 'Docs.',
      size: 65,
      enableSorting: false,
      cell: ({ row }) => {
        const n = (row.original.documents ?? []).length
        return (
          <span className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
            n > 0 ? 'bg-blue-50 text-blue-700' : 'bg-zinc-100 text-zinc-400',
          )}>
            <FileText className="h-2.5 w-2.5" />{n}
          </span>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 120,
      cell: ({ getValue }) => (
        <StatusBadge status={getValue() as 'complete' | 'incomplete' | 'pending'} size="sm" />
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      size: 140,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" size="icon-sm" onClick={() => onViewFolio(row.original)} title="Ver detalle">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => onQR(row.original)} title="Generar QR">
            <QrCode className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => handleCopy(row.original)} title="Copiar enlace">
            {copiedId === row.original.id
              ? <Check className="h-3.5 w-3.5 text-emerald-500" />
              : <Copy className="h-3.5 w-3.5" />}
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => handleShare(row.original)} title="Compartir info">
            {sharedId === row.original.id
              ? <Check className="h-3.5 w-3.5 text-emerald-500" />
              : <Share2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      ),
    },
  ], [onViewFolio, onQR, copiedId, sharedId])

  const table = useReactTable({
    data: folios,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: 'includesString',
  })

  const rows = table.getRowModel().rows
  const totalFiltered = table.getFilteredRowModel().rows.length
  const { pageIndex, pageSize } = table.getState().pagination
  const from = pageIndex * pageSize + 1
  const to = Math.min((pageIndex + 1) * pageSize, totalFiltered)

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[1120px] border-collapse">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50/80">
              {table.getFlatHeaders().map(h => (
                <th key={h.id} style={{ width: h.getSize() }}
                  className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {h.column.getCanSort() ? (
                    <button className="flex items-center gap-1 hover:text-zinc-700"
                      onClick={h.column.getToggleSortingHandler()}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      <SortIcon sorted={h.column.getIsSorted()} />
                    </button>
                  ) : flexRender(h.column.columnDef.header, h.getContext())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-14 text-center text-sm text-zinc-400">
                  No se encontraron folios
                </td>
              </tr>
            ) : rows.map((row, i) => (
              <tr key={row.id}
                className={cn(
                  'border-b border-zinc-50 last:border-0 transition-colors',
                  i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/30',
                  'hover:bg-blue-50/20',
                )}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-3 py-2.5" style={{ width: cell.column.getSize() }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination bar */}
      <div className="flex items-center justify-between border-t border-zinc-100 px-4 py-2.5">
        <div className="flex items-center gap-3">
          <p className="text-xs text-zinc-500">
            {totalFiltered === 0 ? '0 folios' : `${from}–${to} de ${totalFiltered} folios`}
          </p>
          <select
            value={pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="rounded border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-300"
          >
            {PAGE_SIZES.map(s => <option key={s} value={s}>{s} por página</option>)}
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm"
            onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
            className="h-7 gap-1 px-2 text-xs">
            <ChevronLeft className="h-3.5 w-3.5" /> Anterior
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(table.getPageCount(), 7) }).map((_, i) => {
              const pc = table.getPageCount()
              let page = i
              if (pc > 7) {
                const mid = Math.min(Math.max(pageIndex, 3), pc - 4)
                page = i < 2 ? i : i === 2 ? (pageIndex > 3 ? -1 : 2) : i === 4 ? (pageIndex < pc - 4 ? -1 : pc - 3) : mid + i - 3
              }
              if (page === -1) return <span key={i} className="px-1 text-xs text-zinc-400">…</span>
              return (
                <button key={page} onClick={() => table.setPageIndex(page)}
                  className={cn('flex h-7 w-7 items-center justify-center rounded text-xs transition-colors',
                    pageIndex === page ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100')}>
                  {page + 1}
                </button>
              )
            })}
          </div>
          <Button variant="outline" size="sm"
            onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
            className="h-7 gap-1 px-2 text-xs">
            Siguiente <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
