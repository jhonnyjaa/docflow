# Documentación Técnica — DocFlow

**Versión:** 1.0  
**Tipo:** Sistema de Gestión Documental de Materiales  
**Fecha:** Junio 2026

---

## Índice

1. [Visión general del sistema](#1-visión-general-del-sistema)
2. [Arquitectura](#2-arquitectura)
3. [Stack tecnológico](#3-stack-tecnológico)
4. [Modelo de datos](#4-modelo-de-datos)
5. [Autenticación y autorización](#5-autenticación-y-autorización)
6. [Almacenamiento de archivos](#6-almacenamiento-de-archivos)
7. [Modo demo](#7-modo-demo)
8. [Despliegue e infraestructura](#8-despliegue-e-infraestructura)
9. [Variables de entorno](#9-variables-de-entorno)

---

## 1. Visión general del sistema

DocFlow es una **Single Page Application (SPA)** que resuelve la trazabilidad documental de materiales en una compañía de producción. El sistema expone dos flujos diferenciados:

- **Flujo público** — formulario multi-paso para proveedores que no requiere autenticación
- **Flujo autenticado** — dashboard interno para personal de calidad, almacén y administración

Los documentos (PDFs) se almacenan en la nube y cada material recibe un folio con enlace permanente y código QR para acceso rápido desde dispositivos móviles.

---

## 2. Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENTE (Browser)                   │
│                                                         │
│   React SPA  ──►  React Router  ──►  Vistas / Páginas   │
│       │                                                 │
│   TanStack Query  ──►  Supabase JS Client               │
│   Zustand (auth state)                                  │
└─────────────────────────────┬───────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    SUPABASE (Backend as a Service)       │
│                                                         │
│   ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│   │  PostgreSQL  │  │  Auth (JWT)  │  │   Storage   │  │
│   │  (folios,   │  │  (usuarios   │  │  (PDFs en   │  │
│   │  documents) │  │  internos)   │  │   bucket)   │  │
│   └──────────────┘  └──────────────┘  └─────────────┘  │
│                   Row Level Security                     │
└─────────────────────────────────────────────────────────┘
                              │
                         Desplegado en
                              ▼
                    ┌──────────────────┐
                    │      VERCEL      │
                    │  (CDN global,    │
                    │  HTTPS, builds   │
                    │  automáticos)    │
                    └──────────────────┘
```

### Principios de diseño

| Principio | Implementación |
|-----------|----------------|
| **Sin servidor propio** | Supabase provee DB, Auth y Storage como servicio gestionado |
| **Acceso público selectivo** | Row Level Security en PostgreSQL controla qué operaciones requieren sesión |
| **Modo offline/demo** | La app funciona íntegramente sin Supabase conectado, con datos locales |
| **Código splitting** | El bundle se divide en chunks por dominio (vendor, UI, tabla, Supabase) |

---

## 3. Stack tecnológico

### Frontend

| Tecnología | Versión | Rol |
|------------|---------|-----|
| **React** | 18 | Librería de interfaz de usuario |
| **TypeScript** | 5 | Tipado estático |
| **Vite** | 6 | Bundler y servidor de desarrollo |
| **React Router DOM** | 6 | Enrutamiento del lado del cliente (SPA) |
| **Tailwind CSS** | 3 | Estilos utilitarios, variables CSS para theming |
| **Framer Motion** | 11 | Animaciones de transición entre pasos y entradas |

### Gestión de estado y datos

| Tecnología | Rol |
|------------|-----|
| **TanStack Table v8** | Tabla editable con ordenamiento, filtrado global y paginación |
| **TanStack Query v5** | Caché de datos remotos y sincronización con Supabase |
| **Zustand** | Estado global de autenticación con persistencia en localStorage |
| **React Hook Form + Zod** | Validación del formulario de datos del proveedor |

### Componentes UI

| Tecnología | Rol |
|------------|-----|
| **Radix UI** | Primitivos accesibles: Dialog, Select, Tooltip, Separator, Switch, Label |
| **Lucide React** | Librería de íconos SVG |
| **Sonner** | Notificaciones toast |
| **react-dropzone** | Zona de arrastre para carga de archivos PDF |
| **qrcode** | Generación de códigos QR en canvas y PNG |

### Backend (Supabase)

| Servicio | Tecnología base | Rol |
|----------|----------------|-----|
| **Base de datos** | PostgreSQL 15 | Almacenamiento de folios y documentos |
| **Autenticación** | GoTrue (JWT) | Sesiones de usuarios internos |
| **Storage** | S3-compatible | Archivos PDF de documentos |
| **API** | PostgREST | API REST autogenerada desde el schema |
| **Seguridad** | Row Level Security | Control de acceso por operación y rol |

### Despliegue

| Servicio | Rol |
|----------|-----|
| **Vercel** | Hosting del frontend, CDN global, builds automáticos desde Git |
| **Supabase Cloud** | Infraestructura de backend gestionada |
| **GitHub** | Repositorio de código y trigger de deploys en Vercel |

---

## 4. Modelo de datos

### Tabla `folios`

Representa un material específico de una entrega, con su trazabilidad documental.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador primario |
| `public_token` | UUID | Token único para el enlace público (no secuencial, no predecible) |
| `oc` | TEXT | Número de orden de compra |
| `position` | TEXT | Posición dentro de la OC |
| `material_code` | TEXT | Código interno del material |
| `lot` | TEXT | Número de lote del fabricante |
| `description` | TEXT | Descripción del material |
| `quantity` | DECIMAL | Cantidad entregada |
| `unit` | TEXT | Unidad de medida |
| `date` | DATE | Fecha de entrega |
| `supplier_name` | TEXT | Nombre del proveedor |
| `supplier_email` | TEXT | Email de contacto del proveedor |
| `observation` | TEXT | Observaciones internas (no pública) |
| `status` | TEXT | `pending` / `complete` / `incomplete` |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última modificación (trigger automático) |

### Tabla `documents`

Cada fila representa un archivo PDF adjunto a un folio.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Identificador primario |
| `folio_id` | UUID | Referencia al folio (ON DELETE CASCADE) |
| `doc_type` | TEXT | `quality_cert` / `tech_sheet` / `safety_sheet` / `other` |
| `doc_name` | TEXT | Nombre legible del tipo de documento |
| `file_path` | TEXT | Ruta en el bucket de Storage |
| `file_name` | TEXT | Nombre original del archivo |
| `uploaded_by` | TEXT | `supplier` o `internal` |
| `created_at` | TIMESTAMPTZ | Fecha de carga |

### Relaciones

```
folios (1) ──── (N) documents
```

Los documentos se eliminan en cascada cuando se elimina el folio.

---

## 5. Autenticación y autorización

### Usuarios internos

La autenticación usa **Supabase Auth (GoTrue)**, basada en JWT. El token de sesión se almacena en `localStorage` y se renueva automáticamente.

El estado de sesión se gestiona con **Zustand** con middleware `persist`, de forma que la sesión sobrevive recargas de página.

### Row Level Security (RLS)

Toda la seguridad de datos se aplica a nivel de base de datos, no de aplicación:

| Tabla | Operación | Permitido para |
|-------|-----------|----------------|
| `folios` | SELECT | Todos (público) |
| `folios` | INSERT | Todos (formulario de proveedor) |
| `folios` | UPDATE | Solo `authenticated` |
| `folios` | DELETE | Solo `authenticated` |
| `documents` | SELECT | Todos (público) |
| `documents` | INSERT | Todos (proveedor e interno) |
| `documents` | DELETE | Solo `authenticated` |

### Storage

| Operación | Permitido para |
|-----------|----------------|
| Leer archivos | Todos (bucket público) |
| Subir archivos | Todos |
| Eliminar archivos | Solo `authenticated` |

---

## 6. Almacenamiento de archivos

Los archivos PDF se almacenan en un **bucket público de Supabase Storage** llamado `documents`.

### Estructura de rutas en el bucket

```
documents/
  {folio_id}/
    quality_cert/
      certificado.pdf
    tech_sheet/
      ficha_tecnica.pdf
    safety_sheet/
      msds.pdf
    other/
      otro_doc.pdf
```

Los archivos son accesibles mediante una URL pública directa generada por Supabase. El tamaño máximo por archivo es 20 MB.

---

## 7. Modo demo

La aplicación incluye un **modo demo completo** que funciona sin ninguna conexión a Supabase. Se activa automáticamente si las variables de entorno `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` no están definidas.

En modo demo:
- Los datos se almacenan en **memoria y `localStorage`** del navegador
- Los folios creados persisten entre pestañas del mismo navegador mediante `localStorage`
- Las credenciales de acceso son fijas: `admin@empresa.com`, `calidad@empresa.com`, `almacen@empresa.com` con contraseña `demo1234`
- La carga de archivos no persiste (solo se guarda la referencia en memoria)
- El cambio de contraseña está deshabilitado

Este modo permite evaluar o desarrollar la aplicación sin infraestructura de backend.

---

## 8. Despliegue e infraestructura

### Pipeline de despliegue

```
Desarrollador
     │
     ▼ git push
  GitHub
     │
     ▼ Webhook automático
  Vercel Build
   npm run build
   (Vite → dist/)
     │
     ▼ Deploy
  CDN Vercel (global)
```

### Configuración de Vercel

El archivo `vercel.json` en la raíz configura el rewrite para que React Router funcione correctamente en producción:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

Sin esta configuración, las rutas como `/folio/token-abc-001` devolverían un 404 al recargar la página.

### Optimización del bundle

El build de Vite divide el código en chunks separados para mejorar la carga inicial:

| Chunk | Contenido |
|-------|-----------|
| `vendor` | React, React DOM, React Router |
| `ui` | Radix UI, Framer Motion, Lucide |
| `table` | TanStack Table y Query |
| `supabase` | Supabase JS Client |

---

## 9. Variables de entorno

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase (`https://xxx.supabase.co`) | No (activa modo demo si no está) |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase | No (activa modo demo si no está) |

Las variables con prefijo `VITE_` son expuestas al bundle del navegador por Vite. **No incluir claves secretas** con este prefijo.

En Vercel se configuran en **Project Settings → Environment Variables**.  
En desarrollo local se configuran en un archivo `.env` (excluido del repositorio por `.gitignore`).
