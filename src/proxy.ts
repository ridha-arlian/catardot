import { auth } from '../auth'
import { redis } from '@/app/lib/redis'
import { NextResponse } from 'next/server'

// Rate limiting per user/IP
async function checkRateLimit(identifier: string, limit = 100, windowSec = 60) {
  const key = `ratelimit:${identifier}`

  const tx = redis.multi()
  tx.incr(key)
  tx.expire(key, windowSec)

  const results = await tx.exec()
  const count = results?.[0] as number | undefined

  return (count ?? 0) <= limit
}

export default auth(async (req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const identifier = req.auth?.user?.email || req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || 'anonymous'

  const allowed = await checkRateLimit(identifier, 100, 60)
  if (!allowed) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const protectedWebRoutes = ['/story', '/story/profile']
  const protectedApiRoutes = ['/api/sheets', '/api/story']

  const isProtectedWebRoute = protectedWebRoutes.some((route) => pathname === route || pathname.startsWith(route + '/'))
  const isProtectedApiRoute = protectedApiRoutes.some((route) => pathname.startsWith(route))

  if (pathname.startsWith('/api/auth')) return NextResponse.next()

  if (pathname.startsWith('/api')) {
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 10 * 1024 * 1024) return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    
    if (!isLoggedIn && isProtectedApiRoute) return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 })
    
    const response = NextResponse.next()
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    console.log(`[API] ${req.method} ${pathname} - ${identifier}`)

    return response
  }

  if (!isLoggedIn && isProtectedWebRoute) return Response.redirect(new URL('/not-authorized', req.nextUrl.origin))

  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  return response
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/webhooks).*)',
  ],
}