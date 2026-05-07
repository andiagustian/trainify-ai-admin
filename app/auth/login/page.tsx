'use client'

import { useState, useRef, useEffect } from 'react'
import { signInWithEmail } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [cooldownSeconds, setCooldownSeconds] = useState(0)
  const cooldownTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimeoutRef.current) {
        clearInterval(cooldownTimeoutRef.current)
        cooldownTimeoutRef.current = null
      }
    }
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loading || cooldownSeconds > 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await signInWithEmail(email)

      if (error) {
        const errorMsg = error.message?.toLowerCase() || ''
        const errorStatus = (error as any).status
        
        console.log('Auth error:', { errorMsg, errorStatus, fullError: error })
        
        // Check for rate limit - more specific detection
        const isRateLimit = 
          errorStatus === 429 || 
          errorMsg.includes('email rate limit') ||
          errorMsg.includes('too many requests') ||
          errorMsg.includes('rate_limit_exceeded')
        
        if (isRateLimit) {
          console.log('Rate limit detected, starting 5min cooldown')
          setError('Rate limited. Please wait 5 minutes before trying again.')
          setCooldownSeconds(300)
          if (cooldownTimeoutRef.current) clearTimeout(cooldownTimeoutRef.current)
          cooldownTimeoutRef.current = setInterval(() => {
            setCooldownSeconds((prev) => {
              if (prev <= 1) {
                if (cooldownTimeoutRef.current) {
                  clearInterval(cooldownTimeoutRef.current)
                  cooldownTimeoutRef.current = null
                }
                setError(null)
                console.log('Cooldown finished')
                return 0
              }
              return prev - 1
            })
          }, 1000)
        } else {
          console.log('Other error:', errorMsg)
          setError(error.message || 'Failed to send magic link. Please try again.')
        }
      } else {
        console.log('Magic link sent successfully to:', email)
        setSent(true)
        localStorage.setItem('admin_email', email)
        sessionStorage.setItem('admin_email', email)
      }
    } catch (err: any) {
      console.error('Unexpected error:', err)
      setError(err?.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const buttonText = loading 
    ? 'Sending magic link...' 
    : cooldownSeconds > 0 
    ? `Wait ${cooldownSeconds}s to retry`
    : 'Send Magic Link'

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorations */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '384px',
        height: '384px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
        borderRadius: '9999px',
        filter: 'blur(80px)',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: '384px',
        height: '384px',
        background: 'radial-gradient(circle, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
        borderRadius: '9999px',
        filter: 'blur(80px)',
        transform: 'translate(50%, 50%)',
        pointerEvents: 'none'
      }}></div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '448px' }}>
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            borderRadius: '12px',
            marginBottom: '1rem',
            boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.3)',
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: 'white'
          }}>
            AI
          </div>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: 'white',
            margin: '0.5rem 0 0 0'
          }}>
            TrainifyAI Admin
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#94a3b8',
            margin: '0.5rem 0 0 0'
          }}>
            Management Dashboard
          </p>
        </div>

        {/* Main Card */}
        <div style={{
          background: '#1e293b',
          borderRadius: '1rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
          padding: '2rem',
          border: '1px solid #334155'
        }}>
          {sent ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                display: 'flex',
                gap: '0.75rem'
              }}>
                <div style={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  background: 'rgba(34, 197, 94, 0.2)',
                  borderRadius: '0.5rem'
                }}>
                  <span style={{ fontSize: '1.5rem' }}>✓</span>
                </div>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#86efac',
                    margin: 0
                  }}>
                    Magic link sent successfully
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#cbd5e1',
                    margin: '0.25rem 0 0 0'
                  }}>
                    Check your inbox for a login link at <span style={{ color: 'white', fontWeight: '600' }}>{email}</span>
                  </p>
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#94a3b8',
                    margin: '0.5rem 0 0 0'
                  }}>
                    💡 Link expires in 24 hours. Check spam folder if not found.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSent(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#334155',
                  border: '1px solid #475569',
                  color: 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#475569';
                  e.currentTarget.style.borderColor = '#64748b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#334155';
                  e.currentTarget.style.borderColor = '#475569';
                }}
              >
                Try another email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {error && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(244, 63, 94, 0.1) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  <div style={{
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px'
                  }}>
                    <span style={{ color: '#fca5a5', fontSize: '1.25rem' }}>!</span>
                  </div>
                  <p style={{
                    fontSize: '0.875rem',
                    color: '#fca5a5',
                    margin: 0
                  }}>
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#e2e8f0',
                  marginBottom: '0.75rem'
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@trainifyai.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#334155',
                    border: '1px solid #475569',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '0.875rem',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#475569';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                  disabled={loading || cooldownSeconds > 0}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email || cooldownSeconds > 0}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: (loading || cooldownSeconds > 0)
                    ? '#334155'
                    : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                  border: 'none',
                  color: (loading || cooldownSeconds > 0) ? '#94a3b8' : 'white',
                  borderRadius: '0.5rem',
                  fontWeight: '500',
                  cursor: (loading || cooldownSeconds > 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: (!loading && cooldownSeconds === 0) ? '0 10px 15px -3px rgba(59, 130, 246, 0.4)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!loading && cooldownSeconds === 0) {
                    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading && cooldownSeconds === 0) {
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(59, 130, 246, 0.4)';
                  }
                }}
              >
                {loading && (
                  <svg style={{ animation: 'spin 1s linear infinite', width: '1rem', height: '1rem' }} fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"></path>
                  </svg>
                )}
                <span>{buttonText}</span>
              </button>

              <p style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                textAlign: 'center',
                margin: 0
              }}>
                No password needed. We'll send you a secure magic link to sign in.
              </p>
            </form>
          )}
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#64748b',
          marginTop: '1.5rem',
          margin: '1.5rem 0 0 0'
        }}>
          © 2024 TrainifyAI. All rights reserved.
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
