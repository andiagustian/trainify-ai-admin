'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from '@/lib/auth'
import clsx from 'clsx'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const DashboardIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
)

const UsersIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const MonitoringIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
)

const AuditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
)

const SignOutIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
)

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [signingOut, setSigningOut] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin_email')
    if (stored) setEmail(stored)
  }, [])

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOut()
      localStorage.removeItem('admin_email')
      sessionStorage.removeItem('admin_email')
      router.push('/auth/login')
    } catch (e) {
      console.error('Sign out error:', e)
    } finally {
      setSigningOut(false)
    }
  }

  const getInitials = (email: string) =>
    email.split('@')[0].split('.').map((p) => p[0]?.toUpperCase()).join('').slice(0, 2)

  const navItems = [
    { label: 'Dashboard', href: '/', icon: <DashboardIcon /> },
    { label: 'Users', href: '/users', icon: <UsersIcon /> },
    { label: 'Admin Mgmt', href: '/admin', icon: <UsersIcon /> },
    { label: 'Monitoring', href: '/monitoring', icon: <MonitoringIcon /> },
    { label: 'Audit Log', href: '/audit-log', icon: <AuditIcon /> },
  ]

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0 shadow-sm">
        {/* Brand */}
        <div className="px-4 h-14 flex items-center border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-7 h-7 bg-blue-600 rounded-md shrink-0">
              <span className="text-[10px] font-bold text-white leading-none">AI</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-none">TrainifyAI</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-none">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <p className="px-2 mb-2 text-[9px] font-semibold uppercase tracking-widest text-gray-400 select-none">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <span className={clsx('shrink-0', isActive ? 'text-blue-600' : 'text-gray-400')}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="px-2 py-3 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-gray-50">
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <span className="text-[9px] font-semibold text-blue-700">
                {email ? getInitials(email) : 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-700 truncate leading-none">
                {email || 'Admin'}
              </p>
              <p className="text-[9px] text-gray-400 mt-0.5 leading-none">Administrator</p>
            </div>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-40 shrink-0"
              title="Sign out"
            >
              <SignOutIcon />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
