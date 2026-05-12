'use client'

import { useQuery } from '@tanstack/react-query'
import { reportsService } from '@/services/reports.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { useState } from 'react'
import { format } from 'date-fns'

function Section({ title, lines, total, headerColor }: {
  title: string
  lines: { accountCode: string; accountName: string; balance: number }[]
  total: number
  headerColor: string
}) {
  return (
    <div>
      <div className={`px-6 py-2 text-xs font-bold uppercase tracking-widest ${headerColor}`}>{title}</div>
      {lines.map(l => (
        <div key={l.accountCode} className="flex items-center justify-between px-6 py-3 border-b border-slate-50 hover:bg-slate-50">
          <div>
            <span className="font-mono text-xs text-indigo-500 mr-2">{l.accountCode}</span>
            <span className="text-sm text-slate-700">{l.accountName}</span>
          </div>
          <span className="text-sm font-medium text-slate-900">{fmt(l.balance)}</span>
        </div>
      ))}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100">
        <span className="text-sm font-bold text-slate-700">Total {title}</span>
        <span className="text-sm font-bold text-slate-900">{fmt(total)}</span>
      </div>
    </div>
  )
}

export default function BalanceSheetPage() {
  const [asOf, setAsOf] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data, isLoading } = useQuery({
    queryKey: ['balanceSheet', asOf],
    queryFn: () => reportsService.balanceSheet(asOf),
  })

  const balanced = data ? Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01 : null

  return (
    <div>
      <PageHeader
        title="Balance Sheet"
        description="Financial position as of a given date"
        action={
          <input
            type="date"
            value={asOf}
            onChange={e => setAsOf(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : !data ? null : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Assets */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <Section title="Assets" lines={data.assets} total={data.totalAssets} headerColor="text-blue-700 bg-blue-50" />
          </div>

          {/* Right: Liabilities + Equity */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <Section title="Liabilities" lines={data.liabilities} total={data.totalLiabilities} headerColor="text-purple-700 bg-purple-50" />
            <div className="border-t border-slate-100" />
            <Section title="Equity" lines={data.equity} total={data.totalEquity} headerColor="text-indigo-700 bg-indigo-50" />
            <div className="flex items-center justify-between px-6 py-3 bg-slate-100 border-t-2 border-slate-200">
              <span className="text-sm font-bold text-slate-700">Total Liabilities & Equity</span>
              <span className="text-sm font-bold text-slate-900">{fmt(data.totalLiabilitiesAndEquity)}</span>
            </div>
          </div>

          {/* Balance check */}
          <div className="lg:col-span-2">
            <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${balanced ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
              {balanced
                ? `Balance sheet balances — Total Assets = ${fmt(data.totalAssets)}`
                : `Out of balance: Assets ${fmt(data.totalAssets)} ≠ L+E ${fmt(data.totalLiabilitiesAndEquity)}`}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
