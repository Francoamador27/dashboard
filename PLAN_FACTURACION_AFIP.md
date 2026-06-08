# Plan: Integración AFIP/ARCA — Facturación Electrónica

## Premisas del sistema
- **Solo el admin factura**: los clientes nunca tienen acceso a emitir, ver ni descargar facturas AFIP. Toda la funcionalidad de facturación vive exclusivamente en el panel admin, protegida por middleware `AdminOnly`.
- **Múltiples empresas emisoras**: el admin puede registrar N empresas facturadoras, cada una con su propio CUIT, certificado y clave privada. Por cliente puede facturarse desde distintas empresas según corresponda.
- **Archivos sensibles por empresa**: cada empresa sube su propio archivo de certificado (`.crt`) y su clave privada (`.key`) directamente desde el panel admin.

## Stack base existente
- **Backend**: Laravel 13, PHP 8.3, MySQL, Eloquent, Sanctum, SMTP Gmail, Storage local
- **Frontend**: React 19, Vite, React Query, Zustand, Tailwind CSS 4, SweetAlert2, React Toastify
- **Settings**: tabla `settings` con key-value encriptado
- **Auth**: admin vs cliente, middleware `AdminOnly`

---

## Fase 1 — Backend: Base de datos y modelos

### Migración 1: `empresa_facturadoras`
Cada "empresa emisora" que puede firmar facturas. El admin sube los archivos directamente desde el panel.

| Campo | Tipo | Notas |
|---|---|---|
| id | bigint PK | |
| nombre | string | Razón social |
| cuit | string(13) | **XX-XXXXXXXX-X** — con validación de dígito verificador |
| condicion_iva | enum | RI, M, EX, CE |
| domicilio | string | Dirección fiscal |
| punto_de_venta | unsignedSmallInt | Ej: 1, 2, 3... |
| certificado_path | string | Archivo `.crt` subido por el admin — almacenado fuera de `public/` |
| clave_privada_path | string | Archivo `.key` subido por el admin — almacenado fuera de `public/` |
| passphrase | text(encrypted) | Si la clave privada tiene passphrase (encriptado con APP_KEY) |
| email_from | string | Email de envío para facturas de esta empresa |
| ambiente | enum | `homologacion` / `produccion` |
| activo | boolean | |
| timestamps | | |

### Migración 2: `facturas_afip`
Registro inmutable de cada comprobante emitido:

| Campo | Tipo | Notas |
|---|---|---|
| id | bigint PK | |
| empresa_facturadora_id | FK | |
| cliente_id | FK | |
| cliente_pago_id | FK nullable | Vinculado al pago si aplica |
| tipo_comprobante | tinyint | 1=FA, 6=FB, 11=FC |
| punto_de_venta | smallint | Del comprobante emitido |
| numero_comprobante | unsignedInt | Autonumérico por AFIP |
| cae | string(14) | Legal, no nullable post-emisión |
| cae_vencimiento | date | Vence a 10 días del CAE |
| fecha_emision | date | |
| concepto | tinyint | 2=Servicios |
| cuit_receptor | string nullable | Solo en Factura A |
| nombre_receptor | string | |
| domicilio_receptor | string nullable | |
| condicion_iva_receptor | string | |
| items | json | Array de ítems con precio/IVA |
| importe_neto_gravado | decimal(10,2) | |
| importe_iva | decimal(10,2) | |
| importe_exento | decimal(10,2) | |
| importe_total | decimal(10,2) | |
| moneda | string(3) | PES / DOL |
| cotizacion | decimal(8,4) | Para moneda extranjera |
| pdf_path | string nullable | Generado post-CAE |
| estado | enum | `pendiente`, `emitida`, `error` |
| error_mensaje | text nullable | Respuesta WSFE en caso de fallo |
| timestamps + softDeletes | | |

---

## Fase 2 — Backend: Package AFIP y servicios

### Package PHP
```bash
composer require afipsdk/afip.php
composer require barryvdh/laravel-dompdf
```

### `AfipService` (core)
Servicio singleton con caché de Ticket de Acceso:

```
AfipService
├── getAfipInstance(EmpresaFacturadora): Afip   ← instancia por empresa
├── getTicketAcceso(EmpresaFacturadora): cached  ← válido 12hs, cacheado
├── getUltimoNumero(empresa, tipo, ptovta): int
├── emitirFactura(empresa, FacturaDTO): FacturaResult
│     ├── Valida datos
│     ├── Obtiene TA
│     ├── getUltimoNumero + 1
│     ├── Llama WSFE.FECAESolicitar
│     └── Retorna CAE + vencimiento
└── consultarComprobante(empresa, tipo, ptovta, num): array
```

### `GenerarPdfFacturaService`
Genera el PDF con formato AFIP requerido usando `barryvdh/laravel-dompdf`.

Contenido obligatorio del comprobante:
- Encabezado: logo empresa, letra (A/B/C), CUIT, razón social, domicilio, condición IVA, punto de venta y número
- Receptor: nombre, CUIT/DNI, domicilio, condición IVA
- Fecha de emisión, concepto
- Tabla de ítems: descripción, cantidad, precio unitario, % IVA, subtotal
- Totales: neto gravado, IVA 21%, exento, **total**
- **CAE y vencimiento** (obligatorio legal)
- **QR Code ARCA**: URL con JSON base64 del comprobante (nuevo estándar)
- **Código de barras Code128** (formato anterior, aún requerido)

### `FacturaEmailService` + Mailable `FacturaEmitidaMail`
```
FacturaEmitidaMail
├── to: array de emails (1 o más)
├── subject: string (editable desde frontend)
├── body: string HTML (editable)
└── attachData(pdf_bytes, 'Factura-{tipo}-{numero}.pdf')
```

### Seguridad de certificados
- Almacenados en `storage/app/certificados/{empresa_id}/` (fuera de `public/`)
- Disco `certificados` privado (no accesible por URL pública)
- Paths relativos en DB, nunca absolutos
- Descarga/lectura solo desde `AfipService`, nunca expuestos en API
- `passphrase` encriptada con `encrypt()` de Laravel (usa `APP_KEY`)
- Middleware extra en rutas de configuración: solo admin

---

## Fase 3 — Backend: Controllers y rutas

### `EmpresaFacturadoraController`
Todas las rutas protegidas por `AdminOnly`. Los archivos se reciben como `multipart/form-data`.

```
GET    /api/empresas-facturadoras              → index()          (lista — nunca devuelve paths de cert/key)
POST   /api/empresas-facturadoras              → store()          (multipart: datos + cert (.crt) + key (.key))
GET    /api/empresas-facturadoras/{id}         → show()           (datos de la empresa, sin paths sensibles)
PUT    /api/empresas-facturadoras/{id}         → update()         (puede re-subir cert y/o key opcionalmente)
DELETE /api/empresas-facturadoras/{id}         → destroy()        (soft delete — archivos se mantienen en disco)
POST   /api/empresas-facturadoras/{id}/test    → testConexion()   (autentica contra WSAA y devuelve éxito/error)
```

### `FacturaAfipController`
Todas las rutas protegidas por `AdminOnly`. Los clientes no tienen acceso a ninguno de estos endpoints.

```
GET    /api/facturas                           → index()              (todas, con filtros)
GET    /api/clientes/{cliente}/facturas        → indexByCliente()
POST   /api/clientes/{cliente}/facturas        → store()              (emite via AFIP — solo admin)
GET    /api/facturas/{factura}                 → show()
GET    /api/facturas/{factura}/pdf             → descargarPdf()       (StreamedResponse — solo admin)
POST   /api/facturas/{factura}/enviar-email    → enviarEmail()        (solo admin)
```

### `EmitirFacturaRequest` — validaciones clave
- CUIT: algoritmo de dígito verificador argentino
- Punto de venta: entre 1 y 9998
- La empresa pertenece a la instalación y está activa
- Ítems: descripción no vacía, cantidad > 0, precio > 0, IVA válido (0 / 10.5 / 21)
- Tipo de comprobante coherente con condición IVA del receptor

---

## Fase 4 — Frontend: Sección "Facturacion" en admin

### Nueva ruta y sidebar
- Agregar en `Sidebar.jsx`: ícono de factura, label "Facturación"
- Nueva ruta `/dashboard/facturacion` → `Facturacion.jsx`

### `Facturacion.jsx` — Página principal con dos tabs

**Tab "Facturas"**
- Tabla de todas las facturas emitidas (todas las empresas, todos los clientes)
- Columnas: Fecha, Empresa emisora, Cliente, Tipo (A/B/C), Número, Total, Estado, CAE
- Filtros: por empresa, por cliente, por estado, rango de fechas
- Acciones por fila: descargar PDF, enviar email, ver detalle
- Badge de estado: `emitida` (verde), `error` (rojo), `pendiente` (amarillo)

**Tab "Configuración"**
- Lista de empresas facturadoras
- Tarjeta por empresa: razón social, CUIT, ambiente, punto de venta, estado conexión
- Botón "Nueva empresa" → abre `ModalEmpresaFacturadora`
- Por empresa: botón editar, botón "Probar conexión", botón eliminar

### `ModalEmpresaFacturadora.jsx`
Solo visible y accesible para el admin. Al editar, cert y key son opcionales (solo se reemplazan si se sube un archivo nuevo).

```
Razón Social *
CUIT *           [XX-XXXXXXXX-X — validación de dígito verificador en tiempo real]
Condición IVA *  [Responsable Inscripto / Monotributista / Exento]
Domicilio fiscal *
Punto de Venta * [número, 1-9998]
Email de envío * [from address para facturas de esta empresa]
Ambiente *       [Homologación / Producción — warning prominente al elegir Producción]
─────────────────────────────────────────
ARCHIVOS (subidos directamente por el admin)
Certificado AFIP  [Upload .crt]  ← muestra nombre del archivo actual si ya existe
Clave Privada     [Upload .key]  ← muestra "••••• (ya cargada)" si ya existe
Passphrase        [Password input — solo si la clave la requiere]
─────────────────────────────────────────
[Cancelar]  [Guardar]  [Probar conexión WSAA]
```

### Actualización de `TabFacturacion.jsx`
Agregar nueva sección "Facturas AFIP" debajo de los pagos manuales existentes:
- Lista de facturas AFIP para ese cliente
- Botón "Emitir Factura AFIP" → `ModalEmitirFactura`
- Por factura: descargar PDF, enviar email

### `ModalEmitirFactura.jsx`
```
Empresa emisora *         [Select — lista de empresas activas]
Tipo de comprobante *     [Factura A / B / C — condicionado por empresa]
Concepto *                [Servicios (default)]
─────────────────────────────────────────
DATOS DEL RECEPTOR
Nombre / Razón Social *   [pre-rellenado del cliente]
CUIT/DNI                  [requerido en FA, opcional en FB]
Condición IVA *
Domicilio
─────────────────────────────────────────
ÍTEMS
[+ Agregar ítem]
  Descripción | Cantidad | Precio unitario | IVA% | Subtotal
  (editable, fila por fila)
─────────────────────────────────────────
Moneda           [ARS / USD]
Cotización       [si USD]
─────────────────────────────────────────
Resumen: Neto gravado | IVA 21% | Total ARS
─────────────────────────────────────────
Vincular a pago  [Select opcional — pagos pendientes del cliente]
─────────────────────────────────────────
[Cancelar]  [Emitir Factura →]
  ↑ Spinner + "Comunicando con ARCA..." durante emisión
  ↑ Toast éxito con CAE obtenido
  ↑ Toast error con mensaje WSFE si falla
```

### `ModalEnviarFactura.jsx`
```
Para (emails) *           [chips input — 1 o más emails, pre-rellenado con email del cliente]
CC (emails)               [chips input opcional]
Asunto *                  [pre-rellenado: "Factura C 0001-00000042 - Acme SA"]
Mensaje                   [textarea, pre-rellenado con template]
─────────────────────────────────────────
Adjunto: Factura-C-0001-00000042.pdf  (no editable, siempre adjunta)
─────────────────────────────────────────
[Cancelar]  [Enviar →]
```

---

## Fase 5 — Hooks React Query

```
useEmpresasFacturadoras.js
├── useEmpresasFacturadoras()       → GET /api/empresas-facturadoras
├── useCrearEmpresa()               → POST (con FormData para archivos)
├── useActualizarEmpresa()          → PUT
├── useEliminarEmpresa()            → DELETE
└── useTestConexion()               → POST .../test-conexion

useFacturasAfip.js
├── useFacturasAfip(filters?)       → GET /api/facturas
├── useFacturasByCliente(clienteId) → GET /api/clientes/:id/facturas
├── useEmitirFactura()              → POST /api/clientes/:id/facturas
├── useEnviarFacturaEmail()         → POST /api/facturas/:id/enviar-email
└── useDescargarPdfFactura()        → GET /api/facturas/:id/pdf (blob)
```

---

## Consideraciones de seguridad

| Riesgo | Mitigación |
|---|---|
| Certificados expuestos | Disco privado, nunca en `public/`, sin endpoint de descarga |
| Clave privada legible | Encriptada en reposo con `APP_KEY`, solo `AfipService` la lee |
| CUIT falso | Validación de dígito verificador en backend + frontend |
| Emisión accidental en producción | Warning visual, campo `ambiente` por empresa, confirmación doble |
| Ticket de Acceso expirado | Cache con TTL 11:50hs, refresco automático en `AfipService` |
| Facturas no idempotentes | Registro en DB antes de llamar WSFE, estado `pendiente` → evita doble emisión |
| PDF mutable post-emisión | `pdf_path` solo se escribe una vez, nunca se sobreescribe |
| Logs con datos fiscales | `APP_DEBUG=false` en producción, no loguear certificados |

---

## Orden de implementación

- [ ] **1. Backend** — migrations + models (`EmpresaFacturadora`, `FacturaAfip`)
- [ ] **2. Backend** — `AfipService` en homologación + test con empresa de prueba AFIP
- [ ] **3. Backend** — `GenerarPdfFacturaService` + template Blade del comprobante
- [ ] **4. Backend** — controllers + routes + validaciones
- [ ] **5. Backend** — `FacturaEmitidaMail` + test de envío
- [ ] **6. Frontend** — hooks + `ConfiguracionEmpresas` + `ModalEmpresaFacturadora`
- [ ] **7. Frontend** — `Facturacion.jsx` con Tab Facturas + Tab Configuración
- [ ] **8. Frontend** — `ModalEmitirFactura` integrado en `TabFacturacion`
- [ ] **9. Frontend** — `ModalEnviarFactura`
- [ ] **10. Testing** — ciclo completo en homologación con CUIT de prueba AFIP
