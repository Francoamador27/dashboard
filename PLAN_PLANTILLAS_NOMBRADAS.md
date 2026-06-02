# Plan: Plantillas Nombradas en Creador de Contenido

## Objetivo
Reemplazar el sistema de "plantilla predeterminada" (una sola, guardada en localStorage) por una **biblioteca de plantillas nombradas** persistidas en el backend. Agregar un paso 3 al flujo del editor donde el usuario elige una plantilla guardada antes de abrir el editor.

---

## Flujo nuevo (4 pasos)

```
Paso 1: Formato  →  Paso 2: Tipo  →  Paso 3: Mis Plantillas  →  Paso 4: Editor
(Historia, Feed…)   (Aurora, etc.)   (elegir o empezar vacío)    [guardar plantilla]
```

---

## PARTE 1 — Backend (Laravel)

### 1.1 Migración

**Archivo:** `database/migrations/2026_05_30_000001_create_creador_plantillas_table.php`

```php
Schema::create('creador_plantillas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('cliente_id')->constrained()->cascadeOnDelete();
    $table->string('nombre');
    $table->string('formato');   // "historia" | "feed" | "feed45" | "landscape"
    $table->string('tipo');      // "gradiente" | "imagen"
    $table->json('estado_editor'); // { bloques: [...], templateConfig: {...} }
    $table->timestamps();
    $table->softDeletes();
});
```

> No necesita imagen, job asíncrono ni status — es solo un snapshot JSON del estado del editor.

---

### 1.2 Modelo

**Archivo:** `app/Models/CreadorPlantilla.php`

```php
class CreadorPlantilla extends Model {
    use SoftDeletes;

    protected $fillable = [
        'cliente_id', 'nombre', 'formato', 'tipo', 'estado_editor',
    ];

    protected $casts = [
        'estado_editor' => 'array',
    ];

    public function cliente(): BelongsTo {
        return $this->belongsTo(Cliente::class);
    }
}
```

---

### 1.3 Controlador

**Archivo:** `app/Http/Controllers/CreadorPlantillaController.php`

Métodos:

| Método | Ruta | Descripción |
|---|---|---|
| `index` | GET `/clientes/{cliente}/creador-plantillas` | Lista todas las plantillas del cliente. Acepta `?formato=` y `?tipo=` como query params opcionales. |
| `store` | POST `/clientes/{cliente}/creador-plantillas` | Crea una nueva plantilla. Body: `{ nombre, formato, tipo, estado_editor }` |
| `update` | PUT `/clientes/{cliente}/creador-plantillas/{id}` | Actualiza nombre y/o estado_editor |
| `destroy` | DELETE `/clientes/{cliente}/creador-plantillas/{id}` | Soft delete |

**`store` / `update` — validación:**
```php
$validated = $request->validate([
    'nombre'        => 'required|string|max:100',
    'formato'       => 'required|string',
    'tipo'          => 'required|string',
    'estado_editor' => 'required|array',
]);
```

**`index` — respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Promo Verano",
    "formato": "historia",
    "tipo": "gradiente",
    "created_at": "2026-05-30T..."
  }
]
```
> El `estado_editor` no se envía en el listado (payload pesado). Se incluye solo en `store` response y `update` response.

**`show` (opcional, para cargar una plantilla):**

Como alternativa a incluir `estado_editor` en el listado, se puede agregar:
```
GET /clientes/{cliente}/creador-plantillas/{id}  → devuelve el objeto completo con estado_editor
```
Esto es más eficiente cuando hay muchas plantillas. Decidir en implementación si se incluye o no.

---

### 1.4 Rutas

**Archivo:** `routes/api.php` — dentro del grupo admin:

```php
// Creador de contenido — plantillas nombradas
Route::prefix('clientes/{cliente}')->group(function () {
    Route::get('creador-plantillas',          [CreadorPlantillaController::class, 'index']);
    Route::post('creador-plantillas',         [CreadorPlantillaController::class, 'store']);
    Route::get('creador-plantillas/{plantilla}',    [CreadorPlantillaController::class, 'show']);
    Route::put('creador-plantillas/{plantilla}',    [CreadorPlantillaController::class, 'update']);
    Route::delete('creador-plantillas/{plantilla}', [CreadorPlantillaController::class, 'destroy']);
});
```

---

## PARTE 2 — Frontend (React)

### 2.1 Nuevo hook: `useCreadorPlantillas.js`

**Archivo:** `src/dashboard/hooks/useCreadorPlantillas.js`

```js
// Lista (sin estado_editor para que sea liviano)
export function useCreadorPlantillas(clienteId, filters = {}) {
  return useQuery({
    queryKey: ['creador-plantillas', clienteId, filters],
    queryFn: () => api.get(`/clientes/${clienteId}/creador-plantillas`, { params: filters }).then(r => r.data),
    enabled: !!clienteId,
  });
}

// Detalle con estado_editor (solo cuando se va a cargar una)
export function useCreadorPlantillaDetalle(clienteId, plantillaId) {
  return useQuery({
    queryKey: ['creador-plantillas', clienteId, plantillaId],
    queryFn: () => api.get(`/clientes/${clienteId}/creador-plantillas/${plantillaId}`).then(r => r.data),
    enabled: !!clienteId && !!plantillaId,
  });
}

// Crear
export function useCrearCreadorPlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/clientes/${clienteId}/creador-plantillas`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creador-plantillas', clienteId] }),
  });
}

// Actualizar
export function useActualizarCreadorPlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/clientes/${clienteId}/creador-plantillas/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creador-plantillas', clienteId] }),
  });
}

// Eliminar
export function useEliminarCreadorPlantilla(clienteId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.delete(`/clientes/${clienteId}/creador-plantillas/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['creador-plantillas', clienteId] }),
  });
}
```

---

### 2.2 Cambios en `CreadorContenido.jsx`

#### Storage — eliminar todo lo relacionado a localStorage

Eliminar:
- `defaultsKey()` función
- `loadDefaults()` función
- La función anónima que guarda en localStorage
- `imgToBase64()` (si se usaba solo para el guardado — verificar si también se usa para descarga)

#### Estado del main component — agregar

```js
const [plantillaActivaId, setPlantillaActivaId] = useState(null); // id de la plantilla cargada
const [modalGuardar, setModalGuardar]           = useState(false);
```

#### Navegación — actualizar

```js
// Paso 2 → 3
const goStep3 = (p, cfg) => {
  setPlantilla(p);
  setTplCfg(cfg);
  setStep(3);
};

// Paso 3 → 4: recibe el objeto completo con estado_editor, o null para empezar en blanco
const goStep4 = (entry) => {
  if (entry?.estado_editor) {
    setTplCfg({ ...templateConfig, ...entry.estado_editor.templateConfig });
    setBloques(entry.estado_editor.bloques.map(b => ({ ...b, id: _uid++ })));
    setPlantillaActivaId(entry.id);
  } else {
    setTplCfg(templateConfig);
    setBloques([
      newBloque({ nombre: 'Título',      size: 80, bold: true, x: 8, y: 8,  color: '#000000' }),
      newBloque({ nombre: 'Descripción', size: 42,             x: 8, y: 72, color: '#000000' }),
    ]);
    setPlantillaActivaId(null);
  }
  setStep(4);
};
```

#### Steps indicator

```js
const STEPS = ['Formato', 'Tipo', 'Mis Plantillas', 'Editor'];
```

#### Render condicional de pasos

```jsx
{step === 1 && <FormatoStep onNext={goStep2} />}
{step === 2 && <PlantillaStep tipo={tipo} onNext={goStep3} onBack={() => setStep(1)} />}
{step === 3 && (
  <MisPlantillasStep
    clienteId={clienteId}
    formato={tipo}
    tipo={plantilla}
    onNext={goStep4}
    onBack={() => setStep(2)}
  />
)}
{step === 4 && (
  <EditorStep
    ...props actuales...
    onSaveNamed={() => setModalGuardar(true)}
  />
)}
{modalGuardar && (
  <GuardarPlantillaModal
    clienteId={clienteId}
    formato={tipo}
    tipo={plantilla}
    bloques={bloques}
    templateConfig={templateConfig}
    plantillaActivaId={plantillaActivaId}
    onSaved={(id) => { setPlantillaActivaId(id); setModalGuardar(false); }}
    onClose={() => setModalGuardar(false)}
  />
)}
```

---

### 2.3 Nuevo componente: `MisPlantillasStep`

**Props:** `{ clienteId, formato, tipo, onNext, onBack }`

**Lógica:**
- Llama a `useCreadorPlantillas(clienteId, { formato, tipo })`
- Muestra spinner mientras carga
- Si hay plantillas: grid de cards
- Siempre muestra el botón "Empezar en blanco" → `onNext(null)`

**Card de cada plantilla:**
- Nombre
- Chip de formato y tipo
- Fecha relativa ("hace 3 días")
- Botón eliminar con confirm inline
- Click en la card → llama `useCreadorPlantillaDetalle` para obtener `estado_editor` → `onNext(entry)`

> **Alternativa más simple:** incluir `estado_editor` directamente en el listado (no el hook de detalle). Evita un segundo request. Decidir según tamaño esperado del estado.

---

### 2.4 Nuevo componente: `GuardarPlantillaModal`

**Props:** `{ clienteId, formato, tipo, bloques, templateConfig, plantillaActivaId, onSaved, onClose }`

**UI:**
- Input de texto: nombre de la plantilla
- Si `plantillaActivaId` existe: opción "Actualizar la plantilla actual" vs "Guardar como nueva"
- Botones: Cancelar / Guardar

**Lógica al guardar:**
```js
const crear  = useCrearCreadorPlantilla(clienteId);
const actualizar = useActualizarCreadorPlantilla(clienteId);

const handleConfirm = async (nombre, modoActualizar) => {
  const payload = {
    nombre,
    formato,
    tipo,
    estado_editor: { bloques, templateConfig },
  };
  if (modoActualizar && plantillaActivaId) {
    const res = await actualizar.mutateAsync({ id: plantillaActivaId, ...payload });
    onSaved(res.id);
  } else {
    const res = await crear.mutateAsync(payload);
    onSaved(res.id);
  }
};
```

---

### 2.5 Cambios en `EditorStep`

- **Eliminar:** botón "Guardar como plantilla predeterminada", estado `saving`, estado `savedMsg`, prop `onSaveDefaults`
- **Agregar:** botón "Guardar plantilla" que llama `onSaveNamed()`

---

## Orden de implementación

### Backend
1. Crear migración `creador_plantillas`
2. Crear modelo `CreadorPlantilla`
3. Crear `CreadorPlantillaController` con los 5 métodos
4. Registrar rutas en `api.php`
5. Ejecutar `php artisan migrate`

### Frontend
6. Crear `src/dashboard/hooks/useCreadorPlantillas.js`
7. En `CreadorContenido.jsx`:
   a. Eliminar todo el código de localStorage
   b. Agregar estado `plantillaActivaId` y `modalGuardar`
   c. Actualizar `STEPS` a 4 pasos
   d. Actualizar `goStep3` y agregar `goStep4`
   e. Crear componente `MisPlantillasStep`
   f. Crear componente `GuardarPlantillaModal`
   g. Actualizar `EditorStep`: remover botón viejo, agregar prop `onSaveNamed`
   h. Actualizar render condicional en el main

---

## Archivos a crear/modificar

| Archivo | Acción |
|---|---|
| `c:\laragon\www\dashboard\database\migrations\2026_05_30_000001_create_creador_plantillas_table.php` | Crear |
| `c:\laragon\www\dashboard\app\Models\CreadorPlantilla.php` | Crear |
| `c:\laragon\www\dashboard\app\Http\Controllers\CreadorPlantillaController.php` | Crear |
| `c:\laragon\www\dashboard\routes\api.php` | Modificar — agregar rutas |
| `src/dashboard/hooks/useCreadorPlantillas.js` | Crear |
| `src/dashboard/components/cliente/CreadorContenido.jsx` | Modificar |
