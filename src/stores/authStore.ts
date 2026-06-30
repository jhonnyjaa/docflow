import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  demoMode: boolean
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  setLoading: (loading: boolean) => void
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'admin@empresa.com',
  created_at: '2026-01-01T00:00:00Z',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: { full_name: 'Admin Demo' },
  identities: [],
  factors: [],
  updated_at: '2026-01-01T00:00:00Z',
  phone: '',
}

const DEMO_CREDENTIALS = [
  { email: 'admin@empresa.com', password: 'demo1234' },
  { email: 'calidad@empresa.com', password: 'demo1234' },
  { email: 'almacen@empresa.com', password: 'demo1234' },
]

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: false,
      demoMode: !isSupabaseConfigured,

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),

      signIn: async (email: string, password: string) => {
        set({ loading: true })
        const { demoMode } = get()

        if (demoMode) {
          const match = DEMO_CREDENTIALS.find(c => c.email === email && c.password === password)
          if (match) {
            const user = { ...DEMO_USER, email, user_metadata: { full_name: email.split('@')[0] } }
            set({ user, loading: false })
            return {}
          }
          set({ loading: false })
          return { error: 'Credenciales incorrectas' }
        }

        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        set({ loading: false })
        if (error) return { error: error.message }
        set({ user: data.user, session: data.session })
        return {}
      },

      signOut: async () => {
        const { demoMode } = get()
        if (!demoMode) await supabase.auth.signOut()
        set({ user: null, session: null })
      },

      initialize: async () => {
        const { demoMode } = get()
        if (demoMode) return

        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          set({ user: session.user, session })
        }

        supabase.auth.onAuthStateChange((_event, session) => {
          set({ user: session?.user || null, session: session || null })
        })
      },
    }),
    {
      name: 'docflow-auth',
      partialize: (state) => ({ user: state.user, session: state.session }),
    },
  ),
)
