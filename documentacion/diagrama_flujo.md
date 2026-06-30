# Diagrama de Flujo de Usuario — DocFlow

Este documento describe los flujos de usuario del sistema DocFlow. El código PlantUML correspondiente está en [`diagrama_flujo.puml`](./diagrama_flujo.puml).

Para renderizar el diagrama puedes usar:
- [PlantUML Online Server](https://www.plantuml.com/plantuml/uml/)
- Extensión **PlantUML** para VS Code
- [Kroki.io](https://kroki.io/)

---

## Flujos del sistema

El sistema tiene **tres tipos de usuario**, cada uno con su propio flujo independiente:

| Actor | Punto de entrada | Autenticación |
|-------|-----------------|---------------|
| Proveedor | `/` (URL pública) | No requiere |
| Usuario interno | `/login` | Email + contraseña |
| Visitante | `/folio/{token}` (QR o enlace) | No requiere |

---

## Flujo 1 — Proveedor

```plantuml
@startuml
skinparam backgroundColor #FAFAFA

title Flujo Proveedor

start
:Accede a la URL principal (/);
:Paso 1 — Ingresa datos del proveedor\n(nombre de empresa, email);

if (¿Datos válidos?) then (Sí)
else (No)
  :Muestra error de validación;
  stop
endif

:Avanza al Paso 2 — Ítems y documentos;

repeat
  :Completa una fila de la tabla\n(OC, posición, código, lote,\ndescripción, cantidad, UM, fecha);
  :Clic en Cargar para adjuntar PDFs\n(certificado de calidad, ficha técnica,\nhoja de seguridad, otro);
  :Arrastra o selecciona archivos PDF;
backward :+ Agregar fila;
repeat while (¿Más ítems?) is (Sí) not (No)

:Presiona Revisar envío — Paso 3;

if (¿Todo correcto?) then (Sí)
  :Presiona Enviar documentos;
  :Sistema crea un folio único por ítem\ny sube archivos a Storage;
  :Pantalla de confirmación con QR,\nenlace y botón Compartir por folio;
  :Descarga o imprime el QR\npara pegarlo en el material;
  stop
else (Corregir)
  :Vuelve al Paso 2;
endif

@enduml
```

### Descripción del flujo

1. El proveedor ingresa a la URL pública sin necesidad de crear cuenta
2. **Paso 1** — Completa el nombre de la empresa y su email de contacto
3. **Paso 2** — Llena una tabla editable (estilo Excel) con un ítem por fila, adjuntando los PDFs correspondientes por tipo de documento
4. **Paso 3** — Revisa el resumen antes de confirmar el envío
5. Al enviar, el sistema genera un folio único por material con su código QR
6. El proveedor descarga o imprime el QR para pegarlo físicamente en el empaque

---

## Flujo 2 — Usuario interno

```plantuml
@startuml
skinparam backgroundColor #FAFAFA

title Flujo Usuario Interno

start
:Accede a /login;
:Ingresa email y contraseña;

if (¿Credenciales correctas?) then (Sí)
else (No)
  :Muestra error;
  stop
endif

:Dashboard — Vista general\nTarjetas: Total / Completos / Incompletos / Pendientes;

:Busca o filtra folios;
:Tabla de folios paginada;

if (¿Acción en folio?) then (Ver detalle)
  :Abre modal Detalle del folio;
  fork
    :Cambia estado\n(Completo / Incompleto / Pendiente);
  fork again
    :Descarga o elimina documentos;
  fork again
    :Carga nuevos documentos;
  fork again
    :Edita observaciones internas;
  end fork
else if (QR)
  :Abre modal del código QR;
  if (¿Acción?) then (Descargar)
    :Descarga PNG del QR;
  else (Imprimir)
    :Abre ventana de impresión;
  endif
else if (Compartir)
  :Copia texto formateado + enlace;
else (Copiar link)
  :Copia solo la URL pública;
endif

:Continúa revisando otros folios;
stop

@enduml
```

### Descripción del flujo

1. El usuario ingresa con sus credenciales en `/login`
2. Accede al dashboard con indicadores resumidos en tarjetas
3. Puede buscar folios por texto libre o filtrar por estado
4. Por cada folio puede:
   - **Ver detalle**: modal completo con cambio de estado, gestión de documentos y observaciones
   - **QR**: descargar o imprimir el código QR
   - **Compartir**: copiar un mensaje formateado con información y enlace
   - **Copiar link**: copiar solo la URL pública

---

## Flujo 3 — Visitante (QR o enlace)

```plantuml
@startuml
skinparam backgroundColor #FAFAFA

title Flujo Visitante

start
:Escanea QR con celular\no recibe enlace compartido;
:Accede a /folio/{token};

if (¿Folio existe?) then (Sí)
  :Vista pública del folio;
  :Ve información del material\n(código, lote, OC, proveedor, estado);
  :Ve lista de documentos adjuntos;
  if (¿Necesita el archivo?) then (Sí)
    :Descarga el PDF;
  endif
  stop
else (No)
  :Muestra página de error;
  stop
endif

@enduml
```

### Descripción del flujo

1. El visitante escanea el QR pegado en el material físico, o recibe el enlace por mensaje
2. Accede directamente a la vista pública del folio sin login
3. Ve la información completa del material y todos los documentos adjuntos
4. Puede descargar cualquier PDF directamente desde el navegador o celular

---

## Diagrama completo integrado

El siguiente diagrama muestra los tres flujos en paralelo con sus actores diferenciados por color:

- 🔵 **Azul** — Flujo del proveedor
- 🟢 **Verde** — Flujo del usuario interno  
- 🟠 **Naranja** — Flujo del visitante

```plantuml
@startuml DocFlow — Diagrama completo

skinparam backgroundColor #FAFAFA
skinparam DefaultFontSize 11

skinparam partition {
  BackgroundColor #F4F4F5
  BorderColor #D4D4D8
}

title DocFlow — Flujo completo de usuario

|#EFF6FF|Proveedor|
start
:Accede a / (formulario público);
:Paso 1 — Datos del proveedor;
if (¿Válido?) then (Sí)
else (No)
  :Error de validación;
  stop
endif
:Paso 2 — Tabla de ítems + documentos;
:Paso 3 — Revisión y envío;
:Folios creados + pantalla de confirmación\ncon QR descargable por ítem;
stop

|#F0FDF4|Usuario Interno|
start
:Login (/login);
if (¿Autenticado?) then (Sí)
else (No)
  :Error de credenciales;
  stop
endif
:Dashboard con tabla de folios;
fork
  :Ver detalle del folio\n(estado, documentos, observaciones);
fork again
  :Generar / descargar / imprimir QR;
fork again
  :Compartir enlace o info del folio;
end fork
stop

|#FFF7ED|Visitante|
start
:Escanea QR o abre enlace compartido;
:Vista pública /folio/{token};
:Ve datos del material y documentos;
:Descarga PDFs;
stop

@enduml
```
