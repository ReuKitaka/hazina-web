'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersService, CreateUserPayload } from '@/services/users.service'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { UserPlus, Shield, Loader2 } from 'lucide-react'
import { UserProfile } from '@/types'

const emptyForm: CreateUserPayload = { email: '', password: '', firstName: '', lastName: '' }

export default function SuperAdminsPage() {
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateUserPayload>(emptyForm)

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['super-admins'],
    queryFn: () => usersService.findSuperAdmins(),
  })

  const create = useMutation({
    mutationFn: (data: CreateUserPayload) => usersService.createSuperAdmin(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admins'] })
      toast.success('Super admin created')
      setForm(emptyForm)
      setShowForm(false)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create super admin')
    },
  })

  const set = (field: keyof CreateUserPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    create.mutate(form)
  }

  const inputClass = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Super Admins"
          description="Manage administrator accounts with full system access"
        />
        <Button onClick={() => setShowForm(v => !v)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Super Admin
        </Button>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">New Super Admin</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">First Name</label>
              <input className={inputClass} value={form.firstName} onChange={set('firstName')} required placeholder="Jane" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Last Name</label>
              <input className={inputClass} value={form.lastName} onChange={set('lastName')} required placeholder="Doe" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input className={inputClass} type="email" value={form.email} onChange={set('email')} required placeholder="jane@hazina.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Password</label>
              <input className={inputClass} type="password" value={form.password} onChange={set('password')} required minLength={8} placeholder="Min 8 characters" />
            </div>
            <div className="col-span-2 flex gap-3 pt-2">
              <Button type="submit" disabled={create.isPending} className="gap-2">
                {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Create
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); setForm(emptyForm) }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              {['Name', 'Email', 'Status', 'Created'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Loading…</td></tr>
            )}
            {!isLoading && admins.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No super admins yet</td></tr>
            )}
            {admins.map((admin: UserProfile) => (
              <tr key={admin.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
                      {admin.firstName[0]}{admin.lastName[0]}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{admin.firstName} {admin.lastName}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{admin.email}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-indigo-500" />
                    <span className="text-xs font-medium text-indigo-700 bg-indigo-50 rounded-full px-2 py-0.5">Super Admin</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}