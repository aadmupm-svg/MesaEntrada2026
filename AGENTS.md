# AGENTS.md — Mesa de Entrada WS

Resumen del sistema para retomar el contexto rápidamente en cada sesión.

## Qué es

Sistema web de **Mesa de Entrada y Salidas** (registro de notas/trámites de una municipalidad). Monorepo pnpm con dos apps: API Express + frontend React (Vite). Desplegado en Vercel (frontend + serverless API) con base de datos PostgreSQL (Supabase).

## Stack

- Monorepo: **pnpm** (`packageManager: pnpm@10.6.3`)
- **apps/api**: Express 5 + Prisma 7 (con `@prisma/adapter-pg`) + zod + jsonwebtoken + bcryptjs + socket.io (solo dev)
- **apps/web**: React 19 + Vite 8 + TypeScript + MUI (Material UI v9) + TanStack Query v5 + react-router-dom v7 + react-hook-form + zod + dayjs + axios + jspdf (+ jspdf-autotable) + SweetAlert2 + supabase-js
- Tipado estricto; validaciones con zod tanto en API como en frontend

## Scripts (raíz)

| Comando | Qué hace |
|---|---|
| `pnpm dev` | API (tsx watch, puerto 8000) + web (vite, puerto 5173, proxy `/api` → 8000) |
| `pnpm build` | Build de ambas apps (`pnpm -r build`) |
| `pnpm typecheck` | `tsc --noEmit` en ambas apps — **siempre correr tras cambios** |
| `pnpm db:generate` / `db:migrate` / `db:seed` | Prisma: generar cliente, migrar, sembrar admin |

Verificación obligatoria tras editar código: `pnpm typecheck` (y si se tocó el front, `pnpm --filter web build`).

## Estructura

```
apps/api/src/
  app.ts            # Express: cors, json, rutas /api/auth, /api/notas, /api/fecha, /api/usuarios
  index.ts          # Dev server + socket.io (no se usa en Vercel)
  vercel.ts         # Entrypoint serverless (exporta app)
  routes/auth.ts    # POST /login (bcrypt + JWT)
  routes/notas.ts   # CRUD notas + /next-number (requireAuth)
  routes/usuarios.ts# CRUD usuarios (requireAuth + requireAdmin)
  routes/hora.ts    # GET /fecha → fecha/hora autoritativa (headers HTTP de cloudflare/github/google)
  middleware/auth.ts# firmarToken, requireAuth (JWT Bearer, expira 8h), requireAdmin
  middleware/error.ts
  lib/hora.ts       # Fecha autoritativa: desfase vs NTP vía cabecera Date, TTL 5min, fallback reloj local, tz UTC-3
  lib/prisma.ts     # PrismaClient con adapter-pg
  prisma/schema.prisma
  prisma/seed.ts    # Crea admin (SEED_USUARIO/SEED_PASSWORD, default admin/admin123)

apps/web/src/
  main.tsx          # Providers: QueryClient, ThemeMode, BrowserRouter, Auth
  App.tsx           # Rutas: / → Login, /home → Home (RequireAuth), /usuarios → Usuarios (RequireAdmin), * → Login
  auth/             # AuthProvider (token/user/admin en localStorage), RequireAuth, RequireAdmin, useAuth
  api/              # axios instance con interceptor Bearer + redirect a "/" en 401; funciones por recurso
  lib/supabase.ts   # Cliente Supabase (VITE_SUPABASE_URL/ANON_KEY); null si no hay env
  lib/swal.ts       # Helpers SweetAlert2: base(), toastOk, toastError, toastInfo, confirmarEliminar
  components/
    Home.tsx        # Pantalla principal: tabla, filtros, paginación, imprimir, ABM notas
    NotaForm.tsx    # Form con RHF+zod (tipo/nº/fojas/fecha/hora/firmante/extracto/destino)
    NotaTable.tsx   # Tabla MUI stickyHeader con chips de tipo, editar/eliminar
    Login.tsx, Usuarios.tsx
    pdf/PrintTable.ts # Genera PDF con jsPDF+autoTable (landscape A4, logo, numeración de páginas)
  constants.ts      # destinos (14 áreas) y tipos (Entrada/Salida)
  types.ts          # Nota, NotaPayload, Usuario, UsuarioPayload, UsuarioEdit
  theme.ts, themeMode.tsx  # tema claro/oscuro (localStorage "mesa-entrada-modo"), paleta con colores custom "campo"/"titulo"
```

## Reglas de negocio clave

- **Nota**: `tipo` (Entrada/Salida), `numero` (numérico, se normaliza a 3 dígitos, p.ej. "7" → "007"), `anio`, `fojas`, `fecha` (DD/MM/YYYY), `hora`, `firmante`, `extracto`, `para` (destino), `usuario`, `usuarioId`. Único por `[numero, anio]` → 409 si ya existe.
- El **año y la fecha/hora** provienen del endpoint `GET /api/fecha` (fecha autoritativa, UTC-3), no del reloj del cliente. Se usa para `anio`, `numero` y fecha por defecto del form.
- **Destino**: select con los 14 destinos fijos para tipo Entrada; **texto libre** para tipo Salida.
- **Sesión**: JWT en localStorage (`token`, `user`, `admin`). Interceptor limpia y redirige a `/` en 401.
- **Realtime**: en dev, socket.io (`notas:changed`); en web, suscripción `postgres_changes` a la tabla `Nota` (Supabase) que invalida queries. Solo si `supabase` está configurado.
- **Imprimir Resumen (PDF)**: botón en Home → `imprimirPlanilla(notas, fechaPdf, hoy)` genera PDF landscape con logo `/logoMuni.png`, tabla de notas del día elegido y paginación. **Antes de imprimir se valida que haya notas para esa fecha; si no hay, swal informativo y NO se imprime** (Home.tsx `handleImprimir`).
- **Usuarios**: admin no puede eliminarse a sí mismo; pass hasheada con bcrypt (10 rounds); admin se gestiona desde `/usuarios`.
- **JWT_SECRET**: env de la API; default `"secret-no-configurado"` (no usar en prod).

## Convenciones de código

- Fechas en formato `DD/MM/YYYY` (string), hora `HH:mm` (string).
- Números de nota normalizados con `padStart(3, "0")` en la API (`normalizarNumero`).
- Frontend: componentes con `export function Nombre(...)`; estilos MUI inline `sx`; colores de paleta custom `bgcolor: "campo"` / `"titulo"`.
- SWAL: **solo parámetros válidos de SweetAlert2** (warning previo: `backgroundColor` no existe, usar `background`; `borderRadius` no existe, usar CSS var `--swal2-border-radius` en `index.css`). No agregar parámetros inventados.
- Validaciones duplicadas: schema zod en API (routes) y en frontend (NotaForm).
- No agregar comentarios al código salvo que se pidan.

## Entorno / deploy

- **Vercel**: `vercel.json` en raíz → build `pnpm --filter web build`, output `apps/web/dist`, serverless function `api/vercel.ts` (rewrite `/api/*` → función; resto → index.html SPA).
- **Env**: `apps/api/.env` (DATABASE_URL, JWT_SECRET) y `apps/web/.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY); hay `.env.example`. No commitear `.env`.
- **Git**: repo `aadmupm-svg/MesaEntrada2026`, rama `main`, deploy automático con push. Push puede requerir re-autenticación (token GitHub; el editor inyecta credenciales vía GIT_ASKPASS).

## Notas históricas (bugs ya resueltos — no reintroducir)

- SweetAlert2 no acepta `borderRadius` ni `backgroundColor` como opciones (warnings en consola). Usar `background` y CSS var.
- PDF vacío: antes se imprimía aunque no hubiera notas del día. Ahora se valida antes con swal.