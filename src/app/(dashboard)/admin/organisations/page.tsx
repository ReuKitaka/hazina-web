'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organisationsService } from '@/services/organisations.service'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Organisation } from '@/types'
import { Building2, CheckCircle, XCircle, PauseCircle, PlayCircle, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/shared/page-header'

const statusColor: Record<Organisation['status'], string> = {
  PENDING:   'bg-yellow-100 text-yellow-800',
  ACTIVE:    'bg-green-100 text-green-800',
  SUSPENDED: 'bg-red-100 text-red-800',
}

export default function OrganisationsPage() {
  const { updateToken } = useAuth()
  const router = useRouter()
  const qc = useQueryClient()

  const { data: orgs = [], isLoading } = useQuery({
    queryKey: ['organisations'],
    queryFn: () => organisationsService.findAll(),
  })

  const approve  = useMutation({ mutationFn: (id: string) => organisationsService.approve(id),   onSuccess: () => { qc.invalidateQueries({ queryKey: ['organisations'] }); toast.success('Approved') } })
  const reject   = useMutation({ mutationFn: (id: string) => organisationsService.reject(id),    onSuccess: () => { qc.invalidateQueries({ queryKey: ['organisations'] }); toast.success('Rejected') } })
  const suspend  = useMutation({ mutationFn: (id: string) => organisationsService.suspend(id),   onSuccess: () => { qc.invalidateQueries({ queryKey: ['organisations'] }); toast.success('Suspended') } })
  const reinstate = useMutation({ mutationFn: (id: string) => organisationsService.reinstate(id), onSuccess: () => { qc.invalidateQueries({ queryKey: ['organisations'] }); toast.success('Reinstated') } })

  const switchOrg = useMutation({
    mutationFn: (id: string) => organisationsService.switchToOrg(id),
    onSuccess: (data) => {
      updateToken(data)
      toast.success(`Switched to ${data.orgName}`)
      router.push('/dashboard')
    },
  })

  if (isLoading) return <div className="text-slate-500 text-sm">Loading…</div>

  return (
    <div className="space-y-6">
      <PageHeader title="Organisations" description="Manage all registered organisations" />

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {['Organisation', 'Contact', 'Slug', 'Status', 'Registered', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orgs.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">No organisations yet</td></tr>
            )}
            {orgs.map(org => (
              <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-sm">{org.name[0]}</div>
                    <span className="text-sm font-medium text-slate-900">{org.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{org.contactEmail}</td>
                <td className="px-6 py-4 text-sm font-mono text-slate-500">{org.slug}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[org.status]}`}>{org.status}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">{new Date(org.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {org.status === 'PENDING' && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-green-700"
                          onClick={() => approve.mutate(org.id)}>
                          <CheckCircle className="h-3 w-3" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-red-600"
                          onClick={() => reject.mutate(org.id)}>
                          <XCircle className="h-3 w-3" /> Reject
                        </Button>
                      </>
                    )}
                    {org.status === 'ACTIVE' && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                          onClick={() => switchOrg.mutate(org.id)}>
                          <LogIn className="h-3 w-3" /> Enter
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-amber-600"
                          onClick={() => suspend.mutate(org.id)}>
                          <PauseCircle className="h-3 w-3" /> Suspend
                        </Button>
                      </>
                    )}
                    {org.status === 'SUSPENDED' && (
                      <Button size="sm" variant="outline" className="h-7 gap-1 text-xs text-green-700"
                        onClick={() => reinstate.mutate(org.id)}>
                        <PlayCircle className="h-3 w-3" /> Reinstate
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}