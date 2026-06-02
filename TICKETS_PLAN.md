# Plan: Sistema de Tickets Completo

## Objetivo
Crear un sistema de tickets robusto, intuitivo y visual, accesible desde el menú principal del admin, con soporte para respuestas, fechas límite, colores por prioridad, y gestión desde el panel del cliente.

---

## Resumen de cambios

| Área | Qué se hace |
|------|-------------|
| Backend — Migration | Agregar `fecha_limite` a `cliente_tickets` |
| Backend — Model | Actualizar `ClienteTicket` con el nuevo campo |
| Backend — Controller | `indexAll()` global + validación `fecha_limite` + ruta detalle con thread |
| Backend — Routes | `GET /api/tickets` (todos los tickets del admin) + `GET /api/clientes/{c}/tickets/{t}` |
| Frontend — Hooks | Nuevo `useTickets.js` global + hooks de comentarios en `useClienteDetalle.js` |
| Frontend — Página | Nueva página `Tickets.jsx` en el menú principal |
| Frontend — Tab | Rediseño completo de `TabTickets.jsx` (fecha límite + thread + colores) |
| Frontend — Sidebar | Agregar ítem "Tickets" con badge de pendientes |
| Frontend — Router | Registrar ruta `/dashboard/tickets` |

---

## Backend

### 1. Migration — `fecha_limite`

**Archivo:** `database/migrations/2026_05_29_000001_add_fecha_limite_to_cliente_tickets.php`

```php
Schema::table('cliente_tickets', function (Blueprint $table) {
    $table->date('fecha_limite')->nullable()->after('resuelto_at');
});
```

---

### 2. Model — `ClienteTicket.php`

Agregar a `$fillable`:
```php
'fecha_limite'
```

Agregar a `$casts`:
```php
'fecha_limite' => 'date:Y-m-d',
```

---

### 3. Controller — `ClienteTicketController.php`

#### Método nuevo: `indexAll()`
```
GET /api/tickets
```
- Devuelve todos los tickets de todos los clientes
- Carga relación `cliente` (id, nombre, colores)
- Soporte para filtros: `?estado=`, `?cliente_id=`, `?prioridad=`
- Ordenado por: urgentes primero → por fecha_limite → por created_at
- Incluye `comentarios_count`

#### Método nuevo: `show()`
```
GET /api/clientes/{cliente}/tickets/{ticket}
```
- Devuelve el ticket con thread completo: `comentarios.user`, `comentarios.adjuntos`, `adjuntos`

#### Actualizar validación en `store()` y `update()`:
```php
'fecha_limite' => ['nullable', 'date'],
```

---

### 4. Routes — `api.php`

```php
// Dentro del grupo admin:
Route::get('/tickets', [ClienteTicketController::class, 'indexAll']);
Route::get('/clientes/{cliente}/tickets/{ticket}', [ClienteTicketController::class, 'show']);
```

---

## Frontend

### 5. Hooks — `useTickets.js` (nuevo archivo)

```
src/dashboard/hooks/useTickets.js
```

Hooks a crear:
- `useTicketsAll(filters)` → `GET /api/tickets` con filtros
- `useTicketDetalle(clienteId, ticketId)` → `GET /api/clientes/{c}/tickets/{t}`
- `useCrearComentario(clienteId, ticketId)` → `POST /api/clientes/{c}/tickets/{t}/comentarios` (multipart)
- `useEliminarComentario(clienteId, ticketId)` → `DELETE /api/clientes/{c}/tickets/{t}/comentarios/{id}`

---

### 6. Hooks — `useClienteDetalle.js` (actualizar)

Agregar:
- `useTicketDetalle(clienteId, ticketId)` → detalle con thread
- `useCrearComentarioAdmin(clienteId, ticketId)` → admin responde (con adjuntos multipart)
- `useEliminarComentario(clienteId, ticketId)` → eliminar comentario

Actualizar `useCrearTicket` y `useActualizarTicket` para incluir `fecha_limite`.

---

### 7. Página — `Tickets.jsx` (nueva)

```
src/dashboard/pages/Tickets.jsx
```

#### Layout:

```
┌─────────────────────────────────────────────────────┐
│  🎫 Tickets            [+ Nuevo ticket]             │
│  4 abiertos · 1 urgente · 2 vencidos                │
├─────────────────────────────────────────────────────┤
│ [Todos] [Pendiente] [En progreso] [Esperando] ...   │
│ Cliente: [dropdown]  Prioridad: [chips]  Sort: [↕]  │
├─────────────────────────────────────────────────────┤
│ ▍ [ACME] Ticket #0012 — Error en botón de pago      │
│   tipo: bug   🔴 URGENTE   📅 Vence hoy   💬 3      │
│   Estado: [En progreso]                  [▼ Abrir]  │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│  (expandido) Thread de mensajes + caja de respuesta │
│  [Estado ▼] [Prioridad ▼] [📅 Fecha] [→ ir cliente]│
├─────────────────────────────────────────────────────┤
│ ▍ [Bloom] Ticket #0009 — Actualizar paleta...       │
│   tipo: mejora  🟡 MEDIA   📅 30 may   💬 1         │
└─────────────────────────────────────────────────────┘
```

#### Funcionalidades:
- Stats chips arriba: Abiertos | Urgentes | Vencidos | Resueltos este mes
- Tabs de estado: Todos / Pendiente / En progreso / Esperando cliente / Resuelto / Cerrado
- Filtro por cliente (dropdown)
- Filtro por prioridad (chips: Todos / Baja / Media / Alta / Urgente)
- Ordenar: Más recientes / Más urgentes / Por fecha límite
- Modal "Nuevo ticket" con selector de cliente
- Cada ticket card expandible inline:
  - Thread completo (burbujas admin/cliente)
  - Caja de respuesta con adjuntos
  - Controls inline: cambiar estado, prioridad, fecha límite
  - Link "Ir al cliente" → `/dashboard/clientes/:id`

#### Sistema de colores:

| Prioridad | Color borde izq | Badge |
|-----------|----------------|-------|
| urgente | `border-red-500` | `bg-red-100 text-red-700` |
| alta | `border-amber-500` | `bg-amber-100 text-amber-700` |
| media | `border-blue-500` | `bg-blue-100 text-blue-700` |
| baja | `border-slate-300` | `bg-slate-100 text-slate-500` |

| Estado | Color badge |
|--------|-------------|
| pendiente | `bg-yellow-100 text-yellow-800` |
| en_progreso | `bg-blue-100 text-blue-800` |
| esperando_cliente | `bg-purple-100 text-purple-800` |
| resuelto | `bg-emerald-100 text-emerald-800` |
| cerrado | `bg-zinc-100 text-zinc-600` |

| Fecha límite | Color |
|---|---|
| Vencido | `text-red-600` + icono ⚠ |
| Vence hoy / mañana / pasado | `text-amber-600` |
| Normal | `text-slate-400` |

---

### 8. Tab — `TabTickets.jsx` (rediseño)

Actualizar para incluir:
- Campo `fecha_limite` (date input) en el formulario de creación/edición
- Borde izquierdo de color según prioridad en cada ticket card
- Badge de `fecha_limite` visible en el header del ticket (con colores)
- Sección expandible de comentarios: thread admin/cliente + caja de respuesta del admin
- Botón de adjuntar en la respuesta

---

### 9. Sidebar — `Sidebar.jsx`

Agregar ítem:
```js
{ to: '/dashboard/tickets', label: 'Tickets', icon: Ticket }
```

Con badge de conteo de tickets `pendiente` + `esperando_cliente` (rojo si hay urgentes).

Para el badge: hook `useTicketsAll({ estado: 'pendiente' })` o cache compartido.

---

### 10. Router — `Router.jsx`

```js
const DashboardTickets = lazy(() => import("./dashboard/pages/Tickets"));

// Dentro del DashboardLayout children:
{ path: "tickets", element: suspense(<DashboardTickets />) },
```

---

## Orden de implementación

1. ✅ Migration + Model + Controller backend
2. ✅ Rutas `api.php`
3. ✅ Hooks `useTickets.js` + actualizar `useClienteDetalle.js`
4. ✅ Sidebar + Router
5. ✅ Página `Tickets.jsx`
6. ✅ Rediseño `TabTickets.jsx`

---

## Lo que NO cambia

- Portal del cliente (`PortalTickets`, `PortalNuevoTicket`, `PortalTicketDetalle`) — ya funciona bien
- Sistema de emails — ya funciona bien
- CRUD base de tickets — se extiende, no se reescribe

---

## Notas técnicas

- El thread de comentarios usa `multipart/form-data` para soportar adjuntos
- El admin puede marcar comentarios como `es_interno: true` (el cliente no los ve)
- Al cerrar/resolver un ticket, se dispara el email `TicketCerradoMail` automáticamente
- La `fecha_limite` es solo informativa — no bloquea acciones; solo cambia el color visual
