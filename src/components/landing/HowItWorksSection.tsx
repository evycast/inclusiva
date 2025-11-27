'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function HowItWorksSection() {
	const [activeTab, setActiveTab] = useState<'search' | 'publish'>('search');

	const searchSteps = [
		{
			number: '1',
			title: 'Explorá',
			desc: 'Navegá por las categorías o usá el buscador para encontrar lo que necesitás.',
		},
		{
			number: '2',
			title: 'Elegí',
			desc: 'Mirá los detalles, fotos y precios de los servicios o productos disponibles.',
		},
		{
			number: '3',
			title: 'Contactá',
			desc: 'Hablá directamente con la persona a través de WhatsApp o sus redes.',
		},
		{
			number: '4',
			title: 'Disfrutá',
			desc: 'Coordiná la entrega o el servicio y aprovechá la comunidad.',
		},
	];

	const publishSteps = [
		{
			number: '1',
			title: 'Registrate',
			desc: 'Creá tu cuenta gratuita en pocos segundos para empezar.',
		},
		{
			number: '2',
			title: 'Publicá',
			desc: 'Subí fotos y descripción de lo que ofrecés. ¡Es gratis!',
		},
		{
			number: '3',
			title: 'Moderación',
			desc: 'Revisamos tu publicación para asegurar que cumpla las normas.',
		},
		{
			number: '4',
			title: 'Conectá',
			desc: 'Recibí consultas de interesades directamente en tu WhatsApp.',
		},
	];

	const steps = activeTab === 'search' ? searchSteps : publishSteps;

	return (
		<section className='py-24 bg-slate-50/80'>
			<div className='container px-4 mx-auto'>
				<div className='text-center mb-12'>
					<Badge variant='outline' className='mb-4 border-primary/20 text-primary bg-primary/5'>
						Simple y Seguro
					</Badge>
					<h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-6'>¿Cómo funciona Inclusiva?</h2>

					{/* Custom Tabs */}
					<div className='inline-flex p-1 bg-white rounded-full border border-slate-200 shadow-sm mb-8'>
						<button
							onClick={() => setActiveTab('search')}
							className={cn(
								'px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300',
								activeTab === 'search'
									? 'bg-primary text-white shadow-md'
									: 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
							)}
						>
							Quiero Buscar
						</button>
						<button
							onClick={() => setActiveTab('publish')}
							className={cn(
								'px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300',
								activeTab === 'publish'
									? 'bg-primary text-white shadow-md'
									: 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
							)}
						>
							Quiero Publicar
						</button>
					</div>
				</div>

				<div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto'>
					{steps.map((step, index) => (
						<StepCard key={index} number={step.number} title={step.title} desc={step.desc} />
					))}
				</div>
			</div>
		</section>
	);
}

function StepCard({ number, title, desc }: { number: string; title: string; desc: string }) {
	return (
		<div className='bg-white p-8 rounded-[2rem] shadow-friendly hover:shadow-friendly-hover transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 border border-slate-100'>
			<div className='absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500' />
			<div className='relative z-10'>
				<div className='mb-6'>
					<span className='text-6xl font-black text-slate-300/50 group-hover:text-primary/20 transition-colors block leading-none tracking-tighter'>
						{number}
					</span>
				</div>
				<h3 className='text-xl font-bold text-slate-900 mb-3'>{title}</h3>
				<p className='text-slate-600 leading-relaxed font-medium'>{desc}</p>
			</div>
		</div>
	);
}
