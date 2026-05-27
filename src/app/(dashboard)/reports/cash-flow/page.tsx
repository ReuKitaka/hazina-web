'use client'

import { useQuery } from '@tanstack/react-query'
import { reportsService } from '@/services/reports.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { useState } from 'react'
import { format, startOfMonth } from 'date-fns'
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { ReportDownloadButtons } from '@/components/report-downloads'

export default function CashFlowPage() {
  const [from, setFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data, isLoading } = useQuery({
    queryKey: ['cashFlow', from, to],
    queryFn: () => reportsService.cashFlow(from, to),
  })

  return (
    <div>
      <PageHeader
        title="Cash Flow"
        description="Cash receipts and payments for the selected period"
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <span className="text-slate-400 text-sm">to</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {data && <ReportDownloadButtons report="cash-flow" data={data} />}
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : !data ? null : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <div className="flex items-center gap-2 mb-1">
                <ArrowDownCircle className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">Total Receipts</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{fmt(data.totalReceipts)}</p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-5">
              <div className="flex items-center gap-2 mb-1">
                <ArrowUpCircle className="h-4 w-4 text-rose-600" />
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wide">Total Payments</span>
              </div>
              <p className="text-2xl font-bold text-rose-700">{fmt(data.totalPayments)}</p>
            </div>
            <div className={`rounded-2xl border p-5 ${data.netCashFlow >= 0 ? 'border-indigo-100 bg-indigo-50' : 'border-red-100 bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold uppercase tracking-wide ${data.netCashFlow >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>Net Cash Flow</span>
              </div>
              <p className={`text-2xl font-bold ${data.netCashFlow >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>{fmt(data.netCashFlow)}</p>
            </div>
          </div>

          {/* Receipts table */}
          {data.receipts.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-emerald-50 text-xs font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                <ArrowDownCircle className="h-3.5 w-3.5" /> Receipts
              </div>
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ref</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.receipts.map(r => (
                    <tr key={r.transactionId} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm text-slate-500">{r.date}</td>
                      <td className="px-6 py-3 text-sm text-slate-900">{r.description}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">{r.cashAccountName || '—'}</td>
                      <td className="px-6 py-3 text-sm font-mono text-slate-400">{r.reference || '—'}</td>
                      <td className="px-6 py-3 text-sm text-right font-semibold text-emerald-600">{fmt(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Payments table */}
          {data.payments.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-3 bg-rose-50 text-xs font-bold uppercase tracking-widest text-rose-700 flex items-center gap-2">
                <ArrowUpCircle className="h-3.5 w-3.5" /> Payments
              </div>
              <table className="min-w-full divide-y divide-slate-100">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Account</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ref</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.payments.map(p => (
                    <tr key={p.transactionId} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-sm text-slate-500">{p.date}</td>
                      <td className="px-6 py-3 text-sm text-slate-900">{p.description}</td>
                      <td className="px-6 py-3 text-sm text-slate-500">{p.cashAccountName || '—'}</td>
                      <td className="px-6 py-3 text-sm font-mono text-slate-400">{p.reference || '—'}</td>
                      <td className="px-6 py-3 text-sm text-right font-semibold text-rose-600">{fmt(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
