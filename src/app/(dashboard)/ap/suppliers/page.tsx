'use client'

import { useQuery } from '@tanstack/react-query'
import { apService } from '@/services/ap.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { Building2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function SuppliersPage() {
  const { data: suppliers = [], isLoading } = useQuery({
    queryKey: ['suppliers'],
    queryFn: apService.findAllSuppliers,
  })

  return (
    <div>
      <Link href="/ap"><Button variant="ghost" size="sm" className="gap-1 mb-4 text-slate-500"><ArrowLeft className="h-4 w-4" /> Back to Bills</Button></Link>
      <PageHeader title="Suppliers" description="All registered suppliers" />

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : suppliers.length === 0 ? (
        <EmptyState icon={Building2} title="No suppliers yet" />
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
    </div>
  )
}
