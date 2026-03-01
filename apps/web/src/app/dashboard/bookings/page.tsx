'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@vetice/ui';
import { toast } from 'sonner';

interface Booking {
  id: string;
  startDate: string;
  endDate: string;
  totalPriceUsd: number;
  rateApplied: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'COMPLETED';
  createdAt: string;
  property: {
    id: string;
    title: string;
    address: string;
    images: { url: string }[];
  };
  student?: {
    email: string;
    studentProfile?: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<'STUDENT' | 'HOST'>('STUDENT');

  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePay = async (bookingId: string) => {
    setIsProcessing(bookingId);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/pay`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success('Pago procesado correctamente', {
          description: 'Tu reserva ha sido confirmada.',
        });
        loadBookings();
      } else {
        toast.error(data.message || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error de red al procesar el pago');
    } finally {
      setIsProcessing(null);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/cancel`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        toast.success('Reserva cancelada');
        loadBookings();
      }
    } catch (error) {
      console.error('Error canceling booking:', error);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: 'CONFIRMED' | 'CANCELED') => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${bookingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      if (response.ok) {
        toast.success(status === 'CONFIRMED' ? 'Reserva confirmada' : 'Reserva rechazada');
        loadBookings();
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: <Badge variant="secondary">Pendiente</Badge>,
      CONFIRMED: <Badge variant="default">Confirmada</Badge>,
      CANCELED: <Badge variant="destructive">Cancelada</Badge>,
      COMPLETED: <Badge variant="default">Completada</Badge>,
    };
    return badges[status as keyof typeof badges] || null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p>Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {userRole === 'STUDENT' ? 'Mis Reservas' : 'Reservas de Propiedades'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {userRole === 'STUDENT'
              ? 'Gestiona tus reservas activas'
              : 'Administra las solicitudes de reserva'}
          </p>
        </div>
        {userRole === 'STUDENT' && (
          <Button onClick={() => router.push('/search')}>Nueva Búsqueda</Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">Reservas totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter((b) => b.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">Esperando confirmación</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter((b) => b.status === 'CONFIRMED').length}
            </div>
            <p className="text-xs text-muted-foreground">Reservas activas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter((b) => b.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-muted-foreground">Reservas finalizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Reservas */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold mb-2">No tienes reservas</h3>
            <p className="text-muted-foreground mb-4">
              {userRole === 'STUDENT'
                ? 'Comienza buscando una propiedad'
                : 'Las solicitudes aparecerán aquí'}
            </p>
            {userRole === 'STUDENT' && (
              <Button onClick={() => router.push('/search')}>Buscar Propiedades</Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Imagen */}
                  <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    {booking.property.images.length > 0 && booking.property.images[0] ? (
                      <img
                        src={booking.property.images[0]!.url}
                        alt={booking.property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        Sin imágenes
                      </div>
                    )}
                  </div>

                  {/* Información */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{booking.property.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {booking.property.address}
                        </p>
                        {userRole === 'HOST' && booking.student && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Reservado por: {booking.student.studentProfile?.firstName}{' '}
                            {booking.student.studentProfile?.lastName}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-vertice-primary">
                          ${booking.totalPriceUsd}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {booking.rateApplied.toFixed(2)} VES/USD
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Entrada</p>
                        <p className="font-medium">
                          {new Date(booking.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Salida</p>
                        <p className="font-medium">
                          {new Date(booking.endDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>{getStatusBadge(booking.status)}</div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/bookings/${booking.id}`)}>
                        Ver Detalles
                      </Button>

                      {userRole === 'STUDENT' && booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handlePay(booking.id)}
                            disabled={isProcessing === booking.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {isProcessing === booking.id ? 'Procesando...' : 'Pagar'}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancel(booking.id)}
                            disabled={isProcessing === booking.id}
                          >
                            Cancelar
                          </Button>
                        </>
                      )}

                      {userRole === 'HOST' && booking.status === 'PENDING' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleUpdateStatus(booking.id, 'CONFIRMED')}
                          >
                            Confirmar
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleUpdateStatus(booking.id, 'CANCELED')}
                          >
                            Rechazar
                          </Button>
                        </>
                      )}
                    </div>
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
