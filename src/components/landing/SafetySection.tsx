'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export function SafetySection() {
	return (
		<section className='py-24 overflow-hidden'>
			<div className='container px-4 mx-auto'>
				<div className='bg-gradient-to-br from-violet-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden'>
					{/* Background decorations */}
					<div className='absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl' />
					<div className='absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl' />

					<div className='relative z-10 flex flex-col md:flex-row items-center gap-16'>
						<div className='flex-1 space-y-8 text-left'>
							<div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-sm font-bold backdrop-blur-sm border border-white/10'>
								<ShieldCheck className='w-4 h-4' />
								Moderación Activa
							</div>
							<h2 className='text-3xl md:text-5xl font-bold leading-tight'>Tu seguridad es nuestra prioridad</h2>
							<p className='text-indigo-100 text-lg md:text-xl leading-relaxed opacity-90'>
								Cada publicación y perfil es revisado manualmente por nuestro equipo. Fomentamos un ambiente de respeto
								y confianza para todes.
							</p>
							<div>
								<Link href='/seguridad'>
									<Button
										variant='secondary'
										className='rounded-full h-14 px-8 text-lg font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all bg-white text-violet-700 hover:bg-indigo-50'
									>
										Más información
									</Button>
								</Link>
							</div>
						</div>
						<div className='flex-1 flex justify-center relative'>
							<div className='relative w-72 h-72 md:w-80 md:h-80'>
								<img
									src='https://image.pollinations.ai/prompt/flat%20vector%20illustration%20two%20people%20hugging%20protection%20care%20community%20safe%20space%20minimalist%20vibrant%20colors%20white%20background?width=600&height=600&nologo=true&seed=88'
									alt='Seguridad'
									className='w-full h-full object-contain drop-shadow-2xl animate-float'
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
