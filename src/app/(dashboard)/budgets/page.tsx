'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsService } from '@/services/budgets.service'
import { accountsService } from '@/services/accounts.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { Target, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Budget, BudgetStatus } from '@/types'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'

const input = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const label = 'block text-sm font-medium text-slate-700 mb-1'

function NewBudgetDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsService.findAll() })
  const [form, setForm] = useState({
    name: '',
    accountId: '',
    periodStart: format(new Date(), 'yyyy-MM-01'),
    periodEnd: format(new Date(), 'yyyy-MM-dd'),
    budgetAmount: '',
    notes: '',
  })

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  const create = useMutation({
    mutationFn: () => budgetsService.create({ ...form, budgetAmount: parseFloat(form.budgetAmount) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success('Budget created'); onClose() },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create budget'),
  })

  const canSubmit = form.name && form.accountId && form.periodStart && form.periodEnd &&
    form.budgetAmount && parseFloat(form.budgetAmount) > 0

  const expenseAccounts = accounts.filter(a => a.type === 'EXPENSE')

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>New Budget</DialogTitle></DialogHeader>
      <div className="space-y-4 mt-2">
        <div>
          <label className={label}>Budget Name</label>
          <input className={input} value={form.name} onChange={set('name')} required placeholder="e.g. Q1 Marketing Spend" />
        </div>
        <div>
          <label className={label}>Expense Account</label>
          <select className={input} value={form.accountId} onChange={set('accountId')}>
            <option value="">Select account…</option>
            {expenseAccounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
          </select>
          {accounts.length > 0 && expenseAccounts.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">No expense accounts found. Create one under Accounts first.</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Period Start</label>
            <input type="date" className={input} value={form.periodStart} onChange={set('periodStart')} />
          </div>
          <div>
            <label className={label}>Period End</label>
            <input type="date" className={input} value={form.periodEnd} onChange={set('periodEnd')} />
          </div>
        </div>
        <div>
          <label className={label}>Budget Amount</label>
          <input type="number" step="0.01" className={input} value={form.budgetAmount} onChange={set('budgetAmount')} placeholder="0.00" />
        </div>
        <div>
          <label className={label}>Notes <span className="text-slate-400">(optional)</span></label>
          <textarea className={input} rows={2} value={form.notes} onChange={set('notes')} placeholder="Any notes about this budget…" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !canSubmit}>
            {create.isPending ? 'Creating…' : 'Create Budget'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

function BudgetCard({ budget, onDelete }: { budget: Budget; onDelete: (id: string) => void }) {
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
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{budget.name}</h3>
          <p className="text-sm text-slate-500">{budget.accountCode} · {budget.accountName}</p>
        </div>
        <div className="flex items-center gap-2 ml-2 shrink-0">
          {status && (
            <span className={`text-xs font-bold uppercase tracking-wide ${alertColors[level]}`}>{level}</span>
          )}
          <button onClick={() => onDelete(budget.id)} className="text-slate-300 hover:text-red-400 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
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
  const qc = useQueryClient()
  const [showNew, setShowNew] = useState(false)

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: budgetsService.findAll,
  })

  const deleteBudget = useMutation({
    mutationFn: (id: string) => budgetsService.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['budgets'] }); toast.success('Budget deleted') },
    onError: () => toast.error('Failed to delete budget'),
  })

  return (
    <div>
      <PageHeader title="Budgets" description="Spending limits and live budget tracking"
        action={
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Budget
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-52 bg-slate-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState icon={Target} title="No budgets yet" description="Create a budget to start tracking spending against a limit." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map(b => (
            <BudgetCard key={b.id} budget={b} onDelete={id => deleteBudget.mutate(id)} />
          ))}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={v => !v && setShowNew(false)}>
        <NewBudgetDialog onClose={() => setShowNew(false)} />
      </Dialog>
    </div>
  )
}