'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthResponse } from '@/types'

interface AuthUser {
  email: string
  role: string
  organisationId?: string
  orgName?: string
}

interface AuthContextType {
  user: AuthUser | null
  token: string | null
  isSuperAdmin: boolean
  hasOrgContext: boolean
  login: (data: AuthResponse) => void
  updateToken: (data: AuthResponse) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('hazina_token')
    const storedUser = localStorage.getItem('hazina_user')
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (data: AuthResponse) => {
    const authUser: AuthUser = {
      email: data.email,
      role: data.role,
      organisationId: data.organisationId,
      orgName: data.orgName,
    }
    localStorage.setItem('hazina_token', data.token)
    localStorage.setItem('hazina_user', JSON.stringify(authUser))
    setToken(data.token)
    setUser(authUser)
  }

  /** Updates token after org switch/exit without full logout/login cycle. */
  const updateToken = (data: AuthResponse) => {
    login(data)
  }

  const logout = () => {
    localStorage.removeItem('hazina_token')
    localStorage.removeItem('hazina_user')
    setToken(null)
    setUser(null)
  }

  const isSuperAdmin = user?.role === 'SUPER_ADMIN'
  const hasOrgContext = !!user?.organisationId

  return (
    <AuthContext.Provider value={{ user, token, isSuperAdmin, hasOrgContext, login, updateToken, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}