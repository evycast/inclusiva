'use client';

import React from 'react';
import Link from 'next/link';
import { Box, ArrowRight } from 'lucide-react';
import { getCategory, CategoryKey } from '@/lib/categories';

const CATEGORY_MAPPING: { key: CategoryKey; href: string }[] = [
    { key: 'servicios', href: 'servicios' },
    { key: 'productos', href: 'productos' },
    { key: 'usados', href: 'usados' },
    { key: 'eventos', href: 'eventos' },
    { key: 'cursos', href: 'cursos' },
    { key: 'pedidos', href: 'pedidos' },
];

export function CategoriesSection() {
	return (
		<section className='py-24 bg-background relative'>
			<div className='container px-4 mx-auto'>
				<div className='text-center max-w-3xl mx-auto mb-16'>
					<h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4'>Explorá nuestras categorías</h2>
					<p className='text-lg text-muted-foreground'>Todo lo que buscás, organizado para vos.</p>
				</div>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{CATEGORY_MAPPING.map(({ key, href }) => {
						const def = getCategory(key);
						const Icon = def.icon;
						return (
							<CategoryCard
								key={key}
								icon={<Icon className='w-8 h-8' />}
								label={def.label}
								description={def.description}
								// Construct classes dynamically based on category color name to match original look but using centralized defs
								// def.color is like 'violet', 'pink', etc.
								color={`bg-${def.color}-50 text-${def.color}-600 hover:bg-${def.color}-100`}
                                href={`/publicaciones?category=${key}`}
							/>
						);
					})}
				</div>

                {/* CTA Ver todo */}
                <div className='mt-10 flex justify-center'>
                    <Link
                        href='/publicaciones'
                        aria-label='Ver todas las publicaciones'
                        className='group inline-flex items-center justify-center gap-2 w-full  rounded-2xl bg-slate-100 px-6 py-4 text-base text-slate-700 shadow-sm hover:bg-slate-100 hover:text-slate-900 hover:shadow-md transition-all'
                    >
                        <Box className='w-5 h-5 text-slate-600 group-hover:text-slate-800' />
                        <span className='font-semibold'>Ver todo</span>
                        <ArrowRight className='w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform' />
                    </Link>
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
				className={`h-full rounded-[2rem] p-8 transition-all duration-300  shadow-sm hover:shadow-xl cursor-pointer ${color} bg-opacity-30 border border-transparent hover:border-black/5 flex flex-col justify-start`}
			>
				<div className='flex flex-col gap-6 items-start text-left'>
					<div className='w-16 h-16 rounded-3xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
						{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-8 h-8' })}
					</div>
					<div>
						<h3 className='font-bold text-2xl text-foreground mb-3'>{label}</h3>
						<p className='text-foreground/80 leading-relaxed font-medium opacity-90'>{description}</p>
					</div>
				</div>
			</div>
		</Link>
	);
}
