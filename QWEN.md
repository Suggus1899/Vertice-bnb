# QWEN.md - Configuración Principal del Proyecto Vetice-bnb

> **Última actualización:** Febrero 2026  
> **Stack:** Next.js 16 + Node.js/Express + PostgreSQL/PostGIS + Prisma + React Native (Expo) + Tailwind CSS v4 + TypeScript 5.x  
> **Arquitectura:** Micro-Monolítica Cliente-Servidor

---

## 📖 Tabla de Contenidos

1. [Información del Proyecto](#-información-del-proyecto)
2. [Arquitectura del Sistema](#-arquitectura-del-sistema)
3. [Modelo de Base de Datos](#-modelo-de-base-de-datos)
4. [Lógica del Buscador](#-lógica-del-buscador)
5. [Hoja de Ruta (Sprints)](#-hoja-de-ruta-sprints)
6. [Skills y Mejores Prácticas](#-skills-y-mejores-prácticas)
7. [Reglas Críticas por Tecnología](#-reglas-críticas-por-tecnología)
8. [Anti-Patrones](#-anti-patrones)

---

## 📌 Información del Proyecto

**Nombre:** Vetice-bnb (Vértice)  
**Descripción:** Plataforma de búsqueda de alojamiento estudiantil con geolocalización, chat en tiempo real y sistema de reservas.  
**Tipo:** Proyecto de Grado (Tesis)  
**Duración:** 16 semanas (4 meses)

### Actores del Sistema
- **Estudiante:** Busca propiedades, chatea con anfitriones, reserva
- **Anfitrión:** Publica propiedades, gestiona reservas
- **Administrador:** Modera contenido, aprueba KYC

### Funcionalidades Clave
- 🔍 Búsqueda geoespacial con PostGIS (radio en km)
- 💬 Chat en tiempo real con Socket.io
- 💰 Pagos en USD y Bs (tasa BCV dinámica)
- 📸 Upload de imágenes a Cloudinary/S3
- 🔐 Autenticación JWT con roles
- 📱 Web (Next.js) + Móvil (React Native/Expo)

---

## 🏗️ Arquitectura del Sistema

### Visión General

Vértice emplea una **Arquitectura Micro-Monolítica Cliente-Servidor**. El backend es una API REST robusta (Node.js/Express) que sirve a los clientes Web (Next.js) y Móvil (React Native).

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              External Services                              │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│ Cloudinary/S3   │    Firebase     │   Email Service │    BCV Exchange API   │
│  (Storage)      │   (FCM Push)    │   (Resend)      │    (Tasa de Cambio)   │
└────────┬────────┴────────┬────────┴────────┬────────┴──────────┬───────────┘
         │                 │                 │                   │
         │ Direct Upload   │ Push Notif.     │ Email             │ Daily Fetch
         │                 │                 │                   │
         ▼                 ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Backend Services                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────────┐  │
│  │  Load Balancer  │  │  Node.js API    │  │   Socket.io Service         │  │
│  │  (Nginx)        │──│  (Express TS)   │──│   (Real-time Events)        │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────────┘  │
│                          │                                                  │
│                          │ Cron Jobs Service                                │
│                          │ (Exchange Rate Sync)                             │
└──────────────────────────┼──────────────────────────────────────────────────┘
                           │
                           │ Read/Write
                           ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                Data Layer                                   │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  PostgreSQL + PostGIS                │  Redis (Optional)                    │
│  - Users & Profiles                  │  - Session Cache                     │
│  - Properties & Bookings             │  - Rate Cache                        │
│  - Messages & KYC                    │  - Pub/Sub                           │
│  - Exchange Rates                    │                                      │
└──────────────────────────────────────┴──────────────────────────────────────┘
         ▲
         │ HTTPS/REST
         │ WebSocket
┌────────┴─────────────────────────────────────────────────────────────────────┐
│                                 Clients                                      │
├──────────────────────────────────────┬──────────────────────────────────────┤
│  Next.js Web App                     │  React Native Mobile                 │
│  (Vercel - SSR/CSR)                  │  (Expo - JWT Auth)                   │
│  - Student/Host/Admin                │  - Student Only                      │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### Servicios Externos

| Servicio | Propósito | Alternativa |
|----------|-----------|-------------|
| **Cloudinary** | Almacenamiento y optimización de imágenes | AWS S3 |
| **Firebase FCM** | Notificaciones push | OneSignal |
| **Resend** | Email transaccional | Nodemailer |
| **BCV API** | Tasa de cambio oficial | Manual (cron) |

---

## 📊 Índice de Skills Disponibles

Este proyecto cuenta con **12 categorías de skills** con **108+ archivos** de mejores prácticas:

| Skill | Archivos | Enfoque Principal |
|-------|----------|-------------------|
| [`next-best-practices`](.agents/skills/next-best-practices/) | 17 | Async patterns, RSC boundaries, data fetching, error handling |
| [`next-cache-components`](.agents/skills/next-cache-components/) | 1 | PPR, `use cache`, invalidación de caché |
| [`nodejs-backend-patterns`](.agents/skills/nodejs-backend-patterns/) | 1 | Express/Fastify, arquitectura por capas, middleware |
| [`nodejs-best-practices`](.agents/skills/nodejs-best-practices/) | 1 | Selección de framework, seguridad, testing |
| [`postgresql-table-design`](.agents/skills/postgresql-table-design/) | 1 | Tipos de datos, indexing, JSONB, particionamiento |
| [`prisma-expert`](.agents/skills/prisma-expert/) | 1 | Schema design, migraciones, optimización de queries |
| [`react-native-best-practices`](.agents/skills/react-native-best-practices/) | 24 | FPS, bundle size, TTI, performance nativo |
| [`tailwind-design-system`](.agents/skills/tailwind-design-system/) | 1 | Tailwind v4 CSS-first, CVA, dark mode |
| [`typescript-advanced-types`](.agents/skills/typescript-advanced-types/) | 1 | Genéricos, conditional types, mapped types |
| [`typescript-expert`](.agents/skills/typescript-expert/) | 1 | Type-level programming, performance, monorepo |
| [`ui-ux-pro-max`](.agents/skills/ui-ux-pro-max/) | 1 + data | Accesibilidad, touch targets, UI profesional |
| [`vercel-react-best-practices`](.agents/skills/vercel-react-best-practices/) | 58 | Waterfalls, bundle size, server/client performance |

---

## 🎯 Reglas Críticas por Tecnología

### Next.js 16+ (Frontend Web)

#### Async Patterns (CRÍTICO)
- ✅ `params`, `searchParams`, `cookies()`, `headers()` son **asíncronos** en Next.js 15+
- ✅ Tipar como `Promise<...>` y hacer await
- ✅ Usar `React.use()` para componentes sincrónicos
```typescript
// ✅ CORRECTO
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
}

// ❌ INCORRECTO
export default function Page({ params }: { params: { slug: string } }) {
  const { slug } = params; // Error en Next.js 15+
}
```

#### Data Fetching (CRÍTICO)
- ✅ **Server Component lee** → Fetch directo (NO crear API route)
- ✅ **Client Component muta** → Server Action
- ✅ **Client Component lee** → Pasar desde Server Component o Route Handler
- ✅ **APIs externas/webhooks** → Route Handler
- ✅ Evitar waterfalls: Usar `Promise.all()` para fetching paralelo
```typescript
// ✅ CORRECTO - Parallel fetching
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id)
]);

// ❌ INCORRECTO - Waterfall
const user = await fetchUser(id);
const posts = await fetchPosts(id); // Espera innecesaria
```

#### Componentes de Cliente vs Servidor
- ✅ `'use client'`: Para hooks, event handlers, browser APIs
- ✅ `'use server'`: Para Server Actions (mutaciones)
- ✅ `'use cache'`: Para caché (Next.js 16+, requiere `cacheComponents: true`)
- ❌ **NO** usar componentes Cliente asíncronos
- ❌ **NO** pasar props no serializables (funciones, Date, Map, Set, clases)

#### Imágenes y Fuentes
- ✅ Siempre usar `next/image` NO `<img>`
- ✅ Siempre usar `next/font` (zero layout shift)
- ✅ Configurar `remotePatterns` en `next.config.js` para imágenes externas
```typescript
// ✅ CORRECTO
import { Inter } from 'next/font/google';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });
```

#### Error Handling
- ✅ `error.tsx`: Para errores de segmentos de ruta (Client Component)
- ✅ `global-error.tsx`: Para errores de root layout (debe incluir `<html>` y `<body>`)
- ✅ **Server Actions**: NO envolver `redirect()`, `notFound()` en try-catch
- ✅ Usar `unstable_rethrow()` para re-lanzar errores de navegación

#### Metadata y SEO
- ✅ **Solo Server Components** pueden usar metadata
- ✅ Static: `export const metadata: Metadata = { title: '...' }`
- ✅ Dynamic: `generateMetadata()` function
- ✅ Usar `next/og` con `ImageResponse` para OG images

---

### Node.js + Express (Backend)

#### Arquitectura (CRÍTICO)
- ✅ **Arquitectura por capas**: Controller → Service → Repository
- ✅ **Dependency Injection**: Usar contenedor para dependencias
- ✅ **Validación en límites**: Zod schema validation en entrada de API
```typescript
// ✅ CORRECTO - Capas separadas
// Controller
export const createUser = async (req: Request, res: Response) => {
  const user = await userService.create(req.body);
  res.json(user);
};

// Service
export const create = async (data: CreateUserDTO) => {
  // Business logic
  return userRepository.create(data);
};
```

#### Error Handling
- ✅ **Clases de error personalizadas**: `AppError`, `ValidationError`, `NotFoundError`
- ✅ **Global error handler**: Middleware centralizado
- ✅ **Async wrapper**: `asyncHandler` para catching async errors
```typescript
// ✅ CORRECTO
class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

// Global error handler middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  res.status(500).json({ message: 'Internal Server Error' });
});
```

#### Autenticación
- ✅ **JWT**: Access token (15m) + refresh token (7d)
- ✅ **Password hashing**: bcrypt con salt rounds
- ✅ **Token refresh**: Rotar refresh tokens
- ✅ **Rate limiting**: Redis-backed para sistemas distribuidos

#### Seguridad Checklist
- ✅ Validación de inputs (Zod)
- ✅ Parameterized queries (Prisma)
- ✅ Password hashing (Argon2/Bcrypt)
- ✅ JWT verification middleware
- ✅ Rate limiting
- ✅ Security headers (Helmet)
- ✅ HTTPS en producción
- ✅ CORS configurado correctamente
- ✅ Secrets en variables de entorno
- ✅ `npm audit` regularmente

---

### PostgreSQL + PostGIS (Base de Datos)

#### Tipos de Datos (CRÍTICO)
- ✅ **IDs**: `BIGINT GENERATED ALWAYS AS IDENTITY` o `UUID`
- ✅ **Enteros**: `BIGINT` (prefer), `INTEGER` para rangos pequeños
- ✅ **Dinero**: `NUMERIC(p,s)` (NUNCA float)
- ✅ **Tiempo**: `TIMESTAMPTZ` (NUNCA `timestamp` sin timezone)
- ✅ **Strings**: `TEXT` con CHECK constraint para límites
- ✅ **Booleanos**: `BOOLEAN` con `NOT NULL`
- ✅ **JSON**: `JSONB` (mejor que JSON) con índice GIN
- ✅ **Geoespacial**: `geography(Point, 4326)` para PostGIS

#### Indexing (CRÍTICO)
- ✅ **PK/unique**: Auto-indexados
- ✅ **FK columns**: ¡Agregar índices manualmente! (PostgreSQL NO lo hace automático)
- ✅ **Filtros/sorts frecuentes**: Agregar índices
- ✅ **Join keys**: Agregar índices
- ✅ **JSONB**: `CREATE INDEX USING GIN (jsonb_col)`
- ✅ **Arrays**: GIN index para containment queries (`@>`)

```sql
-- ✅ CORRECTO - Índice en FK
CREATE INDEX "Property_hostId_idx" ON "Property"("hostId");

-- ✅ CORRECTO - Índice GIN para JSONB
CREATE INDEX "Property_services_idx" ON "Property" USING GIN ("services");

-- ✅ CORRECTO - Índice parcial para hot subsets
CREATE INDEX "Property_active_idx" ON "Property"(id) WHERE "isActive" = true;
```

#### PostGIS Queries
```sql
-- ✅ Buscar propiedades dentro de un radio (en metros)
SELECT id FROM "Property"
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography,
  radius_meters
);

-- ✅ Calcular distancia (en metros)
SELECT id, ST_Distance(
  location::geography,
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
) as distance
FROM "Property";
```

#### Anti-Patrones
- ❌ `timestamp` sin timezone → Usar `timestamptz`
- ❌ `varchar(n)` → Usar `text` con CHECK
- ❌ `money` → Usar `numeric`
- ❌ `serial` → Usar `generated always as identity`
- ❌ Olvidar índices en FKs
- ❌ UNIQUE + NULLs múltiples → Usar `NULLS NOT DISTINCT` (PG15+)

---

### Prisma ORM

#### Schema Design
- ✅ **Relaciones explícitas**: Usar `@relation` con `fields` y `references`
- ✅ **Cascade behaviors**: Definir `onDelete`, `onUpdate`
- ✅ **Índices**: Agregar `@@index` para campos consultados frecuentemente
- ✅ **Nombres de tablas**: Usar `@@map("table_name")`

```prisma
// ✅ CORRECTO
model Property {
  id       String   @id @default(uuid())
  hostId   String   @map("host_id")
  host     User     @relation(fields: [hostId], references: [id], onDelete: Cascade)
  isActive Boolean  @default(true) @map("is_active")
  
  @@index([hostId])
  @@index([isActive])
  @@map("property")
}
```

#### Migraciones
- ✅ **Desarrollo**: `prisma migrate dev --name descriptive_name`
- ✅ **Producción**: `prisma migrate deploy` (NUNCA `migrate dev`)
- ✅ **Resolver fallos**: `prisma migrate resolve --applied "migration_name"`

#### Query Optimization
- ✅ **N+1 problem**: Usar `include` para relaciones
- ✅ **Select fields**: Solo campos necesarios para reducir payload
- ✅ **Agregaciones complejas**: Usar `$queryRaw` para SQL puro
- ✅ **Query logging**: Habilitar en desarrollo para debugging

```typescript
// ✅ CORRECTO - Evitar N+1
const properties = await prisma.property.findMany({
  include: {
    images: true,
    host: { select: { id: true, name: true, avatar: true } }
  }
});

// ✅ CORRECTO - Solo campos necesarios
const properties = await prisma.property.findMany({
  select: { id: true, title: true, priceUsd: true }
});
```

#### Connection Management (Serverless)
```typescript
// ✅ CORRECTO - Singleton para serverless
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

#### Transacciones
```typescript
// ✅ Transacción secuencial
await prisma.$transaction([
  prisma.user.update({ ... }),
  prisma.booking.create({ ... })
]);

// ✅ Transacción interactiva
await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ ... });
  await tx.booking.create({ ... });
});
```

---

### React Native (Expo) - Móvil

#### Performance de Listas (CRÍTICO)
- ✅ **Reemplazar ScrollView** con FlatList/FlashList para >10-20 items
- ✅ **FlashList**: 78/100 performance score vs 25/100 de FlatList
- ✅ **Optimización**: `estimatedItemSize`, `getItemLayout`, `getItemType`

```typescript
// ✅ CORRECTO - FlashList con optimización
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={properties}
  estimatedItemSize={200}
  renderItem={({ item }) => <PropertyCard property={item} />}
  keyExtractor={(item) => item.id}
/>;

// ❌ INCORRECTO - ScrollView para muchas items
<ScrollView>
  {properties.map(p => <PropertyCard key={p.id} property={p} />)}
</ScrollView>
```

#### React Compiler (SDK 52+)
- ✅ **Automatiza memoization**: NO necesitar `memo`/`useMemo`/`useCallback` manualmente
- ✅ **Setup**: `npx expo install babel-plugin-react-compiler`
- ✅ **Verificación**: React DevTools muestra badge `Memo ✨`
- ❌ **NO** mutar props o durante render

#### Barrel Imports (CRÍTICO)
- ❌ **NO** importar desde barrel files (`import { Button } from './components'`)
- ✅ **Importar directo**: `import Button from './components/Button'`
- ⚠️ **Impacto**: 200-800ms de costo de importación

#### TTI (Time To Interactive)
- ✅ **Medir solo cold starts** (excluir warm/hot/prewarm)
- ✅ **Librería**: `react-native-performance`
- ✅ **Targets**: TTI <2s (bueno), 2-4s (aceptable), >4s (necesita trabajo)
- ✅ **Optimización**: Deshabilitar compresión de bundle JS (Android)

#### Animaciones
- ✅ **Usar Reanimated**: Worklets para 60 FPS
- ✅ **Evitar**: Animaciones en JS thread

#### Memoria
- ✅ **Hunt memory leaks**: Usar DevTools
- ✅ **Uncontrolled components**: Para TextInput optimization
- ✅ **Atomic state**: Jotai/Zustand para reducir re-renders

---

### Tailwind CSS v4 (Diseño)

#### Configuración CSS-First
- ✅ **Import**: `@import "tailwindcss"` (NO `@tailwind base/components/utilities`)
- ✅ **Tema en CSS**: `@theme` block (NO `tailwind.config.ts`)
- ✅ **Dark mode**: `@custom-variant dark (&:where(.dark, .dark *))`

```css
/* ✅ CORRECTO - Tailwind v4 */
@import "tailwindcss";

@theme {
  --color-primary: oklch(45% 0.2 260);
  --color-primary-foreground: oklch(95% 0.01 260);
  
  --font-inter: "Inter", sans-serif;
  
  --animate-fade-in: fade-in 0.3s ease-in-out;
  
  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }
}

@custom-variant dark (&:where(.dark, .dark *));
```

#### CVA (Class Variance Authority)
```typescript
// ✅ CORRECTO - Componente con variantes type-safe
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

#### Compound Components (React 19)
```typescript
// ✅ CORRECTO - React 19 (NO necesita forwardRef)
function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('rounded-lg border', className)} {...props} />;
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col p-6', className)} {...props} />;
}

Card.Header = CardHeader;
```

---

### TypeScript 5.x

#### Configuración Estricta
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "skipLibCheck": true,
    "incremental": true,
    "moduleResolution": "bundler"
  }
}
```

#### Patrones Avanzados
- ✅ **Branded Types**: `type UserId = Brand<string, 'UserId'>` para domain primitives
- ✅ **Type guards**: `isString(value): value is string`
- ✅ **Assertion functions**: `asserts value is string`
- ✅ **`satisfies` operator**: Para validación de tipos sin inferir
- ✅ **Const assertions**: Para inferencia más precisa

```typescript
// ✅ CORRECTO - Branded type
type UserId = Brand<string, 'UserId'>;
type PostId = Brand<string, 'PostId'>;

function getUser(id: UserId) { /* ... */ }
getUser(somePostId); // ❌ Error de tipo

// ✅ CORRECTO - satisfies
const routes = {
  home: '/',
  users: '/users',
} satisfies Record<string, string>;

// ✅ CORRECTO - Const assertion
const roles = ['STUDENT', 'HOST', 'ADMIN'] as const;
type Role = typeof roles[number];
```

#### Genéricos y Conditional Types
```typescript
// ✅ CORRECTO - Genérico con constraint
function merge<T extends object, U extends object>(obj1: T, obj2: U): T & U {
  return { ...obj1, ...obj2 };
}

// ✅ CORRECTO - Conditional type con infer
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

// ✅ CORRECTO - Mapped type con key remapping
type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K]
};
```

---

### UI/UX Profesional

#### Accesibilidad (CRÍTICO)
- ✅ **Contraste de color**: Mínimo 4.5:1 para texto normal
- ✅ **Focus states**: Focus rings visibles en elementos interactivos
- ✅ **Alt text**: Descriptivo para imágenes significativas
- ✅ **ARIA labels**: `aria-label` para botones solo con íconos
- ✅ **Navegación por teclado**: Orden de tab coincide con orden visual
- ✅ **Labels de forms**: Usar `<label for="id">`

#### Touch & Interacción (CRÍTICO)
- ✅ **Touch target size**: Mínimo 44x44px
- ✅ **Hover vs tap**: Usar click/tap para interacciones primarias
- ✅ **Loading buttons**: Deshabilitar durante operaciones asíncronas
- ✅ **Error feedback**: Mensajes claros cerca del problema
- ✅ **Cursor pointer**: Agregar a elementos clickeables

#### Reglas de UI Profesional
- ❌ **NO emojis**: Usar íconos SVG (Heroicons, Lucide, Simple Icons)
- ✅ **Hover states estables**: Transiciones de color/opacity, NO scale transforms
- ✅ **Logos de marca correctos**: SVG oficial desde Simple Icons
- ✅ **Tamaño de íconos consistente**: ViewBox fijo (24x24) con `w-6 h-6`
- ✅ **Contraste en light/dark mode**: Probado en ambos modos
- ✅ **Navbar flotante**: Agregar espaciado de bordes (`top-4 left-4 right-4`)

#### Checklist Pre-Entrega
- ✅ **Calidad Visual**: No emojis, íconos consistentes, logos correctos
- ✅ **Interacción**: Cursor pointer, feedback hover, transiciones suaves (150-300ms)
- ✅ **Light/Dark Mode**: Contraste probado, elementos glass visibles, bordes visibles
- ✅ **Layout**: Espaciado apropiado, sin contenido oculto, responsive en 375/768/1024/1440px
- ✅ **Accesibilidad**: Alt text, labels de forms, color NO es único indicador

---

## 🚀 Anti-Patrones a Evitar

### Next.js
- ❌ Componentes Cliente asíncronos
- ❌ Props no serializables a Client Components
- ❌ Waterfalls en fetching (usar `Promise.all()`)
- ❌ Envolver `redirect()`, `notFound()` en try-catch en Server Actions
- ❌ Usar `<img>` en vez de `next/image`
- ❌ Usar `<script>` en vez de `next/script`

### Node.js/Express
- ❌ Lógica de negocio en controllers
- ❌ Saltar validación de inputs
- ❌ Hardcodear secrets
- ❌ Usar métodos sync en producción
- ❌ No usar índices en FKs de PostgreSQL
- ❌ Bloquear event loop con trabajo CPU-intensive

### PostgreSQL
- ❌ `timestamp` sin timezone
- ❌ `varchar(n)` en vez de `text` con CHECK
- ❌ `money` en vez de `numeric`
- ❌ Olvidar índices en columnas FK
- ❌ UNIQUE permite múltiples NULLs (usar `NULLS NOT DISTINCT`)

### Prisma
- ❌ Implicit many-to-many (usar tablas join explícitas)
- ❌ Over-including relations
- ❌ Ignorar connection limits en serverless
- ❌ Usar `migrate dev` en producción
- ❌ Abuso de raw queries

### React Native
- ❌ ScrollView para listas largas (>10-20 items)
- ❌ Importar desde barrel files
- ❌ Mutar props o durante render (rompe React Compiler)
- ❌ Animaciones en JS thread (usar Reanimated)
- ❌ No medir TTI en cold starts

### TypeScript
- ❌ Usar `any` (usar `unknown`)
- ❌ Type assertions sin necesidad (usar type guards)
- ❌ No usar strict mode
- ❌ Tipos complejos sin documentación JSDoc

### Tailwind/UI
- ❌ Emojis como íconos
- ❌ Hover states con scale transforms
- ❌ Sin contraste en dark mode
- ❌ Touch targets < 44x44px
- ❌ Sin alt text o labels

---

## 📚 Recursos de Aprendizaje

### Documentación Oficial
- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [PostgreSQL Docs](https://postgresql.org/docs)
- [Prisma Docs](https://prisma.io/docs)
- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://typescriptlang.org/docs)

### Skills Locales
Todas las mejores prácticas detalladas están en `.agents/skills/`:
```bash
.agents/skills/
├── next-best-practices/          # 17 archivos
├── next-cache-components/         # 1 archivo
├── nodejs-backend-patterns/       # 1 archivo (1049 líneas)
├── nodejs-best-practices/         # 1 archivo
├── postgresql-table-design/       # 1 archivo
├── prisma-expert/                 # 1 archivo
├── react-native-best-practices/   # 24 archivos
├── tailwind-design-system/        # 1 archivo
├── typescript-advanced-types/     # 1 archivo
├── typescript-expert/             # 1 archivo
├── ui-ux-pro-max/                 # 1 archivo + data
└── vercel-react-best-practices/   # 58 archivos
```

---

## 🎯 Objetivos del Proyecto Vetice-bnb

### Sprint 0-2: Setup
- [ ] Monorepo (TurboRepo)
- [ ] PostgreSQL + PostGIS
- [ ] Express + TypeScript + ESLint + Prettier
- [ ] Next.js + Expo + Tailwind CSS
- [ ] Sistema de diseño "Vértice"

### Sprint 3-4: Autenticación
- [ ] Schema Prisma (User, StudentProfile, HostProfile)
- [ ] JWT (Access + Refresh tokens)
- [ ] UI Login/Registro
- [ ] Middleware por roles
- [ ] Upload de avatar (Cloudinary)

### Sprint 5-6: Propiedades
- [ ] Schema Property, PropertyImage
- [ ] CRUD endpoints
- [ ] Drag-and-drop images → Cloudinary
- [ ] Mapa para ubicación (Leaflet)
- [ ] Dashboard Anfitrión

### Sprint 7-8: Búsqueda
- [ ] PostGIS queries (`ST_DWithin`)
- [ ] API con filtros dinámicos
- [ ] UI Búsqueda Web (Mapa + Lista)
- [ ] UI Búsqueda Móvil
- [ ] Filtros dinámicos

### Sprint 9-10: Chat
- [ ] Socket.io setup
- [ ] Schema ChatRoom, Message
- [ ] Eventos en tiempo real
- [ ] UI Chat
- [ ] Firebase FCM

### Sprint 11-12: Reservas
- [ ] Cron job tasa BCV
- [ ] Schema Booking, Payment, ExchangeRate
- [ ] Flujo Reserva
- [ ] UI Checkout (USD + Bs)
- [ ] Comprobante Pago Móvil

### Sprint 13-14: Admin/KYC
- [ ] Schema KYCDocument
- [ ] Upload constancia
- [ ] Dashboard Admin
- [ ] Moderación

### Sprint 15-16: Deploy
- [ ] Tests E2E
- [ ] Optimización (Next/Image, lazy loading)
- [ ] Deploy (Vercel, Render, Expo EAS)
- [ ] Documentación UML

---

## 💾 Modelo de Base de Datos (Schema Prisma)

### Tablas Principales

#### User
```prisma
model User {
  id         String    @id @default(uuid())
  email      String    @unique
  password   String
  role       Role      @default(STUDENT)
  isVerified Boolean   @default(false)
  kycStatus  KycStatus @default(NONE)
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
  
  studentProfile StudentProfile?
  hostProfile    HostProfile?
  properties     Property[]
  bookings       Booking[]
  sentMessages   Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  kycDocuments   KYCDocument[]
}

enum Role {
  STUDENT
  HOST
  ADMIN
}

enum KycStatus {
  PENDING
  APPROVED
  REJECTED
  NONE
}
```

#### Property
```prisma
model Property {
  id             String   @id @default(uuid())
  hostId         String   @map("host_id")
  title          String
  description    String
  priceUsd       Decimal  @db.Decimal(10, 2)
  location       Unsupported("geography(Point, 4326)")
  address        String
  type           PropertyType
  gender         Gender
  rules          Json
  services       Json
  paymentMethods Json
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  
  host   Host    @relation(fields: [hostId], references: [id], onDelete: Cascade)
  images PropertyImage[]
  bookings Booking[]
  
  @@index([hostId])
  @@index([isActive])
  @@index([type])
  @@map("property")
}

enum PropertyType {
  ROOM
  APARTMENT
  HOUSE
}

enum Gender {
  MIXED
  FEMALE_ONLY
  MALE_ONLY
}
```

#### Booking
```prisma
model Booking {
  id            String   @id @default(uuid())
  propertyId    String   @map("property_id")
  studentId     String   @map("student_id")
  startDate     DateTime
  endDate       DateTime
  totalPriceUsd Decimal  @db.Decimal(10, 2)
  rateApplied   Decimal  @db.Decimal(10, 2)
  status        BookingStatus
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  property Property @relation(fields: [propertyId], references: [id])
  student  User    @relation(fields: [studentId], references: [id])
  
  @@index([propertyId])
  @@index([studentId])
  @@index([status])
  @@map("booking")
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELED
  COMPLETED
}
```

#### Message (Chat)
```prisma
model Message {
  id         String   @id @default(uuid())
  senderId   String   @map("sender_id")
  receiverId String   @map("receiver_id")
  propertyId String?  @map("property_id")
  content    String
  readAt     DateTime?
  createdAt  DateTime @default(now())
  
  sender   User   @relation("SentMessages", fields: [senderId], references: [id])
  receiver User   @relation("ReceivedMessages", fields: [receiverId], references: [id])
  property Property? @relation(fields: [propertyId], references: [id])
  
  @@index([senderId])
  @@index([receiverId])
  @@index([createdAt])
  @@map("message")
}
```

#### ExchangeRate
```prisma
model ExchangeRate {
  id       Int      @id @default(autoincrement())
  currency String   @default("VES")
  rate     Decimal  @db.Decimal(10, 4)
  date     DateTime @default(now())
  
  @@index([date])
  @@map("exchange_rate")
}
```

#### KYCDocument
```prisma
model KYCDocument {
  id        String    @id @default(uuid())
  userId    String
  type      KycType
  fileUrl   String
  status    KycStatus @default(PENDING)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
  @@map("kyc_document")
}

enum KycType {
  STUDENT_ID
  ENROLLMENT_CERT
  ID_CARD
}
```

---

## 🔍 Lógica del Buscador (API Endpoint)

### Endpoint: `GET /api/properties/search`

**Query Parameters:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `latitude` | number | Latitud del usuario |
| `longitude` | number | Longitud del usuario |
| `radiusKm` | number | Radio de búsqueda en km (default: 5) |
| `minPrice` | number | Precio mínimo en USD |
| `maxPrice` | number | Precio máximo en USD |
| `type` | enum | ROOM, APARTMENT, HOUSE |
| `gender` | enum | MIXED, FEMALE_ONLY, MALE_ONLY |
| `amenities` | string[] | ['wifi', 'ac', 'parking', 'laundry'] |
| `paymentMethods` | string[] | ['pagoMovil', 'zelle', 'cashUsd'] |

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "count": 15,
  "data": [
    {
      "id": "uuid",
      "title": "Apartamento moderno en Altamira",
      "priceUsd": 450,
      "location": { "lat": 10.496, "lng": -66.859 },
      "type": "APARTMENT",
      "gender": "MIXED",
      "services": { "wifi": true, "ac": true, "parking": false },
      "images": [{ "url": "https://...", "order": 0 }],
      "host": { "id": "uuid", "name": "Juan Pérez", "isVerified": true }
    }
  ]
}
```

**Código del Controlador:**
```typescript
export const searchProperties = async (req: Request, res: Response) => {
  try {
    const filters: SearchFilters = req.query;
    const { 
      latitude, 
      longitude, 
      radiusKm = 5,
      minPrice, 
      maxPrice, 
      type, 
      gender, 
      amenities 
    } = filters;

    // 1. Construir cláusula WHERE dinámica
    const whereClause: any = { isActive: true };
    
    if (type) whereClause.type = type;
    if (gender) whereClause.gender = gender;
    
    if (minPrice || maxPrice) {
      whereClause.priceUsd = {};
      if (minPrice) whereClause.priceUsd.gte = Number(minPrice);
      if (maxPrice) whereClause.priceUsd.lte = Number(maxPrice);
    }

    // 2. Consulta geoespacial con PostGIS
    let propertyIds: string[] = [];
    if (latitude && longitude) {
      const result: any[] = await prisma.$queryRaw`
        SELECT id FROM "Property"
        WHERE ST_DWithin(
          location::geography,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusKm * 1000}
        )
      `;
      propertyIds = result.map(row => row.id);
      
      if (propertyIds.length === 0) {
        return res.json({ success: true, count: 0, data: [] });
      }
      whereClause.id = { in: propertyIds };
    }

    // 3. Obtener datos completos con relaciones
    const properties = await prisma.property.findMany({
      where: whereClause,
      include: {
        images: true,
        host: { select: { id: true, name: true, avatar: true, isVerified: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error) {
    console.error('Search Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
```

---

## 📐 Recomendaciones UML para Tesis

Para una tesis de ingeniería estricta, incluya:

1. **Diagrama de Casos de Uso:** Visión funcional de alto nivel (Actores: Estudiante, Anfitrión, Admin)
2. **Diagrama Entidad-Relación (DER):** Notación Crow's Foot detallada de la base de datos
3. **Diagrama de Componentes:** Muestra la estructura modular (Módulo Auth, Módulo Búsqueda, Módulo Notificación)
4. **Diagrama de Secuencia (Crítico):**
   - **"Flujo de Reserva":** Interacción detallada entre Estudiante, API, Base de Datos y Notificación al Anfitrión
   - **"Algoritmo de Búsqueda":** Flujo lógico de filtrado y consulta geoespacial
5. **Diagrama de Despliegue:** Mapeo de artefactos de software a nodos de hardware/nube

---

<div align="center">

**Vértice** — Plataforma de Búsqueda de Alojamiento Estudiantil

*QWEN.md v2.0 — Configuración Principal Unificada — Febrero 2026*

</div>
