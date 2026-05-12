'use client'

import { useQuery } from '@tanstack/react-query'
import { arService } from '@/services/ar.service'
import { PageHeader } from '@/components/shared/page-header'
import { fmt } from '@/components/shared/amount'
import { EmptyState } from '@/components/shared/empty-state'
import { Users } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function CustomersPage() {
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: arService.findAllCustomers,
  })

  return (
    <div>
      <div className="mb-6">
        <Link href="/ar"><Button variant="ghost" size="sm" className="gap-1 mb-4 text-slate-500"><ArrowLeft className="h-4 w-4" /> Back to Invoices</Button></Link>
      </div>
      <PageHeader title="Customers" description="All registered customers" />

      {isLoading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />)}</div>
      ) : customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers yet" />
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
    </div>
  )
}
