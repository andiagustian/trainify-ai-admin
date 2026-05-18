'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  getUserDetail,
  banUser,
  suspendUser,
  resetUsage,
  overrideSubscription,
} from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import Navbar from '@/components/Navbar'

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [userId, setUserId] = useState<string>('')
  const [actionModal, setActionModal] = useState<'ban' | 'suspend' | 'override' | null>(null)
  const [actionReason, setActionReason] = useState('')
  const [overrideTier, setOverrideTier] = useState<'free' | 'starter' | 'pro'>('pro')
  const [overrideExpiry, setOverrideExpiry] = useState('')

  useEffect(() => {
    params.then((p) => setUserId(p.id))
  }, [params])

  const { data: userDetail, isLoading, error, refetch } = useQuery({
    queryKey: ['user-detail', userId],
    queryFn: () => getUserDetail(userId),
    enabled: !!userId,
  })

  const banMutation = useMutation({
    mutationFn: (reason: string) => banUser(userId, reason),
    onSuccess: () => { setActionModal(null); setActionReason(''); refetch() },
  })

  const suspendMutation = useMutation({
    mutationFn: (reason: string) => suspendUser(userId, reason),
    onSuccess: () => { setActionModal(null); setActionReason(''); refetch() },
  })

  const resetUsageMutation = useMutation({
    mutationFn: () => resetUsage(userId),
    onSuccess: () => refetch(),
  })

  const overrideMutation = useMutation({
    mutationFn: () => overrideSubscription(userId, overrideTier, overrideExpiry, 'Manual override'),
    onSuccess: () => {
      setActionModal(null)
      setOverrideTier('pro')
      setOverrideExpiry('')
      refetch()
    },
  })

  if (!userId) return null

  return (
    <>
      <Navbar />
      <AdminLayout>
        <div className="px-6 py-6 space-y-5">
          {/* Header */}
          <div>
            <Link
              href="/users"
              className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors mb-3"
            >
              ← Back to Users
            </Link>
            <h1 className="page-title">User Details</h1>
          </div>

          {isLoading ? (
            <div className="card p-10 text-center text-sm text-gray-500">Loading user details…</div>
          ) : error ? (
            <div className="card p-10 text-center text-sm text-red-400">Failed to load user</div>
          ) : userDetail ? (
            <>
              {/* Info + Subscription */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card">
                  <div className="card-header">
                    <h2 className="text-sm font-semibold text-gray-900">User Information</h2>
                  </div>
                  <div className="card-body space-y-4">
                    <InfoRow label="Email" value={userDetail.user.email} mono={false} />
                    <InfoRow label="User ID" value={userDetail.user.id} mono />
                    <div>
                      <p className="stat-label mb-1.5">Status</p>
                      <span className={
                        userDetail.status.status === 'active'   ? 'badge badge-success' :
                        userDetail.status.status === 'banned'   ? 'badge badge-danger'  :
                                                                   'badge badge-warning'
                      }>
                        {userDetail.status.status}
                      </span>
                      {userDetail.status.reason && (
                        <p className="text-xs text-gray-500 mt-1.5">Reason: {userDetail.status.reason}</p>
                      )}
                    </div>
                    <InfoRow
                      label="Joined"
                      value={new Date(userDetail.user.createdAt).toLocaleDateString()}
                    />
                  </div>
                </div>

                <div className="card">
                  <div className="card-header">
                    <h2 className="text-sm font-semibold text-gray-900">Subscription</h2>
                  </div>
                  <div className="card-body space-y-4">
                    <div>
                      <p className="stat-label mb-1.5">Tier</p>
                      <span className={userDetail.subscription?.tier === 'pro' ? 'badge badge-blue' : 'badge badge-gray'}>
                        {userDetail.subscription?.tier || 'free'}
                      </span>
                    </div>
                    <InfoRow label="Status" value={userDetail.subscription?.status || 'active'} />
                    {userDetail.subscription?.expires_at && (
                      <InfoRow
                        label="Expires"
                        value={new Date(userDetail.subscription.expires_at).toLocaleDateString()}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Usage stats */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-gray-900">Usage Statistics</h2>
                </div>
                <div className="card-body">
                  {userDetail.usage.monthly.length === 0 ? (
                    <p className="text-sm text-gray-500">No usage data</p>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {userDetail.usage.monthly.map((month: any, idx: number) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-[10px] text-gray-500 mb-1">{month.year_month}</p>
                          <p className="text-xl font-bold text-gray-900">{month.conversions}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent documents */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-gray-900">Recent Documents</h2>
                </div>
                <div className="card-body">
                  {userDetail.recentDocuments.length === 0 ? (
                    <p className="text-sm text-gray-500">No documents yet</p>
                  ) : (
                    <div className="space-y-2">
                      {userDetail.recentDocuments.map((doc: any) => (
                        <div
                          key={doc.id}
                          className="flex justify-between items-center px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{doc.mode}</p>
                          </div>
                          <p className="text-xs text-gray-500 shrink-0 ml-4">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Admin actions */}
              <div className="card">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-gray-900">Admin Actions</h2>
                </div>
                <div className="card-body flex flex-wrap gap-2">
                  <button
                    onClick={() => setActionModal('ban')}
                    className="btn-danger text-xs"
                    disabled={userDetail.status.status === 'banned'}
                  >
                    Ban User
                  </button>
                  <button
                    onClick={() => setActionModal('suspend')}
                    className="btn-secondary text-xs"
                    disabled={userDetail.status.status === 'suspended'}
                  >
                    Suspend User
                  </button>
                  <button
                    onClick={() => resetUsageMutation.mutate()}
                    className="btn-secondary text-xs"
                    disabled={resetUsageMutation.isPending}
                  >
                    {resetUsageMutation.isPending ? 'Resetting…' : 'Reset Usage'}
                  </button>
                  <button
                    onClick={() => setActionModal('override')}
                    className="btn-primary text-xs"
                  >
                    Override Subscription
                  </button>
                </div>
              </div>

              {/* Modals */}
              {actionModal === 'ban' && (
                <ActionModal
                  title="Ban User"
                  description="The user will be permanently blocked from accessing the application."
                  onConfirm={() => banMutation.mutate(actionReason)}
                  onCancel={() => { setActionModal(null); setActionReason('') }}
                  loading={banMutation.isPending}
                  danger
                >
                  <div>
                    <label className="label">Reason</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Reason for banning…"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                    />
                  </div>
                </ActionModal>
              )}

              {actionModal === 'suspend' && (
                <ActionModal
                  title="Suspend User"
                  description="The user will be temporarily blocked from accessing the application."
                  onConfirm={() => suspendMutation.mutate(actionReason)}
                  onCancel={() => { setActionModal(null); setActionReason('') }}
                  loading={suspendMutation.isPending}
                >
                  <div>
                    <label className="label">Reason</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Reason for suspension…"
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                    />
                  </div>
                </ActionModal>
              )}

              {actionModal === 'override' && (
                <ActionModal
                  title="Override Subscription"
                  description="Manually change this user's subscription tier."
                  onConfirm={() => overrideMutation.mutate()}
                  onCancel={() => { setActionModal(null); setOverrideTier('pro'); setOverrideExpiry('') }}
                  loading={overrideMutation.isPending}
                >
                  <div className="space-y-3">
                    <div>
                      <label className="label">Tier</label>
                      <select
                        className="input"
                        value={overrideTier}
                        onChange={(e) => setOverrideTier(e.target.value as 'free' | 'starter' | 'pro')}
                      >
                        <option value="free">Free</option>
                        <option value="starter">Starter (Rp 49k/month)</option>
                        <option value="pro">Pro (Rp 69k/month)</option>
                      </select>
                    </div>
                    {overrideTier !== 'free' && (
                      <div>
                        <label className="label">Expiry Date (Optional)</label>
                        <input
                          type="date"
                          className="input"
                          value={overrideExpiry}
                          onChange={(e) => setOverrideExpiry(e.target.value)}
                          placeholder="Leave empty for +30 days"
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to auto-set 30 days from now</p>
                      </div>
                    )}
                  </div>
                </ActionModal>
              )}
            </>
          ) : null}
        </div>
      </AdminLayout>
    </>
  )
}

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="stat-label mb-0.5">{label}</p>
      <p className={`text-sm text-gray-900 ${mono ? 'font-mono' : 'font-medium'}`}>{value}</p>
    </div>
  )
}

function ActionModal({
  title,
  description,
  children,
  onConfirm,
  onCancel,
  loading,
  danger = false,
}: {
  title: string
  description: string
  children: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
  danger?: boolean
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="card max-w-md w-full">
        <div className="card-header">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="card-body space-y-4">
          <p className="text-sm text-gray-500">{description}</p>
          {children}
          <div className="flex gap-2 pt-1">
            <button onClick={onCancel} disabled={loading} className="btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 ${danger ? 'btn-danger' : 'btn-primary'}`}
            >
              {loading ? 'Processing…' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
