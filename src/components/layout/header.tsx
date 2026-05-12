'use client'

import { Bell } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  title?: string
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-6">
      <div className="flex-1">
        {title && <h2 className="text-sm font-medium text-slate-600">{title}</h2>}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <span className="text-sm text-slate-700 hidden sm:block">{user?.email}</span>
        </div>
      </div>
    </header>
  )
}
