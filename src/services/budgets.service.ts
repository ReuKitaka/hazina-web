import api from '@/lib/api'
import { Budget, BudgetStatus } from '@/types'

export const budgetsService = {
  findAll: () => api.get<Budget[]>('/api/budgets').then(r => r.data),
  findById: (id: string) => api.get<Budget>(`/api/budgets/${id}`).then(r => r.data),
  getStatus: (id: string) => api.get<BudgetStatus>(`/api/budgets/${id}/status`).then(r => r.data),
  create: (data: object) => api.post<Budget>('/api/budgets', data).then(r => r.data),
  update: (id: string, data: object) => api.put<Budget>(`/api/budgets/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/api/budgets/${id}`).then(r => r.data),
}
