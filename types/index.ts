/**
 * Shared types for admin app
 */

export type AdminRole = 'superadmin' | 'admin'

export interface AdminUser {
  userId: string
  role: AdminRole
  createdAt: string
}

export interface AppUser {
  id: string
  email: string
  createdAt: string
  lastSignIn: string | null
  tier: 'free' | 'starter' | 'pro'
  subscriptionStatus: string | null
  expiresAt: string | null
  status: 'active' | 'banned' | 'suspended'
  reason?: string
  documentCount: number
}

export interface Subscription {
  id: string
  userId: string
  tier: 'free' | 'starter' | 'pro'
  status: string
  expiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface UserStatus {
  userId: string
  status: 'active' | 'banned' | 'suspended'
  reason?: string
  statusChangedAt: string
  statusChangedBy?: string
}

export interface AuditLogEntry {
  id: string
  adminId: string
  action: string
  targetUserId?: string
  details: Record<string, any>
  createdAt: string
}

export interface DashboardMetrics {
  metrics: {
    totalUsers: number
    activeUsers: number
    activeUsersPercent: string
    tierDistribution: {
      free: number
      starter: number
      pro: number
    }
    proUserCount: number
    starterUserCount?: number
    freeUserCount: number
  }
  conversions: {
    today: number
    thisMonth: number
  }
  revenue: {
    activeProSubscriptions: number
    estimatedMRR: number
  }
  timestamp: string
}

export interface RevenueMetrics {
  subscriptions: {
    totalCount: number
    totalActive: number
    activeStarter: number
    activePro: number
    expiredSubs: number
    activePercent: string
  }
  revenue: {
    MRR: number
    ARR: number
    currencyCode: string
    pricing: {
      starter: { monthly: number; yearly: number }
      pro: { monthly: number; yearly: number }
    }
  }
  trends: {
    monthlyNewSubscribers: Record<string, number>
    lastUpdated: string
  }
}

export interface SystemHealth {
  status: string
  timestamp: string
  services: {
    api: {
      status: string
      uptime: {
        hours: number
        days: number
      }
    }
    anthropic: {
      status: string
      model: string
    }
    database: {
      status: string
      provider: string
    }
  }
  memory: {
    usagePercent: string
  }
  environment: {
    nodeEnv: string
    deployment: string
  }
}
