import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => req.cookies.set(name, value));
          res = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();

  const url = req.nextUrl.clone();
  const path = url.pathname;

  const protectedRoutes = ['/labs', '/seats', '/booking', '/dashboard', '/students', '/payments'];
  const authRoutes = ['/login', '/register'];

  const isProtected = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));

  if (isProtected && !session) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && session) {
    url.pathname = '/labs';
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: [
    '/labs/:path*',
    '/seats/:path*',
    '/booking/:path*',
    '/dashboard/:path*',
    '/students/:path*',
    '/payments/:path*',
    '/login',
    '/register'
  ],
};
