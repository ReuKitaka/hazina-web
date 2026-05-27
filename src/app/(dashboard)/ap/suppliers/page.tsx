'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apService } from '@/services/ap.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { Building2, ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useState } from 'react'
import { toast } from 'sonner'

const input = 'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
const label = 'block text-sm font-medium text-slate-700 mb-1'

function NewSupplierDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', taxPin: '' })

  const set = (f: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [f]: e.target.value }))

  const create = useMutation({
    mutationFn: () => apService.createSupplier(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['suppliers'] })
      toast.success('Supplier created')
      onClose()
    },
    onError: (e: any) => toast.error(e?.response?.data?.message || 'Failed to create supplier'),
  })

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader><DialogTitle>New Supplier</DialogTitle></DialogHeader>
      <div className="space-y-4 mt-2">
        <div>
          <label className={label}>Name</label>
          <input className={input} value={form.name} onChange={set('name')} required placeholder="Supplier Co. Ltd" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Email <span className="text-slate-400">(optional)</span></label>
            <input type="email" className={input} value={form.email} onChange={set('email')} placeholder="accounts@supplier.com" />
          </div>
          <div>
            <label className={label}>Phone <span className="text-slate-400">(optional)</span></label>
            <input className={input} value={form.phone} onChange={set('phone')} placeholder="+254 700 000 000" />
          </div>
        </div>
        <div>
          <label className={label}>KRA PIN / Tax PIN <span className="text-slate-400">(optional)</span></label>
          <input className={input} value={form.taxPin} onChange={set('taxPin')} placeholder="P051234567X" />
        </div>
        <div>
          <label className={label}>Address <span className="text-slate-400">(optional)</span></label>
          <textarea className={input} rows={2} value={form.address} onChange={set('address')} placeholder="P.O. Box 5678, Nairobi" />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => create.mutate()} disabled={create.isPending || !form.name}>
            {create.isPending ? 'Creating…' : 'Create Supplier'}
          </Button>
        </div>
      </div>
    </DialogContent>
  )
}

export default function SuppliersPage() {
  const [showNew, setShowNew] = useState(false)

  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: apService.findAllSuppliers,
  })

  return (
    <div>
      <Link href="/ap">
        <Button variant="ghost" size="sm" className="gap-1 mb-4 text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Back to Bills
        </Button>
      </Link>
      <PageHeader title="Suppliers" description="All registered suppliers"
        action={
          <Button onClick={() => setShowNew(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New Supplier
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : suppliers.length === 0 ? (
        <EmptyState icon={Building2} title="No suppliers yet" description="Add a supplier before creating bills." />
      ) : (
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">KRA PIN</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Outstanding</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {suppliers.map(s => (
                <tr key={s.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm font-mono font-semibold text-indigo-600">{s.supplierCode}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-medium">{s.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{s.email || '—'}</td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">{s.taxPin || '—'}</td>
                  <td className={`px-6 py-4 text-sm text-right font-semibold ${s.outstandingBalance > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                    {fmt(s.outstandingBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showNew} onOpenChange={v => !v && setShowNew(false)}>
        <NewSupplierDialog onClose={() => setShowNew(false)} />
      </Dialog>
    </div>
  )
}