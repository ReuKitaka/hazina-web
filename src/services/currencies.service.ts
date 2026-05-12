import api from '@/lib/api'
import { ExchangeRate, RevaluationResponse } from '@/types'

export const currenciesService = {
  findAll: () => api.get<ExchangeRate[]>('/api/currencies/rates').then(r => r.data),
  create: (data: object) => api.post<ExchangeRate>('/api/currencies/rates', data).then(r => r.data),
  getLatest: (base: string, quote: string, asOf?: string) =>
    api.get<ExchangeRate>('/api/currencies/rates/latest', { params: { base, quote, asOf } }).then(r => r.data),
  revalue: (data: { accountId: string; foreignCurrency: string; fxGainLossAccountId: string; valuationDate: string; notes?: string }) =>
    api.post<RevaluationResponse>('/api/currencies/revalue', data).then(r => r.data),
}
