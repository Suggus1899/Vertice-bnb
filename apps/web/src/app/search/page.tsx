'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import SearchFiltersPanel, { type SearchFilters } from '../../components/search-filters';
import { Button, Card, CardContent, Badge } from '@vetice/ui';
import { cn } from '@vetice/ui';

// Importar el mapa como un único componente dinámico
const SearchMap = dynamic(() => import('../../components/search-map'), { 
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Cargando mapa...</p>
    </div>
  )
});

interface Property {
  id: string;
  title: string;
  description: string;
  priceUsd: number;
  address: string;
  city?: string;
  type: string;
  gender: string;
  services?: Record<string, boolean>;
  images: { url: string }[];
  host: {
    firstName: string;
    lastName: string;
    isVerified: boolean;
  };
  location?: {
    coordinates: [number, number];
  };
  _count?: {
    reviews: number;
  };
}

export default function SearchPage() {
  const [properties, setProperties] = React.useState<Property[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'both' | 'list' | 'map'>('both');
  const [selectedProperty, setSelectedProperty] = React.useState<string | null>(null);
  const [mapCenter, setMapCenter] = React.useState<[number, number]>([10.4806, -66.9036]); // Caracas

  const [filters, setFilters] = React.useState<SearchFilters>({
    latitude: 10.4806,
    longitude: -66.9036,
    radiusKm: 5,
    minPrice: undefined,
    maxPrice: undefined,
    type: undefined,
    gender: undefined,
    amenities: [],
    paymentMethods: [],
  });

  // Obtener ubicación del usuario
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setMapCenter(newCenter);
          setFilters((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        () => {
          console.log('No se pudo obtener la ubicación');
        }
      );
    }
  }, []);

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.latitude) queryParams.set('latitude', filters.latitude.toString());
      if (filters.longitude) queryParams.set('longitude', filters.longitude.toString());
      queryParams.set('radiusKm', filters.radiusKm.toString());
      if (filters.minPrice) queryParams.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.set('maxPrice', filters.maxPrice.toString());
      if (filters.type) queryParams.set('type', filters.type);
      if (filters.gender) queryParams.set('gender', filters.gender);
      if (filters.startDate) queryParams.set('startDate', filters.startDate);
      if (filters.endDate) queryParams.set('endDate', filters.endDate);
      filters.amenities.forEach((a) => queryParams.append('amenities', a));
      filters.paymentMethods.forEach((m) => queryParams.append('paymentMethods', m));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/properties?${queryParams.toString()}`
      );

      const data = await response.json();

      if (data.success) {
        setProperties(data.data);
        
        // Si hay resultados, centrar el mapa en el primero
        if (data.data.length > 0 && data.data[0].location) {
          const coords = data.data[0].location.coordinates;
          setMapCenter([coords[1], coords[0]]); // [lat, lng]
        }
      }
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Búsqueda inicial
  React.useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo al montar

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Buscar Propiedades</h1>
              <p className="text-sm text-muted-foreground">
                {properties.length} propiedades encontradas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                📋 Lista
              </Button>
              <Button
                variant={viewMode === 'both' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('both')}
              >
                🗺️ Mapa + Lista
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('map')}
              >
                🗺️ Solo Mapa
              </Button>
            </div>
          </div>

          {/* Filtros */}
          <SearchFiltersPanel
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            isLoading={isLoading}
          />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div
          className={cn(
            'gap-6',
            viewMode === 'both' ? 'grid grid-cols-1 lg:grid-cols-2' : '',
            viewMode === 'list' ? '' : '',
            viewMode === 'map' ? '' : ''
          )}
        >
          {/* Lista de propiedades */}
          {(viewMode === 'both' || viewMode === 'list') && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p>Cargando propiedades...</p>
                </div>
              ) : properties.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold mb-2">
                      No se encontraron propiedades
                    </h3>
                    <p className="text-muted-foreground">
                      Intenta ajustar los filtros o ampliar el radio de búsqueda
                    </p>
                  </CardContent>
                </Card>
              ) : (
                properties.map((property) => (
                  <Card
                    key={property.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-lg',
                      selectedProperty === property.id && 'ring-2 ring-vertice-primary'
                    )}
                    onClick={() => setSelectedProperty(property.id)}
                  >
                    <div className="flex gap-4 p-4">
                      {/* Imagen */}
                      <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
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
                      </div>

                      {/* Información */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg truncate">
                              {property.title}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {property.address}
                            </p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-vertice-primary">
                              ${property.priceUsd}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              /mes
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline">{property.type}</Badge>
                          <Badge variant="outline">{property.gender}</Badge>
                          {property.services?.wifi && (
                            <Badge variant="outline" title="WiFi">📶</Badge>
                          )}
                          {property.services?.ac && (
                            <Badge variant="outline" title="Aire Acondicionado">❄️</Badge>
                          )}
                          {property.services?.parking && (
                            <Badge variant="outline" title="Estacionamiento">🚗</Badge>
                          )}
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs text-muted-foreground">
                            {property.host?.firstName} {property.host?.lastName}
                            {property.host?.isVerified && (
                              <span className="ml-1 text-green-600">✓</span>
                            )}
                          </div>
                          <Button size="sm" asChild>
                            <a href={`/properties/${property.id}`}>Ver Detalles</a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Mapa */}
          {(viewMode === 'both' || viewMode === 'map') && (
            <div className="h-[600px] lg:sticky lg:top-48 rounded-lg overflow-hidden border shadow-md">
              <SearchMap
                properties={properties}
                mapCenter={mapCenter}
                selectedProperty={selectedProperty}
                onSelectProperty={setSelectedProperty}
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
