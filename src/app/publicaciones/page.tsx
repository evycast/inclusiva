'use client';

import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '@/components/PostCard';
import SearchFilters from '@/components/SearchFilters';
import { useCategory } from '@/contexts/CategoryContext';
import { Button } from '@/components/ui/button';
import { usePostsQuery, type UiSortKey } from '@/hooks/usePosts';
import type { ApiPost } from '@/types/api';

export default function PostsListPage() {
	const { selectedCategory, setSelectedCategory } = useCategory();
	const [q, setQ] = useState('');
	const [debouncedQ, setDebouncedQ] = useState('');
	const [sort, setSort] = useState<UiSortKey>('recent');
	const [page, setPage] = useState(1);
	const pageSize = 24;

	useEffect(() => {
		const t = setTimeout(() => setDebouncedQ(q), 300);
		window.scrollTo(0, 0);
		return () => clearTimeout(t);
	}, [q]);

	// Reset page to 1 when filters change
	useEffect(() => {
		setPage(1);
		window.scrollTo(0, 0);
	}, [selectedCategory, debouncedQ, sort]);

	const {
		data: list,
		isLoading,
		isError,
	} = usePostsQuery({
		category: selectedCategory,
		q: debouncedQ,
		sort,
		page,
		pageSize,
	});

	const posts: ApiPost[] = list?.data ?? [];
	const pagination = list?.pagination ?? { page: 1, totalPages: 1, total: 0, hasPrev: false, hasNext: false, pageSize };

	return (
		<>
			{/* Hero Header con imagen de fondo */}
			<section className='relative  py-16 md:min-h-[40vh] flex items-center justify-center overflow-hidden'>
				{/* Imagen de fondo */}
				<div className='absolute inset-0 hero-bg-abstract' />

				{/* Overlay gradiente suave */}
				<div className='absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-background' />

				{/* Contenido del header */}
				<div className='relative z-10 text-center space-y-6 px-4 sm:px-6 max-w-4xl mx-auto'>
					<h1 className='font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight'>
						<span className='bg-gradient-to-r from-white via-pink-100 to-violet-200 bg-clip-text text-transparent'>
							Inclusiva
						</span>
					</h1>
					<p className='text-lg sm:text-xl lg:text-2xl text-white max-w-2xl mx-auto leading-relaxed'>
						Descubrí eventos, servicios, productos y más de nuestra increible comunidad
					</p>
				</div>
			</section>

			<main className='mx-auto max-w-7xl px-4 sm:px-6 pb-8 flex flex-col gap-6 sm:gap-8 h-full min-h-[calc(100svh-5rem)]'>
				{/* Filtros de búsqueda */}
				<SearchFilters
					selected={selectedCategory}
					onSelectedChange={setSelectedCategory}
					searchQuery={q}
					onSearchQueryChange={setQ}
					sortBy={sort}
					onSortByChange={setSort}
					resultsCount={pagination.total}
				/>

				{/* Grid de cards */}
				{isLoading && (
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className='rounded-xl border p-4 bg-card'>
								<div className='flex items-center gap-3 mb-4'>
									<Skeleton className='h-10 w-10 rounded-full' />
									<div className='flex-1'>
										<Skeleton className='h-4 w-3/4 mb-2' />
										<Skeleton className='h-3 w-1/2' />
									</div>
								</div>
								<Skeleton className='h-40 w-full rounded-lg mb-4' />
								<Skeleton className='h-4 w-full mb-2' />
								<Skeleton className='h-4 w-5/6 mb-2' />
								<Skeleton className='h-4 w-2/3' />
							</div>
						))}
					</div>
				)}
				{isError && <div className='text-center text-destructive'>No se pudo cargar las publicaciones</div>}
				{!isLoading && !isError && (
					<>
						<section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
							{posts.map((p) => (
								<PostCard key={p.id} post={p} />
							))}
						</section>

						{/* Paginación */}
						{pagination?.totalPages && pagination?.totalPages > 1 && (
							<div className='flex items-center justify-start gap-2 mt-4 '>
								<Button
									variant='outline'
									disabled={!pagination.hasPrev}
									onClick={() => setPage((p) => Math.max(p - 1, 1))}
								>
									Anterior
								</Button>
								<span className='text-sm text-muted-foreground'>
									Página {pagination.page} de {pagination.totalPages}
								</span>
								<Button variant='outline' disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
									Siguiente
								</Button>
							</div>
						)}
					</>
				)}
			</main>
		</>
	);
}
