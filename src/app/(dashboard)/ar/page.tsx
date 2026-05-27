'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { arService } from '@/services/ar.service'
import { accountsService } from '@/services/accounts.service'
import { PageHeader } from '@/components/shared/page-header'
import { StatusBadge, fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { Receipt, CheckCircle, XCircle, ChevronDown, ChevronRight, DollarSign, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import { format } from 'date-fns'
import { Invoice } from '@/types'

const input = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const label = 'block text-sm font-medium text-slate-700 mb-1'
const STATUSES = ['', 'DRAFT', 'APPROVED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED']

interface LineItem { description: string; quantity: string; unitPrice: string; revenueAccountId: string }
const emptyLine = (): LineItem => ({ description: '', quantity: '1', unitPrice: '', revenueAccountId: '' })

function NewInvoiceDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: arService.findAllCustomers })
  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsService.findAll() })

  const [form, setForm] = useState({
    customerId: '', arAccountId: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    customerRef: '', notes: '',
  })
  const [lines, setLines] = useState<LineItem[]>([emptyLine()])

  const setF = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  const setLine = (i: number, f: keyof LineItem) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setLines(prev => prev.map((l, idx) => idx === i ? { ...l, [f]: e.target.value } : l))
  }

  const addLine = () => setLines(p => [...p, emptyLine()])
  const removeLine = (i: number) => setLines(p => p.filter((_, idx) => idx !== i))

  const total = lines.reduce((sum, l) => sum + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitPrice) || 0), 0)

  const create = useMutation({
    mutationFn: () => arService.createInvoice({
      ...form,
      lines: lines.map(l => ({
        description: l.description,
        quantity: parseFloat(l.quantity),
        unitPrice: parseFloat(l.unitPrice),
        revenueAccountId: l.revenueAccountId,
      })),
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice created'); onClose() },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create invoice'),
  })

  const canSubmit = form.customerId && form.arAccountId && form.issueDate && form.dueDate &&
    lines.every(l => l.description && l.quantity && l.unitPrice && l.revenueAccountId)

  const arAccounts = accounts.filter(a => a.type === 'ASSET')
  const revenueAccounts = accounts.filter(a => a.type === 'REVENUE')

  return (
    <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader><DialogTitle>New Invoice</DialogTitle></DialogHeader>
      <div className="space-y-4 mt-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Customer</label>
            <select className={input} value={form.customerId} onChange={setF('customerId')}>
              <option value="">Select customer…</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className={label}>AR Account</label>
            <select className={input} value={form.arAccountId} onChange={setF('arAccountId')}>
              <option value="">Select account…</option>
              {arAccounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Issue Date</label>
            <input type="date" className={input} value={form.issueDate} onChange={setF('issueDate')} />
          </div>
          <div>
            <label className={label}>Due Date</label>
            <input type="date" className={input} value={form.dueDate} onChange={setF('dueDate')} />
          </div>
        </div>
        <div>
          <label className={label}>Customer Reference <span className="text-slate-400">(optional)</span></label>
          <input className={input} value={form.customerRef} onChange={setF('customerRef')} placeholder="PO-1234" />
        </div>

        {/* Line items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">Line Items</label>
            <button type="button" onClick={addLine} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium">
              <Plus className="h-3.5 w-3.5" /> Add line
            </button>
          </div>
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-start">
                <div className="col-span-4">
                  <input className={input} placeholder="Description" value={line.description} onChange={setLine(i, 'description')} />
                </div>
                <div className="col-span-2">
                  <input type="number" className={input} placeholder="Qty" value={line.quantity} onChange={setLine(i, 'quantity')} min="1" />
                </div>
                <div className="col-span-2">
                  <input type="number" step="0.01" className={input} placeholder="Price" value={line.unitPrice} onChange={setLine(i, 'unitPrice')} />
                </div>
                <div className="col-span-3">
                  <select className={input} value={line.revenueAccountId} onChange={setLine(i, 'revenueAccountId')}>
                    <option value="">Revenue account…</option>
                    {revenueAccounts.map(a => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1 flex justify-end pt-1">
                  {lines.length > 1 && (
                    <button type="button" onClick={() => removeLine(i)} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <span className="text-sm font-semibold text-slate-700">Total: {fmt(total)}</span>
          </div>
        </div>

        <div>
          <label className={label}>Notes <span className="text-slate-400">(optional)</span></label>
          <textarea className={input} rows={2} value={form.notes} onChange={setF('notes')} placeholder="Any additional notes…" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !canSubmit}>
            {create.isPending ? 'Creating…' : 'Create Invoice'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

function ReceiptDialog({ invoice, onClose }: { invoice: Invoice; onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({
    receiptDate: format(new Date(), 'yyyy-MM-dd'),
    amountReceived: String(invoice.outstandingAmount),
    paymentMethod: 'BANK_TRANSFER',
    paymentAccountId: '',
  })

  const { data: accounts = [] } = useQuery({ queryKey: ['accounts'], queryFn: () => accountsService.findAll() })

  const record = useMutation({
    mutationFn: () => arService.recordReceipt({
      invoiceId: invoice.id,
      receiptDate: form.receiptDate,
      amountReceived: parseFloat(form.amountReceived),
      paymentMethod: form.paymentMethod || undefined,
      paymentAccountId: form.paymentAccountId,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Receipt recorded'); onClose() },
    onError: () => toast.error('Failed to record receipt'),
  })

  const canSubmit = form.amountReceived && parseFloat(form.amountReceived) > 0 && form.paymentAccountId

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>Record Receipt — {invoice.invoiceNumber}</DialogTitle></DialogHeader>
      <div className="space-y-4 mt-2">
        <div className="rounded-lg bg-slate-50 px-4 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Customer</span>
            <span className="font-medium text-slate-900">{invoice.customerName}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-slate-500">Outstanding</span>
            <span className="font-semibold text-amber-600">{fmt(invoice.outstandingAmount)}</span>
          </div>
        </div>
        <div>
          <label className={label}>Payment Date</label>
          <input type="date" value={form.receiptDate} onChange={e => setForm(p => ({ ...p, receiptDate: e.target.value }))} className={input} />
        </div>
        <div>
          <label className={label}>Amount Received</label>
          <input type="number" step="0.01" value={form.amountReceived} onChange={e => setForm(p => ({ ...p, amountReceived: e.target.value }))} className={input} />
        </div>
        <div>
          <label className={label}>Payment Account</label>
          <select value={form.paymentAccountId} onChange={e => setForm(p => ({ ...p, paymentAccountId: e.target.value }))} className={input}>
            <option value="">Select account…</option>
            {accounts.filter(a => a.type === 'ASSET').map(a => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={label}>Payment Method</label>
          <select value={form.paymentMethod} onChange={e => setForm(p => ({ ...p, paymentMethod: e.target.value }))} className={input}>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="MOBILE_MONEY">Mobile Money</option>
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => record.mutate()} disabled={record.isPending || !canSubmit}>
            {record.isPending ? 'Recording…' : 'Record Receipt'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function ARPage() {
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [showNewInvoice, setShowNewInvoice] = useState(false)
  const [receiptInvoice, setReceiptInvoice] = useState<Invoice | null>(null)

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', statusFilter],
    queryFn: () => arService.findAllInvoices(statusFilter || undefined),
  })

  const approve = useMutation({
    mutationFn: (id: string) => arService.approveInvoice(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice approved') },
    onError: () => toast.error('Failed to approve'),
  })
  const cancel = useMutation({
    mutationFn: (id: string) => arService.cancelInvoice(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice cancelled') },
    onError: () => toast.error('Failed to cancel'),
  })

  return (
    <div>
      <PageHeader title="Accounts Receivable" description="Customer invoices and receipts"
        action={
          <div className="flex gap-2">
            <Link href="/ar/customers"><Button variant="outline">Manage Customers</Button></Link>
            <Button onClick={() => setShowNewInvoice(true)} className="gap-2">
              <Plus className="h-4 w-4" /> New Invoice
            </Button>
          </div>
        }
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
      ) : invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="No invoices" />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="w-8 px-4 py-3" />
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Due</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map(inv => (
                <>
                  <tr key={inv.id} className="hover:bg-slate-50 cursor-pointer"
                    onClick={() => setExpanded(expanded === inv.id ? null : inv.id)}>
                    <td className="px-4 py-4 text-slate-400">
                      {expanded === inv.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-indigo-600">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 font-medium">{inv.customerName}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{inv.issueDate}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{inv.dueDate}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium">{fmt(inv.totalAmount)}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-amber-600">{fmt(inv.outstandingAmount)}</td>
                    <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {inv.status === 'DRAFT' && (
                          <>
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                              onClick={() => approve.mutate(inv.id)}>
                              <CheckCircle className="h-3 w-3" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-red-600"
                              onClick={() => cancel.mutate(inv.id)}>
                              <XCircle className="h-3 w-3" /> Cancel
                            </Button>
                          </>
                        )}
                        {(inv.status === 'APPROVED' || inv.status === 'PARTIALLY_PAID') && (
                          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-emerald-600"
                            onClick={() => setReceiptInvoice(inv)}>
                            <DollarSign className="h-3 w-3" /> Record Receipt
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === inv.id && (
                    <tr key={`${inv.id}-d`}>
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
                              {inv.lines.map(l => (
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

      <Dialog open={showNewInvoice} onOpenChange={v => !v && setShowNewInvoice(false)}>
        <NewInvoiceDialog onClose={() => setShowNewInvoice(false)} />
      </Dialog>

      <Dialog open={!!receiptInvoice} onOpenChange={v => !v && setReceiptInvoice(null)}>
        {receiptInvoice && <ReceiptDialog invoice={receiptInvoice} onClose={() => setReceiptInvoice(null)} />}
      </Dialog>
    </div>
  )
}