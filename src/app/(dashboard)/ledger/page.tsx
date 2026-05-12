'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ledgerService } from '@/services/ledger.service'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge, fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { toast } from 'sonner'
import { FileText, CheckCircle, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function LedgerPage() {
  const qc = useQueryClient()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')

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
      <PageHeader title="Journal Entries" description="All General Ledger entries" />

      <div className="flex gap-2 mb-6">
        {statuses.map(s => (
          <button key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
          >{s || 'All'}</button>
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
                <>
                  <tr key={entry.id} className="hover:bg-slate-50 transition-colors cursor-pointer"
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
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
