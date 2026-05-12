'use client'

import { useQuery } from '@tanstack/react-query'
import { cashbookService } from '@/services/cashbook.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt, StatusBadge } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useState } from 'react'

export default function CashBookPage() {
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null)

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
      <PageHeader title="Cash Book" description="Track cash and bank account movements" />

      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-2xl bg-slate-100 animate-pulse" />)}</div>
      ) : accounts.length === 0 ? (
        <EmptyState icon={Wallet} title="No cash accounts" description="Create a cash account to start tracking transactions." />
      ) : (
        <>
          {/* Account cards */}
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

          {/* Transactions */}
          {selectedAccount && (
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">{activeAccount?.name} — Transactions</h3>
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
    </div>
  )
}
