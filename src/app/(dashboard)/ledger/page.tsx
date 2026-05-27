'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ledgerService } from '@/services/ledger.service'
import { accountsService } from '@/services/accounts.service'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge, fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { toast } from 'sonner'
import { FileText, CheckCircle, RotateCcw, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react'
import { useState, Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { format } from 'date-fns'

const input = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const label = 'block text-sm font-medium text-slate-700 mb-1'

interface JELine {
  accountId: string
  description: string
  debitAmount: string
  creditAmount: string
}

const emptyLine = (): JELine => ({ accountId: '', description: '', debitAmount: '', creditAmount: '' })

function NewJournalEntryDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsService.findAll() })

  const [form, setForm] = useState({
    entryDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    reference: '',
  })
  const [lines, setLines] = useState<JELine[]>([emptyLine(), emptyLine()])

  const setF = (f: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  const setLine = (i: number, f: keyof JELine) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLines(prev => prev.map((l, idx) => {
      if (idx !== i) return l
      const updated = { ...l, [f]: e.target.value }
      // Entering a debit clears credit and vice versa
      if (f === 'debitAmount' && e.target.value) updated.creditAmount = ''
      if (f === 'creditAmount' && e.target.value) updated.debitAmount = ''
      return updated
    }))
  }

  const addLine = () => setLines(p => [...p, emptyLine()])
  const removeLine = (i: number) => setLines(p => p.filter((_, idx) => idx !== i))

  const totalDebits = lines.reduce((s, l) => s + (parseFloat(l.debitAmount) || 0), 0)
  const totalCredits = lines.reduce((s, l) => s + (parseFloat(l.creditAmount) || 0), 0)
  const balanced = Math.abs(totalDebits - totalCredits) < 0.001 && totalDebits > 0
  const diff = Math.abs(totalDebits - totalCredits)

  const create = useMutation({
    mutationFn: () => ledgerService.create({
      entryDate: form.entryDate,
      description: form.description,
      reference: form.reference || undefined,
      lines: lines.map(l => ({
        accountId: l.accountId,
        description: l.description || undefined,
        debitAmount: parseFloat(l.debitAmount) || undefined,
        creditAmount: parseFloat(l.creditAmount) || undefined,
      })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ledger'] })
      toast.success('Journal entry created')
      onClose()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create entry'),
  })

  const canSubmit = form.description && form.entryDate && balanced &&
    lines.every(l => l.accountId && (parseFloat(l.debitAmount) > 0 || parseFloat(l.creditAmount) > 0))

  return (
    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>New Journal Entry</DialogTitle></DialogHeader>
      <div className="space-y-5 mt-2">

        {/* Header fields */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={label}>Date</label>
            <input type="date" className={input} value={form.entryDate} onChange={setF('entryDate')} />
          </div>
          <div className="col-span-2">
            <label className={label}>Description</label>
            <input className={input} value={form.description} onChange={setF('description')} placeholder="e.g. Depreciation adjustment — May 2026" />
          </div>
        </div>
        <div>
          <label className={label}>Reference <span className="text-slate-400">(optional)</span></label>
          <input className={input} value={form.reference} onChange={setF('reference')} placeholder="e.g. ADJ-001" />
        </div>

        {/* Lines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Lines</label>
            <button type="button" onClick={addLine}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              <Plus className="h-3.5 w-3.5" /> Add line
            </button>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-12 gap-2 px-1 mb-1">
            <span className="col-span-4 text-xs font-medium text-slate-500">Account</span>
            <span className="col-span-3 text-xs font-medium text-slate-500">Description</span>
            <span className="col-span-2 text-xs font-medium text-slate-500 text-right">Debit</span>
            <span className="col-span-2 text-xs font-medium text-slate-500 text-right">Credit</span>
            <span className="col-span-1" />
          </div>

          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-4">
                  <select className={input} value={line.accountId} onChange={setLine(i, 'accountId')}>
                    <option value="">Select account…</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <input className={input} placeholder="Narration" value={line.description} onChange={setLine(i, 'description')} />
                </div>
                <div className="col-span-2">
                  <input type="number" step="0.01" min="0" className={input} placeholder="0.00"
                    value={line.debitAmount} onChange={setLine(i, 'debitAmount')} />
                </div>
                <div className="col-span-2">
                  <input type="number" step="0.01" min="0" className={input} placeholder="0.00"
                    value={line.creditAmount} onChange={setLine(i, 'creditAmount')} />
                </div>
                <div className="col-span-1 flex justify-center">
                  {lines.length > 2 && (
                    <button type="button" onClick={() => removeLine(i)}
                      className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Totals row */}
          <div className="grid grid-cols-12 gap-2 mt-3 pt-3 border-t border-slate-100">
            <div className="col-span-7 flex items-center">
              {totalDebits > 0 && (
                balanced
                  ? <span className="text-xs font-semibold text-emerald-600">✓ Balanced</span>
                  : <span className="text-xs font-semibold text-red-500">
                      Difference: {fmt(diff)} — {totalDebits > totalCredits ? 'need more credits' : 'need more debits'}
                    </span>
              )}
            </div>
            <div className="col-span-2 text-right">
              <span className={`text-sm font-bold ${balanced ? 'text-slate-900' : 'text-red-500'}`}>{fmt(totalDebits)}</span>
            </div>
            <div className="col-span-2 text-right">
              <span className={`text-sm font-bold ${balanced ? 'text-slate-900' : 'text-red-500'}`}>{fmt(totalCredits)}</span>
            </div>
            <div className="col-span-1" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !canSubmit}>
            {create.isPending ? 'Saving…' : 'Save as Draft'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function LedgerPage() {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [showNew, setShowNew] = useState(false)

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['ledger', statusFilter],
    queryFn: () => ledgerService.findAll(statusFilter ? { status: statusFilter } : {}),
  })

  const postEntry = useMutation({
    mutationFn: (id: string) => ledgerService.post(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); toast.success('Entry posted') },
    onError: () => toast.error('Failed to post entry'),
  })

  const reverseEntry = useMutation({
    mutationFn: (id: string) => ledgerService.reverse(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ledger'] }); toast.success('Entry reversed') },
    onError: () => toast.error('Failed to reverse entry'),
  })

  const statuses = ['', 'DRAFT', 'POSTED', 'REVERSED']

  return (
    <div>
      <PageHeader title="Journal Entries" description="All General Ledger entries"
        action={
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Entry
          </Button>
        }
      />

      <div className="flex gap-2 mb-6">
        {statuses.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : entries.length === 0 ? (
        <EmptyState icon={FileText} title="No journal entries" />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-8 px-4 py-3" />
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Entry #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Debits</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map(entry => (
                <Fragment key={entry.id}>
                  <tr className="hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}>
                    <td className="px-4 py-4 text-slate-400">
                      {expanded === entry.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-indigo-600">{entry.entryNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{entry.entryDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium max-w-xs truncate">{entry.description}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">{fmt(entry.totalDebit)}</td>
                    <td className="px-6 py-4"><StatusBadge status={entry.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                        {entry.status === 'DRAFT' && (
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                            onClick={() => postEntry.mutate(entry.id)}>
                            <CheckCircle className="h-3 w-3" /> Post
                          </Button>
                        )}
                        {entry.status === 'POSTED' && (
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-red-600 hover:text-red-700"
                            onClick={() => reverseEntry.mutate(entry.id)}>
                            <RotateCcw className="h-3 w-3" /> Reverse
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === entry.id && (
                    <tr key={`${entry.id}-detail`}>
                      <td colSpan={7} className="px-6 py-0">
                        <div className="bg-slate-50 rounded-xl mx-2 my-3 overflow-hidden">
                          <table className="min-w-full">
                            <thead>
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Account</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Description</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Debit</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Credit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.lines.map(line => (
                                <tr key={line.id}>
                                  <td className="px-4 py-2 text-xs font-mono text-indigo-600">{line.accountCode} · {line.accountName}</td>
                                  <td className="px-4 py-2 text-xs text-slate-500">{line.description}</td>
                                  <td className="px-4 py-2 text-xs text-right font-medium">{line.debitAmount > 0 ? fmt(line.debitAmount) : '—'}</td>
                                  <td className="px-4 py-2 text-xs text-right font-medium">{line.creditAmount > 0 ? fmt(line.creditAmount) : '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showNew} onOpenChange={v => !v && setShowNew(false)}>
        <NewJournalEntryDialog onClose={() => setShowNew(false)} />
      </Dialog>
    </div>
  )
}