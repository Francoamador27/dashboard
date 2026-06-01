# 📊 Sistema de Portafolio - Documentación Completa

## 🎯 Resumen de Implementación

Se ha reemplazado el sistema de "Ejemplos" y "Galería" con un completo **Sistema de Portafolio** que permite:

✅ Subir proyectos con imagen, título, descripción y contenido HTML editable
✅ Mostrar proyectos en cards atractivas en una galería pública
✅ Acceder a página singular de cada proyecto con detalles completos
✅ Administrar proyectos (crear, editar, eliminar, reordenar)
✅ Reordenar proyectos mediante drag & drop

---

## 🏗️ Backend (Laravel)

### Migración Creada
**Archivo:** `database/migrations/2026_03_03_184009_create_portafolios_table.php`

Campos de la tabla:
- `id` - ID único del proyecto
- `titulo` - Título del proyecto
- `descripcion` - Descripción corta (visible en cards)
- `contenido` - Contenido HTML editable (página singular)
- `imagen` - URL de la imagen del proyecto
- `position` - Posición/orden del proyecto
- `timestamps` - created_at y updated_at

```php
Schema::create('portafolios', function (Blueprint $table) {
    $table->id();
    $table->string('titulo');
    $table->text('descripcion');
    $table->longText('contenido')->nullable();
    $table->string('imagen')->nullable();
    $table->integer('position')->default(0);
    $table->timestamps();
});
```

### Modelo
**Archivo:** `app/Models/Portafolio.php`

```php
class Portafolio extends Model
{
    protected $fillable = [
        'titulo',
        'descripcion',
        'contenido',
        'imagen',
        'position'
    ];
}
```

### Controlador
**Archivo:** `app/Http/Controllers/PortafolioController.php`

**Métodos disponibles:**
- `index()` - GET - Obtener todos los proyectos ordenados
- `show($id)` - GET - Obtener un proyecto específico
- `store(Request $request)` - POST - Crear nuevo proyecto
- `update(Request $request, $id)` - PUT - Actualizar proyecto
- `destroy($id)` - DELETE - Eliminar proyecto
- `reorder(Request $request)` - POST - Reordenar proyectos

### Rutas API
**Archivo:** `routes/api.php`

**Rutas Públicas:**
```
GET    /portafolios              - Obtener todos los proyectos
GET    /portafolios/{id}         - Obtener proyecto específico
```

**Rutas Administrativas (requieren autenticación y rol admin):**
```
POST   /portafolios              - Crear proyecto
PUT    /portafolios/{id}         - Actualizar proyecto
DELETE /portafolios/{id}         - Eliminar proyecto
POST   /portafolios/reorder      - Reordenar proyectos
```

---

## 🎨 Frontend (React)

### Componentes Creados

#### 1. **Portafolio.jsx** - Página Pública
**Ubicación:** `src/components/Portafolio.jsx`

Muestra un grid de cards con todos los proyectos del portafolio. Incluye:
- Header con título y descripción
- Grid responsivo (1 col mobile, 2 col tablet, 3 col desktop)
- Indicador de carga
- Mensaje si no hay proyectos

**Ruta de acceso:** `/portafolio`

#### 2. **PortafolioCard.jsx** - Tarjeta Individual
**Ubicación:** `src/components/PortafolioCard.jsx`

Card individual para cada proyecto con:
- Imagen del proyecto (con hover zoom)
- Overlay oscuro en hover
- Título y descripción (truncados)
- Ícono con efecto hover
- Animaciones suaves

#### 3. **PortafolioDetail.jsx** - Página Singular
**Ubicación:** `src/components/PortafolioDetail.jsx`

Página completa de cada proyecto que incluye:
- Botón volver a portafolio
- Breadcrumb de navegación
- Título e ícono del proyecto
- Descripción
- Imagen principal
- Contenido HTML completo (dangerouslySetInnerHTML)
- CTA para contactar

**Ruta de acceso:** `/portafolio/:id`

#### 4. **AdminPortafolioList.jsx** - Lista de Administración
**Ubicación:** `src/views/AdminPortafolioList.jsx`

Interface administrativa que permite:
- Ver todos los proyectos en lista
- **Drag & Drop** para reordenar proyectos
- Botón editar para cada proyecto
- Botón eliminar con confirmación
- Crear nuevo proyecto

**Características:**
- Drag and Drop usando @dnd-kit
- Guardado automático del orden en backend
- Vista previa de imagen
- Truncado de títulos y descripciones

**Ruta de acceso:** `/admin-dash/portafolio`

#### 5. **AdminPortafolio.jsx** - Crear/Editar Proyecto
**Ubicación:** `src/views/AdminPortafolio.jsx`

Formulario completo para crear o editar proyectos con:
- **Subida de imagen** con preview
- **Input de título**
- **Textarea de descripción**
- **Textarea de contenido HTML** con instrucciones
- Validación de campos requeridos
- Estados de carga/guardado

**Características especiales:**
- Soporte para HTML (p, h2, strong, em, ul, li, img, etc.)
- Eliminación de imagen anterior al actualizar
- Manejo de errores
- Redirección después de guardar

**Rutas de acceso:**
- Crear: `/admin-dash/portafolio/new`
- Editar: `/admin-dash/portafolio/:id`

### Rutas en Router.jsx

```jsx
// Rutas públicas
{ path: "/portafolio", element: suspense(<Portafolio />) },
{ path: "/portafolio/:id", element: suspense(<PortafolioDetail />) },

// Rutas administrativas
{ path: '/admin-dash/portafolio', element: suspense(<AdminPortafolioList />) },
{ path: '/admin-dash/portafolio/new', element: suspense(<AdminPortafolio />) },
{ path: '/admin-dash/portafolio/:id', element: suspense(<AdminPortafolio />) },
```

---

## 🚀 Cómo Usar

### Para Administradores

#### Crear un nuevo proyecto:
1. Ve a `/admin-dash/portafolio`
2. Haz clic en "Nuevo Proyecto"
3. Completa el formulario:
   - **Imagen:** Sube una imagen (PNG, JPG, WEBP, máx 2MB)
   - **Título:** Nombre del proyecto
   - **Descripción:** Texto corto (visible en cards)
   - **Contenido:** HTML completo con detalles del proyecto
4. Haz clic en "Crear Proyecto"

#### Editar un proyecto:
1. Ve a `/admin-dash/portafolio`
2. Haz clic en el ícono de edición (lápiz azul)
3. Modifica los campos deseados
4. Haz clic en "Actualizar Proyecto"

#### Eliminar un proyecto:
1. Ve a `/admin-dash/portafolio`
2. Haz clic en el ícono de eliminar (basura roja)
3. Confirma la acción

#### Reordenar proyectos:
1. Ve a `/admin-dash/portafolio`
2. Arrastra los proyectos por el ícono de las seis líneas
3. El orden se guarda automáticamente

### Para Usuarios

#### Ver portafolio:
1. Ve a `/portafolio`
2. Explora los proyectos en cards
3. Haz clic en un proyecto para ver detalles completos

---

## 📝 Contenido HTML Permitido

En el campo "Contenido Detallado", puedes usar HTML como:

```html
<p>Párrafo normal</p>
<h2>Subtítulo</h2>
<h3>Subsubtítulo</h3>
<strong>Texto en negrita</strong>
<em>Texto en cursiva</em>
<ul>
  <li>Elemento de lista</li>
  <li>Otro elemento</li>
</ul>
<ol>
  <li>Lista numerada</li>
  <li>Otro elemento numerado</li>
</ol>
<img src="url-imagen" alt="descripción">
<a href="url">Enlace</a>
<blockquote>Cita o contenido destacado</blockquote>
```

---

## 🔐 Permisos y Autenticación

- **Rutas públicas** (`/portafolio`, `/portafolio/:id`): Accesibles para todos
- **Rutas administrativas** (`/admin-dash/portafolio/*`): Requieren:
  - Estar autenticado
  - Tener rol de administrador
  - Token válido en localStorage

---

## 🛠️ Tecnologías Utilizadas

### Backend:
- **Laravel 11** - Framework PHP
- **ImageHelper** - Optimización de imágenes (WEBP)

### Frontend:
- **React 18** - Framework JS
- **React Router v6** - Routing
- **@dnd-kit** - Drag & Drop (v6.3.1 y v10.0.0)
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos

---

## 📋 Proceso de Instalación Completado

✅ Migración ejecutada (`php artisan migrate`)
✅ Modelo Portafolio creado
✅ Controlador completo implementado
✅ Rutas API configuradas
✅ Componentes React creados
✅ Router actualizado
✅ Dependencias instaladas (@dnd-kit/utilities)

---

## 🔍 URLs Rápidas

| Descripción | URL |
|---|---|
| Ver Portafolio | `/portafolio` |
| Ver Proyecto | `/portafolio/:id` |
| Administrar | `/admin-dash/portafolio` |
| Crear Nuevo | `/admin-dash/portafolio/new` |
| Editar Proyecto | `/admin-dash/portafolio/:id` |

---

## 📚 Endpoint de API

**Base URL:** `{VITE_API_URL}`

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/portafolios` | Obtener todos |
| GET | `/portafolios/:id` | Obtener uno |
| POST | `/portafolios` | Crear (admin) |
| PUT | `/portafolios/:id` | Actualizar (admin) |
| DELETE | `/portafolios/:id` | Eliminar (admin) |
| POST | `/portafolios/reorder` | Reordenar (admin) |

---

## 💡 Notas Importantes

1. **Imágenes**: Se optimizan automáticamente a WEBP en el servidor
2. **HTML**: Se renderiza con `dangerouslySetInnerHTML` - Solo administradores pueden subir
3. **Orden**: Se mantiene persistentemente en la BD con el campo `position`
4. **Borrado**: Al eliminar un proyecto, su imagen también se elimina del servidor
5. **Actualización**: Al cambiar imagen, la anterior se elimina automáticamente

---

## ❌ Problemas Posibles y Soluciones

**Problema:** "No puedo subir imagen"
- Solución: Verifica que el tamaño sea menor a 2MB y el formato sea PNG, JPG o WEBP

**Problema:** "El contenido HTML no se muestra"
- Solución: Asegúrate de usar etiquetas HTML válidas. El contenido se renderiza tal cual.

**Problema:** "No puedo reordenar"
- Solución: Recarga la página. Si persiste, verifica que tengas permisos de admin.

**Problema:** "404 en portafolio/:id"
- Solución: Verifica que el ID del proyecto existe en la base de datos.

---

## 📞 Soporte

Para más información o reportar problemas, contacta al equipo de desarrollo.

**Última actualización:** 2026-03-03
