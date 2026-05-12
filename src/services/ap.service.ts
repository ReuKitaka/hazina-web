import api from '@/lib/api'
import { Supplier, Bill, ApPayment } from '@/types'

export const apService = {
  findAllSuppliers: () => api.get<Supplier[]>('/api/ap/suppliers').then(r => r.data),
  createSupplier: (data: object) => api.post<Supplier>('/api/ap/suppliers', data).then(r => r.data),
  findAllBills: (status?: string) =>
    api.get<Bill[]>('/api/ap/bills', { params: status ? { status } : {} }).then(r => r.data),
  findBillById: (id: string) => api.get<Bill>(`/api/ap/bills/${id}`).then(r => r.data),
  createBill: (data: object) => api.post<Bill>('/api/ap/bills', data).then(r => r.data),
  approveBill: (id: string) => api.post<Bill>(`/api/ap/bills/${id}/approve`).then(r => r.data),
  cancelBill: (id: string) => api.post<Bill>(`/api/ap/bills/${id}/cancel`).then(r => r.data),
  recordPayment: (data: object) => api.post<ApPayment>('/api/ap/payments', data).then(r => r.data),
}
