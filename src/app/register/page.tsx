import { redirect } from 'next/navigation'

interface PageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams
  const nextUrl = params.next
  
  // Redirigir a la página de login unificada con modo registro
  const redirectUrl = nextUrl 
    ? `/login?mode=register&next=${encodeURIComponent(nextUrl)}`
    : '/login?mode=register'
  
  redirect(redirectUrl)
}
