'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsService } from '@/services/accounts.service'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge } from '@/components/shared/amount'
import { useState } from 'react'
import { toast } from 'sonner'
import { Plus, BookOpen } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']
const TYPE_COLORS: Record<string, string> = {
  ASSET: 'bg-sky-50 text-sky-700 border-sky-100',
  LIABILITY: 'bg-red-50 text-red-700 border-red-100',
  EQUITY: 'bg-purple-50 text-purple-700 border-purple-100',
  REVENUE: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  EXPENSE: 'bg-amber-50 text-amber-700 border-amber-100',
}

export default function AccountsPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [form, setForm] = useState({ code: '', name: '', type: 'ASSET', description: '' })

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsService.findAll(),
  })

  const create = useMutation({
    mutationFn: () => accountsService.create(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['accounts'] }); setOpen(false); toast.success('Account created') },
    onError: () => toast.error('Failed to create account'),
  })

  const filtered = accounts.filter(a =>
    !filter || a.type === filter
  )

  return (
    <div>
      <PageHeader
        title="Chart of Accounts"
        description="Manage your general ledger accounts"
        action={
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Account
          </Button>
        }
      />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!filter ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border hover:bg-slate-50'}`}
        >All</button>
        {TYPES.map(t => (
          <button key={t}
            onClick={() => setFilter(filter === t ? '' : t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${filter === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >{t}</button>
        ))}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No accounts yet" description="Create your first account to start tracking finances." />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Normal Balance</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-indigo-600">{a.code}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{a.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[a.type]}`}>
                      {a.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{a.normalBalance}</td>
                  <td className="px-6 py-4"><StatusBadge status={a.active ? 'POSTED' : 'CANCELLED'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Code</label>
                <input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="1000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Cash and Cash Equivalents" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending ? 'Creating…' : 'Create Account'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
