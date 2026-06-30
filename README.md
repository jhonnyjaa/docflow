# DocFlow — Gestión Documental de Materiales

Plataforma SaaS moderna para centralizar la gestión documental de materiales en empresas de producción. Permite a proveedores cargar documentos (certificados de calidad, fichas técnicas, hojas de seguridad) y a usuarios internos consultarlos, gestionarlos y compartirlos mediante link o QR.

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (customizado) |
| Tablas | TanStack Table v8 (editable grid) |
| Estado | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| Animaciones | Framer Motion |
| QR | qrcode |
| Archivos | react-dropzone |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Storage | Supabase Storage |
| Despliegue | Vercel |

---

## Funcionalidades

### Vista pública (proveedor)
- Formulario multi-paso tipo Typeform/Calendly
- Grid editable con TanStack Table (agregar/quitar filas)
- Carga de documentos por ítem (PDF, hasta 20MB)
- Soporte multi-OC en un solo envío
- Pantalla de confirmación con links y QR por folio

### Dashboard interno (usuarios autenticados)
- Tabla full-featured con ordenamiento, búsqueda y filtros por estado
- Estadísticas en tiempo real (total, completos, incompletos, pendientes)
- Modal de detalle con gestión completa de documentos
- Cambio de estado: Completo / Incompleto / Pendiente
- Edición de observaciones
- Generación y descarga/impresión de QR
- Copiar enlace compartible

### Vista pública por link
- Solo lectura, accesible sin login
- Ficha limpia con toda la info del folio
- Documentos descargables
- QR integrado con opción de imprimir

---

## Instalación local

### Prerrequisitos
- Node.js 18+
- npm o pnpm
- Cuenta en [Supabase](https://supabase.com)

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tu-usuario/docflow.git
cd docflow
npm install
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de Supabase:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

> **Modo demo sin Supabase:** Si no configuras las variables de entorno, la app funciona con datos mock locales. Ideal para desarrollo.

### 3. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:5173`.

---

## Configuración de Supabase

### Paso 1: Crear el esquema

En Supabase Dashboard → SQL Editor, ejecuta:

```sql
-- Primero el esquema
\i supabase/migrations/001_schema.sql

-- Luego los datos demo (opcional)
\i supabase/migrations/002_seed.sql
```

O copia y pega el contenido de cada archivo en el editor SQL.

### Paso 2: Crear el bucket de Storage

En Supabase Dashboard → Storage → New Bucket:

- **Name:** `documents`
- **Public:** ✅ Activado (para links directos)

Luego en SQL Editor:

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Lectura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents');

CREATE POLICY "Upload público"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Eliminación autenticada"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND auth.role() = 'authenticated');
```

### Paso 3: Crear usuarios internos demo

En Supabase Dashboard → Authentication → Users → Add user:

| Email | Contraseña |
|-------|-----------|
| admin@empresa.com | demo1234 |
| calidad@empresa.com | demo1234 |
| almacen@empresa.com | demo1234 |

---

## Despliegue en Vercel

### Opción A: Via CLI

```bash
npm install -g vercel
vercel login
vercel
```

### Opción B: Via GitHub

1. Sube el repositorio a GitHub
2. En [vercel.com](https://vercel.com), importa el repositorio
3. Configura las variables de entorno:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy ✅

---

## Rutas de la aplicación

| Ruta | Descripción | Acceso |
|------|-------------|--------|
| `/` | Formulario público para proveedores | Público |
| `/login` | Login de usuarios internos | Público |
| `/dashboard` | Panel de gestión de folios | Autenticado |
| `/folio/:token` | Vista pública de un folio | Público |

---

## Usuarios demo (modo sin Supabase)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@empresa.com | demo1234 | Administrador |
| calidad@empresa.com | demo1234 | Calidad |
| almacen@empresa.com | demo1234 | Almacén |

---

## Estados de folios

| Estado | Descripción |
|--------|-------------|
| **Pendiente** | Folio creado, documentos en revisión |
| **Completo** | Usuario interno marcó como completo |
| **Incompleto** | Faltan documentos o hay observaciones |

> El estado lo define el usuario interno, no el sistema. Esto permite flexibilidad ya que cada material puede requerir distintos documentos.

---

## Estructura del proyecto

```
src/
├── components/
│   ├── ui/           # Componentes base (Button, Input, Dialog, etc.)
│   └── shared/       # StatusBadge, QRModal, FileUploadZone
├── hooks/            # Custom React hooks
├── lib/
│   ├── supabase.ts   # Cliente Supabase + helpers
│   ├── utils.ts      # Utilidades (cn, formatDate, etc.)
│   └── mock-data.ts  # Datos demo para modo offline
├── pages/
│   ├── Login/        # Página de autenticación
│   ├── ProviderForm/ # Formulario multi-paso para proveedores
│   ├── Dashboard/    # Panel interno con tabla de folios
│   └── FolioPublic/  # Vista pública de folio por token
├── stores/
│   └── authStore.ts  # Estado de autenticación (Zustand)
└── types/
    └── index.ts      # Tipos TypeScript compartidos
```

---

## Build para producción

```bash
npm run build
npm run preview  # Previsualizar build local
```

---

## Licencia

MIT
