import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Proteger la ruta /cpanel (excepto /cpanel/login)
  if (
    !isLoggedIn &&
    !pathname.startsWith('/cpanel/login') &&
    pathname.startsWith('/cpanel')
  ) {
    const url = req.nextUrl.clone();
    url.pathname = '/cpanel/login';
    return NextResponse.redirect(url);
  }

  // Si el usuario ya está logueado pero intenta ir a /cpanel/login, lo redirigimos a /cpanel
  if (isLoggedIn && pathname === '/cpanel/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/cpanel';
    return NextResponse.redirect(url);
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
