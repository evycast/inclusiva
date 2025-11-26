import Link from 'next/link';
import { FaHeart } from 'react-icons/fa';
import { getSSRAuth } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
export const dynamic = 'force-dynamic'

export default async function Header() {
    const auth = await getSSRAuth()
    const logged = !!auth.ok
    return (
        <header className='fixed top-0 z-50 w-full bg-card border-b border-border/50 transition-colors duration-300'>
            <div className='mx-auto max-w-7xl px-6'>
                <div className='flex h-20 items-center justify-between'>
                    <Link href='/' className='flex items-center gap-3 group'>
                        <div className='bg-gradient-to-br from-pink-500 to-violet-600 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 group-hover:rotate-3'>
                            <FaHeart className='w-5 h-5 text-white' />
                        </div>
                        <div className='flex flex-col'>
                            <span className='font-display text-xl sm:text-2xl font-semibold bg-gradient-to-r from-white via-pink-100 to-violet-200 bg-clip-text text-transparent tracking-tight transition-all duration-300 group-hover:from-pink-200 group-hover:via-pink-300 group-hover:to-violet-500'>
                                Inclusiva
                            </span>
                            <span className='hidden us:inline-block text-xs sm:text-sm text-muted-foreground'>
                                Comunidad conectada
                            </span>
                        </div>
                    </Link>
                    <nav className='hidden md:flex items-center gap-6 text-sm'>
                        <Link href='/' className='text-muted-foreground hover:text-foreground transition-colors'>Inicio</Link>
                        <Link href='/publicaciones' className='text-muted-foreground hover:text-foreground transition-colors'>Publicaciones</Link>
                        <Link href='/guia' className='text-muted-foreground hover:text-foreground transition-colors'>Guía</Link>
                        <Link href='/como-publicar' className='text-muted-foreground hover:text-foreground transition-colors'>Cómo publicar</Link>
                        <Link href='/contacto' className='text-muted-foreground hover:text-foreground transition-colors'>Contacto</Link>
                        <Link href='/publicaciones/crear' className='ml-2 inline-flex items-center rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-2 font-medium text-white shadow-lg hover:shadow-xl transition'>
                            Publicar
                        </Link>
                        {!logged && (
                            <>
                                <Link href='/admin/login' className='text-muted-foreground hover:text-foreground transition-colors'>Iniciar sesión</Link>
                                <Link href='/register' className='text-muted-foreground hover:text-foreground transition-colors'>Registrarse</Link>
                            </>
                        )}
                        {logged && (
                            <>
                                <Link href='/profile' className='text-muted-foreground hover:text-foreground transition-colors'>Perfil</Link>
                                <LogoutButton />
                            </>
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}
