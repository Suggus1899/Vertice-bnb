'use client';

import * as React from 'react';
import { Button, Card, CardContent, Badge, Avatar, Spinner, cn } from '@vetice/ui';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  author: {
    studentProfile: {
      firstName: string;
      lastName: string;
      avatar?: string;
    };
  };
}

interface PropertyReviewsProps {
  propertyId: string;
}

export function PropertyReviews({ propertyId }: PropertyReviewsProps) {
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [stats, setStats] = React.useState({ average: 0, count: 0 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [newRating, setNewRating] = React.useState(5);
  const [newComment, setNewComment] = React.useState('');
  const [canReview, setCanReview] = React.useState(false);
  const [eligibleBookingId, setEligibleBookingId] = React.useState<string | null>(null);

  const loadReviews = React.useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reviews/property/${propertyId}`
      );
      const data = await response.json();
      if (data.success) {
        setReviews(data.data.reviews);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [propertyId]);

  const checkEligibility = React.useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      // Buscamos reservas del usuario para esta propiedad que estén CONFIRMED o COMPLETED
      // y que NO tengan reseñas aún.
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/bookings/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      
      if (data.success) {
        const eligibleBooking = data.data.find(
          (b: any) => 
            b.propertyId === propertyId && 
            (b.status === 'CONFIRMED' || b.status === 'COMPLETED') &&
            !b.review // Asumiendo que el backend ahora incluye 'review' o nulled
        );

        if (eligibleBooking) {
          setEligibleBookingId(eligibleBooking.id);
          setCanReview(true);
        }
      }
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
  }, [propertyId]);

  React.useEffect(() => {
    loadReviews();
    checkEligibility();
  }, [loadReviews, checkEligibility]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibleBookingId) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: eligibleBookingId,
          rating: newRating,
          comment: newComment,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Reseña publicada con éxito');
        setNewComment('');
        setCanReview(false);
        loadReviews();
      } else {
        toast.error(data.message || 'Error al publicar la reseña');
      }
    } catch (error) {
      toast.error('Error de red al publicar la reseña');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-8">
      {/* Resumen de Calificaciones */}
      <div className="flex items-center gap-6">
        <div className="text-center">
          <div className="text-5xl font-bold text-foreground">
            {stats.average.toFixed(1)}
          </div>
          <div className="flex justify-center my-2">
            <StarDisplay rating={stats.average} />
          </div>
          <div className="text-sm text-muted-foreground">
            {stats.count} reseñas
          </div>
        </div>
        
        {/* Barras de progreso (opcional para el futuro) */}
        <div className="flex-1 space-y-1 hidden sm:block">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-2 text-sm">
              <span className="w-3">{star}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400" 
                  style={{ 
                    width: `${reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0}%` 
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Formulario de Nueva Reseña */}
      {canReview && (
        <Card className="border-vertice-primary/20 bg-vertice-primary/5">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Cuéntanos tu experiencia</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Calificación:</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setNewRating(s)}
                      className={cn(
                        "text-2xl transition-transform hover:scale-110",
                        s <= newRating ? "text-yellow-400" : "text-muted"
                      )}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Comentario (opcional)</label>
                <textarea
                  className="w-full min-h-[100px] p-3 rounded-md border bg-background focus:ring-2 focus:ring-vertice-primary outline-none"
                  placeholder="¿Cómo fue tu estancia?"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Publicando...' : 'Publicar Reseña'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Reseñas */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Aún no hay reseñas para esta propiedad.
          </p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="space-y-3 pb-6 border-b last:border-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar 
                    src={review.author.studentProfile.avatar} 
                    fallback={review.author.studentProfile.firstName?.[0] || 'U'} 
                  />
                  <div>
                    <div className="font-medium">
                      {review.author.studentProfile.firstName} {review.author.studentProfile.lastName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('es-VE', { 
                        year: 'numeric', 
                        month: 'long' 
                      })}
                    </div>
                  </div>
                </div>
                <StarDisplay rating={review.rating} size="sm" />
              </div>
              {review.comment && (
                <p className="text-foreground leading-relaxed">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StarDisplay({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';

  return (
    <div className="flex gap-0.5">
      {stars.map((s) => (
        <span
          key={s}
          className={cn(
            sizeClass,
            s <= Math.round(rating) ? "text-yellow-400" : "text-muted"
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}
