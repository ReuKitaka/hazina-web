'use client'

import { useQuery } from '@tanstack/react-query'
import { reportsService } from '@/services/reports.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { format } from 'date-fns'
import { ReportDownloadButtons } from '@/components/report-downloads'

const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-blue-50 text-blue-700',
  LIABILITY: 'bg-purple-50 text-purple-700',
  EQUITY: 'bg-indigo-50 text-indigo-700',
  REVENUE: 'bg-emerald-50 text-emerald-700',
  EXPENSE: 'bg-rose-50 text-rose-700',
}

export default function TrialBalancePage() {
  const [asOf, setAsOf] = useState(format(new Date(), 'yyyy-MM-dd'))

  const { data, isLoading } = useQuery({
    queryKey: ['trialBalance', asOf],
    queryFn: () => reportsService.trialBalance(asOf),
  })

  const balanced = data ? Math.abs(data.totalDebits - data.totalCredits) < 0.01 : null

  return (
    <div>
      <PageHeader
        title="Trial Balance"
        description="All account balances as of a given date"
        action={
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={asOf}
              onChange={e => setAsOf(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {data && <ReportDownloadButtons report="trial-balance" data={data} />}
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : !data ? null : (
        <>
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden mb-6">
            <table className="min-w-full divide-y divide-slate-100">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Debit</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.lines.map(line => (
                  <tr key={line.accountId} className="hover:bg-slate-50">
                    <td className="px-6 py-3 text-sm font-mono font-semibold text-indigo-600">{line.accountCode}</td>
                    <td className="px-6 py-3 text-sm text-slate-900">{line.accountName}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLORS[line.accountType] ?? 'bg-slate-100 text-slate-600'}`}>
                        {line.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-slate-700">
                      {line.debitBalance > 0 ? fmt(line.debitBalance) : '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-medium text-slate-700">
                      {line.creditBalance > 0 ? fmt(line.creditBalance) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={3} className="px-6 py-3 text-sm font-bold text-slate-700 uppercase tracking-wide">Totals</td>
                  <td className="px-6 py-3 text-sm text-right font-bold text-slate-900">{fmt(data.totalDebits)}</td>
                  <td className="px-6 py-3 text-sm text-right font-bold text-slate-900">{fmt(data.totalCredits)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold ${balanced ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            <BarChart3 className="h-4 w-4" />
            {balanced ? 'Trial balance is balanced' : `Out of balance by ${fmt(Math.abs((data.totalDebits ?? 0) - (data.totalCredits ?? 0)))}`}
          </div>
        </>
      )}
    </div>
  )
}
