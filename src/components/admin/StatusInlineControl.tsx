'use client'

import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'

export type AdminStatus = 'pending' | 'approved' | 'rejected'

export function StatusInlineControl({
  status,
  onChange,
  loading,
  disabled,
}: {
  status: AdminStatus
  onChange: (next: AdminStatus) => void
  loading?: boolean
  disabled?: boolean
}) {
  const borderClasses =
		status === 'approved'
			? 'border-none bg-transparent hover:bg-transparent'
			: status === 'rejected'
			? 'border border-red-200'
			: 'border border-amber-200';

  const iconClasses =
    status === 'approved'
      ? 'text-green-600'
      : status === 'rejected'
      ? 'text-red-600'
      : 'text-amber-600'

  const Icon = status === 'approved' ? CheckCircle2 : status === 'rejected' ? XCircle : Clock
  
  const labelEs = (s: AdminStatus) => (s === 'approved' ? 'Aprobado' : s === 'rejected' ? 'Rechazado' : 'Pendiente')

  return (
		<Select value={status} onValueChange={(v) => onChange(v as AdminStatus)}>
			<SelectTrigger
				disabled={!!disabled}
				className={`inline-flex items-center gap-1 rounded-md px-2 py-0 font-medium leading-tight bg-transparent border-none
        ring-0 focus:ring-0 focus-visible:ring-0 outline-none focus:outline-none shadow-none transition-colors
        hover:bg-transparent text-foreground
        disabled:opacity-60 disabled:cursor-not-allowed`}
				aria-label='Estado'
			>
				{loading ? (
					<Loader2 className='h-3 w-3 animate-spin text-muted-foreground' />
				) : (
					<Icon className={`h-3 w-3 ${iconClasses}`} />
				)}
				<span className='px-0.5'>{labelEs(status)}</span>
			</SelectTrigger>
			<SelectContent
				align='start'
				className='bg-popover border-border text-popover-foreground'
			>
				<SelectItem  className='py-2.5' value='pending'>Pendiente</SelectItem>
				<SelectItem  className='py-2.5' value='approved'>Aprobado</SelectItem>
				<SelectItem  className='py-2.5' value='rejected'>Rechazado</SelectItem>
			</SelectContent>
		</Select>
	);
}