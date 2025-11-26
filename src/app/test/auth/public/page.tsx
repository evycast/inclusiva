import { getSSRAuth } from '@/lib/auth'

export default async function Page() {
  const auth = await getSSRAuth()
  return (
    <div className='max-w-2xl mx-auto p-6'>
      <h1 className='text-2xl font-semibold mb-4'>Pública · Prueba</h1>
      <div className='space-y-2'>
        <p className='text-muted-foreground'>Acceso permitido para cualquiera.</p>
        <p className='text-muted-foreground'>Rol: {auth.role ?? 'sin rol'}</p>
      </div>
    </div>
  )
}
