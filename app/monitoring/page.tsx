'use client'

import { useQuery } from '@tanstack/react-query'
import { getDashboardMetrics, getRevenueMetrics, getSystemHealth } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import Navbar from '@/components/Navbar'
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const CHART_COLORS = ['#3b82f6', '#10b981']

const TOOLTIP_STYLE = {
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  color: '#111827',
  fontSize: '12px',
}

export default function MonitoringPage() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboard-metrics-monitoring'],
    queryFn: getDashboardMetrics,
    refetchInterval: 30_000,
  })

  const { data: revenue } = useQuery({
    queryKey: ['revenue-metrics-monitoring'],
    queryFn: getRevenueMetrics,
    refetchInterval: 60_000,
  })

  const { data: health } = useQuery({
    queryKey: ['system-health-monitoring'],
    queryFn: getSystemHealth,
    refetchInterval: 30_000,
  })

  const tierData = [
    { name: 'Free', value: metrics?.metrics.tierDistribution.free ?? 0 },
    { name: 'Pro',  value: metrics?.metrics.tierDistribution.pro  ?? 0 },
  ]

  const subscriberData = revenue?.trends.monthlyNewSubscribers
    ? Object.entries(revenue.trends.monthlyNewSubscribers).map(([month, count]) => ({
        month,
        subscribers: count,
      }))
    : []

  return (
    <>
      <Navbar />
      <AdminLayout>
        <div className="px-6 py-6 space-y-6">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">Monitoring</h1>
            <p className="page-description">Real-time analytics and system health</p>
          </div>

          {/* ── Analytics ──────────────────────────────────────────── */}
          <section className="space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Analytics</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users',       value: metrics?.metrics.totalUsers ?? 0,          sub: undefined },
                { label: 'Active (30d)',       value: metrics?.metrics.activeUsers ?? 0,         sub: `${metrics?.metrics.activeUsersPercent ?? 0}%` },
                { label: 'Pro Subscriptions', value: revenue?.subscriptions.activeSubs ?? 0,    sub: undefined },
                { label: 'MRR',               value: `$${revenue?.revenue.MRR ?? 0}`,           sub: `ARR $${revenue?.revenue.ARR ?? 0}` },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <p className="stat-label">{s.label}</p>
                  <p className="stat-value">{s.value}</p>
                  {s.sub && <p className="stat-sub">{s.sub}</p>}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Tier distribution pie */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-gray-900">User Tier Distribution</h3>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={tierData}
                        cx="50%" cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                        {tierData.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ color: '#6b7280', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Conversions */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-gray-900">Conversions</h3>
                </div>
                <div className="card-body space-y-3">
                  {[
                    { label: 'Today',      value: metrics?.conversions.today      ?? 0 },
                    { label: 'This month', value: metrics?.conversions.thisMonth  ?? 0 },
                  ].map((r) => (
                    <div key={r.label} className="flex items-center justify-between py-0.5">
                      <span className="text-sm text-gray-500">{r.label}</span>
                      <span className="text-sm font-semibold text-gray-900">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subscriber trend */}
            {subscriberData.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-gray-900">New Subscribers — Last 12 months</h3>
                </div>
                <div className="card-body">
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={subscriberData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} />
                      <Legend wrapperStyle={{ color: '#6b7280', fontSize: '12px' }} />
                      <Line
                        type="monotone"
                        dataKey="subscribers"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={false}
                        name="New Subscribers"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </section>

          {/* ── System Health ────────────────────────────────────────── */}
          <section className="space-y-4 pt-2">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">System Health</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Service status */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-gray-900">Services</h3>
                </div>
                <div className="card-body space-y-3">
                  {[
                    { label: 'API',        status: health?.services.api.status        ?? 'unknown' },
                    { label: 'Database',   status: health?.services.database.status   ?? 'unknown' },
                    { label: 'Claude API', status: health?.services.anthropic.status  ?? 'unknown' },
                  ].map((s) => {
                    const ok = s.status === 'operational' || s.status === 'connected' || s.status === 'active'
                    return (
                      <div key={s.label} className="flex items-center justify-between py-0.5">
                        <span className="text-sm text-gray-500">{s.label}</span>
                        <span className={ok ? 'badge badge-success' : 'badge badge-warning'}>{s.status}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Uptime */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-gray-900">Uptime</h3>
                </div>
                <div className="card-body space-y-4">
                  <div>
                    <p className="stat-label">Hours</p>
                    <p className="stat-value">{health?.services.api.uptime.hours ?? 0}h</p>
                  </div>
                  <div>
                    <p className="stat-label">Days</p>
                    <p className="text-xl font-bold text-gray-900">{health?.services.api.uptime.days ?? 0}d</p>
                  </div>
                </div>
              </div>

              {/* Resources */}
              <div className="card">
                <div className="card-header">
                  <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
                </div>
                <div className="card-body space-y-3">
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <p className="stat-label">Memory Usage</p>
                      <span className="text-xs text-gray-500">{health?.memory.usagePercent ?? 0}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${health?.memory.usagePercent ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Environment */}
            <div className="card">
              <div className="card-header">
                <h3 className="text-sm font-semibold text-gray-900">Environment</h3>
              </div>
              <div className="card-body grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: 'Node Environment', value: health?.environment.nodeEnv     ?? 'unknown' },
                  { label: 'Deployment',        value: health?.environment.deployment ?? 'unknown' },
                  { label: 'AI Model',          value: health?.services.anthropic.model ?? 'unknown' },
                ].map((e) => (
                  <div key={e.label}>
                    <p className="stat-label">{e.label}</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">{e.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </AdminLayout>
    </>
  )
}
