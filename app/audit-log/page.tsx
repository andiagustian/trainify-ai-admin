'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditLog } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import Navbar from '@/components/Navbar'
import type { AuditLogEntry } from '@/types'

const ACTION_LABELS: Record<string, string> = {
  list_users:           'List Users',
  view_user:            'View User',
  ban_user:             'Ban User',
  suspend_user:         'Suspend User',
  reset_usage:          'Reset Usage',
  override_subscription:'Override Subscription',
  invite_admin:         'Invite Admin',
}

const ACTION_BADGE: Record<string, string> = {
  ban_user:     'badge badge-danger',
  suspend_user: 'badge badge-warning',
  default:      'badge badge-gray',
}

export default function AuditLogPage() {
  const [filters, setFilters] = useState({ action: 'all', limit: 100 })
  const [page, setPage] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ['audit-log', filters, page],
    queryFn: () =>
      getAuditLog({
        action: filters.action === 'all' ? undefined : filters.action,
        limit: filters.limit,
        offset: page * filters.limit,
      }),
  })

  const logs = data?.data || []

  return (
    <>
      <Navbar />
      <AdminLayout>
        <div className="px-6 py-6 space-y-5">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">Audit Log</h1>
            <p className="page-description">History of all admin actions</p>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="card-body">
              <div className="max-w-xs">
                <label className="label">Action Type</label>
                <select
                  className="input"
                  value={filters.action}
                  onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(0) }}
                >
                  <option value="all">All actions</option>
                  {Object.keys(ACTION_LABELS).map((a) => (
                    <option key={a} value={a}>{ACTION_LABELS[a]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-sm text-gray-500">Loading audit log…</div>
            ) : error ? (
              <div className="p-10 text-center text-sm text-red-400">Failed to load audit log</div>
            ) : logs.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">No entries found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header-row">
                      <th className="table-header-cell">Timestamp</th>
                      <th className="table-header-cell">Admin</th>
                      <th className="table-header-cell">Action</th>
                      <th className="table-header-cell">Target User</th>
                      <th className="table-header-cell">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: AuditLogEntry) => (
                      <tr key={log.id} className="table-row">
                        <td className="table-cell whitespace-nowrap text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="table-cell font-mono text-xs text-gray-500">
                          {log.adminId.slice(0, 8)}…
                        </td>
                        <td className="table-cell">
                          <span className={ACTION_BADGE[log.action] ?? ACTION_BADGE.default}>
                            {ACTION_LABELS[log.action] ?? log.action}
                          </span>
                        </td>
                        <td className="table-cell font-mono text-xs text-gray-500">
                          {log.targetUserId ? `${log.targetUserId.slice(0, 8)}…` : '—'}
                        </td>
                        <td className="table-cell">
                          <button
                            className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                            onClick={() => alert(JSON.stringify(log.details, null, 2))}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {logs.length > 0 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {page * filters.limit + 1}–{Math.min((page + 1) * filters.limit, logs.length)} entries
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={logs.length < filters.limit}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
