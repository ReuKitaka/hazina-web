import api from '@/lib/api'
import { Account } from '@/types'

export const accountsService = {
  findAll: (type?: string) => api.get<Account[]>('/api/accounts', { params: type ? { type } : {} }).then(r => r.data),
  findById: (id: string) => api.get<Account>(`/api/accounts/${id}`).then(r => r.data),
  getBalance: (id: string) => api.get<number>(`/api/accounts/${id}/balance`).then(r => r.data),
  create: (data: { code: string; name: string; type: string; parentId?: string; description?: string }) =>
    api.post<Account>('/api/accounts', data).then(r => r.data),
  update: (id: string, data: Partial<{ name: string; description: string; active: boolean }>) =>
    api.put<Account>(`/api/accounts/${id}`, data).then(r => r.data),
}
