import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, options) {
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({ request: { headers: req.headers } })
          res.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({ request: { headers: req.headers } })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const isAuthPage = req.nextUrl.pathname === '/login' || 
                     req.nextUrl.pathname === '/register'

  const isProtectedPage = req.nextUrl.pathname.startsWith('/labs') ||
                          req.nextUrl.pathname.startsWith('/seats') ||
                          req.nextUrl.pathname.startsWith('/booking') ||
                          req.nextUrl.pathname.startsWith('/admin')

  if (isProtectedPage && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/labs', req.url))
  }

  return res
}

export const config = {
  matcher: ['/labs/:path*', '/seats/:path*', '/booking/:path*', 
            '/admin/:path*', '/login', '/register']
}
