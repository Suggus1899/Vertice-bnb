# 🚀 Guía de Inicio Rápido - Vetice-bnb

## Prerrequisitos

- Node.js 20+
- Docker Desktop (para PostgreSQL + PostGIS)
- npm 10+

## 1️⃣ Iniciar Base de Datos

```bash
cd packages/database
docker compose up -d
```

Espera a que el contenedor esté saludable (aproximadamente 30 segundos).

## 2️⃣ Instalar Dependencias

Desde la raíz del proyecto:

```bash
npm install
```

## 3️⃣ Generar Prisma Client

```bash
cd packages/database
npm run db:generate
```

## 4️⃣ Ejecutar Migraciones

```bash
cd packages/database
npm run db:migrate
```

## 5️⃣ Iniciar Servidores de Desarrollo

Desde la raíz del proyecto:

```bash
npm run dev
```

Esto iniciará:
- **API Backend**: http://localhost:3001
- **Frontend Web**: http://localhost:3000
- **Móvil (Expo)**: Sigue las instrucciones en consola

## 📁 Estructura del Proyecto

```
vetice-bnb/
├── apps/
│   ├── api/          # Express.js Backend
│   ├── web/          # Next.js 16 Frontend
│   └── mobile/       # React Native (Expo)
├── packages/
│   ├── database/     # Prisma Schema + DB
│   ├── ui/           # Componentes compartidos
│   ├── types/        # Tipos TypeScript
│   └── config/       # Configs compartidas
├── package.json
├── turbo.json
└── QWEN.md
```

## 🛠️ Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia todos los servicios |
| `npm run build` | Construye todos los paquetes |
| `npm run lint` | Ejecuta linting |
| `npm run typecheck` | Verifica tipos TypeScript |
| `npm run clean` | Limpia build outputs |

## 🗄️ Comandos de Base de Datos

```bash
cd packages/database

# Ver logs de Docker
docker compose logs -f

# Detener base de datos
docker compose down

# Resetear base de datos
npm run db:migrate:reset

# Abrir Prisma Studio
npm run db:studio
```

## 📱 Ejecutar App Móvil

```bash
cd apps/mobile
npm run dev
```

Escanea el código QR con:
- **Android**: Expo Go app
- **iOS**: Cámara nativa o Expo Go

## ✅ Verificar Instalación

1. **API**: Visita http://localhost:3001/health → Debería mostrar `{"status": "ok"}`
2. **Web**: Visita http://localhost:3000 → Debería mostrar la página de bienvenida
3. **Database**: Ejecuta `npm run db:studio` → Debería abrir Prisma Studio

## 🐛 Solución de Problemas

### Error: "Cannot find module '@vetice/database'"

```bash
npm run db:generate
```

### Error: "Database connection failed"

Verifica que Docker esté corriendo:
```bash
docker ps
```

### Error: "Port already in use"

Cambia los puertos en los archivos `.env`:
- API: `PORT=3001` en `apps/api/.env`
- Web: Usa `PORT=3000` en `apps/web/package.json` scripts

## 📖 Documentación Completa

- [QWEN.md](./QWEN.md) - Configuración principal y mejores prácticas
- [Skills](./.agents/skills/) - Guías detalladas por tecnología

---

**Vértice** — Plataforma de Alojamiento Estudiantil
