'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@vetice/ui';

interface Property {
  id: string;
  title: string;
  priceUsd: number;
  type: string;
  gender: string;
  address: string;
  isActive: boolean;
  createdAt: string;
  images: { url: string }[];
}

export default function PropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ total: 0, active: 0, inactive: 0 });

  React.useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const [propertiesRes, statsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/my-properties`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/properties/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const propertiesData = await propertiesRes.json();
      const statsData = await statsRes.json();

      if (propertiesData.success) {
        setProperties(propertiesData.data);
      }

      if (statsData.success) {
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (propertyId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}/toggle-status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        loadProperties();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleDelete = async (propertyId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta propiedad?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${propertyId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        loadProperties();
      }
    } catch (error) {
      console.error('Error deleting property:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Cargando propiedades...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mis Propiedades</h1>
          <p className="text-muted-foreground mt-1">
            Gestiona tus propiedades publicadas
          </p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>
            + Nueva Propiedad
          </Button>
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Propiedades registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Visibles en búsquedas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.inactive}</div>
            <p className="text-xs text-muted-foreground">Ocultas temporalmente</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de propiedades */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-lg font-semibold mb-2">No tienes propiedades</h3>
            <p className="text-muted-foreground mb-4">
              Comienza publicando tu primera propiedad
            </p>
            <Link href="/dashboard/properties/new">
              <Button>Crear Primera Propiedad</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {property.images.length > 0 && property.images[0] ? (
                  <img
                    src={property.images[0]!.url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    Sin imágenes
                  </div>
                )}
                <Badge
                  className="absolute top-2 right-2"
                  variant={property.isActive ? 'default' : 'secondary'}
                >
                  {property.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{property.title}</h3>
                      <p className="text-sm text-muted-foreground">{property.address}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-vertice-primary">
                        ${property.priceUsd}
                      </div>
                      <div className="text-xs text-muted-foreground">/mes</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline">{property.type}</Badge>
                    <Badge variant="outline">{property.gender}</Badge>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(property.id, property.isActive)}
                    >
                      {property.isActive ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(property.id)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
