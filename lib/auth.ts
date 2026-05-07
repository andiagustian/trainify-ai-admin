/**
 * Supabase Auth client for admin app
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/**
 * Get current admin session
 */
export async function getAdminSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

/**
 * Sign in with magic link
 */
export async function signInWithEmail(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
      shouldCreateUser: true,
    },
  })
}

/**
 * Sign out
 */
export async function signOut() {
  return supabase.auth.signOut()
}

/**
 * Get JWT token for API calls
 */
export async function getAdminToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session?.access_token
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated() {
  const session = await getAdminSession()
  return !!session
}
