import api from '@/lib/api'
import { Customer, Invoice, ArReceipt } from '@/types'

export const arService = {
  findAllCustomers: () => api.get<Customer[]>('/api/ar/customers').then(r => r.data),
  createCustomer: (data: object) => api.post<Customer>('/api/ar/customers', data).then(r => r.data),
  findAllInvoices: (status?: string) =>
    api.get<Invoice[]>('/api/ar/invoices', { params: status ? { status } : {} }).then(r => r.data),
  findInvoiceById: (id: string) => api.get<Invoice>(`/api/ar/invoices/${id}`).then(r => r.data),
  createInvoice: (data: object) => api.post<Invoice>('/api/ar/invoices', data).then(r => r.data),
  approveInvoice: (id: string) => api.post<Invoice>(`/api/ar/invoices/${id}/approve`).then(r => r.data),
  cancelInvoice: (id: string) => api.post<Invoice>(`/api/ar/invoices/${id}/cancel`).then(r => r.data),
  recordReceipt: (data: object) => api.post<ArReceipt>('/api/ar/receipts', data).then(r => r.data),
}
