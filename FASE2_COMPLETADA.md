# ✅ FASE 2: AUTENTICACIÓN - COMPLETADA

> **Estado:** ✅ Completada exitosamente  
> **Fecha:** Febrero 2026  
> **Duración estimada:** 2 semanas

---

## 📦 Entregables de la Fase 2

### 1. Autenticación JWT ✅

**Archivos creados:**
- `apps/api/src/utils/jwt.ts` - Generación y verificación de tokens
- `apps/api/src/utils/errors.ts` - Errores personalizados (AppError, ValidationError, etc.)

**Características:**
- ✅ Access Token (15 minutos de expiración)
- ✅ Refresh Token (7 días de expiración)
- ✅ JWT con payload: userId, email, role
- ✅ Funciones: `generateTokens()`, `verifyAccessToken()`, `verifyRefreshToken()`

**Configuración:**
```env
JWT_ACCESS_SECRET="tu-secret-access-token"
JWT_REFRESH_SECRET="tu-secret-refresh-token"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
```

---

### 2. Endpoints de Autenticación ✅

**Archivos creados:**
- `apps/api/src/validators/auth.validator.ts` - Validación con Zod
- `apps/api/src/repositories/auth.repository.ts` - Acceso a datos
- `apps/api/src/services/auth.service.ts` - Lógica de negocio
- `apps/api/src/controllers/auth.controller.ts` - Manejo de peticiones
- `apps/api/src/routes/auth.routes.ts` - Definición de rutas

**Endpoints:**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar usuario | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/refresh` | Refresh token | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/me` | Obtener perfil | ✅ |
| PATCH | `/api/auth/me` | Actualizar perfil | ✅ |

**Schema de Registro:**
```typescript
{
  email: string (email válido),
  password: string (min 8, 1 mayúscula, 1 minúscula, 1 número),
  role: 'STUDENT' | 'HOST',
  firstName: string (min 2),
  lastName: string (min 2),
  phone?: string,
  university?: string (requerido para STUDENT),
  major?: string (requerido para STUDENT),
}
```

**Respuesta de Login/Registro:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "STUDENT",
      "profile": {
        "firstName": "Juan",
        "lastName": "Pérez",
        "avatar": "https://..."
      }
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

---

### 3. Middleware de Autenticación y Roles ✅

**Archivos creados:**
- `apps/api/src/middleware/auth.middleware.ts` - Middleware de autenticación

**Middlewares disponibles:**

```typescript
// Autenticar usuario (cualquier rol)
authenticate(req, res, next)

// Autorizar por roles específicos
authorize('STUDENT', 'HOST')

// Combinado: autentica y autoriza
requireAuth('STUDENT')  // Solo estudiantes
requireAuth('HOST')     // Solo anfitriones
requireAuth('ADMIN')    // Solo administradores
requireAuth()           // Cualquier usuario autenticado

// Autenticación opcional (no falla si no hay token)
optionalAuth(req, res, next)
```

**Ejemplo de uso en rutas:**
```typescript
// Ruta protegida para cualquier usuario autenticado
router.get('/me', authenticate, authController.getProfile);

// Ruta solo para anfitriones
router.post('/properties', requireAuth('HOST'), propertyController.create);

// Ruta solo para administradores
router.get('/admin/users', requireAuth('ADMIN'), userController.getAll);
```

---

### 4. UI de Login y Registro (Web) ✅

**Archivos creados:**
- `apps/web/src/app/(auth)/layout.tsx` - Layout de autenticación
- `apps/web/src/app/(auth)/login/page.tsx` - Página de login
- `apps/web/src/app/(auth)/register/page.tsx` - Página de registro
- `apps/web/src/app/dashboard/page.tsx` - Dashboard protegido
- `apps/web/src/middleware.ts` - Middleware de rutas

**Características Web:**
- ✅ Formulario de login con email y contraseña
- ✅ Formulario de registro con selector de rol (Estudiante/Anfitrión)
- ✅ Validación de contraseñas (coincidencia, longitud)
- ✅ Campos condicionales según el rol
- ✅ Manejo de errores con Alert component
- ✅ Loading states durante las peticiones
- ✅ Redirección automática tras login/registro exitoso
- ✅ Middleware para proteger rutas

**Componentes UI utilizados:**
- Button, Input, Label, Card, Select, Alert
- Todos con variantes y estilos consistentes

**Dashboard Web:**
- ✅ Muestra información del usuario
- ✅ Acciones rápidas según el rol
- ✅ Botón de logout
- ✅ Estado del proyecto

---

### 5. UI de Login y Registro (Móvil) ✅

**Archivos creados:**
- `apps/mobile/src/app/(auth)/login.tsx` - Pantalla de login
- `apps/mobile/src/app/(auth)/register.tsx` - Pantalla de registro
- `apps/mobile/package.json` - Actualizado con AsyncStorage

**Características Móvil:**
- ✅ UI nativa con React Native
- ✅ Selector de rol (Estudiante/Anfitrión) con botones
- ✅ Formulario con validaciones
- ✅ ScrollView para campos múltiples
- ✅ Loading states con ActivityIndicator
- ✅ Alertas nativas con Alert.alert()
- ✅ AsyncStorage para guardar tokens
- ✅ Navegación con expo-router

**Dependencias agregadas:**
```json
{
  "@react-native-async-storage/async-storage": "^1.23.0"
}
```

---

### 6. Upload de Avatares a Cloudinary ✅

**Archivos creados:**
- `apps/api/src/services/cloudinary.service.ts` - Servicio de Cloudinary
- `apps/api/src/controllers/upload.controller.ts` - Controlador de upload
- `apps/api/src/routes/upload.routes.ts` - Rutas de upload

**Endpoints de Upload:**

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload/avatar` | Subir avatar | ✅ |
| POST | `/api/upload/property` | Subir imagen de propiedad | ✅ |
| POST | `/api/upload/multiple` | Subir múltiples imágenes | ✅ |
| DELETE | `/api/upload/:publicId` | Eliminar imagen | ✅ |

**Características:**
- ✅ Upload con multer (memoria/buffer)
- ✅ Límite de 5MB por archivo
- ✅ Solo imágenes (validación de mimetype)
- ✅ Transformaciones automáticas:
  - Avatar: 400x400 crop, optimización automática
  - Propiedades: 1200x800 max, calidad automática
- ✅ Múltiples uploads simultáneos
- ✅ Eliminación de imágenes por publicId

**Configuración requerida:**
```env
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="tu-api-key"
CLOUDINARY_API_SECRET="tu-api-secret"
```

**Ejemplo de uso (frontend):**
```typescript
const uploadAvatar = async (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);

  const response = await fetch('/api/upload/avatar', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const data = await response.json();
  return data.data.url; // URL del avatar en Cloudinary
};
```

---

### 7. Protección de Rutas ✅

**Backend:**
- ✅ Middleware `authenticate` en rutas que lo requieren
- ✅ Middleware `authorize` para roles específicos
- ✅ Errores 401 Unauthorized y 403 Forbidden

**Frontend Web:**
- ✅ Middleware de Next.js para proteger rutas
- ✅ Redirección automática a /login
- ✅ Parámetro `from` para redirigir después del login
- ✅ Verificación de token en localStorage

**Frontend Móvil:**
- ✅ AsyncStorage para persistencia de tokens
- ✅ Redirección después de login/logout
- ✅ Verificación de autenticación en navegación

---

## 📊 Resumen de Archivos Creados

| Categoría | Archivos | Líneas aprox. |
|-----------|----------|---------------|
| **Backend Auth** | 6 | ~600 |
| **Backend Upload** | 3 | ~250 |
| **UI Web Auth** | 4 | ~400 |
| **UI Mobile Auth** | 2 | ~350 |
| **Utilidades** | 2 | ~150 |
| **Config** | 3 | ~100 |
| **TOTAL** | **20** | **~1850** |

---

## 🚀 Comandos para Probar la Autenticación

### 1. Iniciar el backend

```bash
cd apps/api
npm run dev
```

### 2. Probar endpoints con curl

**Registro:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123",
    "role": "STUDENT",
    "firstName": "Juan",
    "lastName": "Pérez",
    "university": "UCV",
    "major": "Sistemas"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123"
  }'
```

**Obtener perfil:**
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer REDACTED"
```

### 3. Iniciar frontend web

```bash
cd apps/web
npm run dev
```

Visita http://localhost:3000/login

### 4. Iniciar app móvil

```bash
cd apps/mobile
npm run dev
```

Escanea el QR con Expo Go

---

## 🔐 Flujo de Autenticación Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUJO DE AUTENTICACIÓN                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  1. REGISTRO                                                                │
│     Usuario → POST /api/auth/register → Backend                             │
│     Backend → Crear user + hash password → Generar tokens                   │
│     Backend → Response con tokens + user → Usuario                          │
│     Usuario → Guardar tokens en localStorage/AsyncStorage                   │
│                                                                             │
│  2. LOGIN                                                                   │
│     Usuario → POST /api/auth/login → Backend                                │
│     Backend → Buscar user + verificar password → Generar tokens             │
│     Backend → Response con tokens + user → Usuario                          │
│     Usuario → Guardar tokens → Redirigir a dashboard                        │
│                                                                             │
│  3. ACCESO A RUTAS PROTEGIDAS                                               │
│     Usuario → GET /dashboard → Middleware                                   │
│     Middleware → Verificar token en header                                  │
│     Middleware → verifyAccessToken() → Adjuntar user a req                  │
│     Middleware → next() → Controller → Response                             │
│                                                                             │
│  4. REFRESH TOKEN                                                           │
│     Token expira → 401 Unauthorized                                         │
│     Frontend → POST /api/auth/refresh con refreshToken                      │
│     Backend → Verificar refreshToken → Generar nuevos tokens                │
│     Backend → Response con nuevos tokens → Frontend                         │
│     Frontend → Actualizar tokens almacenados → Reintentar petición          │
│                                                                             │
│  5. LOGOUT                                                                  │
│     Usuario → Click en logout → Frontend                                    │
│     Frontend → POST /api/auth/logout (opcional)                             │
│     Frontend → Eliminar tokens de localStorage                              │
│     Frontend → Redirigir a /login                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✅ Checklist de Verificación

| Funcionalidad | Web | Móvil | Backend |
|---------------|-----|-------|---------|
| Registro | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Logout | ✅ | ✅ | ✅ |
| Refresh Token | ✅ | ✅ | ✅ |
| Perfil de usuario | ✅ | ✅ | ✅ |
| Upload de avatar | ⏳ | ⏳ | ✅ |
| Rutas protegidas | ✅ | ✅ | ✅ |
| Roles (STUDENT/HOST) | ✅ | ✅ | ✅ |

---

## 🎯 Próxima Fase: Propiedades (Fase 3)

**Tareas pendientes:**
- [ ] Schema Property, PropertyImage (ya creado en Prisma)
- [ ] CRUD endpoints de propiedades
- [ ] Drag-and-drop images → Cloudinary
- [ ] Mapa para ubicación (Leaflet / React Native Maps)
- [ ] Dashboard Anfitrión

**Duración estimada:** 2 semanas (Sprints 5-6)

---

<div align="center">

**✨ FASE 2: AUTENTICACIÓN - COMPLETADA EXITOSAMENTE ✨**

*Listo para comenzar la Fase 3: Propiedades*

**Vértice** — Plataforma de Alojamiento Estudiantil

</div>
