'use client'

import { useQuery } from '@tanstack/react-query'
import { reportsService } from '@/services/reports.service'
import { arService } from '@/services/ar.service'
import { apService } from '@/services/ap.service'
import { cashbookService } from '@/services/cashbook.service'
import { fmt } from '@/components/shared/amount'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Receipt, ShoppingCart } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { format } from 'date-fns'

const today = format(new Date(), 'yyyy-MM-dd')
const yearStart = `${new Date().getFullYear()}-01-01`

function MetricCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string; trend?: 'up' | 'down'
}) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          trend === 'up'
            ? <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            : <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  )
}

export default function DashboardPage() {
  const { data: pnl, isLoading: pnlLoading } = useQuery({
    queryKey: ['pnl', yearStart, today],
    queryFn: () => reportsService.profitAndLoss(yearStart, today),
  })
  const { data: cashAccounts } = useQuery({
    queryKey: ['cashAccounts'],
    queryFn: cashbookService.findAllAccounts,
  })
  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => arService.findAllInvoices(),
  })
  const { data: bills } = useQuery({
    queryKey: ['bills'],
    queryFn: () => apService.findAllBills(),
  })

  const cashBalance = cashAccounts?.reduce((sum, ca) => sum + (ca.balance ?? 0), 0) ?? 0
  const arOutstanding = invoices
    ?.filter(i => i.status === 'APPROVED' || i.status === 'PARTIALLY_PAID')
    .reduce((sum, i) => sum + i.outstandingAmount, 0) ?? 0
  const apOutstanding = bills
    ?.filter(b => b.status === 'APPROVED' || b.status === 'PARTIALLY_PAID')
    .reduce((sum, b) => sum + b.outstandingAmount, 0) ?? 0

  const chartData = [
    { name: 'Revenue', amount: pnl?.totalRevenue ?? 0 },
    { name: 'Expenses', amount: pnl?.totalExpenses ?? 0 },
    { name: 'Net Income', amount: pnl?.netIncome ?? 0 },
  ]

  if (pnlLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">Year-to-date summary · {new Date().getFullYear()}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="xl:col-span-2">
          <MetricCard label="Total Revenue" value={fmt(pnl?.totalRevenue ?? 0)} sub="YTD" icon={TrendingUp} color="bg-emerald-500" trend="up" />
        </div>
        <div className="xl:col-span-2">
          <MetricCard label="Total Expenses" value={fmt(pnl?.totalExpenses ?? 0)} sub="YTD" icon={TrendingDown} color="bg-red-500" trend="down" />
        </div>
        <div className="xl:col-span-2">
          <MetricCard
            label="Net Income"
            value={fmt(pnl?.netIncome ?? 0)}
            sub="YTD"
            icon={TrendingUp}
            color={(pnl?.netIncome ?? 0) >= 0 ? 'bg-indigo-600' : 'bg-orange-500'}
          />
        </div>
        <div className="xl:col-span-2">
          <MetricCard label="Cash Balance" value={fmt(cashBalance)} sub="All accounts" icon={Wallet} color="bg-sky-500" />
        </div>
        <div className="xl:col-span-2">
          <MetricCard label="AR Outstanding" value={fmt(arOutstanding)} sub="Receivables" icon={Receipt} color="bg-violet-500" />
        </div>
        <div className="xl:col-span-2">
          <MetricCard label="AP Outstanding" value={fmt(apOutstanding)} sub="Payables" icon={ShoppingCart} color="bg-amber-500" />
        </div>
      </div>

      {/* Chart + Summaries */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Bar chart */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Revenue vs Expenses</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,.1)' }} />
              <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* P&L summary */}
        <div className="rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-4">P&L Summary</h3>
          <div className="space-y-3">
            {pnl?.revenues.map(r => (
              <div key={r.accountId} className="flex items-center justify-between text-sm">
                <span className="text-slate-500 truncate mr-2">{r.accountName}</span>
                <span className="font-medium text-emerald-600 shrink-0">{fmt(r.amount)}</span>
              </div>
            ))}
            <div className="border-t border-slate-100 pt-3">
              {pnl?.expenses.map(e => (
                <div key={e.accountId} className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-500 truncate mr-2">{e.accountName}</span>
                  <span className="font-medium text-red-500 shrink-0">({fmt(e.amount)})</span>
                </div>
              ))}
            </div>
            <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">Net Income</span>
              <span className={`text-sm font-bold ${(pnl?.netIncome ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {fmt(pnl?.netIncome ?? 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
