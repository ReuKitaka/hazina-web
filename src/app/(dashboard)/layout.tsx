'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from '@/components/layout/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { token, isLoading, isSuperAdmin, hasOrgContext } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return
    if (!token) { router.push('/login'); return }
    if (isSuperAdmin && !hasOrgContext && pathname !== '/admin/organisations') {
      router.push('/admin/organisations')
    }
  }, [token, isLoading, isSuperAdmin, hasOrgContext, pathname, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Skeleton className="h-8 w-48" />
      </div>
    )
  }

  if (!token) return null

  return (
    <div className="flex h-full min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col pl-64">
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
