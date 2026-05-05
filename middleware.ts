import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-ybcnptkrimaecyfpuxcx-auth-token')?.value ||
                req.cookies.get('sb-access-token')?.value

  const isAuthPage = req.nextUrl.pathname === '/login' || 
                     req.nextUrl.pathname === '/register'

  const isProtectedPage = req.nextUrl.pathname.startsWith('/labs') ||
                          req.nextUrl.pathname.startsWith('/seats') ||
                          req.nextUrl.pathname.startsWith('/booking') ||
                          req.nextUrl.pathname.startsWith('/admin')

  if (isProtectedPage && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/labs', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/labs/:path*', '/seats/:path*', '/booking/:path*', 
            '/admin/:path*', '/login', '/register']
}
