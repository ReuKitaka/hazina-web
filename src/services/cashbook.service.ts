import api from '@/lib/api'
import { CashAccount, CashTransaction } from '@/types'

export const cashbookService = {
  findAllAccounts: () => api.get<CashAccount[]>('/api/cashbook/accounts').then(r => r.data),
  getBalance: (id: string) => api.get<number>(`/api/cashbook/accounts/${id}/balance`).then(r => r.data),
  createAccount: (data: object) => api.post<CashAccount>('/api/cashbook/accounts', data).then(r => r.data),
  findTransactions: (accountId: string) =>
    api.get<CashTransaction[]>(`/api/cashbook/accounts/${accountId}/transactions`).then(r => r.data),
  recordTransaction: (data: object) => api.post<CashTransaction>('/api/cashbook/transactions', data).then(r => r.data),
}
