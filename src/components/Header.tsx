import Link from 'next/link';
import { Heart } from 'lucide-react';
import { getSSRAuth } from '@/lib/auth';
import HeaderNav from '@/components/HeaderNav';
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
                            <Heart className='w-5 h-5 text-white' />
                        </div>
                        <div className='flex flex-col'>
                            <span className='font-display text-xl sm:text-2xl font-semibold text-gradient-brand tracking-tight transition-all duration-300'>
                                Inclusiva
                            </span>
                            <span className='hidden us:inline-block text-xs sm:text-sm text-muted-foreground'>
                                Comunidad conectada
                            </span>
                        </div>
                    </Link>
                    <HeaderNav initialLogged={logged} />
                </div>
            </div>
        </header>
    );
}
