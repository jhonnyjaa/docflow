export type FolioStatus = 'complete' | 'incomplete' | 'pending'

export type DocType = 'quality_cert' | 'tech_sheet' | 'safety_sheet' | 'other'

export interface Folio {
  id: string
  public_token: string
  oc: string
  position: string
  material_code: string
  lot: string
  description: string
  quantity: number
  unit: string
  date: string
  supplier_name: string
  supplier_email?: string
  observation?: string
  status: FolioStatus
  created_at: string
  updated_at: string
  documents?: FolioDocument[]
}

export interface FolioDocument {
  id: string
  folio_id: string
  doc_type: DocType
  doc_name: string
  file_path: string
  file_name: string
  file_url?: string
  uploaded_by: string
  created_at: string
}

export interface SubmissionRow {
  id: string
  oc: string
  position: string
  material_code: string
  lot: string
  description: string
  quantity: string
  unit: string
  date: string
  observation: string
  documents: RowDocuments
}

export interface RowDocuments {
  quality_cert?: File | null
  tech_sheet?: File | null
  safety_sheet?: File | null
  other?: File | null
}

export const DOC_TYPE_LABELS: Record<DocType, string> = {
  quality_cert: 'Certificado de calidad',
  tech_sheet: 'Ficha técnica',
  safety_sheet: 'Hoja de seguridad',
  other: 'Otro documento',
}

export const UNIT_OPTIONS = ['KG', 'LT', 'MT', 'UND', 'TON', 'GL', 'M2', 'M3', 'PZA', 'CJA', 'PAQ']

export const STATUS_CONFIG: Record<FolioStatus, { label: string; color: string; bg: string }> = {
  complete: { label: 'Completo', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  incomplete: { label: 'Incompleto', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
  pending: { label: 'Pendiente', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
}
