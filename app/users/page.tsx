'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { getUsers } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import Navbar from '@/components/Navbar'
import type { AppUser } from '@/types'

export default function UsersPage() {
  const [filters, setFilters] = useState({
    search: '',
    tier: 'all' as 'all' | 'free' | 'pro',
    status: 'all' as 'all' | 'active' | 'banned' | 'suspended',
  })
  const [page, setPage] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', filters, page],
    queryFn: () =>
      getUsers({
        search: filters.search || undefined,
        tier: filters.tier === 'all' ? undefined : filters.tier,
        status: filters.status === 'all' ? undefined : filters.status,
        limit: 50,
        offset: page * 50,
      }),
  })

  const users = data?.data || []
  const pagination = data?.pagination

  return (
    <>
      <Navbar />
      <AdminLayout>
        <div className="px-6 py-6 space-y-5">
          {/* Header */}
          <div className="page-header">
            <h1 className="page-title">Users</h1>
            <p className="page-description">Manage and monitor all registered users</p>
          </div>

          {/* Filters */}
          <div className="card">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="label">Search by email</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="user@example.com"
                    value={filters.search}
                    onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(0) }}
                  />
                </div>
                <div>
                  <label className="label">Tier</label>
                  <select
                    className="input"
                    value={filters.tier}
                    onChange={(e) => { setFilters({ ...filters, tier: e.target.value as any }); setPage(0) }}
                  >
                    <option value="all">All tiers</option>
                    <option value="free">Free</option>
                    <option value="pro">Pro</option>
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    className="input"
                    value={filters.status}
                    onChange={(e) => { setFilters({ ...filters, status: e.target.value as any }); setPage(0) }}
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            {isLoading ? (
              <div className="p-10 text-center text-sm text-gray-500">Loading users…</div>
            ) : error ? (
              <div className="p-10 text-center text-sm text-red-400">Failed to load users</div>
            ) : users.length === 0 ? (
              <div className="p-10 text-center text-sm text-gray-500">No users found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-header-row">
                      <th className="table-header-cell">Email</th>
                      <th className="table-header-cell">Tier</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Documents</th>
                      <th className="table-header-cell">Joined</th>
                      <th className="table-header-cell"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user: AppUser) => (
                      <tr key={user.id} className="table-row">
                        <td className="table-cell font-medium text-gray-900">{user.email}</td>
                        <td className="table-cell">
                          <span className={user.tier === 'pro' ? 'badge badge-blue' : 'badge badge-gray'}>
                            {user.tier}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span className={
                            user.status === 'active'
                              ? 'badge badge-success'
                              : user.status === 'banned'
                                ? 'badge badge-danger'
                                : 'badge badge-warning'
                          }>
                            {user.status}
                          </span>
                        </td>
                        <td className="table-cell text-gray-500">{user.documentCount}</td>
                        <td className="table-cell text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="table-cell">
                          <Link
                            href={`/users/${user.id}`}
                            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination && pagination.total > 50 && (
              <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {page * 50 + 1}–{Math.min((page + 1) * 50, pagination.total)} of {pagination.total} users
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
                    disabled={!pagination.hasMore}
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
