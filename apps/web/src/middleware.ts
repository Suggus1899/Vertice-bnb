import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas protegidas que requieren autenticación
const protectedRoutes = ['/dashboard', '/profile', '/settings'];

// Rutas de auth que no deben estar accesibles si ya estás logueado
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de autenticación
  const accessToken = request.cookies.get('accessToken')?.value;

  // Verificar si es una ruta de auth
  if (authRoutes.some(route => pathname.startsWith(route))) {
    // Si ya está autenticado, redirigir al dashboard
    if (accessToken) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Verificar si es una ruta protegida
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Si no está autenticado, redirigir al login
    if (!accessToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
