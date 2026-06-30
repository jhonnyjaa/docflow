import { createClient } from '@supabase/supabase-js'
import type { Folio, FolioDocument } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder')

export const isSupabaseConfigured = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
)

export async function uploadDocument(
  folioId: string,
  docType: string,
  file: File,
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${folioId}/${docType}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('documents').upload(path, file)
  if (error) throw error
  return path
}

export function getDocumentUrl(path: string): string {
  const { data } = supabase.storage.from('documents').getPublicUrl(path)
  return data.publicUrl
}

export async function createFolio(data: Omit<Folio, 'id' | 'public_token' | 'created_at' | 'updated_at' | 'documents'>): Promise<Folio> {
  const { data: folio, error } = await supabase
    .from('folios')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return folio
}

export async function createDocument(data: Omit<FolioDocument, 'id' | 'created_at'>): Promise<FolioDocument> {
  const { data: doc, error } = await supabase
    .from('documents')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return doc
}

export async function getFolios(): Promise<Folio[]> {
  const { data, error } = await supabase
    .from('folios')
    .select('*, documents(*)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getFolioByToken(token: string): Promise<Folio | null> {
  const { data, error } = await supabase
    .from('folios')
    .select('*, documents(*)')
    .eq('public_token', token)
    .single()
  if (error) return null
  return data
}

export async function getFolioById(id: string): Promise<Folio | null> {
  const { data, error } = await supabase
    .from('folios')
    .select('*, documents(*)')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function updateFolioStatus(id: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('folios')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function updateFolioObservation(id: string, observation: string): Promise<void> {
  const { error } = await supabase
    .from('folios')
    .update({ observation, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteDocument(id: string, filePath: string): Promise<void> {
  await supabase.storage.from('documents').remove([filePath])
  const { error } = await supabase.from('documents').delete().eq('id', id)
  if (error) throw error
}
