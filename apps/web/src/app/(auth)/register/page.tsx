'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Alert, Select } from '@vetice/ui';
import { useRouter } from 'next/navigation';

type UserRole = 'STUDENT' | 'HOST';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'STUDENT' as UserRole,
    firstName: '',
    lastName: '',
    phone: '',
    university: '',
    major: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          university: formData.role === 'STUDENT' ? formData.university : undefined,
          major: formData.role === 'STUDENT' ? formData.major : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);

      // Guardar tokens y usuario
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Redirigir después de 2 segundos
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">
          Crear cuenta en <span className="text-vertice-primary">Vértice</span>
        </CardTitle>
        <CardDescription>
          Completa el formulario para registrar tu cuenta
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <p className="text-sm">{error}</p>
            </Alert>
          )}

          {success && (
            <Alert variant="success">
              <p className="text-sm">¡Registro exitoso! Redirigiendo...</p>
            </Alert>
          )}

          {/* Tipo de cuenta */}
          <div className="space-y-2">
            <Label htmlFor="role">Tipo de cuenta</Label>
            <Select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isLoading || success}
            >
              <option value="STUDENT">Estudiante</option>
              <option value="HOST">Anfitrión</option>
            </Select>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Juan"
                value={formData.firstName}
                onChange={handleChange}
                required
                disabled={isLoading || success}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Pérez"
                value={formData.lastName}
                onChange={handleChange}
                required
                disabled={isLoading || success}
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="estudiante@universidad.edu"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={isLoading || success}
            />
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono (opcional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+58 412 1234567"
              value={formData.phone}
              onChange={handleChange}
              disabled={isLoading || success}
            />
          </div>

          {/* Campos específicos para estudiantes */}
          {formData.role === 'STUDENT' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="university">Universidad</Label>
                <Input
                  id="university"
                  name="university"
                  placeholder="Universidad Central de Venezuela"
                  value={formData.university}
                  onChange={handleChange}
                  required={formData.role === 'STUDENT'}
                  disabled={isLoading || success}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Carrera</Label>
                <Input
                  id="major"
                  name="major"
                  placeholder="Ingeniería de Sistemas"
                  value={formData.major}
                  onChange={handleChange}
                  required={formData.role === 'STUDENT'}
                  disabled={isLoading || success}
                />
              </div>
            </>
          )}

          {/* Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={isLoading || success}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo 8 caracteres, una mayúscula, una minúscula y un número
            </p>
          </div>

          {/* Confirmar contraseña */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={isLoading || success}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || success}
          >
            {isLoading ? 'Registrando...' : success ? 'Registrado' : 'Crear Cuenta'}
          </Button>

          <p className="text-sm text-center text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <Link
              href="/login"
              className="text-vertice-primary font-medium hover:underline"
            >
              Inicia sesión
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
