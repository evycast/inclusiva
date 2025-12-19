'use client';

import { Calendar, Search, Wrench, ShoppingBag, Repeat, GraduationCap, Box } from 'lucide-react';
import Tile from './Tile';
import { useCategory } from '@/contexts/CategoryContext';
import { useRouter } from 'next/navigation';

export default function BentoGrid() {
	const { setSelectedCategory } = useCategory();
	const router = useRouter();

	const handleCategoryClick = (
		category: 'eventos' | 'pedidos' | 'servicios' | 'productos' | 'cursos' | 'usados' | 'all'
	) => {
		setSelectedCategory(category);
		router.push('/publicaciones');
	};

	return (
		<section className='grid grid-cols-1 gap-4 us:grid-cols-6 sm:gap-6 sm:grid-cols-12 sm:grid-rows-12 flex-1 min-h-[calc(100svh-8rem)]'>
			<button
				onClick={() => handleCategoryClick('eventos')}
				className='col-span-1 us:col-span-3 bg-grad-red sm:col-start-1 sm:col-span-4 sm:row-start-1 sm:row-span-3  overflow-hidden relative z-20 flex flex-col items-center justify-center text-center rounded-2xl p-4 md:p-5 lg:p-6 transition-transform duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 shadow-sm'
			>
				<div className='tile-decoration decoration-events'></div>
				<Calendar size={28} className='drop-shadow relative z-10' />
				<span className='text-lg font-semibold drop-shadow relative z-10 mt-1'>Eventos</span>
			</button>

			<button
				onClick={() => handleCategoryClick('pedidos')}
				className='col-span-1 us:col-span-3 bg-grad-pink sm:col-start-9 sm:col-span-5 sm:row-start-1 sm:row-span-3  overflow-hidden relative z-20 flex flex-col items-center justify-center text-center rounded-2xl p-4 md:p-5 lg:p-6 transition-transform duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 shadow-sm'
			>
				<div className='tile-decoration decoration-requests'></div>
				<Search size={28} className='drop-shadow relative z-10' />
				<span className='text-lg font-semibold drop-shadow relative z-10 mt-1'>Pedidos</span>
			</button>

			<button
				onClick={() => handleCategoryClick('servicios')}
				className='col-span-1 us:col-span-3 bg-grad-blue sm:col-start-1 sm:col-span-4 sm:row-start-4 sm:row-span-6  overflow-hidden relative z-20 flex flex-col items-center justify-center text-center rounded-2xl p-4 md:p-5 lg:p-6 transition-transform duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 shadow-sm'
			>
				<div className='tile-decoration decoration-services'></div>
				<Wrench size={28} className='drop-shadow relative z-10' />
				<span className='text-lg font-semibold drop-shadow relative z-10 mt-1'>Servicios</span>
			</button>

			<button
				onClick={() => handleCategoryClick('productos')}
				className='col-span-1 us:col-span-3 bg-grad-orange sm:col-start-5 sm:col-span-4 sm:row-start-1 sm:row-span-8  overflow-hidden relative z-20 flex flex-col items-center justify-center text-center rounded-2xl p-4 md:p-5 lg:p-6 transition-transform duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 shadow-sm'
			>
				<div className='tile-decoration decoration-products'></div>
				<ShoppingBag size={28} className='drop-shadow relative z-10' />
				<span className='text-lg font-semibold drop-shadow relative z-10 mt-1'>Productos</span>
			</button>
			<button
				onClick={() => handleCategoryClick('cursos')}
				className='col-span-1 us:col-span-3 bg-grad-green sm:col-start-1 sm:col-span-4 sm:row-start-10 sm:row-span-3  overflow-hidden relative z-20 flex flex-col items-center justify-center text-center rounded-2xl p-4 md:p-5 lg:p-6 transition-transform duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 shadow-sm'
			>
				<div className='tile-decoration decoration-courses'></div>
				<GraduationCap size={28} className='drop-shadow relative z-10' />
				<span className='text-lg font-semibold drop-shadow relative z-10 mt-1'>Cursos</span>
			</button>
			<button
				onClick={() => handleCategoryClick('usados')}
				className='col-span-1 us:col-span-3 bg-grad-violet sm:col-start-9 sm:col-span-5 sm:row-start-4 sm:row-span-5  overflow-hidden relative z-20 flex flex-col items-center justify-center text-center rounded-2xl p-4 md:p-5 lg:p-6 transition-transform duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 shadow-sm'
			>
				<div className='tile-decoration decoration-used'></div>
				<Repeat size={28} className='drop-shadow relative z-10' />
				<span className='text-lg font-semibold drop-shadow relative z-10 mt-1'>Usados</span>
			</button>

			<button
				onClick={() => handleCategoryClick('all')}
				className='col-span-1 us:col-span-6 bg-grad-gray  sm:col-span-9 sm:row-start-9 sm:row-span-4 relative overflow-hidden  z-20 flex flex-col items-center justify-center text-center rounded-2xl p-4 md:p-5 lg:p-6 transition-transform duration-500 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:scale-[1.02] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 shadow-sm'
			>
				<div className='tile-decoration decoration-all'></div>
				<Box size={28} className='drop-shadow relative z-10' />
				<span className='text-lg font-semibold drop-shadow relative z-10 mt-1'>Todos</span>
			</button>
		</section>
	);
}
