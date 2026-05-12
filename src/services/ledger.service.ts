import api from '@/lib/api'
import { JournalEntry } from '@/types'

export const ledgerService = {
  findAll: (params?: { from?: string; to?: string; status?: string }) =>
    api.get<JournalEntry[]>('/api/ledger/entries', { params }).then(r => r.data),
  findById: (id: string) => api.get<JournalEntry>(`/api/ledger/entries/${id}`).then(r => r.data),
  create: (data: object) => api.post<JournalEntry>('/api/ledger/entries', data).then(r => r.data),
  post: (id: string) => api.post<JournalEntry>(`/api/ledger/entries/${id}/post`).then(r => r.data),
  reverse: (id: string) => api.post<JournalEntry>(`/api/ledger/entries/${id}/reverse`).then(r => r.data),
}
