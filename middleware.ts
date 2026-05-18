import { type NextRequest, NextResponse } from 'next/server'

export function middleware(_request: NextRequest) {
  // Auth is handled entirely client-side by AuthWrapper.
  // Supabase JS stores session in localStorage (not cookies), so
  // server-side cookie checks always fail and cause redirect loops.
  return NextResponse.next()
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
