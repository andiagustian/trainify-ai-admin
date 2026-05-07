/**
 * Admin API Client
 * Calls main app's /api/admin/* routes
 */

import { getAdminToken } from './auth'
import type {
  AppUser,
  AuditLogEntry,
  DashboardMetrics,
  RevenueMetrics,
  SystemHealth,
} from '@/types'

const API_BASE = process.env.NEXT_PUBLIC_MAIN_APP_API || 'http://localhost:3000/api'

/**
 * Helper: Make authenticated API call
 */
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = await getAdminToken()

  if (!token) {
    throw new Error('Not authenticated')
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.error || `API Error: ${response.status}`)
  }

  return response.json()
}

/**
 * Get list of all users
 */
export async function getUsers(filters?: {
  tier?: 'free' | 'pro'
  status?: 'active' | 'banned' | 'suspended'
  search?: string
  limit?: number
  offset?: number
}) {
  const params = new URLSearchParams()

  if (filters?.tier) params.append('tier', filters.tier)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.search) params.append('search', filters.search)
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.offset) params.append('offset', filters.offset.toString())

  const response = await apiCall(`/admin/users?${params}`)
  return response as {
    data: AppUser[]
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
}

/**
 * Get user details
 */
export async function getUserDetail(userId: string) {
  const response = await apiCall(`/admin/users/${userId}`)
  return response as {
    user: {
      id: string
      email: string
      createdAt: string
      lastSignIn: string | null
    }
    subscription: any | null
    status: any
    usage: any
    recentDocuments: any[]
  }
}

/**
 * Ban user
 */
export async function banUser(userId: string, reason: string) {
  return apiCall(`/admin/users/${userId}/ban`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

/**
 * Suspend user
 */
export async function suspendUser(userId: string, reason: string) {
  return apiCall(`/admin/users/${userId}/suspend`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

/**
 * Reset usage counter
 */
export async function resetUsage(userId: string) {
  return apiCall(`/admin/users/${userId}/reset-usage`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

/**
 * Override subscription
 */
export async function overrideSubscription(
  userId: string,
  tier: 'free' | 'pro',
  expiresAt?: string,
  reason?: string
) {
  return apiCall(`/admin/users/${userId}/subscription-override`, {
    method: 'POST',
    body: JSON.stringify({
      tier,
      expiresAt,
      reason,
    }),
  })
}

/**
 * Get audit log
 */
export async function getAuditLog(filters?: {
  adminId?: string
  action?: string
  targetUserId?: string
  limit?: number
  offset?: number
}) {
  const params = new URLSearchParams()

  if (filters?.adminId) params.append('adminId', filters.adminId)
  if (filters?.action) params.append('action', filters.action)
  if (filters?.targetUserId) params.append('targetUserId', filters.targetUserId)
  if (filters?.limit) params.append('limit', filters.limit.toString())
  if (filters?.offset) params.append('offset', filters.offset.toString())

  const response = await apiCall(`/admin/audit-log?${params}`)
  return response as {
    data: AuditLogEntry[]
    pagination: {
      limit: number
      offset: number
      returned: number
    }
  }
}

/**
 * Get dashboard metrics
 */
export async function getDashboardMetrics() {
  return apiCall('/admin/analytics/dashboard') as Promise<DashboardMetrics>
}

/**
 * Get revenue metrics
 */
export async function getRevenueMetrics() {
  return apiCall('/admin/analytics/revenue') as Promise<RevenueMetrics>
}

/**
 * Get system health
 */
export async function getSystemHealth() {
  return apiCall('/admin/system/health') as Promise<SystemHealth>
}
