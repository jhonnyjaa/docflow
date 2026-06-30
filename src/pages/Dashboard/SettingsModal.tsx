import { useState, useEffect } from 'react'
import { Save, Lock, User, Info, LogOut } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/authStore'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

const DISPLAY_NAME_KEY = 'docflow_display_name'

export function getDisplayName(email: string): string {
  return localStorage.getItem(DISPLAY_NAME_KEY) || email.split('@')[0]
}

interface Props {
  open: boolean
  onClose: () => void
}

export function SettingsModal({ open, onClose }: Props) {
  const { user, signOut } = useAuthStore()
  const email = user?.email || ''

  const [displayName, setDisplayName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)

  useEffect(() => {
    if (open) {
      setDisplayName(getDisplayName(email))
      setCurrentPwd('')
      setNewPwd('')
    }
  }, [open, email])

  const handleSaveName = () => {
    if (!displayName.trim()) return
    setSavingName(true)
    localStorage.setItem(DISPLAY_NAME_KEY, displayName.trim())
    setTimeout(() => {
      setSavingName(false)
      toast.success('Nombre actualizado')
      onClose()
      window.location.reload()
    }, 300)
  }

  const handleChangePwd = async () => {
    if (!newPwd || newPwd.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setSavingPwd(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPwd })
      if (error) throw error
      toast.success('Contraseña actualizada')
      setCurrentPwd(''); setNewPwd('')
    } catch (e: unknown) {
      toast.error((e as Error).message || 'Error al cambiar contraseña')
    } finally {
      setSavingPwd(false) }
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
    window.location.href = '/login'
  }

  const initials = displayName.slice(0, 2).toUpperCase() || email.slice(0, 2).toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Configuración</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* User info */}
          <div className="flex items-center gap-3 rounded-xl bg-zinc-50 p-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-zinc-900 truncate">{displayName || email.split('@')[0]}</p>
              <p className="text-xs text-zinc-500 truncate">{email}</p>
              <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                isSupabaseConfigured
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-amber-50 text-amber-700'}`}>
                {isSupabaseConfigured ? 'Supabase' : 'Modo demo'}
              </span>
            </div>
          </div>

          {/* Display name */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-medium text-zinc-800">Nombre para mostrar</h3>
            </div>
            <div className="flex gap-2">
              <Input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Tu nombre"
                className="flex-1"
                onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              />
              <Button size="sm" onClick={handleSaveName} disabled={savingName || !displayName.trim()}>
                <Save className="h-3.5 w-3.5" />
                {savingName ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Change password */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-medium text-zinc-800">Cambiar contraseña</h3>
            </div>

            {!isSupabaseConfigured ? (
              <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
                <p className="text-xs text-amber-700">
                  El cambio de contraseña está disponible cuando la app está conectada a Supabase.
                  En modo demo, las credenciales son fijas.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Contraseña actual</Label>
                  <Input type="password" value={currentPwd}
                    onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nueva contraseña</Label>
                  <Input type="password" value={newPwd}
                    onChange={e => setNewPwd(e.target.value)} placeholder="Mínimo 6 caracteres" />
                </div>
                <Button size="sm" onClick={handleChangePwd} disabled={savingPwd || !newPwd}>
                  {savingPwd ? 'Actualizando...' : 'Actualizar contraseña'}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* App info + logout */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-400">DocFlow v0.1.0</p>
              <p className="text-[10px] text-zinc-300">
                {isSupabaseConfigured ? '● Conectado a Supabase' : '● Modo demo (datos locales)'}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-1.5 text-xs text-red-600 border-red-200 hover:bg-red-50">
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
