'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from '@tanstack/react-query'
import { inviteAdmin, getAdmins, deleteAdmin } from '@/lib/api'
import AdminLayout from '@/components/AdminLayout'
import Navbar from '@/components/Navbar'

export default function AdminManagementPage() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin')
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch admin list
  const { data: adminListData, isLoading: isLoadingAdmins, refetch: refetchAdmins } = useQuery({
    queryKey: ['admins'],
    queryFn: getAdmins,
    retry: 1,
  })

  const mutation = useMutation({
    mutationFn: () => inviteAdmin(email, role),
    onSuccess: (data) => {
      if (data.success) {
        setSuccessMessage(`✅ ${data.message}`)
        if (!data.emailSent) {
          setSuccessMessage(`⚠️ Admin dibuat tapi email gagal: ${data.warning}`)
        }
        setEmail('')
        setRole('admin')
        refetchAdmins()
        setTimeout(() => setSuccessMessage(''), 5000)
      }
    },
    onError: (error: any) => {
      setErrorMessage(`❌ ${error.message || 'Gagal mengundang admin'}`)
      setTimeout(() => setErrorMessage(''), 5000)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (adminId: string) => deleteAdmin(adminId),
    onSuccess: (data) => {
      setSuccessMessage(`✅ ${data.message}`)
      refetchAdmins()
      setTimeout(() => setSuccessMessage(''), 5000)
    },
    onError: (error: any) => {
      setErrorMessage(`❌ ${error.message || 'Gagal menghapus admin'}`)
      setTimeout(() => setErrorMessage(''), 5000)
    },
  })

  return (
    <>
      <Navbar />
      <AdminLayout>
        <div className="px-6 py-6 space-y-6">
          {/* Page header */}
          <div className="page-header">
            <h1 className="page-title">Admin Management</h1>
            <p className="page-description">Kelola admin dan superadmin platform</p>
          </div>

          {/* Messages */}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {/* Invite admin card */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-gray-900">Undang Admin Baru</h2>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  className="input"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'superadmin')}
                  disabled={mutation.isPending}
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  • <strong>Admin:</strong> Kelola users, view analytics, manage subscriptions
                  <br />
                  • <strong>Super Admin:</strong> Semua yang admin bisa, plus: ban/suspend users, audit logs, invite admins
                </p>
              </div>

              <button
                onClick={() => mutation.mutate()}
                disabled={!email || mutation.isPending}
                className="btn-primary w-full"
              >
                {mutation.isPending ? 'Mengirim...' : 'Kirim Undangan'}
              </button>

              <p className="text-xs text-gray-400">
                💡 Admin akan menerima email dengan link magic untuk setup akun mereka. Link berlaku 24 jam.
              </p>
            </div>
          </div>

          {/* Admin list card */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-gray-900">Admin yang Terdaftar</h2>
              <span className="badge badge-info">{adminListData?.total || 0}</span>
            </div>
            <div className="card-body">
              {isLoadingAdmins ? (
                <div className="text-center py-8 text-gray-500">Loading admin list...</div>
              ) : !adminListData?.admins || adminListData.admins.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Belum ada admin yang terdaftar</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Dibuat</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminListData.admins.map((admin) => (
                        <tr key={admin.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-xs text-gray-900">{admin.email}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              admin.role === 'superadmin'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {admin.role === 'superadmin' ? '👑 Super Admin' : '🔑 Admin'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              admin.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : admin.status === 'never_logged_in'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {admin.status === 'active' ? '🟢 Aktif' : admin.status === 'never_logged_in' ? '⏳ Pending' : '⏸️ Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-600">
                            {new Date(admin.created_at).toLocaleDateString('id-ID')}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                if (confirm(`Hapus admin ${admin.email}?`)) {
                                  deleteMutation.mutate(admin.id)
                                }
                              }}
                              disabled={deleteMutation.isPending}
                              className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="card bg-blue-50 border border-blue-100">
            <div className="card-body space-y-2">
              <h3 className="text-sm font-semibold text-blue-900">📋 Perbedaan Role</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <div>
                  <strong>Admin:</strong>
                  <ul className="list-disc list-inside text-xs ml-1">
                    <li>Lihat users, filter tier & status</li>
                    <li>View analytics & revenue metrics</li>
                    <li>Override subscription (upgrade/downgrade)</li>
                    <li>Reset usage counter</li>
                  </ul>
                </div>
                <div>
                  <strong>Super Admin:</strong>
                  <ul className="list-disc list-inside text-xs ml-1">
                    <li>Semua yang Admin bisa</li>
                    <li>Ban / Suspend users</li>
                    <li>Lihat audit log lengkap</li>
                    <li>Invite admin / superadmin lain</li>
                    <li>Kelola admin lain (delete)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Back link */}
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 underline">
            ← Kembali ke Dashboard
          </Link>
        </div>
      </AdminLayout>
    </>
  )
}
