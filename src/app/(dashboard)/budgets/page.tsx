'use client'

import { useQuery } from '@tanstack/react-query'
import { budgetsService } from '@/services/budgets.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { Target } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useEffect, useState } from 'react'
import { Budget, BudgetStatus } from '@/types'

function BudgetCard({ budget }: { budget: Budget }) {
  const [status, setStatus] = useState<BudgetStatus | null>(null)

  useEffect(() => {
    budgetsService.getStatus(budget.id).then(setStatus).catch(() => {})
  }, [budget.id])

  const alertColors = { OK: 'text-emerald-600', WARNING: 'text-amber-600', EXCEEDED: 'text-red-600' }
  const progressColors = { OK: 'bg-emerald-500', WARNING: 'bg-amber-500', EXCEEDED: 'bg-red-500' }
  const level = status?.alertLevel ?? 'OK'

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">{budget.name}</h3>
          <p className="text-sm text-slate-500">{budget.accountCode} · {budget.accountName}</p>
        </div>
        {status && (
          <span className={`text-xs font-bold uppercase tracking-wide ${alertColors[level]}`}>{level}</span>
        )}
      </div>
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Budget</span>
          <span className="font-semibold text-slate-900">{fmt(budget.budgetAmount)}</span>
        </div>
        {status && (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Spent</span>
              <span className="font-semibold text-slate-900">{fmt(status.spentAmount)}</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className={`h-2 rounded-full transition-all ${progressColors[level]}`}
                style={{ width: `${Math.min(status.percentUsed, 100)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-slate-400">
              <span>{status.percentUsed}% used</span>
              <span className={level === 'EXCEEDED' ? 'text-red-500 font-semibold' : ''}>
                {fmt(status.remainingAmount)} remaining
              </span>
            </div>
          </>
        )}
        <p className="text-xs text-slate-400">{budget.periodStart} → {budget.periodEnd}</p>
      </div>
    </div>
  )
}

export default function BudgetsPage() {
  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: budgetsService.findAll,
  })

  return (
    <div>
      <PageHeader title="Budgets" description="Spending limits and live budget tracking" />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-52 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState icon={Target} title="No budgets yet" description="Create budgets via the API to track spending." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map(b => <BudgetCard key={b.id} budget={b} />)}
        </div>
      )}
    </div>
  )
}
