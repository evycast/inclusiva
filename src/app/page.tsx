"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PostCard from '@/components/PostCard';
import { usePostsQuery } from '@/hooks/usePosts';

export default function Home() {
  const [q, setQ] = useState('');
  const router = useRouter();
  const { data, isLoading } = usePostsQuery({ sort: 'recent', page: 1, pageSize: 6 });
  const posts = data?.data ?? [];

  return (
    <main className='mx-auto max-w-7xl px-6 py-10 flex flex-col gap-10'>
      <section className='relative py-16 flex items-center justify-center overflow-hidden'>
        <div className='absolute inset-0 hero-bg-abstract' />
        <div className='absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/70 to-slate-900' />
        <div className='relative z-10 text-center space-y-6 max-w-3xl mx-auto'>
          <h1 className='font-display text-5xl font-bold tracking-tight'>
            <span className='bg-gradient-to-r from-white via-pink-100 to-violet-200 bg-clip-text text-transparent'>
              Inclusiva
            </span>
          </h1>
          <p className='text-lg text-gray-200'>
            Descubrí y publicá en una plataforma inclusiva y simple.
          </p>
          <div className='mx-auto flex max-w-xl items-center gap-2'>
            <Input
              placeholder='Buscar publicaciones...'
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <Button onClick={() => router.push(`/publicaciones?q=${encodeURIComponent(q)}`)}>Buscar</Button>
          </div>
          <div className='mt-4 flex flex-wrap items-center justify-center gap-3 text-sm'>
            <Link href='/publicaciones?category=eventos' className='text-muted-foreground hover:text-foreground'>Eventos</Link>
            <Link href='/publicaciones?category=servicios' className='text-muted-foreground hover:text-foreground'>Servicios</Link>
            <Link href='/publicaciones?category=productos' className='text-muted-foreground hover:text-foreground'>Productos</Link>
            <Link href='/publicaciones?category=usados' className='text-muted-foreground hover:text-foreground'>Usados</Link>
            <Link href='/publicaciones?category=cursos' className='text-muted-foreground hover:text-foreground'>Cursos</Link>
            <Link href='/publicaciones?category=pedidos' className='text-muted-foreground hover:text-foreground'>Pedidos</Link>
          </div>
        </div>
      </section>

      <section className='px-1'>
        <h2 className='text-xl font-semibold mb-4'>Recientes</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
          {isLoading && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className='rounded-xl border p-4 bg-card h-[280px]' />
          ))}
          {!isLoading && posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </section>
    </main>
  );
}
