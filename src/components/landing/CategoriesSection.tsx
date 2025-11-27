'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, ShoppingBag, Repeat, Calendar, GraduationCap, HandHeart } from 'lucide-react';

export function CategoriesSection() {
	return (
		<section className='py-24 bg-white relative'>
			<div className='container px-4 mx-auto'>
				<div className='text-center max-w-3xl mx-auto mb-16'>
					<h2 className='text-3xl md:text-4xl font-bold text-slate-900 mb-4'>Explorá nuestras categorías</h2>
					<p className='text-lg text-slate-600'>Todo lo que buscás, organizado para vos.</p>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					<CategoryCard
						icon={<Briefcase className='w-8 h-8' />}
						label='Servicios'
						description='Ofrecé tu talento o encontrá profesionales de confianza.'
						color='bg-violet-50 text-violet-600 hover:bg-violet-100'
						href='/publicaciones?category=services'
					/>
					<CategoryCard
						icon={<ShoppingBag className='w-8 h-8' />}
						label='Productos'
						description='Vendé lo que hacés o comprá a emprendedores locales.'
						color='bg-pink-50 text-pink-600 hover:bg-pink-100'
						href='/publicaciones?category=products'
					/>
					<CategoryCard
						icon={<Repeat className='w-8 h-8' />}
						label='Usados'
						description='Dale una segunda vida a tus cosas. Economía circular y solidaria.'
						color='bg-orange-50 text-orange-600 hover:bg-orange-100'
						href='/publicaciones?category=used'
					/>
					<CategoryCard
						icon={<Calendar className='w-8 h-8' />}
						label='Eventos'
						description='Descubrí actividades, talleres y encuentros cerca tuyo.'
						color='bg-blue-50 text-blue-600 hover:bg-blue-100'
						href='/publicaciones?category=events'
					/>
					<CategoryCard
						icon={<GraduationCap className='w-8 h-8' />}
						label='Cursos'
						description='Aprendé nuevas habilidades o enseñá lo que sabés.'
						color='bg-green-50 text-green-600 hover:bg-green-100'
						href='/publicaciones?category=courses'
					/>
					<CategoryCard
						icon={<HandHeart className='w-8 h-8' />}
						label='Pedidos'
						description='Solicitá lo que necesitás y recibí ayuda de la comunidad.'
						color='bg-red-50 text-red-600 hover:bg-red-100'
						href='/publicaciones?category=requests'
					/>
				</div>
			</div>
		</section>
	);
}

function CategoryCard({
	icon,
	label,
	description,
	color,
	href,
}: {
	icon: React.ReactElement;
	label: string;
	description: string;
	color: string;
	href: string;
}) {
	return (
		<Link href={href} className='group block h-full'>
			<div
				className={`h-full rounded-[2rem] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl cursor-pointer ${color} bg-opacity-30 border border-transparent hover:border-black/5 flex flex-col justify-start`}
			>
				<div className='flex flex-col gap-6 items-start text-left'>
					<div className='w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
						{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-8 h-8' })}
					</div>
					<div>
						<h3 className='font-bold text-2xl text-slate-900 mb-3'>{label}</h3>
						<p className='text-slate-700 leading-relaxed font-medium opacity-90'>{description}</p>
					</div>
				</div>
			</div>
		</Link>
	);
}
