'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/auth'

const publicRoutes = ['/auth/login', '/auth/callback']

export default function AuthWrapper({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if this is a public route
        if (publicRoutes.includes(pathname)) {
          console.log('[AuthWrapper] Public route, skipping auth check')
          setIsLoading(false)
          return
        }

        // Check for active session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log('[AuthWrapper] Session check:', {
          authenticated: !!session,
          error: !!error,
          pathname,
        })

        if (error || !session) {
          // No session, redirect to login
          console.log('[AuthWrapper] No session, redirecting to login')
          router.replace('/auth/login')
          setIsAuthenticated(false)
        } else {
          // Session exists
          console.log('[AuthWrapper] Session found, user:', session.user?.email)
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error('[AuthWrapper] Auth check error:', err)
        // On error, try to redirect to login
        router.replace('/auth/login')
        setIsAuthenticated(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[AuthWrapper] Auth state changed:', event, !!session)
      setIsAuthenticated(!!session)

      // If user logged out, redirect to login
      if (event === 'SIGNED_OUT') {
        router.replace('/auth/login')
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [pathname, router])

  // For public routes, render immediately
  if (publicRoutes.includes(pathname)) {
    return <>{children}</>
  }

  // For protected routes, show loading or redirect
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      }}>
        <div style={{ textAlign: 'center', color: '#cbd5e1' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #334155',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              margin: '0 auto',
              animation: 'spin 1s linear infinite',
            }}></div>
          </div>
          <p>Checking authentication...</p>
        </div>
      </div>
    )
  }

  // If not authenticated and not loading, redirect will happen
  if (!isAuthenticated) {
    return null
  }

  // Authenticated, render children
  return <>{children}</>
}
