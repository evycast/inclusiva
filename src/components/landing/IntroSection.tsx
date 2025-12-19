'use client'

import React from 'react'
import { HeartHandshake, ShieldCheck, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function IntroSection() {
  return (
    <section className='relative overflow-hidden py-20'>
      <div className='absolute inset-0 bg-gradient-rainbow-soft opacity-20' />
      <div className='container px-4 mx-auto relative z-10'>
        <div className='text-center max-w-3xl mx-auto mb-12 space-y-4'>
          <Badge variant='outline' className='px-4 py-1.5 rounded-full border-primary/20 text-primary bg-primary/5 w-fit mx-auto'>
            Comunidad viva
          </Badge>
          <h2 className='text-3xl md:text-4xl font-bold text-foreground tracking-tight'>Una comunidad inclusiva y segura</h2>
          <p className='text-lg text-muted-foreground leading-relaxed'>Publicá, encontrá oportunidades y conectá con personas y organizaciones que respetan y cuidan.</p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <IntroCard icon={<Users className='w-6 h-6 text-indigo-600' />} title='Diversidad real' text='Categorías y filtros pensados para necesidades concretas, sin vueltas.' color='indigo' />
          <IntroCard icon={<ShieldCheck className='w-6 h-6 text-emerald-600' />} title='Moderación clara' text='Contenido revisado y herramientas de reporte para cuidar a la comunidad.' color='emerald' />
          <IntroCard icon={<HeartHandshake className='w-6 h-6 text-pink-600' />} title='Conexiones honestas' text='Datos de contacto protegidos hasta que decidas compartirlos.' color='pink' />
        </div>
      </div>
    </section>
  )
}

function IntroCard({ icon, title, text, color }: { icon: React.ReactNode; title: string; text: string; color: 'indigo' | 'emerald' | 'pink' }) {
  const bgRing = color === 'indigo' ? 'bg-indigo-100 text-indigo-700' : color === 'emerald' ? 'bg-emerald-100 text-emerald-700' : 'bg-pink-100 text-pink-700'
  const halo = color === 'indigo' ? 'from-indigo-200 to-indigo-300' : color === 'emerald' ? 'from-emerald-200 to-emerald-300' : 'from-pink-200 to-pink-300'
  return (
    <div className='group relative rounded-[2rem] border border-border/50 bg-card p-8 shadow-friendly transition-all duration-300 hover:shadow-friendly-hover hover:-translate-y-1 overflow-hidden'>
      <div className={`absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br ${halo} opacity-40 group-hover:scale-150 transition-transform duration-500`} />
      <div className='relative z-10 flex items-center gap-4 mb-4'>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${bgRing}`}>
          {icon}
        </div>
        <h3 className='text-lg font-bold text-foreground'>{title}</h3>
      </div>
      <p className='text-sm md:text-base text-muted-foreground leading-relaxed'>{text}</p>
    </div>
  )
}
