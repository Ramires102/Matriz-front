# Meeter Front — Frontend

## Forma para iniciarlo

```bash
cd ~/Proyectos/Meeter/Front_meeter/meeter-front

# Limpiar caché previo (si hay errores de compilación)
rm -rf .next

# Iniciar servidor de desarrollo
npm run dev -- -p 3001
```

> Asegurate que el backend esté corriendo en `http://localhost:3000` y que la variable `NEXT_PUBLIC_API_URL` en `.env.local` apunte a esa URL.

## Resumen

Frontend en Next.js 14 (App Router) con Tailwind CSS que replica una web social de eventos premium.

### Tecnologías principales

- **Next.js 14** — App Router, renderizado del lado del cliente.
- **Tailwind CSS** — Estilos utilitarios, theme con variables CSS custom.
- **TypeScript** — Tipado estricto en toda la aplicación.

### Estructura de la aplicación

```
src/
├── app/
│   ├── page.tsx              → Página principal (feed + hero)
│   └── login/page.tsx        → Login / Registro
├── components/
│   ├── auth/                 → AuthGuard (protege rutas)
│   ├── home/                 → HeroCarousel, FeedGrid
│   ├── layout/               → Header, Sidebar, RightPanel, BottomNav, Modal
│   ├── panels/               → CreateEventPanel, EditProfile, etc. (dentro de Sidebar)
│   ├── theme/                → ThemeProvider (light/dark)
│   └── ui/                   → Iconos SVG tipados
└── lib/
    ├── auth-context.tsx       → AuthProvider con login/register/logout
    ├── api.ts                 → Llamadas a la API REST
    ├── mapper.ts              → Conversión ApiEvent → EventItem
    └── types.ts               → Interfaces compartidas
```

### Funcionalidades principales

- **Login / Registro** — Formulario con campos de usuario, email, nombre, DNI (obligatorio) y domicilio (opcional). Guarda JWT en localStorage.
- **Feed dinámico** — Grid de eventos en masonry, con like toggle, estrellas, precio y botón "Reservar". Los datos vienen del backend vía `GET /events`.
- **Hero Carousel** — Slides destacados con auto-play, flechas y dots.
- **Sidebar** — Drawer con perfil del usuario autenticado, navegación, acceso a paneles (Crear Evento, Editar Perfil, Buscar Amigos, Mis Eventos).
- **Modal de evento** — Detalle completo con cover, galería, info del organizador, precio y botón de like.
- **Header** — Search bar, mega menú "Explorar" con categorías, filtro por rating, favoritos.
- **Editar Perfil** — Panel modal donde se pre-cargan los datos reales del usuario (nombre, email, DNI, domicilio).
- **Crear Evento** — Formulario completo con preview visual en vivo. Envía `POST /events` con JWT de autenticación.
- **Theme** — Modo claro/oscuro persistido en localStorage.
- **AuthGuard** — Redirige a `/login` si no hay token.

### Relaciones

- Depende del **backend** (`meeter-api`) en `http://localhost:3000`.
- Envía peticiones con JWT en header `Authorization: Bearer {token}`.
- Los datos de perfil se sincronizan con la respuesta del backend (login/register).

### Cómo probar

```bash
# 1. Abrí http://localhost:3001
# 2. Registrate con usuario, email, nombre, DNI y contraseña
# 3. Iniciá sesión
# 4. Explorá el feed, abrí el sidebar, creá un evento
```
