'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, BookOpen, FileText, Wallet, Receipt,
  ShoppingCart, Target, ArrowLeftRight, BarChart3, TrendingUp,
  Building2, Activity, ChevronRight, LogOut, Users, LogOut as ExitIcon
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useMutation } from '@tanstack/react-query'
import { organisationsService } from '@/services/organisations.service'
import { toast } from 'sonner'

const nav = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Finance',
    items: [
      { label: 'Accounts', href: '/accounts', icon: BookOpen },
      { label: 'Journal Entries', href: '/ledger', icon: FileText },
    ],
  },
  {
    group: 'Operations',
    items: [
      { label: 'Cash Book', href: '/cashbook', icon: Wallet },
      { label: 'Receivables', href: '/ar', icon: Receipt },
      { label: 'Payables', href: '/ap', icon: ShoppingCart },
    ],
  },
  {
    group: 'Planning',
    items: [
      { label: 'Budgets', href: '/budgets', icon: Target },
      { label: 'Currencies', href: '/currencies', icon: ArrowLeftRight },
    ],
  },
  {
    group: 'Reports',
    items: [
      { label: 'Trial Balance', href: '/reports/trial-balance', icon: BarChart3 },
      { label: 'Profit & Loss', href: '/reports/profit-and-loss', icon: TrendingUp },
      { label: 'Balance Sheet', href: '/reports/balance-sheet', icon: Building2 },
      { label: 'Cash Flow', href: '/reports/cash-flow', icon: Activity },
    ],
  },
  {
    group: 'Settings',
    items: [{ label: 'Users', href: '/settings/users', icon: Users }],
  },
]

const superAdminNav = [
  {
    group: 'Administration',
    items: [
      { label: 'Organisations', href: '/admin/organisations', icon: Building2 },
      { label: 'Super Admins', href: '/admin/users', icon: Users },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, isSuperAdmin, hasOrgContext, logout, updateToken } = useAuth()
  const router = useRouter()

  const exitOrg = useMutation({
    mutationFn: () => organisationsService.exitOrg(),
    onSuccess: (data) => {
      updateToken(data)
      toast.success('Exited organisation view')
      router.push('/admin/organisations')
    },
  })

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const visibleNav = isSuperAdmin && !hasOrgContext ? superAdminNav : nav

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
          <span className="text-sm font-bold text-white">H</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">Hazina</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Treasury System</p>
        </div>
      </div>

      {/* Org context banner for SUPER_ADMIN */}
      {isSuperAdmin && hasOrgContext && (
        <div className="mx-3 mt-3 rounded-lg bg-indigo-900/50 border border-indigo-700 px-3 py-2">
          <p className="text-[10px] text-indigo-300 font-semibold uppercase tracking-wider">Viewing</p>
          <p className="text-xs text-white font-medium truncate">{user?.orgName}</p>
          <button
            onClick={() => exitOrg.mutate()}
            className="mt-1 flex items-center gap-1 text-[10px] text-indigo-300 hover:text-white transition-colors"
          >
            <ExitIcon className="h-3 w-3" /> Exit org view
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {visibleNav.map((section) => (
          <div key={section.group}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        active
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight className="h-3 w-3 opacity-60" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}

        {/* Also show org nav when SUPER_ADMIN is inside an org */}
        {isSuperAdmin && hasOrgContext && superAdminNav.map((section) => (
          <div key={section.group}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {section.group}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + '/')
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                        active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {active && <ChevronRight className="h-3 w-3 opacity-60" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.email}</p>
            <p className="text-[10px] text-slate-400">{user?.role}</p>
          </div>
          <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}