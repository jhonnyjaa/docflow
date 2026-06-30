import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FileStack, Search, Filter, X, RefreshCw, Plus, Settings,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FoliosTable } from './FoliosTable'
import { FolioDetail } from './FolioDetail'
import { QRModal } from '@/components/shared/QRModal'
import { SettingsModal, getDisplayName } from './SettingsModal'
import { useAuthStore } from '@/stores/authStore'
import { isSupabaseConfigured, getFolios } from '@/lib/supabase'
import { getMockFolios } from '@/lib/mock-data'
import type { Folio, FolioStatus } from '@/types'
import { cn } from '@/lib/utils'

const STATUS_FILTERS: { value: FolioStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'complete', label: 'Completo' },
  { value: 'incomplete', label: 'Incompleto' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [folios, setFolios] = useState<Folio[]>([])
  const [loading, setLoading] = useState(true)
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<FolioStatus | 'all'>('all')
  const [selectedFolio, setSelectedFolio] = useState<Folio | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [qrFolio, setQrFolio] = useState<Folio | null>(null)
  const [qrOpen, setQrOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const email = user?.email || ''
  const displayName = getDisplayName(email)

  const loadFolios = useCallback(async () => {
    try {
      const data = isSupabaseConfigured ? await getFolios() : getMockFolios()
      setFolios(data)
    } catch {
      toast.error('Error al cargar folios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadFolios() }, [loadFolios])

  const handleViewFolio = (folio: Folio) => {
    setSelectedFolio(folio)
    setDetailOpen(true)
  }

  const handleQR = (folio: Folio) => {
    setQrFolio(folio)
    setQrOpen(true)
  }

  const handleUpdated = () => {
    loadFolios()
    if (selectedFolio) {
      const refreshed = getMockFolios().find(f => f.id === selectedFolio.id)
      if (refreshed) setSelectedFolio(refreshed)
    }
  }

  const filteredFolios = folios.filter(f =>
    statusFilter === 'all' || f.status === statusFilter,
  )

  const stats = {
    total: folios.length,
    complete: folios.filter(f => f.status === 'complete').length,
    incomplete: folios.filter(f => f.status === 'incomplete').length,
    pending: folios.filter(f => f.status === 'pending').length,
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Navbar */}
      <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900">
              <FileStack className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-900">DocFlow</h1>
              <p className="text-[10px] text-zinc-400">Gestión Documental</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" />
                Formulario proveedor
              </Button>
            </a>

            {/* Clickable user avatar → settings */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-2 rounded-full border border-zinc-100 bg-zinc-50 px-3 py-1.5 transition-colors hover:bg-zinc-100"
              title="Configuración"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[10px] font-semibold text-white">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs text-zinc-700">{displayName}</span>
              <Settings className="h-3.5 w-3.5 text-zinc-400" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-6 py-6">
        {/* Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total folios', value: stats.total, color: 'text-zinc-900' },
            { label: 'Completos', value: stats.complete, color: 'text-emerald-600' },
            { label: 'Incompletos', value: stats.incomplete, color: 'text-red-600' },
            { label: 'Pendientes', value: stats.pending, color: 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
              <p className={`mt-0.5 text-2xl font-semibold ${color}`}>{value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Buscar por OC, material, lote, proveedor..."
              value={globalFilter}
              onChange={e => setGlobalFilter(e.target.value)}
              className="pl-9 bg-white"
            />
            {globalFilter && (
              <button onClick={() => setGlobalFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex gap-1.5">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button key={value} onClick={() => setStatusFilter(value)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  statusFilter === value
                    ? 'bg-zinc-900 text-white'
                    : 'border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50',
                )}>
                {label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={loadFolios} className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Actualizar
          </Button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-900" />
              <p className="text-sm text-zinc-400">Cargando folios...</p>
            </div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <FoliosTable
              folios={filteredFolios}
              onViewFolio={handleViewFolio}
              onQR={handleQR}
              globalFilter={globalFilter}
            />
          </motion.div>
        )}
      </main>

      <FolioDetail folio={selectedFolio} open={detailOpen}
        onClose={() => setDetailOpen(false)} onUpdated={handleUpdated} />

      <QRModal folio={qrFolio} open={qrOpen} onClose={() => setQrOpen(false)} />

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  )
}
