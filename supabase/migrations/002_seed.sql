-- DocFlow — Datos de prueba (demo seed)
-- Ejecutar DESPUÉS de 001_schema.sql

-- ============================================
-- FOLIOS DEMO
-- ============================================
INSERT INTO folios (id, public_token, oc, position, material_code, lot, description, quantity, unit, date, supplier_name, supplier_email, observation, status)
VALUES
  (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'aa11bb22-cc33-dd44-ee55-ff6677889900',
    'OC-2026-0142', '01', 'A-001', 'LOTE-2026-06-A',
    'Acero inoxidable 304 plancha 3mm',
    50, 'KG', '2026-06-20',
    'Aceros SAC', 'ventas@aceros.pe',
    'Material para proyecto línea 3',
    'complete'
  ),
  (
    'b2c3d4e5-f6a7-8901-bcde-f01234567891',
    'bb22cc33-dd44-ee55-ff66-aabb00112233',
    'OC-2026-0142', '02', 'T-204', 'LOTE-2026-06-B',
    'Tornillo M8 x 50mm acero galvanizado',
    500, 'UND', '2026-06-21',
    'Ferremax', 'pedidos@ferremax.com',
    NULL,
    'incomplete'
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-012345678902',
    'cc33dd44-ee55-ff66-aa77-bbcc00112244',
    'OC-2026-0155', '01', 'P-778', 'LOTE-EP-0887',
    'Pintura epóxica bicomponente color gris',
    20, 'GL', '2026-06-22',
    'QuimPerú', 'soporte@quimperu.com',
    'Requiere hoja MSDS actualizada',
    'pending'
  ),
  (
    'd4e5f6a7-b8c9-0123-defa-0123456789a3',
    'dd44ee55-ff66-aa77-bb88-ccdd00112255',
    'OC-2026-0160', '01', 'C-512', 'LOTE-CAB-2026-06',
    'Cable eléctrico THW 14AWG color rojo',
    200, 'MT', '2026-06-25',
    'Eléctricas del Norte', 'ventas@electricanorte.pe',
    NULL,
    'complete'
  ),
  (
    'e5f6a7b8-c9d0-1234-efab-0123456789b4',
    'ee55ff66-aa77-bb88-cc99-ddee00112266',
    'OC-2026-0160', '02', 'C-513', 'LOTE-CAB-2026-06',
    'Cable eléctrico THW 14AWG color negro',
    200, 'MT', '2026-06-25',
    'Eléctricas del Norte', 'ventas@electricanorte.pe',
    NULL,
    'pending'
  ),
  (
    'f6a7b8c9-d0e1-2345-fabc-0123456789c5',
    'ff66aa77-bb88-cc99-dd00-eeff00112277',
    'OC-2026-0171', '01', 'B-044', 'LOTE-B044-2026',
    'Brida ciega DN100 clase 150 ASME',
    10, 'UND', '2026-06-28',
    'Tuberías Industriales', 'ventas@tubind.pe',
    'Urgente para parada programada',
    'pending'
  );

-- ============================================
-- DOCUMENTOS DEMO
-- ============================================
INSERT INTO documents (folio_id, doc_type, doc_name, file_path, file_name, uploaded_by)
VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'quality_cert', 'Certificado de calidad', 'demo/quality_cert/cert_acero.pdf', 'cert_acero.pdf', 'supplier'),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'tech_sheet', 'Ficha técnica', 'demo/tech_sheet/ficha_acero.pdf', 'ficha_acero.pdf', 'supplier'),
  ('b2c3d4e5-f6a7-8901-bcde-f01234567891', 'quality_cert', 'Certificado de calidad', 'demo/quality_cert/cert_tornillo.pdf', 'cert_tornillo.pdf', 'supplier'),
  ('c3d4e5f6-a7b8-9012-cdef-012345678902', 'safety_sheet', 'Hoja de seguridad', 'demo/safety_sheet/msds_pintura.pdf', 'msds_pintura.pdf', 'supplier'),
  ('d4e5f6a7-b8c9-0123-defa-0123456789a3', 'quality_cert', 'Certificado de calidad', 'demo/quality_cert/cert_cable.pdf', 'cert_cable.pdf', 'supplier'),
  ('d4e5f6a7-b8c9-0123-defa-0123456789a3', 'tech_sheet', 'Ficha técnica', 'demo/tech_sheet/ficha_cable.pdf', 'ficha_cable.pdf', 'internal');

-- ============================================
-- USUARIOS DEMO (via Supabase Auth)
-- ============================================
-- Los usuarios demo se crean desde el Dashboard de Supabase o via API.
-- Ve a Authentication > Users > Add user y crea:
--
--   admin@empresa.com      / demo1234
--   calidad@empresa.com    / demo1234
--   almacen@empresa.com    / demo1234
--
-- O puedes usar la API de Supabase Admin para crearlos automáticamente.
-- Ver README para instrucciones detalladas.
