import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()

  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/register')
  
  const isProtectedPage = req.nextUrl.pathname.startsWith('/labs') ||
                          req.nextUrl.pathname.startsWith('/seats') ||
                          req.nextUrl.pathname.startsWith('/booking') ||
                          req.nextUrl.pathname.startsWith('/admin')

  if (isProtectedPage && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/labs', req.url))
  }

  return res
}

export const config = {
  matcher: ['/labs/:path*', '/seats/:path*', '/booking/:path*', 
            '/admin/:path*', '/login', '/register']
}
