'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Spinner,
  Alert,
} from '@vetice/ui';

interface KYCDocument {
  id: string;
  type: string;
  fileUrl: string;
  status: string;
  notes?: string;
  createdAt: string;
  user: {
    email: string;
    role: string;
    studentProfile?: { firstName: string; lastName: string; avatar?: string };
    hostProfile?: { firstName: string; lastName: string; avatar?: string };
  };
}

interface KYCStats {
  documents: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  users: {
    total: number;
    verified: number;
    pending: number;
  };
}

export default function AdminKYCPage() {
  const router = useRouter();
  const [documents, setDocuments] = React.useState<KYCDocument[]>([]);
  const [stats, setStats] = React.useState<KYCStats | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isProcessing, setIsProcessing] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  React.useEffect(() => {
    loadStats();
    loadDocuments();
  }, [filter]);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kyc/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadDocuments = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = filter === 'all'
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/kyc/documents`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/kyc/${filter}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setDocuments(data.data);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Error al cargar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    const notes = status === 'REJECTED' ? prompt('Motivo del rechazo (opcional):') : '';
    
    setIsProcessing(id);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/kyc/documents/${id}/review`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status, notes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al revisar documento');
      }

      loadDocuments();
      loadStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al revisar documento');
    } finally {
      setIsProcessing(null);
    }
  };

  const getUserName = (doc: KYCDocument) => {
    const profile = doc.user.role === 'STUDENT' ? doc.user.studentProfile : doc.user.hostProfile;
    return `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || doc.user.email;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: <Badge variant="secondary">🟡 Pendiente</Badge>,
      APPROVED: <Badge variant="default">🟢 Aprobado</Badge>,
      REJECTED: <Badge variant="destructive">🔴 Rechazado</Badge>,
    };
    return badges[status as keyof typeof badges] || null;
  };

  const getDocTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      STUDENT_ID: '🎓 Carnet Estudiantil',
      ENROLLMENT_CERT: '📄 Constancia de Estudios',
      ID_CARD: '🆔 Cédula de Identidad',
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administración KYC</h1>
          <p className="text-muted-foreground mt-1">
            Revisa y aprueba documentos de verificación
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard')}>Volver al Dashboard</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <p className="text-sm">{error}</p>
        </Alert>
      )}

      {/* Estadísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Docs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.documents.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.documents.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.documents.approved}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rechazados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.documents.rejected}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Verificados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.users.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuarios Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.users.pending}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'pending' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          Todos
        </Button>
        <Button
          variant={filter === 'approved' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('approved')}
        >
          Aprobados
        </Button>
        <Button
          variant={filter === 'rejected' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('rejected')}
        >
          Rechazados
        </Button>
      </div>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>
            {filter === 'pending' ? 'Documentos Pendientes' : 
             filter === 'approved' ? 'Documentos Aprobados' :
             filter === 'rejected' ? 'Documentos Rechazados' : 'Todos los Documentos'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📄</div>
              <p>No hay documentos para mostrar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">
                      {getDocTypeLabel(doc.type).split(' ')[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getUserName(doc)}</span>
                        <Badge variant="outline">{doc.user.role}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {getDocTypeLabel(doc.type)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Subido el {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                      {doc.notes && (
                        <div className="text-sm text-red-600 mt-1">
                          Nota: {doc.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(doc.status)}
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        Ver Documento
                      </a>
                    </Button>
                    {doc.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReview(doc.id, 'APPROVED')}
                          disabled={isProcessing === doc.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing === doc.id ? '...' : '✓ Aprobar'}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReview(doc.id, 'REJECTED')}
                          disabled={isProcessing === doc.id}
                        >
                          {isProcessing === doc.id ? '...' : '✗ Rechazar'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
