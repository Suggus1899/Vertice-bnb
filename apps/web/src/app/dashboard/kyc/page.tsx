'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
  Alert,
  Badge,
  Spinner,
  Select,
} from '@vetice/ui';

interface KYCDocument {
  id: string;
  type: 'STUDENT_ID' | 'ENROLLMENT_CERT' | 'ID_CARD';
  fileUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const DOCUMENT_TYPES = {
  STUDENT_ID: { label: 'Carnet Estudiantil', icon: '🎓', description: 'Carnet de tu universidad' },
  ENROLLMENT_CERT: { label: 'Constancia de Estudios', icon: '📄', description: 'Constancia de inscripción vigente' },
  ID_CARD: { label: 'Cédula de Identidad', icon: '🆔', description: 'Cédula laminada o pasaporte' },
};

export default function KYCPage() {
  const router = useRouter();
  const [documents, setDocuments] = React.useState<KYCDocument[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const [uploadData, setUploadData] = React.useState({
    type: 'STUDENT_ID' as keyof typeof DOCUMENT_TYPES,
    fileUrl: '',
  });

  const [user, setUser] = React.useState<{ role?: string }>({});

  React.useEffect(() => {
    // Obtener usuario del localStorage solo en el cliente
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isStudent = user.role === 'STUDENT';

  React.useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kyc/my-documents`, {
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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      // Simular upload a Cloudinary (en producción, usar el endpoint real)
      // const uploadResponse = await fetch(`${API_URL}/api/upload/kyc`, { ... });
      // const fileUrl = uploadResponse.data.url;

      // Por ahora, usamos una URL simulada
      const fileUrl = `https://res.cloudinary.com/demo/image/upload/v${Date.now()}/${uploadData.type}_${Date.now()}.jpg`;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kyc/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: uploadData.type,
          fileUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir documento');
      }

      setSuccess(true);
      setUploadData({ type: 'STUDENT_ID', fileUrl: '' });
      loadDocuments();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir documento');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: <Badge variant="secondary">🟡 Pendiente</Badge>,
      APPROVED: <Badge variant="default">🟢 Aprobado</Badge>,
      REJECTED: <Badge variant="destructive">🔴 Rechazado</Badge>,
    };
    return badges[status as keyof typeof badges] || null;
  };

  const getKycStatus = () => {
    const approved = documents.filter((d) => d.status === 'APPROVED').length;
    const pending = documents.filter((d) => d.status === 'PENDING').length;
    const rejected = documents.filter((d) => d.status === 'REJECTED').length;

    if (approved >= 2) {
      return { status: 'APPROVED', text: 'Verificado', color: 'text-green-600' };
    } else if (rejected > 0) {
      return { status: 'REJECTED', text: 'Documentos rechazados', color: 'text-red-600' };
    } else if (pending > 0) {
      return { status: 'PENDING', text: 'En revisión', color: 'text-yellow-600' };
    } else {
      return { status: 'NONE', text: 'Sin documentos', color: 'text-muted-foreground' };
    }
  };

  const kycStatus = getKycStatus();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Verificación de Identidad (KYC)</h1>
        <p className="text-muted-foreground mt-1">
          Sube tus documentos para verificar tu cuenta
        </p>
      </div>

      {/* Estado KYC */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Verificación</CardTitle>
          <CardDescription>
            Tu estado actual de verificación KYC
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-2xl font-bold ${kycStatus.color}`}>
              {kycStatus.text}
            </div>
            {kycStatus.status === 'APPROVED' && (
              <Badge variant="default">✓ Verificado</Badge>
            )}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-green-600">
                {documents.filter((d) => d.status === 'APPROVED').length}
              </div>
              <div className="text-sm text-muted-foreground">Aprobados</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.filter((d) => d.status === 'PENDING').length}
              </div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </div>
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-2xl font-bold text-red-600">
                {documents.filter((d) => d.status === 'REJECTED').length}
              </div>
              <div className="text-sm text-muted-foreground">Rechazados</div>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>ℹ️ Información:</strong> Necesitas al menos 2 documentos aprobados para estar verificado.
              {isStudent && ' Como estudiante, debes subir tu carnet y constancia de estudios.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Subir Nuevo Documento</CardTitle>
          <CardDescription>
            Selecciona el tipo de documento y proporciona la URL
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleUpload}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <p className="text-sm">{error}</p>
              </Alert>
            )}

            {success && (
              <Alert variant="success">
                <p className="text-sm">¡Documento subido exitosamente!</p>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Documento</Label>
              <Select
                id="type"
                value={uploadData.type}
                onChange={(e) =>
                  setUploadData({
                    ...uploadData,
                    type: e.target.value as keyof typeof DOCUMENT_TYPES,
                  })
                }
                disabled={isUploading}
              >
                {Object.entries(DOCUMENT_TYPES).map(([key, { label, icon, description }]) => (
                  <option key={key} value={key}>
                    {icon} {label} - {description}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileUrl">URL del Documento</Label>
              <Input
                id="fileUrl"
                type="url"
                placeholder="https://cloudinary.com/..."
                value={uploadData.fileUrl}
                onChange={(e) => setUploadData({ ...uploadData, fileUrl: e.target.value })}
                disabled={isUploading}
              />
              <p className="text-xs text-muted-foreground">
                En producción, aquí iría un componente de upload real a Cloudinary.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <h4 className="font-semibold mb-2">Documento seleccionado:</h4>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {DOCUMENT_TYPES[uploadData.type as keyof typeof DOCUMENT_TYPES].icon}
                </span>
                <div>
                  <div className="font-medium">
                    {DOCUMENT_TYPES[uploadData.type as keyof typeof DOCUMENT_TYPES].label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {DOCUMENT_TYPES[uploadData.type as keyof typeof DOCUMENT_TYPES].description}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isUploading || !uploadData.fileUrl}>
              {isUploading ? 'Subiendo...' : 'Subir Documento'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Lista de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Mis Documentos</CardTitle>
          <CardDescription>
            Historial de documentos subidos y su estado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <div className="text-4xl mb-2">📄</div>
              <p>No has subido ningún documento aún</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES]?.icon || '📄'}
                    </div>
                    <div>
                      <div className="font-medium">
                        {DOCUMENT_TYPES[doc.type as keyof typeof DOCUMENT_TYPES]?.label || doc.type}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Subido el {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                      {doc.notes && doc.status === 'REJECTED' && (
                        <div className="text-sm text-red-600 mt-1">
                          Motivo: {doc.notes}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(doc.status)}
                    <Button variant="outline" size="sm" asChild>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                        Ver
                      </a>
                    </Button>
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
