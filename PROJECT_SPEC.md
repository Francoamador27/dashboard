# Dashboard Clientas — Especificación Completa del Proyecto

> Herramienta privada de generación de contenido visual con IA para agencia.
> Stack: Laravel 12 + React + OpenAI API. Alojado en Hostinger.

---

## Rol del asistente

Actúa como **arquitecto senior fullstack** experto en:
- Laravel 12
- React
- Tailwind CSS
- OpenAI API
- Diseño SaaS privado
- Sistemas de gestión de assets

---

## Stack tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| Laravel 12 | Framework principal |
| MySQL | Base de datos |
| Laravel Sanctum | Autenticación API |
| Queue Jobs | Procesamiento asíncrono |
| Storage local | Archivos en servidor |
| API REST | Comunicación frontend-backend |

### Frontend
| Tecnología | Uso |
|---|---|
| React + Vite | Framework UI |
| Tailwind CSS | Estilos utilitarios |
| shadcn/ui | Componentes de UI |
| Zustand | Estado global |
| React Query | Fetching y caché de datos |
| Framer Motion | Animaciones |

---

## Estructura de carpetas

```
backend/                          (c:\laragon\www\dashboard)
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── ClienteController.php
│   │   │   ├── GeneradorController.php
│   │   │   ├── GaleriaController.php
│   │   │   ├── ColeccionController.php
│   │   │   └── CampañaController.php
│   │   └── Middleware/
│   │       └── AdminOnly.php
│   ├── Models/
│   │   ├── Cliente.php
│   │   ├── Asset.php
│   │   ├── Coleccion.php
│   │   └── Campaña.php
│   ├── Services/
│   │   ├── OpenAIImageService.php
│   │   ├── PromptBuilderService.php
│   │   ├── AssetAdapterService.php
│   │   └── CampañaMasivaService.php
│   └── Jobs/
│       ├── GenerarImagenJob.php
│       └── GenerarCampañaJob.php
├── database/
│   └── migrations/
├── routes/
│   └── api.php
└── storage/
    └── app/public/clientes/{id}/
        ├── logos/
        ├── meta/
        ├── stories/
        ├── google/
        ├── highlights/
        └── colecciones/

frontend/                         (c:\Users\Franco\Desktop\PROYECTOS PERSONALES\react\Dashboard Clientas)
├── src/
│   ├── components/
│   │   ├── ui/                   (shadcn/ui)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Topbar.tsx
│   │   ├── clientes/
│   │   ├── generador/
│   │   ├── galeria/
│   │   └── colecciones/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Clientes.tsx
│   │   ├── PerfilMarca.tsx
│   │   ├── Generador.tsx
│   │   ├── Galeria.tsx
│   │   ├── Colecciones.tsx
│   │   └── Configuracion.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useClientes.ts
│   │   ├── useAssets.ts
│   │   └── useGenerador.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   └── appStore.ts
│   ├── services/
│   │   └── api.ts
│   └── lib/
│       └── queryClient.ts
```

---

## Módulos del sistema

### 1. Login privado

Acceso exclusivo del administrador de la agencia.

**Campos:**
- Email
- Password

**Seguridad:**
- Laravel Sanctum
- Sesiones seguras con tokens
- Middleware `AdminOnly` en todas las rutas protegidas

---

### 2. Dashboard principal

**Cards de métricas:**
- Total clientes
- Imágenes generadas
- Campañas creadas
- Últimas actividades

**Sidebar de navegación:**
- Dashboard
- Clientes
- Biblioteca Global
- Generador IA
- Colecciones
- Configuración

---

### 3. Gestión de clientes (CRUD completo)

**Campos por cliente:**
- nombre
- logo
- rubro
- descripción
- prompt base de marca
- colores corporativos (array HEX)
- tipografía
- tono comunicacional
- notas internas

**Ejemplo de cliente:**
```
Nombre: SUOK SERVICE
Prompt base: Marca premium minimalista negro y dorado, líneas limpias, elegante, moderna, corporativa.
```

**Estructura de carpetas físicas:**
```
/storage/app/public/clientes/{id}/
├── logos/
├── meta/
├── stories/
├── google/
├── highlights/
└── colecciones/
```

---

### 4. Perfil de marca (Brand DNA)

Pantalla editable por cliente con:

- Paleta visual (colores corporativos)
- Estilo gráfico
- Restricciones visuales
- Estilo de copy
- Referencias visuales (URLs o imágenes)

> Este perfil se inyecta automáticamente para enriquecer todos los prompts generados para ese cliente.

---

### 5. Generador IA

**Inputs del formulario:**

| Campo | Opciones |
|---|---|
| Cliente | Selector de clientes existentes |
| Plataforma | Meta Feed / Meta Story / Google Display / Google Responsive / Highlight Cover |
| Tipo | Promoción / Branding / Educativo / Institucional / Oferta / Testimonial |
| Objetivo | Awareness / Conversión / Remarketing / Fidelización |
| Texto principal | Input libre |
| CTA | Input libre |
| Prompt adicional | Textarea libre |

**Acción:** Botón `Generar Variantes` → llama al backend → genera 4 imágenes.

---

### 6. Integración OpenAI

**Servicio principal:** `OpenAIImageService.php`

**Responsabilidades:**
1. Construir prompt final combinando Brand DNA del cliente + inputs del formulario
2. Llamar a la API oficial de OpenAI (generación de imágenes)
3. Generar 4 variantes por solicitud
4. Descargar imágenes del CDN de OpenAI
5. Guardar localmente en la carpeta del cliente
6. Registrar metadata completa en DB

**Metadata guardada en DB:**
```
prompt_usado
fecha
cliente_id
plataforma
tipo
objetivo
ruta_archivo
status (pending | processing | completed | failed)
```

---

### 7. Galería visual

Vista tipo **masonry** con diseño premium.

**Filtros disponibles:**
- Cliente
- Plataforma
- Tipo
- Colección
- Fecha (rango)

**Acciones por imagen:**
- Ver en grande (modal)
- Descargar
- Regenerar (reusar prompt)
- Duplicar
- Mover a colección
- Eliminar
- Adaptar a otro formato

---

### 8. Adaptación automática de formatos

**Servicio:** `AssetAdapterService.php`  
**Librería:** `Intervention Image`

**Conversiones disponibles:**
- Meta Feed → Story
- Story → Highlight
- Feed → Google Display

**Formatos soportados:**

| Formato | Dimensiones |
|---|---|
| Meta Feed | 1080x1080 |
| Meta Story | 1080x1920 |
| Google Display | 1200x628 |
| Highlight Cover | 1080x1080 (circular safe zone) |

**Algoritmo:** Resize inteligente + crop centrado.

---

### 9. Colecciones

Organización tipo campañas. Cada colección agrupa assets relacionados.

**Ejemplos de uso:**
- Campaña Junio
- Black Friday
- Institucional
- Promos permanentes

---

### 10. Generación masiva

**Botón:** `Crear campaña mensual`

**Inputs:**
- Cantidad de piezas
- Objetivo
- Cliente

**Comportamiento:**
1. Genera múltiples prompts automáticos variados
2. Distribuye los tipos automáticamente (promo, branding, testimonio, institucional, educativo)
3. Crea todos los assets en segundo plano usando Queue Jobs
4. Notifica al completar

---

## Diseño UI/UX

### Paleta de colores
- Fondo: negro
- Texto: blanco
- Acentos: dorado
- Sombras: suaves y sutiles

### Inspiración visual
- [Linear](https://linear.app)
- [Framer](https://framer.com)
- [Vercel](https://vercel.com)
- Notion premium dashboards

### Animaciones
- Framer Motion para transiciones de página y micro-interacciones

---

## Estándares de código

- Código limpio, sin bloat
- Arquitectura profesional
- Services separados del controlador
- Controllers delgados (solo orquestan)
- Hooks reutilizables en frontend
- Componentes desacoplados
- Comentarios mínimos pero útiles (solo el **por qué**, nunca el **qué**)
- Listo para producción real

---

## Plan de implementación por fases

### Fase 1 — Setup base
- Configuración de proyectos (Laravel + Vite)
- Variables de entorno
- Conexión DB
- Estructura de carpetas

### Fase 2 — Autenticación
- Login backend con Sanctum
- Middleware AdminOnly
- Login UI en React
- Protección de rutas

### Fase 3 — Gestión de clientes
- Migrations y modelos
- CRUD completo backend
- UI de clientes en React
- Perfil de marca (Brand DNA)
- Creación automática de carpetas físicas

### Fase 4 — Integración OpenAI
- `OpenAIImageService.php`
- `PromptBuilderService.php`
- Queue Jobs para procesamiento asíncrono
- Formulario Generador IA en frontend

### Fase 5 — Galería
- Modelo y rutas de assets
- Vista masonry
- Filtros
- Modal de imagen
- Acciones (descargar, eliminar, etc.)

### Fase 6 — Adaptación de formatos
- `AssetAdapterService.php` con Intervention Image
- UI para conversión de formatos

### Fase 7 — Generación masiva
- `CampañaMasivaService.php`
- Queue Jobs masivos
- UI de campaña mensual

---

> Cada fase incluye: archivos creados, ubicación exacta y código completo listo para copiar.
> No simplificar. Construir como software real listo para producción.
