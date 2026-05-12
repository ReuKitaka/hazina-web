'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apService } from '@/services/ap.service'
import { accountsService } from '@/services/accounts.service'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge, fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { ShoppingCart, CheckCircle, XCircle, ChevronDown, ChevronRight, DollarSign } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import { format } from 'date-fns'
import { Bill } from '@/types'

const STATUSES = ['', 'DRAFT', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED']

function PaymentDialog({ bill, onClose }: { bill: Bill; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    amountPaid: String(bill.outstandingAmount),
    paymentMethod: 'BANK_TRANSFER',
    paymentAccountId: '',
  })

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsService.findAll(),
  })

  const record = useMutation({
    mutationFn: () => apService.recordPayment({
      billId: bill.id,
      paymentDate: form.paymentDate,
      amountPaid: parseFloat(form.amountPaid),
      paymentMethod: form.paymentMethod || undefined,
      paymentAccountId: form.paymentAccountId,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bills'] })
      toast.success('Payment recorded')
      onClose()
    },
    onError: () => toast.error('Failed to record payment'),
  })

  const canSubmit = form.amountPaid && parseFloat(form.amountPaid) > 0 && form.paymentAccountId

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Record Payment — {bill.billNumber}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-2">
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Supplier</span>
            <span className="font-medium text-slate-900">{bill.supplierName}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-500">Outstanding</span>
            <span className="font-semibold text-amber-600">{fmt(bill.outstandingAmount)}</span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
          <input type="date" value={form.paymentDate} onChange={e => setForm(p => ({ ...p, paymentDate: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Amount Paid</label>
          <input type="number" step="0.01" value={form.amountPaid} onChange={e => setForm(p => ({ ...p, amountPaid: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Account</label>
          <select value={form.paymentAccountId} onChange={e => setForm(p => ({ ...p, paymentAccountId: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Select account…</option>
            {accounts.filter(a => a.type === 'ASSET').map(a => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
          <select value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => record.mutate()} disabled={record.isPending || !canSubmit}>
            {record.isPending ? 'Recording…' : 'Record Payment'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function APPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [paymentBill, setPaymentBill] = useState<Bill | null>(null)

  const { data: bills = [], isLoading } = useQuery({
    queryKey: ['bills', statusFilter],
    queryFn: () => apService.findAllBills(statusFilter || undefined),
  })

  const approve = useMutation({
    mutationFn: (id: string) => apService.approveBill(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bills'] }); toast.success('Bill approved') },
    onError: () => toast.error('Failed to approve'),
  })
  const cancel = useMutation({
    mutationFn: (id: string) => apService.cancelBill(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['bills'] }); toast.success('Bill cancelled') },
    onError: () => toast.error('Failed to cancel'),
  })

  return (
    <div>
      <PageHeader title="Accounts Payable"
        description="Supplier bills and payments"
        action={<Link href="/ap/suppliers"><Button variant="outline">Manage Suppliers</Button></Link>}
      />

      <div className="flex gap-2 mb-6 flex-wrap">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${statusFilter === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : bills.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No bills" />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-8 px-4 py-3" />
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Bill #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Due</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {bills.map(bill => (
                <>
                  <tr key={bill.id} className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => setExpanded(expanded === bill.id ? null : bill.id)}>
                    <td className="px-4 py-4 text-slate-400">
                      {expanded === bill.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-indigo-600">{bill.billNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{bill.supplierName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{bill.billDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{bill.dueDate}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">{fmt(bill.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-amber-600">{fmt(bill.outstandingAmount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={bill.status} /></td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {bill.status === 'DRAFT' && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                              onClick={() => approve.mutate(bill.id)}>
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-red-600"
                              onClick={() => cancel.mutate(bill.id)}>
                              <XCircle className="h-3 w-3" /> Cancel
                            </Button>
                          </>
                        )}
                        {(bill.status === 'APPROVED' || bill.status === 'PARTIALLY_PAID') && (
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-rose-600"
                            onClick={() => setPaymentBill(bill)}>
                            <DollarSign className="h-3 w-3" /> Record Payment
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === bill.id && (
                    <tr key={`${bill.id}-d`}>
                      <td colSpan={9} className="px-6 py-0">
                        <div className="bg-slate-50 rounded-xl mx-2 my-3 overflow-hidden">
                          <table className="min-w-full">
                            <thead><tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Description</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Qty</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Unit Price</th>
                              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Amount</th>
                            </tr></thead>
                            <tbody>
                              {bill.lines.map(l => (
                                <tr key={l.id}>
                                  <td className="px-4 py-2 text-xs text-slate-700">{l.description}</td>
                                  <td className="px-4 py-2 text-xs text-right">{l.quantity}</td>
                                  <td className="px-4 py-2 text-xs text-right">{fmt(l.unitPrice)}</td>
                                  <td className="px-4 py-2 text-xs text-right font-medium">{fmt(l.amount)}</td>
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

      <Dialog open={!!paymentBill} onOpenChange={v => !v && setPaymentBill(null)}>
        {paymentBill && <PaymentDialog bill={paymentBill} onClose={() => setPaymentBill(null)} />}
      </Dialog>
    </div>
  )
}
