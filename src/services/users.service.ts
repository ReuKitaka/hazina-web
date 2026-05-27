import api from '@/lib/api'
import { UserProfile } from '@/types'

export interface CreateUserPayload {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: string
}

export const usersService = {
  findAll: () => api.get<UserProfile[]>('/api/users').then(r => r.data),
  create: (data: CreateUserPayload) => api.post<UserProfile>('/api/users', data).then(r => r.data),
  toggleActive: (id: string) => api.patch<UserProfile>(`/api/users/${id}/toggle-active`).then(r => r.data),

  findSuperAdmins: () => api.get<UserProfile[]>('/api/users/super-admins').then(r => r.data),
  createSuperAdmin: (data: CreateUserPayload) =>
    api.post<UserProfile>('/api/users/super-admins', data).then(r => r.data),
}
