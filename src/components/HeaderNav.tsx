'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Menu, X, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderNavProps {
    initialLogged: boolean;
}

export default function HeaderNav({ initialLogged }: HeaderNavProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [logged, setLogged] = useState(initialLogged);

    // Verificar estado de auth en el cliente
    const checkAuth = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/status');
            const data = await res.json();
            setLogged(!!data.ok);
        } catch {
            setLogged(false);
        }
    }, []);

    // Re-verificar auth cuando cambia la ruta (después de login/register)
    useEffect(() => {
        checkAuth();
    }, [pathname, checkAuth]);

    // Re-verificar cuando la ventana recupera foco o al escuchar evento custom de auth
    useEffect(() => {
        const handleFocus = () => checkAuth();
        const handleAuthChange = () => checkAuth();
        
        window.addEventListener('focus', handleFocus);
        window.addEventListener('auth-change', handleAuthChange);
        
        return () => {
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('auth-change', handleAuthChange);
        };
    }, [checkAuth]);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            await signOut({ redirect: false });
            try { localStorage.removeItem('contactUser'); } catch { /* ignore */ }
        } finally {
            setLogged(false);
            router.refresh();
            router.replace('/');
        }
    };

    const navItems = [
        { href: '/', label: 'Inicio' },
        { href: '/publicaciones', label: 'Publicaciones' },
        { href: '/guia', label: 'Guía' },
    ];

    return (
        <>
            {/* Desktop Navigation */}
            <nav className='hidden md:flex items-center gap-6 text-sm'>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className='text-muted-foreground hover:text-foreground transition-colors'
                    >
                        {item.label}
                    </Link>
                ))}

                <Link
                    href='/publicaciones/crear'
                    className='ml-2 inline-flex items-center rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-2 font-medium text-white shadow-lg hover:shadow-xl transition'
                >
                    Publicar
                </Link>

                {logged ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant='outline' 
                                size='icon' 
                                className='rounded-full h-10 w-10 border-2 border-pink-500/30 hover:border-pink-500/60 hover:bg-pink-500/10 transition-all'
                            >
                                <User className='h-5 w-5 text-pink-600' />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48'>
                            <DropdownMenuItem asChild>
                                <Link href='/perfil' className='flex items-center gap-3 cursor-pointer py-2'>
                                    <div className='h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center'>
                                        <User className='h-4 w-4 text-white' />
                                    </div>
                                    <span className='font-medium'>Mi perfil</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                                onClick={handleLogout} 
                                className='flex items-center gap-3 cursor-pointer py-2 text-red-500 focus:text-red-500'
                            >
                                <LogOut className='h-4 w-4' />
                                <span>Cerrar sesión</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <div className='flex items-center gap-2'>
                        <Link href='/login'>
                            <Button variant='ghost' size='sm' className='gap-1'>
                                <LogIn className='h-4 w-4' />
                                Ingresar
                            </Button>
                        </Link>
                        <Link href='/register'>
                            <Button variant='outline' size='sm' className='gap-1'>
                                <UserPlus className='h-4 w-4' />
                                Registrarse
                            </Button>
                        </Link>
                    </div>
                )}
            </nav>

            {/* Mobile Navigation */}
            <div className='flex md:hidden items-center gap-2'>
                <Link
                    href='/publicaciones/crear'
                    className='inline-flex items-center rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-2 text-sm font-medium text-white shadow-lg'
                >
                    Publicar
                </Link>

                <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label='Menú'
                >
                    {mobileMenuOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
                </Button>
            </div>

            {/* Mobile Menu Dropdown */}
            {mobileMenuOpen && (
                <div className='absolute top-full left-0 right-0 bg-card border-b border-border/50 md:hidden'>
                    <div className='flex flex-col p-4 gap-2'>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className='px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors'
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}

                        <hr className='my-2 border-border/50' />

                        {logged ? (
                            <>
                                <Link
                                    href='/perfil'
                                    className='px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors flex items-center gap-3'
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <div className='h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center'>
                                        <User className='h-4 w-4 text-white' />
                                    </div>
                                    <span className='font-medium'>Mi perfil</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className='px-3 py-3 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors flex items-center gap-3 text-left w-full'
                                >
                                    <LogOut className='h-5 w-5' />
                                    <span>Cerrar sesión</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href='/login'
                                    className='px-3 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-3'
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <LogIn className='h-5 w-5' />
                                    <span>Iniciar sesión</span>
                                </Link>
                                <Link
                                    href='/register'
                                    className='px-3 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 text-white hover:opacity-90 transition-colors flex items-center gap-3'
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <UserPlus className='h-5 w-5' />
                                    <span>Registrarse</span>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

