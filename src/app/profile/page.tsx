import { redirect } from 'next/navigation'

// Redirección permanente a /perfil
export default function ProfilePage() {
  redirect('/perfil')
}
