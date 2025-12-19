import { redirect } from 'next/navigation'
import { getSSRAuth } from '@/lib/auth'
import CrearWizardClient from './CrearWizardClient'

export default async function CrearPublicacionPage() {
  const auth = await getSSRAuth()

  // Si no hay sesión, redirigir a login con parámetro next
  if (!auth.ok) {
    redirect('/login?next=/publicaciones/crear')
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <CrearWizardClient />
    </div>
  )
}
