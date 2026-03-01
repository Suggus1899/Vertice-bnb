# Vetice-bnb (Vértice)

> Plataforma de búsqueda de alojamiento estudiantil con geolocalización, chat en tiempo real y sistema de reservas.

## 📦 Estructura del Monorepo

```
vetice-bnb/
├── apps/
│   ├── web/              # Next.js 16 (Frontend Web)
│   ├── mobile/           # React Native (Expo SDK 52+)
│   └── api/              # Express.js (Backend API)
├── packages/
│   ├── database/         # Prisma Schema + Database client
│   ├── ui/               # Componentes compartidos (Sistema de diseño)
│   ├── config/           # Configuraciones compartidas (TS, ESLint, etc.)
│   └── types/            # Tipos TypeScript compartidos
└── package.json
```

## 🚀 Quick Start

### Prerrequisitos

- Node.js 20+
- PostgreSQL 15+ con PostGIS
- npm 10+

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar todos los servicios en desarrollo
npm run dev
```

### Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia todos los servicios en desarrollo |
| `npm run build` | Construye todos los paquetes |
| `npm run lint` | Ejecuta linting en todos los paquetes |
| `npm run typecheck` | Verifica tipos TypeScript |
| `npm run clean` | Limpia build outputs y node_modules |

## 📋 Servicios

### Web (Next.js 16)
- **Puerto:** 3000
- **URL:** http://localhost:3000

### API (Express)
- **Puerto:** 3001
- **URL:** http://localhost:3001

### Mobile (Expo)
- **Puerto:** 8081 (Metro bundler)
- **Comando:** `npm run dev --filter=mobile`

## 🗄️ Base de Datos

```bash
# Iniciar PostgreSQL con Docker (opcional)
cd packages/database
docker compose up -d

# Ejecutar migraciones
npm run db:migrate

# Generar Prisma Client
npm run db:generate
```

## 📖 Documentación

- [QWEN.md](./QWEN.md) - Configuración principal del proyecto
- [Skills](./.agents/skills/) - Mejores prácticas por tecnología

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
|------|-------------|
| **Frontend Web** | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| **Backend** | Express.js, Prisma, Socket.io, JWT |
| **Móvil** | React Native (Expo SDK 52+), Reanimated |
| **Base de Datos** | PostgreSQL 15+, PostGIS, Prisma ORM |
| **Infraestructura** | Docker, Vercel (Web), Render (API) |

## 📄 Licencia

MIT
