import { useState, useRef, useCallback, useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { Plus, Trash2, FolderOpen, FileCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { DocumentUploadModal } from './DocumentUploadModal'
import { UNIT_OPTIONS, type SubmissionRow, type DocType } from '@/types'
import { cn } from '@/lib/utils'

const EDITABLE_COLS = ['oc', 'position', 'material_code', 'lot', 'description', 'quantity', 'observation']

// Excel-like cell: local state, commits to parent only on blur/Enter/Tab
function ExcelInput({
  rowId,
  colId,
  rowIndex,
  initialValue,
  onCommit,
  placeholder = '',
  type = 'text',
  align = 'left',
}: {
  rowId: string
  colId: string
  rowIndex: number
  initialValue: string
  onCommit: (rowId: string, colId: string, value: string) => void
  placeholder?: string
  type?: string
  align?: 'left' | 'right'
}) {
  const [value, setValue] = useState(initialValue)
  const ref = useRef<HTMLInputElement>(null)
  // Keep a ref to avoid stale closure in handleBlur
  const valueRef = useRef(value)
  valueRef.current = value
  const initialRef = useRef(initialValue)
  initialRef.current = initialValue

  // Sync when parent resets this row (e.g. clearing the form)
  const prevInitial = useRef(initialValue)
  if (prevInitial.current !== initialValue) {
    prevInitial.current = initialValue
    setValue(initialValue)
  }

  const navigate = (direction: 'next-col' | 'prev-col' | 'next-row' | 'prev-row') => {
    const sel = (c: string, r: number) => `[data-excell="${c}-${r}"]`
    let el: HTMLElement | null = null
    if (direction === 'next-col') el = document.querySelector(sel(colId, rowIndex + 1))
    if (direction === 'prev-col') el = document.querySelector(sel(colId, rowIndex - 1))
    if (direction === 'next-row') {
      const idx = EDITABLE_COLS.indexOf(colId)
      if (idx < EDITABLE_COLS.length - 1)
        el = document.querySelector(sel(EDITABLE_COLS[idx + 1], rowIndex))
      else
        el = document.querySelector(sel(EDITABLE_COLS[0], rowIndex + 1))
    }
    if (direction === 'prev-row') {
      const idx = EDITABLE_COLS.indexOf(colId)
      if (idx > 0)
        el = document.querySelector(sel(EDITABLE_COLS[idx - 1], rowIndex))
    }
    ;(el as HTMLInputElement | null)?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault()
      if (valueRef.current !== initialRef.current) onCommit(rowId, colId, valueRef.current)
      navigate('next-col')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (valueRef.current !== initialRef.current) onCommit(rowId, colId, valueRef.current)
      navigate('prev-col')
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      if (valueRef.current !== initialRef.current) onCommit(rowId, colId, valueRef.current)
      navigate('next-row')
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault()
      if (valueRef.current !== initialRef.current) onCommit(rowId, colId, valueRef.current)
      navigate('prev-row')
    } else if (e.key === 'Escape') {
      setValue(initialValue)
      ref.current?.blur()
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (valueRef.current === initialRef.current) return
    // Defer commit so the browser can settle focus on the next cell first.
    // This prevents the parent re-render from interrupting the native focus transfer.
    const v = valueRef.current
    const relatedTarget = e.relatedTarget as HTMLElement | null
    const delay = relatedTarget?.hasAttribute('data-excell') ? 0 : 0
    setTimeout(() => onCommit(rowId, colId, v), delay)
  }

  return (
    <input
      ref={ref}
      data-excell={`${colId}-${rowIndex}`}
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={cn(
        'w-full border-0 bg-transparent px-1.5 py-1 text-[11px] text-zinc-900 outline-none',
        'placeholder:text-zinc-300',
        'focus:bg-blue-50 focus:ring-1 focus:ring-inset focus:ring-blue-400',
        'hover:bg-zinc-50',
        'transition-colors duration-75',
        align === 'right' && 'text-right',
      )}
    />
  )
}

function UnitSelect({
  rowId,
  rowIndex,
  value,
  onCommit,
}: {
  rowId: string
  rowIndex: number
  value: string
  onCommit: (rowId: string, colId: string, value: string) => void
}) {
  return (
    <select
      data-excell={`unit-${rowIndex}`}
      value={value}
      onChange={e => onCommit(rowId, 'unit', e.target.value)}
      className="w-full border-0 bg-transparent px-1.5 py-1.0 text-[11px] text-zinc-700 outline-none hover:bg-zinc-50 focus:bg-blue-50 focus:ring-1 focus:ring-inset focus:ring-blue-400"
    >
      <option value="">UM</option>
      {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
    </select>
  )
}

function DateInput({
  rowId,
  rowIndex,
  value,
  onCommit,
}: {
  rowId: string
  rowIndex: number
  value: string
  onCommit: (rowId: string, colId: string, value: string) => void
}) {
  return (
    <input
      data-excell={`date-${rowIndex}`}
      type="date"
      value={value}
      onChange={e => onCommit(rowId, 'date', e.target.value)}
      className="w-full border-0 bg-transparent px-1.5 py-1.5 text-[11px] text-zinc-700 outline-none hover:bg-zinc-50 focus:bg-blue-50 focus:ring-1 focus:ring-inset focus:ring-blue-400"
    />
  )
}

interface ItemsGridProps {
  rows: SubmissionRow[]
  onChange: (rows: SubmissionRow[]) => void
}

export function ItemsGrid({ rows, onChange }: ItemsGridProps) {
  const [docModal, setDocModal] = useState<{ open: boolean; rowIndex: number }>({
    open: false, rowIndex: 0,
  })

  // Always-current reference to rows — lets callbacks be stable (no stale closures)
  const rowsRef = useRef(rows)
  rowsRef.current = rows

  // Stable: onChange is setRows from useState, which is always the same reference
  const commitUpdate = useCallback((rowId: string, colId: string, value: string) => {
    onChange(rowsRef.current.map(r => r.id === rowId ? { ...r, [colId]: value } : r))
  }, [onChange])

  const updateDocuments = useCallback((rowIndex: number, docType: DocType, file: File | null) => {
    onChange(
      rowsRef.current.map((r, i) =>
        i === rowIndex ? { ...r, documents: { ...r.documents, [docType]: file } } : r,
      ),
    )
  }, [onChange])

  const addRow = useCallback(() => {
    onChange([...rowsRef.current, {
      id: crypto.randomUUID(), oc: '', position: '', material_code: '', lot: '',
      description: '', quantity: '', unit: '',
      date: new Date().toISOString().split('T')[0],
      observation: '', documents: {},
    }])
  }, [onChange])

  const removeRow = useCallback((index: number) => {
    if (rowsRef.current.length === 1) return
    onChange(rowsRef.current.filter((_, i) => i !== index))
  }, [onChange])

  // Columns are stable as long as commitUpdate/removeRow are stable.
  // Only recreate when row count changes (affects the delete button's disabled state).
  const rowCount = rows.length
  const columns: ColumnDef<SubmissionRow>[] = useMemo(() => [
    {
      id: 'rowNum', header: '#', size: 20,
      cell: ({ row }) => (
        <span className="flex items-center justify-center text-[11px] text-zinc-400 select-none">
          {row.index + 1}
        </span>
      ),
    },
    {
      accessorKey: 'oc', header: 'OC', size: 70,
      cell: ({ row }) => (
        <ExcelInput rowId={row.original.id} colId="oc" rowIndex={row.index}
          initialValue={row.original.oc} onCommit={commitUpdate} placeholder="OC-0001" />
      ),
    },
    {
      accessorKey: 'position', header: 'Pos.', size: 40,
      cell: ({ row }) => (
        <ExcelInput rowId={row.original.id} colId="position" rowIndex={row.index}
          initialValue={row.original.position} onCommit={commitUpdate} placeholder="01" />
      ),
    },
    {
      accessorKey: 'material_code', header: 'Código', size: 75,
      cell: ({ row }) => (
        <ExcelInput rowId={row.original.id} colId="material_code" rowIndex={row.index}
          initialValue={row.original.material_code} onCommit={commitUpdate} placeholder="MAT-001" />
      ),
    },
    {
      accessorKey: 'lot', header: 'Lote', size: 80,
      cell: ({ row }) => (
        <ExcelInput rowId={row.original.id} colId="lot" rowIndex={row.index}
          initialValue={row.original.lot} onCommit={commitUpdate} placeholder="LOTE-001" />
      ),
    },
    {
      accessorKey: 'description', header: 'Descripción', size: 190,
      cell: ({ row }) => (
        <ExcelInput rowId={row.original.id} colId="description" rowIndex={row.index}
          initialValue={row.original.description} onCommit={commitUpdate} placeholder="Descripción" />
      ),
    },
    {
      accessorKey: 'quantity', header: 'Cant.', size: 55,
      cell: ({ row }) => (
        <ExcelInput rowId={row.original.id} colId="quantity" rowIndex={row.index}
          initialValue={row.original.quantity} onCommit={commitUpdate} placeholder="0"
          type="number" align="right" />
      ),
    },
    {
      accessorKey: 'unit', header: 'UM', size: 55,
      cell: ({ row }) => (
        <UnitSelect rowId={row.original.id} rowIndex={row.index}
          value={row.original.unit} onCommit={commitUpdate} />
      ),
    },
    {
      accessorKey: 'date', header: 'Fecha', size: 80,
      cell: ({ row }) => (
        <DateInput rowId={row.original.id} rowIndex={row.index}
          value={row.original.date} onCommit={commitUpdate} />
      ),
    },
    {
      id: 'documents', header: 'Documentos', size: 80,
      cell: ({ row }) => {
        const count = Object.values(row.original.documents).filter(Boolean).length
        return (
          <button type="button"
            onClick={() => setDocModal({ open: true, rowIndex: row.index })}
            className={cn(
              'flex w-full items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium transition-colors',
              count > 0 ? 'text-emerald-700 hover:bg-emerald-50' : 'text-zinc-400 hover:bg-zinc-50',
            )}>
            {count > 0
              ? <FileCheck className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              : <FolderOpen className="h-3.5 w-3.5 shrink-0" />}
            {count > 0 ? `${count} doc${count > 1 ? 's' : ''}` : 'Cargar'}
          </button>
        )
      },
    },
    {
      id: 'observation', header: 'Obser.', size: 80,
      cell: ({ row }) => (
        <ExcelInput rowId={row.original.id} colId="observation" rowIndex={row.index}
          initialValue={row.original.observation} onCommit={commitUpdate} placeholder="Opcional" />
      ),
    },
    {
      id: 'del', header: '', size: 30,
      cell: ({ row }) => (
        <button type="button" onClick={() => removeRow(row.index)}
          disabled={rowCount === 1}
          className="mx-auto flex h-6 w-6 items-center justify-center rounded text-zinc-300 hover:bg-red-50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 transition-colors">
          <Trash2 className="h-3 w-3" />
        </button>
      ),
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [commitUpdate, removeRow, rowCount])

  const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })
  const activeRow = rows[docModal.rowIndex]

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm scrollbar-thin">
        <table className="w-full min-w-[960px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-100/80">
              {table.getFlatHeaders().map(header => (
                <th key={header.id} style={{ width: header.getSize() }}
                  className="px-2 py-1 text-left text-[9px] font-semibold uppercase tracking-wider text-zinc-500 border-r border-zinc-200 last:border-r-0">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr key={row.original.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.12 }}
                  className={cn(
                    'border-b border-zinc-50 last:border-0 group',
                    i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40',
                    'hover:bg-blue-50/30 transition-colors duration-75',
                  )}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="p-0 border-r border-zinc-200 last:border-r-0" style={{ width: cell.column.getSize() }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={addRow} className="gap-1.5 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Agregar fila
        </Button>
        <p className="text-[11px] text-zinc-400">
          Tab / Enter para navegar · Esc para cancelar
        </p>
      </div>

      <DocumentUploadModal
        open={docModal.open}
        onClose={() => setDocModal(m => ({ ...m, open: false }))}
        rowIndex={docModal.rowIndex}
        materialCode={activeRow?.material_code || ''}
        description={activeRow?.description || ''}
        documents={activeRow?.documents || {}}
        onChange={(docType, file) => updateDocuments(docModal.rowIndex, docType, file)}
      />
    </div>
  )
}
