import { type NextRequest, NextResponse } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/auth/login', '/auth/callback']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  try {
    // Check for Supabase session in cookies
    // Supabase stores session in specific cookie format
    const cookieHeader = request.headers.get('cookie') || ''
    
    // Look for Supabase auth token in cookies
    const hasAuthToken = 
      cookieHeader.includes('sb-') || 
      cookieHeader.includes('access-token') ||
      request.cookies.has('sb-access-token') ||
      request.cookies.has('sb-refresh-token')

    if (!hasAuthToken) {
      // No auth token found, redirect to login
      console.log('[Middleware] No auth token found for path:', pathname)
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error('[Middleware] Error:', error)
    // On error, allow request to proceed (let app handle auth)
    return NextResponse.next()
  }
}

// Apply middleware to all routes except static files and APIs
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
}
