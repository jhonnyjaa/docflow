-- DocFlow — Schema inicial
-- Ejecutar en Supabase SQL Editor

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: folios
-- ============================================
CREATE TABLE IF NOT EXISTS folios (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  public_token    UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
  oc              TEXT NOT NULL,
  position        TEXT,
  material_code   TEXT NOT NULL,
  lot             TEXT,
  description     TEXT NOT NULL,
  quantity        DECIMAL(12, 2) DEFAULT 0,
  unit            TEXT,
  date            DATE,
  supplier_name   TEXT NOT NULL,
  supplier_email  TEXT,
  observation     TEXT,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('complete', 'incomplete', 'pending')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TABLA: documents
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folio_id    UUID NOT NULL REFERENCES folios(id) ON DELETE CASCADE,
  doc_type    TEXT NOT NULL
                CHECK (doc_type IN ('quality_cert', 'tech_sheet', 'safety_sheet', 'other')),
  doc_name    TEXT NOT NULL,
  file_path   TEXT NOT NULL,
  file_name   TEXT NOT NULL,
  uploaded_by TEXT NOT NULL DEFAULT 'supplier',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_folios_status ON folios(status);
CREATE INDEX IF NOT EXISTS idx_folios_oc ON folios(oc);
CREATE INDEX IF NOT EXISTS idx_folios_supplier ON folios(supplier_name);
CREATE INDEX IF NOT EXISTS idx_folios_token ON folios(public_token);
CREATE INDEX IF NOT EXISTS idx_documents_folio ON documents(folio_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(doc_type);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_folios_updated_at
  BEFORE UPDATE ON folios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE folios    ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Folios: cualquiera puede leer (consulta pública por token)
CREATE POLICY "Lectura pública de folios"
  ON folios FOR SELECT USING (true);

-- Folios: cualquiera puede insertar (formulario público proveedor)
CREATE POLICY "Inserción pública de folios"
  ON folios FOR INSERT WITH CHECK (true);

-- Folios: solo autenticados pueden actualizar/eliminar
CREATE POLICY "Actualización solo autenticados"
  ON folios FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Eliminación solo autenticados"
  ON folios FOR DELETE USING (auth.role() = 'authenticated');

-- Documents: lectura pública
CREATE POLICY "Lectura pública de documentos"
  ON documents FOR SELECT USING (true);

-- Documents: cualquiera puede insertar (proveedor y usuario interno)
CREATE POLICY "Inserción pública de documentos"
  ON documents FOR INSERT WITH CHECK (true);

-- Documents: solo autenticados pueden eliminar
CREATE POLICY "Eliminación de documentos solo autenticados"
  ON documents FOR DELETE USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKET
-- ============================================
-- Crear el bucket en Supabase Dashboard > Storage > New Bucket
-- Nombre: documents
-- Public: true (para links directos)
-- O ejecutar via API:
--
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);
--
-- CREATE POLICY "Lectura pública storage"
--   ON storage.objects FOR SELECT USING (bucket_id = 'documents');
--
-- CREATE POLICY "Upload público storage"
--   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents');
--
-- CREATE POLICY "Eliminación autenticada storage"
--   ON storage.objects FOR DELETE USING (
--     bucket_id = 'documents' AND auth.role() = 'authenticated'
--   );
