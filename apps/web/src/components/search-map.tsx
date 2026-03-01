'use client';

import * as React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Button } from '@vetice/ui';

// Fix para iconos de Leaflet - solo se ejecuta en el cliente
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Property {
  id: string;
  title: string;
  priceUsd: number;
  address: string;
  location?: {
    coordinates: [number, number];
  };
}

interface SearchMapProps {
  properties: Property[];
  mapCenter: [number, number];
  selectedProperty: string | null;
  onSelectProperty: (id: string) => void;
}

export default function SearchMap({
  properties,
  mapCenter,
  selectedProperty,
  onSelectProperty,
}: SearchMapProps) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Markers de propiedades */}
      {properties.map((property) => {
        if (!property.location) return null;
        const coords: [number, number] = [
          property.location.coordinates[1],
          property.location.coordinates[0],
        ];
        
        return (
          <Marker
            key={property.id}
            position={coords}
            eventHandlers={{
              click: () => onSelectProperty(property.id),
            }}
          >
            <Popup>
              <div className="w-48">
                <h4 className="font-semibold mb-1">{property.title}</h4>
                <p className="text-sm text-vertice-primary font-bold mb-1">
                  ${property.priceUsd}/mes
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  {property.address}
                </p>
                <Button size="sm" className="w-full" asChild>
                  <a href={`/properties/${property.id}`}>Ver Detalles</a>
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
