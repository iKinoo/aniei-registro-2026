import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Proteger la ruta /cpanel (excepto /cpanel/login)
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/cpanel/login') &&
    request.nextUrl.pathname.startsWith('/cpanel')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/cpanel/login';
    return NextResponse.redirect(url);
  }
  
  // Si el usuario ya está logueado pero intenta ir a /cpanel/login, lo redirigimos a /cpanel
  if (user && request.nextUrl.pathname === '/cpanel/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/cpanel';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
