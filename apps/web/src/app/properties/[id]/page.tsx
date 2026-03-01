'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, CardContent, Badge, Spinner } from '@vetice/ui';
import { PropertyReviews } from '@/components/property-reviews';

interface Property {
  id: string;
  title: string;
  description: string;
  priceUsd: number;
  address: string;
  city?: string;
  state?: string;
  country: string;
  type: string;
  gender: string;
  services?: Record<string, boolean>;
  paymentMethods?: string[];
  rules?: Record<string, boolean>;
  images: { url: string; caption?: string }[];
  host: {
    firstName: string;
    lastName: string;
    avatar?: string;
    isVerified: boolean;
    phone?: string;
  };
  location?: {
    coordinates: [number, number];
  };
  createdAt: string;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = React.useState<Property | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedImage, setSelectedImage] = React.useState(0);

  React.useEffect(() => {
    const loadProperty = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/properties/${params.id}`
        );
        const data = await response.json();

        if (data.success) {
          setProperty(data.data);
        }
      } catch (error) {
        console.error('Error loading property:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      loadProperty();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Propiedad no encontrada</h1>
          <Button onClick={() => router.push('/search')}>
            Volver a la búsqueda
          </Button>
        </div>
      </div>
    );
  }

  const SERVICE_LABELS: Record<string, string> = {
    wifi: '📶 WiFi',
    ac: '❄️ Aire Acondicionado',
    parking: '🚗 Estacionamiento',
    laundry: '🧺 Lavandería',
    kitchen: '🍳 Cocina',
    gym: '💪 Gimnasio',
    pool: '🏊 Piscina',
    security: '👮 Seguridad',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.back()}>
            ← Volver
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline">Compartir</Button>
            <Button>Reservar</Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Galería de Imágenes */}
        <div className="space-y-4">
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={property.images[selectedImage]?.url || '/placeholder.jpg'}
              alt={property.images[selectedImage]?.caption || property.title}
              className="w-full h-full object-cover"
            />
          </div>
          {property.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {property.images.map((image, index) => (
                <button
                  key={image.url}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? 'border-vertice-primary'
                      : 'border-transparent hover:border-vertice-primary/50'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.caption || `Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información Principal */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Columna Izquierda - Detalles */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold">{property.title}</h1>
                  <p className="text-muted-foreground mt-1">
                    {property.address}
                    {property.city && `, ${property.city}`}
                    {property.state && `, ${property.state}`}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-vertice-primary">
                    ${property.priceUsd}
                  </div>
                  <div className="text-sm text-muted-foreground">/mes</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mt-4">
                <Badge>{property.type}</Badge>
                <Badge>{property.gender}</Badge>
                {property.host?.isVerified && (
                  <Badge variant="default">Anfitrión Verificado</Badge>
                )}
              </div>
            </div>

            {/* Descripción */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-semibold">Descripción</h2>
                <p className="text-foreground whitespace-pre-line">
                  {property.description}
                </p>
              </CardContent>
            </Card>

            {/* Servicios */}
            {property.services && Object.keys(property.services).length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Servicios</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(property.services)
                      .filter(([_, enabled]) => enabled)
                      .map(([service, _]) => (
                        <div
                          key={service}
                          className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
                        >
                          <span>{SERVICE_LABELS[service] || service}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Métodos de Pago */}
            {property.paymentMethods && property.paymentMethods.length > 0 && (
              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold">Métodos de Pago</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.paymentMethods.map((method) => (
                      <Badge key={method} variant="outline">
                        {method === 'pagoMovil' && 'Pago Móvil'}
                        {method === 'cashUsd' && 'Efectivo USD'}
                        {method === 'zelle' && 'Zelle'}
                        {method === 'bankTransfer' && 'Transferencia'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reseñas */}
            <div className="space-y-4 pt-6">
              <h2 className="text-2xl font-bold">Reseñas y Calificaciones</h2>
              <PropertyReviews propertyId={property.id} />
            </div>
          </div>

          {/* Columna Derecha - Tarjeta de Reserva */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-4">
                {/* Anfitrión */}
                <div className="flex items-center gap-3 pb-4 border-b">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                    {property.host?.firstName?.[0]}
                    {property.host?.lastName?.[0]}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {property.host?.firstName} {property.host?.lastName}
                    </div>
                    {property.host?.isVerified && (
                      <div className="text-sm text-green-600">✓ Verificado</div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-2">
                  <Button className="w-full" size="lg">
                    Solicitar Reserva
                  </Button>
                  <Button variant="outline" className="w-full">
                    Contactar Anfitrión
                  </Button>
                </div>

                {/* Información adicional */}
                <div className="pt-4 border-t space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio mensual</span>
                    <span className="font-medium">${property.priceUsd}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo</span>
                    <span className="font-medium">{property.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Género</span>
                    <span className="font-medium">
                      {property.gender === 'MIXED' && 'Mixto'}
                      {property.gender === 'FEMALE_ONLY' && 'Solo Mujeres'}
                      {property.gender === 'MALE_ONLY' && 'Solo Hombres'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
