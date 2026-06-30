# Manual de Usuario — DocFlow

**Versión:** 1.0  
**Sistema:** Gestión Documental de Materiales  
**Fecha:** Junio 2026

---

## Índice

1. [¿Qué es DocFlow?](#1-qué-es-docflow)
2. [Tipos de usuario](#2-tipos-de-usuario)
3. [Formulario de proveedor (acceso público)](#3-formulario-de-proveedor-acceso-público)
4. [Acceso interno — Login](#4-acceso-interno--login)
5. [Dashboard — Panel de control](#5-dashboard--panel-de-control)
6. [Detalle de folio](#6-detalle-de-folio)
7. [Código QR por folio](#7-código-qr-por-folio)
8. [Compartir un folio](#8-compartir-un-folio)
9. [Vista pública del folio](#9-vista-pública-del-folio)
10. [Configuración de cuenta](#10-configuración-de-cuenta)

---

## 1. ¿Qué es DocFlow?

DocFlow es una plataforma web para la **gestión documental de materiales** en empresas de producción. Permite que los proveedores adjunten los documentos obligatorios de cada material entregado (certificados de calidad, fichas técnicas, hojas de seguridad) y que el equipo interno gestione, revise y comparta esa documentación desde un panel centralizado.

### Beneficios principales

- Proveedor entrega documentos sin necesidad de crear una cuenta
- Cada material tiene un folio único con su propio código QR
- El QR se pega físicamente en el material y lleva directo a los documentos desde el celular
- El personal interno tiene visibilidad completa del estado documental de cada ítem
- Los documentos son accesibles por enlace público, sin barreras de acceso

---

## 2. Tipos de usuario

| Tipo | Cómo accede | Qué puede hacer |
|------|-------------|-----------------|
| **Proveedor** | URL pública (`/`) | Cargar datos e documentos de los materiales que entrega |
| **Usuario interno** | Login con email y contraseña (`/login`) | Ver, gestionar, actualizar y compartir todos los folios |
| **Visitante** | Enlace público o QR | Ver los documentos de un folio específico (solo lectura) |

---

## 3. Formulario de proveedor (acceso público)

El proveedor accede a la URL principal del sistema sin necesidad de registrarse.

### Paso 1 — Datos del proveedor

Al ingresar, el proveedor completa:

- **Nombre de la empresa proveedora** *(obligatorio)*
- **Email de contacto** *(opcional, recomendado para notificaciones)*

Presionar **Continuar** para avanzar al siguiente paso.

---

### Paso 2 — Ítems y documentos

Se muestra una **tabla editable tipo Excel** donde cada fila representa un material.

#### Cómo completar la tabla

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| **OC** | Número de Orden de Compra | OC-2026-0142 |
| **Pos.** | Posición dentro de la OC | 01 |
| **Código** | Código interno del material | MAT-001 |
| **Lote** | Número de lote del fabricante | LOTE-2026-06-A |
| **Descripción** | Nombre completo del material | Acero inoxidable 304 plancha 3mm |
| **Cant.** | Cantidad entregada | 50 |
| **UM** | Unidad de medida | KG, UND, MT, GL… |
| **Fecha** | Fecha de entrega | 20/06/2026 |
| **Documentos** | Archivos PDF a adjuntar | (ver abajo) |
| **Observación** | Nota libre opcional | — |

#### Navegación entre celdas (modo Excel)

- **Tab** → siguiente celda (hacia la derecha)
- **Enter / ↓** → celda de abajo
- **↑** → celda de arriba
- **Esc** → cancelar edición sin guardar

#### Cargar documentos de un ítem

1. En la columna **Documentos**, haz clic en **Cargar**
2. Se abre un modal con 4 tipos de documento:
   - **Certificado de calidad**
   - **Ficha técnica**
   - **Hoja de seguridad**
   - **Otro documento**
3. Arrastra el archivo PDF o haz clic en el área para seleccionarlo (máximo 20 MB por archivo)
4. Cierra el modal cuando termines — el botón mostrará cuántos documentos tiene el ítem

#### Agregar más ítems

Presiona **+ Agregar fila** para incluir otro material. Puedes mezclar materiales de distintas órdenes de compra en el mismo envío.

---

### Paso 3 — Revisar y confirmar

Antes de enviar, el sistema muestra un resumen de todos los ítems y sus documentos. Verifica que la información sea correcta.

Presiona **Enviar documentos** para procesar el formulario.

---

### Pantalla de confirmación

Al completar el envío, el sistema genera un **folio único por cada ítem** y muestra:

- **Código QR** individual por material
- **Enlace público** directo al folio
- Botones para **descargar** el QR (PNG) o **imprimirlo**
- Botón **Compartir** que copia al portapapeles un texto con la información completa del material y el enlace

> **Recomendación:** Imprime o descarga el QR de cada material y pégalo físicamente en el empaque antes de enviarlo. Esto permite al personal de recepción escanear el QR y acceder a los documentos en segundos.

---

## 4. Acceso interno — Login

El personal interno accede en la URL `/login`.

1. Ingresa tu **correo electrónico** asignado
2. Ingresa tu **contraseña**
3. Presiona **Ingresar**

Si las credenciales son incorrectas, el sistema mostrará un mensaje de error. Contacta al administrador del sistema si no recuerdas tus credenciales.

---

## 5. Dashboard — Panel de control

El dashboard es el centro de operaciones para el personal interno.

### Tarjetas de resumen

En la parte superior se muestran 4 indicadores:

| Tarjeta | Descripción |
|---------|-------------|
| **Total folios** | Cantidad total de folios registrados |
| **Completos** | Folios con toda la documentación entregada |
| **Incompletos** | Folios con documentación parcial o incorrecta |
| **Pendientes** | Folios sin documentación aún |

### Buscar y filtrar

- **Buscador**: filtra en tiempo real por OC, código de material, lote, descripción o nombre de proveedor
- **Filtros de estado**: botones Todos / Pendiente / Completo / Incompleto
- **Actualizar**: recarga los datos desde la base de datos

### Tabla de folios

La tabla muestra todos los folios con columnas ordenables. Las acciones disponibles por fila son:

| Ícono | Acción |
|-------|--------|
| 👁 **Ojo** | Abrir el detalle completo del folio |
| **QR** | Ver y descargar el QR del folio |
| **Copiar** | Copiar el enlace público al portapapeles |
| **Compartir** | Copiar texto informativo + enlace (formato bancario) |

### Paginación

En la parte inferior de la tabla puedes:
- Navegar entre páginas con los botones **Anterior / Siguiente**
- Seleccionar cuántos folios mostrar por página (20 / 50 / 100)
- Ver el rango actual: "1–20 de 87 folios"

---

## 6. Detalle de folio

Al hacer clic en el ícono de ojo, se abre un modal con toda la información del folio.

### Información del material

Muestra en una grilla: OC, posición, código, lote, cantidad, fecha, proveedor, email y fecha de creación.

### Cambiar estado

Tres botones para actualizar el estado documental del folio:

| Estado | Significado |
|--------|-------------|
| **Completo** | La documentación está completa y verificada |
| **Incompleto** | Falta algún documento o hay uno incorrecto |
| **Pendiente** | Aún no se ha revisado la documentación |

El botón activo se muestra en negro. El cambio se guarda automáticamente.

### Documentos adjuntos

Lista de todos los archivos PDF cargados. Por cada documento puedes:
- **Descargar** el archivo
- **Eliminar** el documento (solo usuarios internos)

También puedes cargar nuevos documentos haciendo clic en cualquiera de los 4 tipos disponibles.

### Observaciones internas

Campo de texto libre para notas internas (no visible en la vista pública). Haz clic en **Editar** o **Agregar** para modificarlo.

---

## 7. Código QR por folio

El QR contiene el enlace público del folio. Cualquier persona que lo escanee con su celular verá los documentos del material.

### Desde el dashboard (tabla)
Haz clic en el ícono **QR** en la fila del folio.

### Desde el detalle del folio
Haz clic en el botón **QR** en la barra de acciones.

### Opciones disponibles en el modal del QR
- **Descargar** — guarda el QR como imagen PNG en alta resolución
- **Imprimir** — abre una ventana de impresión con el QR, nombre del material, código y lote

---

## 8. Compartir un folio

El botón **Compartir** copia al portapapeles un texto formateado listo para pegar en WhatsApp, email o cualquier sistema de mensajería:

```
DocFlow — Documentos del material

Material: Acero inoxidable 304 plancha 3mm
Código: A-001  ·  Lote: LOTE-2026-06-A
OC: OC-2026-0142  ·  Pos: 01
Proveedor: Aceros SAC
Estado: Completo

Consultar documentos:
https://docflow.vercel.app/folio/token-abc-001
```

También puedes usar **Copiar link** si solo necesitas la URL.

---

## 9. Vista pública del folio

Cualquier persona con el enlace o el QR puede acceder a la vista pública del folio sin necesidad de login.

Muestra:
- Información del material (OC, código, lote, proveedor, cantidad, fecha)
- Estado actual del folio (Completo / Incompleto / Pendiente)
- Lista de documentos con botón de descarga
- Código QR para compartir o imprimir

Esta vista es de solo lectura — no se puede modificar nada sin login interno.

---

## 10. Configuración de cuenta

Haz clic en tu **nombre de usuario** en la esquina superior derecha del dashboard para abrir el panel de configuración.

### Nombre para mostrar
Cambia el nombre que aparece en el encabezado del dashboard. Se guarda en el navegador.

### Cambiar contraseña
*(Disponible solo con Supabase conectado)*  
Ingresa tu contraseña actual y la nueva contraseña (mínimo 6 caracteres) y presiona **Actualizar contraseña**.

### Cerrar sesión
El botón **Cerrar sesión** te desconecta y te lleva al login.

---

## Preguntas frecuentes

**¿El proveedor necesita una cuenta para subir documentos?**  
No. El formulario de carga es completamente público y no requiere registro.

**¿Qué pasa si el proveedor olvida adjuntar un documento?**  
El usuario interno puede cargar documentos adicionales directamente desde el detalle del folio en el dashboard.

**¿Los documentos son accesibles para cualquier persona?**  
Sí, los documentos son públicos para cualquiera que tenga el enlace o el QR. Si necesitas acceso restringido, contacta al administrador para configurarlo.

**¿El QR deja de funcionar?**  
No. El QR apunta a un enlace permanente ligado al folio, que existe mientras el folio exista en el sistema.

**¿Puedo cargar archivos que no sean PDF?**  
Por ahora el sistema solo acepta archivos PDF. Esta restricción garantiza la compatibilidad y legibilidad de los documentos.
