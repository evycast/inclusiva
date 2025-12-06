'use client';

import React from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, PlusCircle, Search } from 'lucide-react';

export function HeroSection() {
	return (
		<section className='relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28'>
			<div className='absolute inset-0 -z-10 bg-gradient-rainbow-soft opacity-30 blur-3xl' />
			<div className='container px-4 mx-auto'>
				<div className='flex flex-col lg:flex-row items-center gap-12 lg:gap-20'>
					<div className='flex-[1.2] text-center lg:text-left space-y-8'>
						<Badge
							variant='outline'
							className='px-4 py-2 text-sm rounded-full bg-card/50 backdrop-blur border-primary/20 text-primary animate-in fade-in slide-in-from-bottom-4 duration-700'
						>
							<Sparkles className='w-4 h-4 mr-2 text-primary' />
							Comunidad Inclusiva
						</Badge>
						<h1 className='text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl leading-tight'>
							Conectá, colaborá y <span className='text-gradient-brand'>crecé sin barreras</span>
						</h1>
						<p className='max-w-2xl mx-auto lg:mx-0 text-xl text-muted-foreground leading-relaxed'>
							Un espacio seguro y moderado donde la comunidad se une. Ofrecé tus servicios, vendé productos, encontrá
							lo que necesitás o sumate a eventos increíbles.
						</p>

						<div className='flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4'>
							<Button
								asChild
								size='lg'
								className='h-14 px-8 text-lg rounded-2xl bg-primary hover:bg-primary-700 shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all w-full sm:w-auto font-bold cursor-pointer'
                            >
                                <Link href='/publicaciones/crear/'>
                                    <PlusCircle className='mr-2 h-5 w-5' />
                                    Publicar Ahora
                                </Link>
                            </Button>
							<Button
								asChild
								size='lg'
								variant='outline'
								className='h-14 px-8 text-lg rounded-2xl border-2 border-border bg-card/80 hover:bg-card hover:border-primary/30 text-muted-foreground hover:text-primary shadow-sm hover:shadow-md hover:-translate-y-1 transition-all w-full sm:w-auto font-bold cursor-pointer'
                            >
                                <Link href='/publicaciones/'>
                                    <Search className='mr-2 h-5 w-5' />
                                    Explorar Todo
                                </Link>
                            </Button>
						</div>
					</div>

					<div className='flex-[0.8] relative w-full max-w-md lg:max-w-full animate-float'>
						{/* Illustration - Cleaner Vector Style */}
						<div className='relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl bg-card p-4 rotate-2 hover:rotate-0 transition-transform duration-500'>
							<img
								src='https://image.pollinations.ai/prompt/flat%20vector%20illustration%20of%20diverse%20young%20people%20collaborating%20happy%20minimalist%20vibrant%20colors%20white%20background%20clean%20lines%20dribbble%20style?width=800&height=800&nologo=true&seed=101'
								alt='Comunidad Inclusiva'
								className='w-full h-auto rounded-[2rem] bg-muted'
							/>
						</div>
						{/* Decorative elements behind */}
						<div className='absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full blur-2xl opacity-50 -z-10' />
						<div className='absolute -bottom-10 -left-10 w-40 h-40 bg-pink-300 rounded-full blur-2xl opacity-50 -z-10' />
					</div>
				</div>
			</div>
		</section>
	);
}
