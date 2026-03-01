'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, CardHeader, CardTitle, CardContent } from '@vetice/ui';

interface User {
  id: string;
  email: string;
  role: 'STUDENT' | 'HOST' | 'ADMIN';
  profile?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Obtener usuario del localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-vertice-primary">Vértice</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Bienvenida */}
          <div>
            <h2 className="text-3xl font-bold">
              Hola, {user?.profile?.firstName || user?.email} 👋
            </h2>
            <p className="text-muted-foreground mt-1">
              Bienvenido a tu panel de control
            </p>
          </div>

          {/* Tarjeta de información del usuario */}
          <Card>
            <CardHeader>
              <CardTitle>Información de la Cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rol</p>
                  <p className="font-medium">
                    {user?.role === 'STUDENT' ? 'Estudiante' : 
                     user?.role === 'HOST' ? 'Anfitrión' : 'Administrador'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">
                    {user?.profile?.firstName} {user?.profile?.lastName}
                  </p>
                </div>
                {user?.role === 'STUDENT' && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Universidad</p>
                      <p className="font-medium">
                        {(user.profile as any)?.university || 'No especificada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Carrera</p>
                      <p className="font-medium">
                        {(user.profile as any)?.major || 'No especificada'}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acciones rápidas según el rol */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {user?.role === 'STUDENT' && (
              <>
                <Link href="/search">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">🔍 Buscar Propiedades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Encuentra alojamiento cerca de tu universidad
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/dashboard/chat">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">💬 Mis Mensajes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Revisa tus conversaciones con anfitriones
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/dashboard/bookings">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">📅 Mis Reservas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Gestiona tus reservas activas
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/dashboard/kyc">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">📄 Verificación KYC</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Sube tus documentos de verificación
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </>
            )}

            {user?.role === 'HOST' && (
              <>
                <Link href="/dashboard/properties">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">🏠 Mis Propiedades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Gestiona tus propiedades publicadas
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/dashboard/chat">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">💬 Mensajes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Responde a los estudiantes
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/dashboard/bookings">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">📋 Reservas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Revisa las solicitudes de reserva
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/dashboard/kyc">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <CardTitle className="text-lg">📄 Verificación KYC</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Verifica tu cuenta de anfitrión
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </>
            )}
          </div>

          {/* Estado del proyecto */}
          <Card>
            <CardHeader>
              <CardTitle>🚀 Estado del Proyecto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Fase 1: Fundamentos - Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Fase 2: Autenticación - Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Fase 3: Propiedades - Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Fase 4: Búsqueda - Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Fase 5: Chat - Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Fase 6: Reservas - Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✅</span>
                  <span>Fase 7: Admin/KYC - Completada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">⏳</span>
                  <span>Fase 8: Deploy - Pendiente</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enlace a Admin (solo para ADMIN) */}
          {user?.role === 'ADMIN' && (
            <Card className="border-2 border-vertice-primary">
              <CardHeader>
                <CardTitle>👨‍💼 Panel de Administrador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Link href="/dashboard/admin/kyc">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-lg">📄 KYC</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Revisar documentos de verificación
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="text-lg">👥 Usuarios</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Gestionar usuarios y roles
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
