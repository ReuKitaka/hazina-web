'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { AuthResponse } from '@/types'

interface AuthContextType {
  user: { email: string; role: string } | null
  token: string | null
  login: (data: AuthResponse) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ email: string; role: string } | null>(null)
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
    localStorage.setItem('hazina_token', data.token)
    localStorage.setItem('hazina_user', JSON.stringify({ email: data.email, role: data.role }))
    setToken(data.token)
    setUser({ email: data.email, role: data.role })
  }

  const logout = () => {
    localStorage.removeItem('hazina_token')
    localStorage.removeItem('hazina_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
