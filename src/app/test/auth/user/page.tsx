import { requireSSRRole } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function Page() {
  const auth = await requireSSRRole(['user'])
  if (!auth.ok) redirect('/admin/login')
  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Usuario · Prueba</h1>
      <p className='text-muted-foreground'>Acceso permitido. Rol: {auth.role}</p>
    </div>
  )
}
