'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { currenciesService } from '@/services/currencies.service'
import { accountsService } from '@/services/accounts.service'
import { PageHeader } from '@/components/shared/page-header'
import { EmptyState } from '@/components/shared/empty-state'
import { ArrowLeftRight, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fmt } from '@/components/shared/amount'

export default function CurrenciesPage() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [revalOpen, setRevalOpen] = useState(false)
  const [form, setForm] = useState({ baseCurrency: 'USD', quoteCurrency: 'KES', rate: '', effectiveDate: format(new Date(), 'yyyy-MM-dd') })
  const [reval, setReval] = useState({ accountId: '', foreignCurrency: '', fxGainLossAccountId: '', valuationDate: format(new Date(), 'yyyy-MM-dd'), notes: '' })

  const { data: rates = [], isLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: currenciesService.findAll,
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsService.findAll(),
    enabled: revalOpen,
  })

  const create = useMutation({
    mutationFn: () => currenciesService.create({ ...form, rate: parseFloat(form.rate) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['exchangeRates'] }); setOpen(false); toast.success('Rate added') },
    onError: () => toast.error('Failed to add rate'),
  })

  const revalue = useMutation({
    mutationFn: () => currenciesService.revalue(reval),
    onSuccess: (data) => {
      setRevalOpen(false)
      toast.success(`Revaluation posted — JE ${data.journalEntryNumber} | ${data.isGain ? 'FX Gain' : 'FX Loss'} ${fmt(Math.abs(data.fxAdjustment))}`)
    },
    onError: () => toast.error('Revaluation failed'),
  })

  const canReval = reval.accountId && reval.foreignCurrency.length === 3 && reval.fxGainLossAccountId

  return (
    <div>
      <PageHeader title="Exchange Rates" description="Manage currency rates for multi-currency transactions"
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRevalOpen(true)} className="gap-2">
              <RefreshCw className="h-4 w-4" /> Revalue
            </Button>
            <Button onClick={() => setOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add Rate
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : rates.length === 0 ? (
        <EmptyState icon={ArrowLeftRight} title="No exchange rates" description="Add exchange rates to enable multi-currency transactions." />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Pair</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Effective Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rates.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">{r.baseCurrency}</span>
                      <ArrowLeftRight className="h-3 w-3 text-slate-400" />
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">{r.quoteCurrency}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">{r.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{r.effectiveDate}</td>
                  <td className="px-6 py-4 text-sm text-slate-400">{r.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Rate Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Add Exchange Rate</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Base Currency</label>
                <input value={form.baseCurrency} onChange={e => setForm(p => ({ ...p, baseCurrency: e.target.value.toUpperCase() }))} maxLength={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quote Currency</label>
                <input value={form.quoteCurrency} onChange={e => setForm(p => ({ ...p, quoteCurrency: e.target.value.toUpperCase() }))} maxLength={3}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rate (1 {form.baseCurrency} = ? {form.quoteCurrency})</label>
              <input type="number" step="0.000001" value={form.rate} onChange={e => setForm(p => ({ ...p, rate: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="129.50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Effective Date</label>
              <input type="date" value={form.effectiveDate} onChange={e => setForm(p => ({ ...p, effectiveDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={() => create.mutate()} disabled={create.isPending || !form.rate}>
                {create.isPending ? 'Adding…' : 'Add Rate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* FX Revaluation Dialog */}
      <Dialog open={revalOpen} onOpenChange={setRevalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>FX Revaluation</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500 -mt-1">Revalues a foreign-currency account balance using the latest exchange rate and posts the gain/loss journal entry.</p>
          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Account to Revalue</label>
              <select value={reval.accountId} onChange={e => setReval(p => ({ ...p, accountId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select account…</option>
                {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Foreign Currency</label>
              <input value={reval.foreignCurrency} onChange={e => setReval(p => ({ ...p, foreignCurrency: e.target.value.toUpperCase() }))}
                maxLength={3} placeholder="USD"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">FX Gain/Loss Account</label>
              <select value={reval.fxGainLossAccountId} onChange={e => setReval(p => ({ ...p, fxGainLossAccountId: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select account…</option>
                {accounts.filter(a => a.type === 'REVENUE' || a.type === 'EXPENSE').map(a => (
                  <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valuation Date</label>
              <input type="date" value={reval.valuationDate} onChange={e => setReval(p => ({ ...p, valuationDate: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes <span className="text-slate-400 font-normal">(optional)</span></label>
              <input value={reval.notes} onChange={e => setReval(p => ({ ...p, notes: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setRevalOpen(false)}>Cancel</Button>
              <Button onClick={() => revalue.mutate()} disabled={revalue.isPending || !canReval}>
                {revalue.isPending ? 'Processing…' : 'Run Revaluation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
