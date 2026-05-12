'use client'

export function fmt(amount: number, currency = 'KES') {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function StatusBadge({ status }: { status: string }) {
  const colours: Record<string, string> = {
    DRAFT: 'bg-slate-100 text-slate-700',
    POSTED: 'bg-emerald-100 text-emerald-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    PARTIALLY_PAID: 'bg-amber-100 text-amber-700',
    PAID: 'bg-blue-100 text-blue-700',
    CANCELLED: 'bg-red-100 text-red-700',
    REVERSED: 'bg-purple-100 text-purple-700',
    OK: 'bg-emerald-100 text-emerald-700',
    WARNING: 'bg-amber-100 text-amber-700',
    EXCEEDED: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colours[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}
