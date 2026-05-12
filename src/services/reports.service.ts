import api from '@/lib/api'
import { TrialBalanceReport, ProfitAndLossReport, BalanceSheetReport, CashFlowReport } from '@/types'

export const reportsService = {
  trialBalance: (asOf?: string) =>
    api.get<TrialBalanceReport>('/api/reports/trial-balance', { params: asOf ? { asOf } : {} }).then(r => r.data),
  profitAndLoss: (from?: string, to?: string) =>
    api.get<ProfitAndLossReport>('/api/reports/profit-and-loss', { params: { from, to } }).then(r => r.data),
  balanceSheet: (asOf?: string) =>
    api.get<BalanceSheetReport>('/api/reports/balance-sheet', { params: asOf ? { asOf } : {} }).then(r => r.data),
  cashFlow: (from?: string, to?: string) =>
    api.get<CashFlowReport>('/api/reports/cash-flow', { params: { from, to } }).then(r => r.data),
}
