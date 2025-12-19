'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Plus, User, List } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

interface BottomBarItem {
	href: string;
	icon: React.ElementType;
	label: string;
	isActive?: boolean;
	isSpecial?: boolean;
}

const BottomBar = () => {
    const pathname = usePathname();
    const router = useRouter();

	const items: BottomBarItem[] = [
		{
			href: '/',
			icon: Home,
			label: 'Inicio',
			isActive: pathname === '/',
		},
		{
			href: '/publicar',
			icon: Plus,
			label: 'Publicar',
			isSpecial: true,
		},
		{
			href: '/perfil',
			icon: User,
			label: 'Perfil',
			isActive: pathname.startsWith('/perfil'),
		},
	];

    const endpoints: Array<{ label: string; href: string }> = [
        { label: 'Inicio', href: '/' },
        { label: 'Publicaciones', href: '/publicaciones' },
        { label: 'Crear publicación', href: '/publicaciones/crear' },
        { label: 'Perfil', href: '/profile' },
        { label: 'Admin login', href: '/admin/login' },
        { label: 'Test · Admin', href: '/test/auth/admin' },
        { label: 'Test · Moderador', href: '/test/auth/moderator' },
        { label: 'Test · Staff', href: '/test/auth/staff' },
        { label: 'Test · Usuario', href: '/test/auth/user' },
        { label: 'Test · Logeado', href: '/test/auth/logged' },
        { label: 'Test · Público', href: '/test/auth/public' },
        { label: 'API · Admin', href: '/api/test/auth/admin' },
        { label: 'API · Moderador', href: '/api/test/auth/moderator' },
        { label: 'API · Staff', href: '/api/test/auth/staff' },
        { label: 'API · Usuario', href: '/api/test/auth/user' },
        { label: 'API · Logeado', href: '/api/test/auth/logged' },
        { label: 'API · Público', href: '/api/test/auth/public' },
    ]

    return (
        <nav className='fixed z-50 right-4 bottom-4 rounded-2xl flex flex-col items-end gap-3'>
            <Popover>
                <PopoverTrigger asChild>
                    <Button className='rounded-full w-14 h-14 shadow-lg bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 text-white hover:opacity-90'>
                        <List className='w-5 h-5' />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className='w-64 p-2'>
                    <div className='max-h-72 overflow-auto'>
                        {endpoints.map((e) => (
                            <button
                                key={e.href}
                                className='w-full text-left px-2 py-1.5 rounded hover:bg-input/60 text-sm'
                                onClick={() => router.push(e.href)}
                            >
                                {e.label}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
            <div className='bg-card border border-border p-4 rounded-full md:bg-transparent md:border-none md:p-0 md:shadow-none shadow-lg'>
                <Link href='/publicar' className='flex flex-col items-center justify-center group'>
                    <div className='w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 via-red-500 to-purple-600 flex items-center justify-center shadow-lg transform transition-all duration-200 group-hover:scale-105 group-active:scale-95 animate-in hover:animate-none'>
                        <Plus className='w-7 h-7 text-white ' />
                    </div>
                </Link>
            </div>
        </nav>
    );
};

export default BottomBar;
