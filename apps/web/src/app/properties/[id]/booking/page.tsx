'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Alert,
  Spinner,
} from '@vetice/ui';

interface Property {
  id: string;
  title: string;
  description: string;
  priceUsd: number;
  address: string;
  images: { url: string }[];
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const [property, setProperty] = React.useState<Property | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isBooking, setIsBooking] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const [bookingData, setBookingData] = React.useState({
    startDate: '',
    endDate: '',
    notes: '',
  });

  const [exchangeRate, setExchangeRate] = React.useState<number>(45.50);

  React.useEffect(() => {
    loadProperty();
    loadExchangeRate();
  }, []);

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
      setError('Error al cargar la propiedad');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExchangeRate = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/exchange-rate`);
      const data = await response.json();
      if (data.success) {
        setExchangeRate(data.data.rate);
      }
    } catch (error) {
      console.error('Error loading exchange rate:', error);
    }
  };

  const calculateNights = () => {
    if (!bookingData.startDate || !bookingData.endDate) return 0;
    const start = new Date(bookingData.startDate);
    const end = new Date(bookingData.endDate);
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const calculateTotal = () => {
    const nights = calculateNights();
    return property ? property.priceUsd * nights : 0;
  };

  const calculateTotalVES = () => {
    const totalUsd = calculateTotal();
    return totalUsd * exchangeRate;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      if (user.role !== 'STUDENT') {
        throw new Error('Solo los estudiantes pueden hacer reservas');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          propertyId: params.id,
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          notes: bookingData.notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear reserva');
      }

      setSuccess(true);

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard/bookings');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear reserva');
    } finally {
      setIsBooking(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

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
          <Button onClick={() => router.push('/search')}>Volver a la búsqueda</Button>
        </div>
      </div>
    );
  }

  const nights = calculateNights();
  const totalUsd = calculateTotal();
  const totalVes = calculateTotalVES();

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          ← Volver
        </Button>

        <h1 className="text-3xl font-bold mb-6">Reservar Propiedad</h1>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Información de la Propiedad */}
          <Card>
            <CardHeader>
              <CardTitle>Propiedad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={property.images[0]?.url || '/placeholder.jpg'}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-lg">{property.title}</h3>
              <p className="text-muted-foreground">{property.address}</p>
              <div className="text-2xl font-bold text-vertice-primary">
                ${property.priceUsd} <span className="text-sm font-normal text-muted-foreground">/noche</span>
              </div>
            </CardContent>
          </Card>

          {/* Formulario de Reserva */}
          <form onSubmit={handleBooking}>
            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Reserva</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <p className="text-sm">{error}</p>
                  </Alert>
                )}

                {success && (
                  <Alert variant="success">
                    <p className="text-sm">¡Reserva creada exitosamente!</p>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="startDate">Fecha de Inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, startDate: e.target.value })
                    }
                    min={minDate}
                    required
                    disabled={isBooking || success}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Fecha de Fin *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, endDate: e.target.value })
                    }
                    min={bookingData.startDate || minDate}
                    required
                    disabled={isBooking || success}
                  />
                </div>

                {nights > 0 && (
                  <Card className="bg-muted/50">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          ${property.priceUsd} x {nights} noches
                        </span>
                        <span>${totalUsd.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tasa BCV</span>
                        <span>{exchangeRate.toFixed(2)} VES/USD</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total (USD)</span>
                          <span className="text-vertice-primary">${totalUsd.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm">
                          <span>Total (Bs)</span>
                          <span className="text-vertice-primary">
                            {totalVes.toFixed(2)} VES
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas (opcional)</Label>
                  <textarea
                    id="notes"
                    value={bookingData.notes}
                    onChange={(e) =>
                      setBookingData({ ...bookingData, notes: e.target.value })
                    }
                    placeholder="Mensaje para el anfitrión..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={isBooking || success}
                  />
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>Al reservar, aceptas los términos y condiciones del anfitrión.</p>
                  <p className="mt-1">
                    El pago se realiza directamente al anfitrión en USD o Bs según la tasa BCV.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isBooking || success || nights === 0}
                >
                  {isBooking ? 'Procesando...' : success ? 'Reserva Exitosa' : 'Confirmar Reserva'}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
