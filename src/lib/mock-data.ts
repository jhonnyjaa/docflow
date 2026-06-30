import type { Folio, FolioDocument } from '@/types'

export const MOCK_DOCUMENTS: FolioDocument[] = [
  {
    id: 'doc-1', folio_id: 'folio-1', doc_type: 'quality_cert',
    doc_name: 'Certificado de calidad', file_path: 'folio-1/quality_cert/cert_acero.pdf',
    file_name: 'cert_acero.pdf', file_url: '#', uploaded_by: 'supplier',
    created_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'doc-2', folio_id: 'folio-1', doc_type: 'tech_sheet',
    doc_name: 'Ficha técnica', file_path: 'folio-1/tech_sheet/ficha_acero.pdf',
    file_name: 'ficha_acero.pdf', file_url: '#', uploaded_by: 'supplier',
    created_at: '2026-06-20T10:05:00Z',
  },
  {
    id: 'doc-3', folio_id: 'folio-2', doc_type: 'quality_cert',
    doc_name: 'Certificado de calidad', file_path: 'folio-2/quality_cert/cert_tornillo.pdf',
    file_name: 'cert_tornillo.pdf', file_url: '#', uploaded_by: 'supplier',
    created_at: '2026-06-21T09:00:00Z',
  },
  {
    id: 'doc-4', folio_id: 'folio-3', doc_type: 'safety_sheet',
    doc_name: 'Hoja de seguridad', file_path: 'folio-3/safety_sheet/msds_pintura.pdf',
    file_name: 'msds_pintura.pdf', file_url: '#', uploaded_by: 'supplier',
    created_at: '2026-06-22T14:00:00Z',
  },
  {
    id: 'doc-5', folio_id: 'folio-4', doc_type: 'quality_cert',
    doc_name: 'Certificado de calidad', file_path: 'folio-4/quality_cert/cert_cable.pdf',
    file_name: 'cert_cable.pdf', file_url: '#', uploaded_by: 'supplier',
    created_at: '2026-06-25T11:00:00Z',
  },
  {
    id: 'doc-6', folio_id: 'folio-4', doc_type: 'tech_sheet',
    doc_name: 'Ficha técnica', file_path: 'folio-4/tech_sheet/ficha_cable.pdf',
    file_name: 'ficha_cable.pdf', file_url: '#', uploaded_by: 'almacen@empresa.com',
    created_at: '2026-06-26T08:30:00Z',
  },
]

const STATIC_FOLIOS: Folio[] = [
  {
    id: 'folio-1', public_token: 'token-abc-001', oc: 'OC-2026-0142', position: '01',
    material_code: 'A-001', lot: 'LOTE-2026-06-A',
    description: 'Acero inoxidable 304 plancha 3mm', quantity: 50, unit: 'KG',
    date: '2026-06-20', supplier_name: 'Aceros SAC', supplier_email: 'ventas@aceros.pe',
    observation: 'Material para proyecto línea 3', status: 'complete',
    created_at: '2026-06-20T10:00:00Z', updated_at: '2026-06-20T10:30:00Z',
    documents: MOCK_DOCUMENTS.filter(d => d.folio_id === 'folio-1'),
  },
  {
    id: 'folio-2', public_token: 'token-abc-002', oc: 'OC-2026-0142', position: '02',
    material_code: 'T-204', lot: 'LOTE-2026-06-B',
    description: 'Tornillo M8 x 50mm acero galvanizado', quantity: 500, unit: 'UND',
    date: '2026-06-21', supplier_name: 'Ferremax', supplier_email: 'pedidos@ferremax.com',
    observation: '', status: 'incomplete',
    created_at: '2026-06-21T09:00:00Z', updated_at: '2026-06-21T09:00:00Z',
    documents: MOCK_DOCUMENTS.filter(d => d.folio_id === 'folio-2'),
  },
  {
    id: 'folio-3', public_token: 'token-abc-003', oc: 'OC-2026-0155', position: '01',
    material_code: 'P-778', lot: 'LOTE-EP-0887',
    description: 'Pintura epóxica bicomponente color gris', quantity: 20, unit: 'GL',
    date: '2026-06-22', supplier_name: 'QuimPerú', supplier_email: 'soporte@quimperu.com',
    observation: 'Requiere hoja MSDS actualizada', status: 'pending',
    created_at: '2026-06-22T14:00:00Z', updated_at: '2026-06-22T14:00:00Z',
    documents: MOCK_DOCUMENTS.filter(d => d.folio_id === 'folio-3'),
  },
  {
    id: 'folio-4', public_token: 'token-abc-004', oc: 'OC-2026-0160', position: '01',
    material_code: 'C-512', lot: 'LOTE-CAB-2026-06',
    description: 'Cable eléctrico THW 14AWG color rojo', quantity: 200, unit: 'MT',
    date: '2026-06-25', supplier_name: 'Eléctricas del Norte', supplier_email: 'ventas@electricanorte.pe',
    observation: '', status: 'complete',
    created_at: '2026-06-25T11:00:00Z', updated_at: '2026-06-26T08:30:00Z',
    documents: MOCK_DOCUMENTS.filter(d => d.folio_id === 'folio-4'),
  },
  {
    id: 'folio-5', public_token: 'token-abc-005', oc: 'OC-2026-0160', position: '02',
    material_code: 'C-513', lot: 'LOTE-CAB-2026-06',
    description: 'Cable eléctrico THW 14AWG color negro', quantity: 200, unit: 'MT',
    date: '2026-06-25', supplier_name: 'Eléctricas del Norte', supplier_email: 'ventas@electricanorte.pe',
    observation: '', status: 'pending',
    created_at: '2026-06-25T11:30:00Z', updated_at: '2026-06-25T11:30:00Z',
    documents: [],
  },
  {
    id: 'folio-6', public_token: 'token-abc-006', oc: 'OC-2026-0171', position: '01',
    material_code: 'B-044', lot: 'LOTE-B044-2026',
    description: 'Brida ciega DN100 clase 150 ASME', quantity: 10, unit: 'UND',
    date: '2026-06-28', supplier_name: 'Tuberías Industriales', supplier_email: 'ventas@tubind.pe',
    observation: 'Urgente para parada programada', status: 'pending',
    created_at: '2026-06-28T08:00:00Z', updated_at: '2026-06-28T08:00:00Z',
    documents: [],
  },
]

// ─── localStorage persistence for newly created folios in demo mode ───────────
const SESSION_KEY = 'docflow_session_folios'

function getSessionFolios(): Folio[] {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? (JSON.parse(raw) as Folio[]) : []
  } catch {
    return []
  }
}

function saveSessionFolios(folios: Folio[]): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(folios.slice(0, 200)))
  } catch {}
}

// Runtime state (session folios first so they appear as most recent)
let runtimeFolios: Folio[] = []

function ensureInit() {
  if (runtimeFolios.length > 0) return
  const session = getSessionFolios()
  const sessionIds = new Set(session.map(f => f.id))
  runtimeFolios = [...session, ...STATIC_FOLIOS.filter(f => !sessionIds.has(f.id))]
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getMockFolios(): Folio[] {
  ensureInit()
  return [...runtimeFolios]
}

export function getMockFolioByToken(token: string): Folio | null {
  ensureInit()
  return runtimeFolios.find(f => f.public_token === token) ?? null
}

export function getMockFolioById(id: string): Folio | null {
  ensureInit()
  return runtimeFolios.find(f => f.id === id) ?? null
}

export function addMockFolios(newFolios: Folio[]): void {
  ensureInit()
  runtimeFolios = [...newFolios, ...runtimeFolios]
  // Persist to localStorage so public links work in new tabs
  const session = getSessionFolios()
  const existingIds = new Set(session.map(f => f.id))
  const toAdd = newFolios.filter(f => !existingIds.has(f.id))
  saveSessionFolios([...toAdd, ...session])
}

export function updateMockFolioStatus(id: string, status: 'complete' | 'incomplete' | 'pending'): void {
  runtimeFolios = runtimeFolios.map(f =>
    f.id === id ? { ...f, status, updated_at: new Date().toISOString() } : f,
  )
}

export function updateMockFolioObservation(id: string, observation: string): void {
  runtimeFolios = runtimeFolios.map(f =>
    f.id === id ? { ...f, observation, updated_at: new Date().toISOString() } : f,
  )
}

export function addMockDocument(doc: FolioDocument): void {
  runtimeFolios = runtimeFolios.map(f =>
    f.id === doc.folio_id ? { ...f, documents: [...(f.documents ?? []), doc] } : f,
  )
}

export function deleteMockDocument(docId: string, folioId: string): void {
  runtimeFolios = runtimeFolios.map(f =>
    f.id === folioId
      ? { ...f, documents: (f.documents ?? []).filter(d => d.id !== docId) }
      : f,
  )
}
