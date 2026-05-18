'use client'

import Link from 'next/link'
import { getDashboardMetrics, getRevenueMetrics, getSystemHealth } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import Navbar from '@/components/Navbar'
import { useQuery } from '@tanstack/react-query'

export default function DashboardPage() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: getDashboardMetrics,
  })

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-metrics'],
    queryFn: getRevenueMetrics,
  })

  const { data: health } = useQuery({
    queryKey: ['system-health'],
    queryFn: getSystemHealth,
  })

  return (
    <>
      <Navbar />
      <AdminLayout>
        <div className="px-6 py-6 space-y-6">
          {/* Page header */}
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">Overview of TrainifyAI metrics and system status</p>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={metricsLoading ? '—' : (metrics?.metrics.totalUsers ?? 0)}
            />
            <StatCard
              label="Active (30d)"
              value={metricsLoading ? '—' : (metrics?.metrics.activeUsers ?? 0)}
              sub={`${metrics?.metrics.activeUsersPercent ?? 0}% of total`}
            />
            <StatCard
              label="Paid Subscriptions"
              value={revenueLoading ? '—' : ((revenue?.subscriptions.activeStarter ?? 0) + (revenue?.subscriptions.activePro ?? 0))}
              sub={`Starter: ${revenue?.subscriptions.activeStarter ?? 0} | Pro: ${revenue?.subscriptions.activePro ?? 0}`}
            />
            <StatCard
              label="MRR (IDR)"
              value={revenueLoading ? '—' : `Rp${(revenue?.revenue.MRR ?? 0).toLocaleString('id-ID')}`}
              sub={`ARR: Rp${(revenue?.revenue.ARR ?? 0).toLocaleString('id-ID')}`}
            />
          </div>

          {/* Conversions + Health */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Conversions */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">Conversions</h2>
                <span className="badge badge-blue">Live</span>
              </div>
              <div className="card-body space-y-3">
                <MetricRow label="Today" value={metrics?.conversions.today ?? 0} loading={metricsLoading} />
                <MetricRow label="This month" value={metrics?.conversions.thisMonth ?? 0} loading={metricsLoading} />
              </div>
            </div>

            {/* System health */}
            <div className="card">
              <div className="card-header flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-900">System Health</h2>
                <span className="badge badge-success">All systems</span>
              </div>
              <div className="card-body space-y-3">
                <HealthRow label="API" status={health?.services.api.status ?? 'unknown'} />
                <HealthRow label="Database" status={health?.services.database.status ?? 'unknown'} />
                <HealthRow label="Claude API" status={health?.services.anthropic.status ?? 'unknown'} />
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="card-body flex flex-wrap gap-2">
              <Link href="/users" className="btn-primary text-xs">
                Manage Users
              </Link>
              <Link href="/admin" className="btn-primary text-xs">
                Admin Management
              </Link>
              <Link href="/monitoring" className="btn-secondary text-xs">
                View Monitoring
              </Link>
              <Link href="/audit-log" className="btn-secondary text-xs">
                Audit Log
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="stat-card">
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  )
}

function MetricRow({
  label,
  value,
  loading,
}: {
  label: string
  value: number
  loading?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{loading ? '—' : value}</span>
    </div>
  )
}

function HealthRow({ label, status }: { label: string; status: string }) {
  const healthy = status === 'operational' || status === 'connected' || status === 'active'
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={healthy ? 'badge badge-success' : 'badge badge-warning'}>{status}</span>
    </div>
  )
}
