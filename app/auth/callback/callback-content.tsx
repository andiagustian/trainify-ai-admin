'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/auth'

export default function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get URL parameters
        const code = searchParams.get('code')
        const token = searchParams.get('token')
        const type = searchParams.get('type')
        const error_code = searchParams.get('error')
        const error_description = searchParams.get('error_description')

        console.log('Callback params:', { code, token, type, error_code, error_description })

        // Handle error from Supabase
        if (error_code || error_description) {
          throw new Error(error_description || error_code || 'Authentication failed')
        }

        // Method 1: If there's a code (OAuth/PKCE flow)
        if (code) {
          console.log('Processing OAuth code...')
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
          if (exchangeError) {
            throw exchangeError
          }
          console.log('OAuth exchange successful')
        }

        // Method 2: If there's a token (magic link/OTP)
        if (token && type === 'magiclink') {
          console.log('Processing magic link token...')
          // Try both sessionStorage and localStorage for email
          let email = sessionStorage.getItem('admin_email') || localStorage.getItem('admin_email') || ''
          console.log('Email from storage:', email ? 'found' : 'not found')
          
          // Attempt verify with email first, then without if email is empty
          let verifyError = null
          let verifyData = null
          
          if (email) {
            const result = await supabase.auth.verifyOtp({
              token,
              type: 'magiclink',
              email,
            })
            verifyError = result.error
            verifyData = result.data
            console.log('Verify OTP with email result:', { error: !!verifyError, sessionCreated: !!verifyData?.session })
          } else {
            // If no email found, the magic link token should still be valid
            // Supabase stores the email in the token itself
            const result = await supabase.auth.verifyOtp({
              token,
              type: 'magiclink',
              email: '', // Empty is okay for magic links
            })
            verifyError = result.error
            verifyData = result.data
            console.log('Verify OTP without email result:', { error: !!verifyError, sessionCreated: !!verifyData?.session })
            
            // Get email from the verified session
            if (verifyData?.session?.user?.email) {
              email = verifyData.session.user.email
              localStorage.setItem('admin_email', email)
              console.log('Email extracted from session:', email)
            }
          }
          
          if (verifyError) {
            throw verifyError
          }
        }

        // Check if session exists
        const { data, error: sessionError } = await supabase.auth.getSession()
        console.log('Get session result:', { error: !!sessionError, sessionExists: !!data?.session })
        
        if (sessionError) {
          throw sessionError
        }

        if (data?.session) {
          // Session established, redirect to dashboard
          console.log('Session verified, redirecting to dashboard...')
          sessionStorage.removeItem('admin_email')
          router.replace('/')
        } else {
          throw new Error('No session created. Please try logging in again.')
        }
      } catch (err: any) {
        console.error('Auth callback error:', err)
        setError(err?.message || 'Failed to authenticate. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
        {loading ? (
          <>
            <p className="text-slate-600">Authenticating...</p>
            <div className="mt-4 flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          </>
        ) : error ? (
          <>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="btn-primary"
            >
              Back to Login
            </button>
          </>
        ) : null}
      </div>
    </div>
  )
}
