'use client';
import Link from 'next/link';
import { Shield, MessageCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

// Número de WhatsApp para contacto (sin el +)
const WHATSAPP_NUMBER = '5492236032601';
const WHATSAPP_MESSAGE = encodeURIComponent('¡Hola! Me comunico desde Inclusiva.');

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
			{/* Botón Admin (pequeño arriba) */}
			<Link
				href='/admin/posts'
				className='bg-gradient-to-br from-teal-500 to-blue-600 flex h-10 w-10 items-center justify-center rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition'
				aria-label='Ir al panel de admin'
			>
				<Shield className='w-4 h-4 text-white' />
			</Link>

			{/* Botón WhatsApp (principal, grande) */}
			<a
				href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
				target='_blank'
				rel='noopener noreferrer'
				className='bg-[#25D366] flex h-16 w-16 items-center justify-center rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition'
				aria-label='Contactar por WhatsApp'
			>
				<MessageCircle className='w-7 h-7 text-white' />
			</a>
		</div>
	);
}
