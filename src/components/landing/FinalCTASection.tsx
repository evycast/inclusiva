'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function FinalCTASection() {
  return (
    <section className='py-24 relative overflow-hidden'>
      {/* Background with soft rainbow gradient */}
      <div className='absolute inset-0 bg-gradient-rainbow-soft opacity-40' />
      
      {/* Decorative elements */}
      <div className='absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2' />
      <div className='absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2' />

      <div className='container mx-auto px-6 relative z-10 text-center'>
        <div className='max-w-3xl mx-auto'>
          
          <h2 className='text-4xl md:text-6xl font-black text-foreground mb-6 tracking-tight leading-tight'>
            ¿Te querés sumar?
          </h2>
          
          <p className='text-xl text-muted-foreground mb-10 leading-relaxed font-medium max-w-2xl mx-auto'>
            Hay un lugar para vos. Publicá lo que hacés o encontrá a quien necesitás en un entorno seguro y amigable.
          </p>

          <div className='flex flex-col sm:flex-row items-center justify-center gap-4'>
            <Link
              href='/publicaciones/crear'
              className='inline-flex items-center justify-center h-14 px-8 text-lg rounded-2xl bg-primary hover:bg-primary-700 shadow-lg hover:shadow-primary/30 hover:-translate-y-1 transition-all w-full sm:w-auto font-bold text-white'
            >
              Publicar Ahora
            </Link>
            <Link 
              href='/publicaciones'
              className='group relative inline-flex items-center justify-center h-14 px-8 text-lg rounded-2xl border-2 border-border bg-card/80 hover:bg-card hover:border-primary/30 text-muted-foreground hover:text-primary shadow-sm hover:shadow-md hover:-translate-y-1 transition-all w-full sm:w-auto font-bold'
            >
              Explorar Avisos
              <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
