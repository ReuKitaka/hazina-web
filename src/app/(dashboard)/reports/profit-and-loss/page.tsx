'use client'

import { useQuery } from '@tanstack/react-query'
import { reportsService } from '@/services/reports.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { useState } from 'react'
import { format, startOfMonth } from 'date-fns'
import { ReportDownloadButtons } from '@/components/report-downloads'

function Section({ title, lines, total, color }: {
  title: string
  lines: { accountCode: string; accountName: string; amount: number }[]
  total: number
  color: string
}) {
  return (
    <div>
      <div className={`px-6 py-2 text-xs font-bold uppercase tracking-widest ${color}`}>{title}</div>
      {lines.map(l => (
        <div key={l.accountCode} className="flex items-center justify-between px-6 py-3 border-b border-slate-50 hover:bg-slate-50">
          <div>
            <span className="font-mono text-xs text-indigo-500 mr-2">{l.accountCode}</span>
            <span className="text-sm text-slate-700">{l.accountName}</span>
          </div>
          <span className="text-sm font-medium text-slate-900">{fmt(l.amount)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50">
        <span className="text-sm font-bold text-slate-700">Total {title}</span>
        <span className="text-sm font-bold text-slate-900">{fmt(total)}</span>
      </div>
    </div>
  )
}

export default function ProfitAndLossPage() {
  const [from, setFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data, isLoading } = useQuery({
    queryKey: ['profitAndLoss', from, to],
    queryFn: () => reportsService.profitAndLoss(from, to),
  })

  return (
    <div>
      <PageHeader
        title="Profit & Loss"
        description="Revenue and expenses for the selected period"
        action={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <span className="text-slate-400 text-sm">to</span>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {data && <ReportDownloadButtons report="profit-and-loss" data={data} />}
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : !data ? null : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <Section title="Revenue" lines={data.revenues} total={data.totalRevenue} color="text-emerald-700 bg-emerald-50" />

          <div className="border-t border-slate-100" />
          <Section title="Expenses" lines={data.expenses} total={data.totalExpenses} color="text-rose-700 bg-rose-50" />

          <div className="border-t-2 border-slate-200">
            <div className={`flex items-center justify-between px-6 py-4 ${data.netIncome >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <span className={`text-base font-bold ${data.netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {data.netIncome >= 0 ? 'Net Income' : 'Net Loss'}
              </span>
              <span className={`text-lg font-bold ${data.netIncome >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                {fmt(Math.abs(data.netIncome))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
