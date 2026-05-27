'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { arService } from '@/services/ar.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { Users, Plus, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { toast } from 'sonner'

const input = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const label = 'block text-sm font-medium text-slate-700 mb-1'

function NewCustomerDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  const create = useMutation({
    mutationFn: () => arService.createCustomer(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] })
      toast.success('Customer created')
      onClose()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create customer'),
  })

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>New Customer</DialogTitle></DialogHeader>
      <div className="space-y-4 mt-2">
        <div>
          <label className={label}>Name</label>
          <input className={input} value={form.name} onChange={set('name')} required placeholder="Acme Ltd" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Email <span className="text-slate-400">(optional)</span></label>
            <input type="email" className={input} value={form.email} onChange={set('email')} placeholder="billing@acme.com" />
          </div>
          <div>
            <label className={label}>Phone <span className="text-slate-400">(optional)</span></label>
            <input className={input} value={form.phone} onChange={set('phone')} placeholder="+254 700 000 000" />
          </div>
        </div>
        <div>
          <label className={label}>Address <span className="text-slate-400">(optional)</span></label>
          <textarea className={input} rows={2} value={form.address} onChange={set('address')} placeholder="P.O. Box 1234, Nairobi" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !form.name}>
            {create.isPending ? 'Creating…' : 'Create Customer'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function CustomersPage() {
  const [showNew, setShowNew] = useState(false)

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: arService.findAllCustomers,
  })

  return (
    <div>
      <div className="mb-6">
        <Link href="/ar">
          <Button variant="ghost" size="sm" className="gap-1 text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Back to Invoices
          </Button>
        </Link>
      </div>
      <PageHeader title="Customers" description="All registered customers"
        action={
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Customer
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" description="Add a customer before creating invoices." />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-indigo-600">{c.customerCode}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{c.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.email || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{c.phone || '—'}</td>
                  <td className={`px-6 py-4 text-sm text-right font-semibold ${c.outstandingBalance > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {fmt(c.outstandingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showNew} onOpenChange={v => !v && setShowNew(false)}>
        <NewCustomerDialog onClose={() => setShowNew(false)} />
      </Dialog>
    </div>
  )
}