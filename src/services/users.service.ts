import api from '@/lib/api'
import { UserProfile } from '@/types'

export const usersService = {
  findAll: () => api.get<UserProfile[]>('/api/users').then(r => r.data),
  toggleActive: (id: string) => api.patch<UserProfile>(`/api/users/${id}/toggle-active`).then(r => r.data),
  register: (data: { email: string; password: string; firstName: string; lastName: string; role: string }) =>
    api.post<UserProfile>('/api/auth/register', data).then(r => r.data),
}
