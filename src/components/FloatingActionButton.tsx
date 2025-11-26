'use client';
import Link from 'next/link';
import { FaQuestionCircle, FaShieldAlt, FaEnvelope } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function FloatingActionButton() {
	const [isFooterVisible, setIsFooterVisible] = useState(false);

	useEffect(() => {
		const footer = document.querySelector('footer');
		if (!footer) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setIsFooterVisible(entry.isIntersecting);
			},
			{
				rootMargin: '0px 0px -50px 0px', // Se activa 50px antes de que el footer sea visible
				threshold: 0
			}
		);

		observer.observe(footer);

		return () => observer.disconnect();
	}, []);

	return (
			<div
				className={`fixed right-6 z-50 flex flex-col items-end gap-3 transition-all duration-300 ${
					isFooterVisible ? 'bottom-32' : 'bottom-6'
				}`}
			>
                <Button
                    className='rounded-full w-12 h-12 shadow-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white hover:opacity-90'
                    aria-label='Enviar correo de prueba'
                    onClick={async () => {
                        try {
                            const res = await fetch('/api/test/email', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ to: 'evelyncastellano1999@gmail.com' }),
                            })
                            const data = await res.json()
                            if (!res.ok) throw new Error(typeof data?.error === 'string' ? data.error : `Error ${res.status}`)
                            toast.success(`Correo de prueba enviado (id: ${data.id ?? 'n/a'})`)
                        } catch (err: unknown) {
                            const msg = err instanceof Error ? err.message : 'Error de envío'
                            toast.error(msg)
                        }
                    }}
                >
                    <FaEnvelope className='w-5 h-5' />
                </Button>
                <Link
                    href='/admin/posts'
                    className='bg-gradient-to-br from-teal-500 to-blue-600 flex h-12 w-12 items-center justify-center rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition '
                    aria-label='Ir al panel de admin'
                >
                    <FaShieldAlt className='w-5 h-5 text-white' />
                </Link>

                <Link
                    href='/guia'
                    className='bg-gradient-to-br from-pink-500 to-violet-600 flex h-16 w-16 items-center justify-center rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition'
                    aria-label='Abrir ayuda y preguntas frecuentes'
                >
                    <FaQuestionCircle className='w-6 h-6 text-white' />
                </Link>
            </div>
        );
}
