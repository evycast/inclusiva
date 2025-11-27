'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, ArrowRight, CheckCircle2 } from 'lucide-react';

export function DonationSection() {
	return (
		<section className='py-24 bg-white'>
			<div className='container px-4 mx-auto'>
				<div className='relative group rounded-[2.5rem] overflow-hidden'>
					<div className='absolute inset-0 bg-gradient-rainbow-soft opacity-20' />
					<div className='relative z-10 bg-white/60 p-8 md:p-16'>
						<div className='flex flex-col md:flex-row items-center gap-12 lg:gap-20'>
							<div className='flex-1 relative order-2 md:order-1'>
								<img
									src='https://image.pollinations.ai/prompt/flat%20vector%20illustration%20community%20support%20heart%20hands%20donation%20minimalist%20vibrant%20colors%20white%20background?width=600&height=400&nologo=true&seed=42'
									alt='Comunidad Solidaria'
									className='w-full h-auto rounded-3xl shadow-lg transform -rotate-2 hover:rotate-0 transition-all duration-500'
								/>
							</div>
							<div className='flex-1 space-y-8 text-left order-1 md:order-2'>
								<div>
									<div className='space-y-6'>
										<div className='flex flex-col md:flex-row items-center gap-4 '>
											<div className='w-16 h-16 rounded-2xl bg-pink-100 flex items-center justify-center text-pink-600 shadow-inner'>
												<Heart className='w-8 h-8 fill-current' />
											</div>
											<h3 className='text-3xl md:text-4xl font-bold text-slate-900 '>Apoyá esta iniciativa</h3>
										</div>
										<p className='text-slate-600 text-lg leading-relaxed'>
											Inclusiva nació como una respuesta autogestionada para crear oportunidades reales de inclusión
											laboral y social. No somos una gran empresa, somos una comunidad construida con esfuerzo y
											corazón.
										</p>
										<p className='text-slate-600 text-lg leading-relaxed'>
											Tu aporte, por pequeño que sea, es fundamental. Nos ayuda a mantener los servidores activos,
											mejorar la plataforma y seguir brindando este espacio de forma gratuita y sin barreras para
											quienes más lo necesitan.
										</p>
									</div>
								</div>
								<div className='pt-4'>
									<Link href='/colaborar' className='inline-block'>
										<Button className='rounded-xl h-14 px-8 text-lg font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all'>
											Cómo colaborar
											<ArrowRight className='ml-2 w-5 h-5' />
										</Button>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
