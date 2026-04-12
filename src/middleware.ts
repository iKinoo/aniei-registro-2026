import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const role = (req.auth?.user as any)?.role as string | undefined;

  const isAuthRoute = pathname.startsWith('/login');
  const isCpanelRoute = pathname.startsWith('/cpanel');
  const isPerfilRoute = pathname.startsWith('/perfil');
  const isRegistroRoute = pathname.startsWith('/registro');

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/cpanel', req.nextUrl));
      }
      return NextResponse.redirect(new URL('/perfil', req.nextUrl));
    }
    return NextResponse.next();
  }

  // Si está logueado, no puede volver a registrarse manualmente
  if (isRegistroRoute && isLoggedIn) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/cpanel', req.nextUrl));
    }
    return NextResponse.redirect(new URL('/perfil', req.nextUrl));
  }

  // Rutas de cpanel solo para administradores
  if (isCpanelRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/perfil', req.nextUrl));
    }
  }

  // Rutas de perfil para registrados (USER o ADMIN)
  if (isPerfilRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, already handled by auth.js usually or should be unblocked for next-auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
