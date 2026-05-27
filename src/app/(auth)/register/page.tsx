'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { organisationsService } from '@/services/organisations.service'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    orgName: '', slug: '', contactEmail: '', phone: '', address: '',
    adminEmail: '', adminPassword: '', firstName: '', lastName: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await organisationsService.register(form)
      toast.success('Registration submitted! Await admin approval before logging in.')
      router.push('/login')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  const labelClass = "block text-sm font-medium text-slate-300 mb-1.5"

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 mb-4">
            <span className="text-xl font-bold text-white">H</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Register your Organisation</h1>
          <p className="text-sm text-slate-400 mt-1">Your account will be reviewed before activation</p>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Organisation</p>

            <div>
              <label className={labelClass}>Organisation Name</label>
              <input className={inputClass} value={form.orgName} onChange={set('orgName')} required placeholder="Acme Ltd" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Slug</label>
                <input className={inputClass} value={form.slug} onChange={set('slug')} required placeholder="acme-ltd" pattern="[a-zA-Z0-9-]+" />
              </div>
              <div>
                <label className={labelClass}>Contact Email</label>
                <input className={inputClass} type="email" value={form.contactEmail} onChange={set('contactEmail')} required placeholder="contact@acme.com" />
              </div>
            </div>
            <div>
              <label className={labelClass}>Phone <span className="text-slate-500">(optional)</span></label>
              <input className={inputClass} value={form.phone} onChange={set('phone')} placeholder="+254 700 000 000" />
            </div>

            <div className="border-t border-slate-700 pt-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Admin Account</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>First Name</label>
                  <input className={inputClass} value={form.firstName} onChange={set('firstName')} required placeholder="Jane" />
                </div>
                <div>
                  <label className={labelClass}>Last Name</label>
                  <input className={inputClass} value={form.lastName} onChange={set('lastName')} required placeholder="Doe" />
                </div>
              </div>
              <div className="mt-4">
                <label className={labelClass}>Admin Email</label>
                <input className={inputClass} type="email" value={form.adminEmail} onChange={set('adminEmail')} required placeholder="jane@acme.com" />
              </div>
              <div className="mt-4">
                <label className={labelClass}>Password</label>
                <input className={inputClass} type="password" value={form.adminPassword} onChange={set('adminPassword')} required minLength={8} placeholder="Min 8 characters" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? 'Submitting…' : 'Submit for Approval'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}