import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!(req.auth?.user as any)?.folioRegistro;
  const { pathname } = req.nextUrl;
  const role = ((req.auth?.user as any)?.role as string | undefined)?.toUpperCase();

  const isAuthRoute = pathname.startsWith('/login');
  const isCpanelRoute = pathname.startsWith('/cpanel');
  const isPerfilRoute = pathname.startsWith('/perfil');
  const isRegistroRoute = pathname.startsWith('/registro');
  const isActividadesRoute = pathname.startsWith('/actividades');

  if (isAuthRoute) {
    if (isLoggedIn) {
      if (role === 'ADMIN') {
        return NextResponse.redirect(new URL('/cpanel', req.nextUrl));
      }
      return NextResponse.redirect(new URL('/perfil', req.nextUrl));
    }
    return NextResponse.next();
  }

  if (isRegistroRoute && isLoggedIn) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/cpanel', req.nextUrl));
    }
    return NextResponse.redirect(new URL('/perfil', req.nextUrl));
  }

  if (isCpanelRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', req.nextUrl));
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/perfil', req.nextUrl));
    }
  }

  if (isPerfilRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (isActividadesRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
