'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cashbookService } from '@/services/cashbook.service'
import { accountsService } from '@/services/accounts.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { Wallet, ArrowDownLeft, ArrowUpRight, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'

const input = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const label = 'block text-sm font-medium text-slate-700 mb-1'

function NewAccountDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsService.findAll() })
  const [form, setForm] = useState({ name: '', accountId: '', currency: 'KES', bankName: '', accountNumber: '' })

  const create = useMutation({
    mutationFn: () => cashbookService.createAccount(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cashAccounts'] }); toast.success('Cash account created'); onClose() },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create account'),
  })

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>New Cash Account</DialogTitle></DialogHeader>
      <div className="space-y-4 mt-2">
        <div>
          <label className={label}>Account Name</label>
          <input className={input} value={form.name} onChange={set('name')} required placeholder="e.g. KCB Current Account" />
        </div>
        <div>
          <label className={label}>GL Account (Asset)</label>
          <select className={input} value={form.accountId} onChange={set('accountId')} required>
            <option value="">Select account…</option>
            {accounts.filter(a => a.type === 'ASSET').map(a => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Currency</label>
            <select className={input} value={form.currency} onChange={set('currency')}>
              {['KES', 'USD', 'EUR', 'GBP', 'UGX', 'TZS'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>Bank Name <span className="text-slate-400">(optional)</span></label>
            <input className={input} value={form.bankName} onChange={set('bankName')} placeholder="KCB Bank" />
          </div>
        </div>
        <div>
          <label className={label}>Account Number <span className="text-slate-400">(optional)</span></label>
          <input className={input} value={form.accountNumber} onChange={set('accountNumber')} placeholder="1234567890" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !form.name || !form.accountId}>
            {create.isPending ? 'Creating…' : 'Create Account'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

function NewTransactionDialog({ accountId, onClose }: { accountId: string; onClose: () => void }) {
  const qc = useQueryClient()
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsService.findAll() })
  const [form, setForm] = useState({
    cashAccountId: accountId,
    transactionType: 'RECEIPT',
    amount: '',
    description: '',
    reference: '',
    counterpartAccountId: '',
    transactionDate: format(new Date(), 'yyyy-MM-dd'),
  })

  const record = useMutation({
    mutationFn: () => cashbookService.recordTransaction({ ...form, amount: parseFloat(form.amount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cashTransactions'] })
      qc.invalidateQueries({ queryKey: ['cashAccounts'] })
      toast.success('Transaction recorded')
      onClose()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to record transaction'),
  })

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  const canSubmit = form.amount && parseFloat(form.amount) > 0 && form.description && form.counterpartAccountId

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Record Transaction</DialogTitle></DialogHeader>
      <div className="space-y-4 mt-2">
        <div>
          <label className={label}>Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(['RECEIPT', 'PAYMENT'] as const).map(t => (
              <button key={t} type="button" onClick={() => setForm(p => ({ ...p, transactionType: t }))}
                className={`rounded-lg border py-2 text-sm font-medium transition-colors ${form.transactionType === t ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {t === 'RECEIPT' ? '↓ Receipt' : '↑ Payment'}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Date</label>
            <input type="date" className={input} value={form.transactionDate} onChange={set('transactionDate')} />
          </div>
          <div>
            <label className={label}>Amount</label>
            <input type="number" step="0.01" className={input} value={form.amount} onChange={set('amount')} placeholder="0.00" />
          </div>
        </div>
        <div>
          <label className={label}>Description</label>
          <input className={input} value={form.description} onChange={set('description')} placeholder="Payment description" />
        </div>
        <div>
          <label className={label}>Counterpart Account</label>
          <select className={input} value={form.counterpartAccountId} onChange={set('counterpartAccountId')}>
            <option value="">Select account…</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
          </select>
        </div>
        <div>
          <label className={label}>Reference <span className="text-slate-400">(optional)</span></label>
          <input className={input} value={form.reference} onChange={set('reference')} placeholder="REF-001" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => record.mutate()} disabled={record.isPending || !canSubmit}>
            {record.isPending ? 'Recording…' : 'Record'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function CashBookPage() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)
  const [showNewAccount, setShowNewAccount] = useState(false)
  const [showNewTxn, setShowNewTxn] = useState(false)

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['cashAccounts'],
    queryFn: cashbookService.findAllAccounts,
  })

  const { data: transactions = [] } = useQuery({
    queryKey: ['cashTransactions', selectedAccount],
    queryFn: () => cashbookService.findTransactions(selectedAccount!),
    enabled: !!selectedAccount,
  })

  const activeAccount = accounts.find(a => a.id === selectedAccount)

  return (
    <div>
      <PageHeader title="Cash Book" description="Track cash and bank account movements"
        action={
          <Button onClick={() => setShowNewAccount(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Account
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />)}</div>
      ) : accounts.length === 0 ? (
        <EmptyState icon={Wallet} title="No cash accounts" description="Create a cash account to start tracking transactions." />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {accounts.map(ca => (
              <button key={ca.id} onClick={() => setSelectedAccount(ca.id === selectedAccount ? null : ca.id)}
                className={`text-left rounded-2xl border p-5 transition-all ${ca.id === selectedAccount ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-400">{ca.currency}</span>
                </div>
                <p className="mt-3 text-xl font-bold text-slate-900">{fmt(ca.balance ?? 0)}</p>
                <p className="text-sm font-medium text-slate-600 mt-0.5">{ca.name}</p>
                {ca.bankName && <p className="text-xs text-slate-400 mt-0.5">{ca.bankName}</p>}
              </button>
            ))}
          </div>

          {selectedAccount && (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900">{activeAccount?.name} — Transactions</h3>
                <Button size="sm" onClick={() => setShowNewTxn(true)} className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Record Transaction
                </Button>
              </div>
              {transactions.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-400">No transactions yet</div>
              ) : (
                <table className="min-w-full divide-y divide-slate-50">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Counterpart</th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 text-sm text-slate-500">{t.transactionDate}</td>
                        <td className="px-6 py-4 text-sm text-slate-900 font-medium max-w-xs truncate">{t.description}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{t.counterpartAccountName || t.counterpartAccountCode}</td>
                        <td className={`px-6 py-4 text-sm text-right font-semibold ${t.transactionType === 'RECEIPT' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {t.transactionType === 'RECEIPT' ? '+' : '-'}{fmt(t.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${t.transactionType === 'RECEIPT' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {t.transactionType === 'RECEIPT' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                            {t.transactionType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      <Dialog open={showNewAccount} onOpenChange={v => !v && setShowNewAccount(false)}>
        <NewAccountDialog onClose={() => setShowNewAccount(false)} />
      </Dialog>

      <Dialog open={showNewTxn} onOpenChange={v => !v && setShowNewTxn(false)}>
        {selectedAccount && <NewTransactionDialog accountId={selectedAccount} onClose={() => setShowNewTxn(false)} />}
      </Dialog>
    </div>
  )
}