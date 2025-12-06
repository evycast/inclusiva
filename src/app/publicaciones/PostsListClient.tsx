"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import PostCard from '@/components/PostCard';
import SearchFilters from '@/components/SearchFilters';
import { useCategory } from '@/contexts/CategoryContext';
import { Button } from '@/components/ui/button';
import { usePostsQuery, type UiSortKey } from '@/hooks/usePosts';
import { CATEGORIES } from '@/lib/categories';
import type { Category } from '@/data/posts';
import type { ApiPost } from '@/types/api';

export default function PostsListClient() {
  const { selectedCategory, setSelectedCategory } = useCategory();
  const sp = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [sort, setSort] = useState<UiSortKey>('recent');
  const [page, setPage] = useState(1);
  const pageSize = 24;
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300);
    window.scrollTo(0, 0);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const category = sp.get('category');
    const q0 = sp.get('q') ?? '';
    const sort0 = (sp.get('sort') as UiSortKey | null) ?? 'recent';
    const page0 = parseInt(sp.get('page') ?? '1', 10) || 1;
    const allowed: ReadonlyArray<Category | 'all'> = ['eventos','servicios','productos','usados','cursos','pedidos','all'] as const;
    if (category && allowed.includes(category as Category | 'all')) setSelectedCategory(category as Category | 'all');
    setQ(q0);
    setDebouncedQ(q0);
    setSort(sort0);
    setPage(Math.max(page0, 1));
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') params.set('category', String(selectedCategory));
    if (debouncedQ) params.set('q', debouncedQ);
    if (sort) params.set('sort', sort);
    params.set('page', String(page));
    const next = params.toString();
    const current = sp.toString();
    if (next !== current) router.replace(`/publicaciones?${next}`);
  }, [selectedCategory, debouncedQ, sort, page, initialized]);

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
    enabled: initialized,
  });

  const posts: ApiPost[] = list?.data ?? [];
  const pagination = list?.pagination ?? { page: 1, totalPages: 1, total: 0, hasPrev: false, hasNext: false, pageSize };
  const showLoading = !initialized || isLoading;

  return (
    <>
      <section className='relative py-16 md:py-20 flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 hero-bg-abstract opacity-30' />
        {(() => {
          const k = String(selectedCategory ?? 'todos')
          const def = CATEGORIES[k as keyof typeof CATEGORIES] ?? CATEGORIES.todos
          return <div className={`absolute inset-0 bg-gradient-to-b ${def.gradient} to-background`} />
        })()}
        <div className='relative z-10 text-center space-y-5 px-4 sm:px-6 max-w-4xl mx-auto'>
          <h1 className='font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white'>Publicaciones</h1>
          <p className='text-base sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed'>Encontrá lo que necesitás y conectá con la comunidad</p>
        </div>
      </section>

      <main className='mx-auto max-w-7xl px-4 sm:px-6 pb-8 flex flex-col gap-6 sm:gap-8 h-full min-h-[calc(100svh-5rem)]'>
        <SearchFilters
          selected={selectedCategory}
          onSelectedChange={setSelectedCategory}
          searchQuery={q}
          onSearchQueryChange={setQ}
          sortBy={sort}
          onSortByChange={setSort}
          resultsCount={pagination.total}
        />

        {showLoading && (
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
        {!showLoading && !isError && (
          <>
            <section className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {posts.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </section>

            {pagination?.totalPages && pagination?.totalPages > 1 && (
              <div className='flex items-center justify-center gap-2 mt-4 '>
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

