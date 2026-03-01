'use client';

import * as React from 'react';
import { Button, Input, Label, Select, Card, CardContent } from '@vetice/ui';
import { cn } from '@vetice/ui';

export interface SearchFilters {
  latitude?: number;
  longitude?: number;
  radiusKm: number;
  minPrice?: number;
  maxPrice?: number;
  type?: 'ROOM' | 'APARTMENT' | 'HOUSE';
  gender?: 'MIXED' | 'FEMALE_ONLY' | 'MALE_ONLY';
  amenities: string[];
  paymentMethods: string[];
  startDate?: string;
  endDate?: string;
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  isLoading?: boolean;
}

const AMENITIES = [
  { id: 'wifi', label: '📶 WiFi', icon: 'wifi' },
  { id: 'ac', label: '❄️ Aire Acondicionado', icon: 'ac' },
  { id: 'parking', label: '🚗 Estacionamiento', icon: 'parking' },
  { id: 'laundry', label: '🧺 Lavandería', icon: 'laundry' },
  { id: 'kitchen', label: '🍳 Cocina', icon: 'kitchen' },
  { id: 'gym', label: '💪 Gimnasio', icon: 'gym' },
  { id: 'pool', label: '🏊 Piscina', icon: 'pool' },
  { id: 'security', label: '👮 Seguridad', icon: 'security' },
];

const PAYMENT_METHODS = [
  { id: 'pagoMovil', label: 'Pago Móvil' },
  { id: 'cashUsd', label: 'Efectivo USD' },
  { id: 'zelle', label: 'Zelle' },
  { id: 'bankTransfer', label: 'Transferencia' },
];

export default function SearchFiltersPanel({
  filters,
  onFiltersChange,
  onSearch,
  isLoading = false,
}: SearchFiltersProps) {
  const handleAmenityToggle = (amenityId: string) => {
    const newAmenities = filters.amenities.includes(amenityId)
      ? filters.amenities.filter((a) => a !== amenityId)
      : [...filters.amenities, amenityId];
    
    onFiltersChange({ ...filters, amenities: newAmenities });
  };

  const handlePaymentMethodToggle = (methodId: string) => {
    const newMethods = filters.paymentMethods.includes(methodId)
      ? filters.paymentMethods.filter((m) => m !== methodId)
      : [...filters.paymentMethods, methodId];
    
    onFiltersChange({ ...filters, paymentMethods: newMethods });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      latitude: undefined,
      longitude: undefined,
      radiusKm: 5,
      minPrice: undefined,
      maxPrice: undefined,
      type: undefined,
      gender: undefined,
       amenities: [],
      paymentMethods: [],
      startDate: undefined,
      endDate: undefined,
    });
  };

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4 space-y-4">
        {/* Filtros principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Precio Mínimo */}
          <div className="space-y-2">
            <Label htmlFor="minPrice">Precio Mínimo</Label>
            <Input
              id="minPrice"
              type="number"
              placeholder="$0"
              value={filters.minPrice || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  minPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>

          {/* Precio Máximo */}
          <div className="space-y-2">
            <Label htmlFor="maxPrice">Precio Máximo</Label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="$1000"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  maxPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
            />
          </div>

          {/* Tipo de Propiedad */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              id="type"
              value={filters.type || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  type: e.target.value as SearchFilters['type'] || undefined,
                })
              }
            >
              <option value="">Todos</option>
              <option value="ROOM">Habitación</option>
              <option value="APARTMENT">Apartamento</option>
              <option value="HOUSE">Casa</option>
            </Select>
          </div>

          {/* Género */}
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select
              id="gender"
              value={filters.gender || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  gender: e.target.value as SearchFilters['gender'] || undefined,
                })
              }
            >
              <option value="">Todos</option>
              <option value="MIXED">Mixto</option>
              <option value="FEMALE_ONLY">Solo Mujeres</option>
              <option value="MALE_ONLY">Solo Hombres</option>
            </Select>
          </div>

          {/* Radio de Búsqueda */}
          <div className="space-y-2">
            <Label htmlFor="radius">Radio (km)</Label>
            <Select
              id="radius"
              value={filters.radiusKm.toString()}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  radiusKm: Number(e.target.value),
                })
              }
            >
              <option value="1">1 km</option>
              <option value="3">3 km</option>
              <option value="5">5 km</option>
              <option value="10">10 km</option>
              <option value="20">20 km</option>
              <option value="50">50 km</option>
            </Select>
          </div>
          
          {/* Fecha Inicio */}
          <div className="space-y-2">
            <Label htmlFor="startDate">Desde</Label>
            <Input
              id="startDate"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  startDate: e.target.value || undefined,
                })
              }
            />
          </div>

          {/* Fecha Fin */}
          <div className="space-y-2">
            <Label htmlFor="endDate">Hasta</Label>
            <Input
              id="endDate"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  endDate: e.target.value || undefined,
                })
              }
            />
          </div>

          {/* Botón Buscar */}
          <div className="flex items-end">
            <Button
              onClick={onSearch}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Buscando...' : '🔍 Buscar'}
            </Button>
          </div>
        </div>

        {/* Servicios */}
        <div className="space-y-2">
          <Label>Servicios</Label>
          <div className="flex flex-wrap gap-2">
            {AMENITIES.map((amenity) => (
              <button
                key={amenity.id}
                type="button"
                onClick={() => handleAmenityToggle(amenity.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-colors',
                  filters.amenities.includes(amenity.id)
                    ? 'bg-vertice-primary text-vertice-primary-foreground border-vertice-primary'
                    : 'bg-background text-foreground border-input hover:border-vertice-primary/50'
                )}
              >
                {amenity.label}
              </button>
            ))}
          </div>
        </div>

        {/* Métodos de Pago */}
        <div className="space-y-2">
          <Label>Métodos de Pago</Label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => handlePaymentMethodToggle(method.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-colors',
                  filters.paymentMethods.includes(method.id)
                    ? 'bg-vertice-secondary text-vertice-secondary-foreground border-vertice-secondary'
                    : 'bg-background text-foreground border-input hover:border-vertice-secondary/50'
                )}
              >
                {method.label}
              </button>
            ))}
          </div>
        </div>

        {/* Botón Limpiar */}
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            disabled={isLoading}
          >
            Limpiar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
