'use client';

import { Badge } from '@/components/ui/badge';
import type { PostInput } from '@/lib/validation/post';
import { Calendar, MapPin, Users, Laptop, Store, Wrench, Medal, History, Banknote } from 'lucide-react';

type Props = { post: PostInput };

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return iso ?? null;
  }
}

export default function CategorySpecificInfo({ post }: Props) {
  if (!post?.category) return null;

  if (post.category === 'eventos') {
    const start = formatDate(post.startDate);
    const end = formatDate(post.endDate);
    return (
      <div className='space-y-3'>
        <h2 className='text-xl font-semibold text-foreground'>Detalles del evento</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground'>
          {start && (
            <div className='flex items-center gap-2'>
              <Calendar className='text-blue-600 w-5 h-5' />
              <span>Inicio: {start}</span>
            </div>
          )}
          {end && (
            <div className='flex items-center gap-2'>
              <Calendar className='text-blue-600 w-5 h-5' />
              <span>Fin: {end}</span>
            </div>
          )}
          {post.venue && (
            <div className='flex items-center gap-2'>
              <MapPin className='text-red-600 w-5 h-5' />
              <span>Lugar: {post.venue}</span>
            </div>
          )}
          {post.mode && (
            <div className='flex items-center gap-2'>
              <Laptop className='text-violet-600 w-5 h-5' />
              <span>Modalidad: {post.mode}</span>
            </div>
          )}
          {typeof post.capacity === 'number' && (
            <div className='flex items-center gap-2'>
              <Users className='text-emerald-600 w-5 h-5' />
              <span>Capacidad: {post.capacity}</span>
            </div>
          )}
          {post.organizer && (
            <div className='flex items-center gap-2'>
              <Medal className='text-amber-600 w-5 h-5' />
              <span>Organiza: {post.organizer}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (post.category === 'servicios') {
    return (
      <div className='space-y-3'>
        <h2 className='text-xl font-semibold text-foreground'>Detalles del servicio</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground'>
          {typeof post.experienceYears === 'number' && (
            <div className='flex items-center gap-2'>
              <Wrench className='text-violet-600 w-5 h-5' />
              <span>Experiencia: {post.experienceYears} años</span>
            </div>
          )}
          {post.availability && (
            <div className='flex items-center gap-2'>
              <Calendar className='text-emerald-600 w-5 h-5' />
              <span>Disponibilidad: {post.availability}</span>
            </div>
          )}
          {post.serviceArea && (
            <div className='flex items-center gap-2'>
              <MapPin className='text-red-600 w-5 h-5' />
              <span>Zona: {post.serviceArea}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (post.category === 'productos') {
    return (
      <div className='space-y-3'>
        <h2 className='text-xl font-semibold text-foreground'>Detalles del producto</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground'>
          {post.condition && (
            <div className='flex items-center gap-2'>
              <Store className='text-pink-600 w-5 h-5' />
              <span>Condición: {post.condition}</span>
            </div>
          )}
          {typeof post.stock === 'number' && (
            <div className='flex items-center gap-2'>
              <Badge variant='outline' className='border-border'>Stock: {post.stock}</Badge>
            </div>
          )}
          {post.warranty && (
            <div className='flex items-center gap-2'>
              <Medal className='text-amber-600 w-5 h-5' />
              <span>Garantía: {post.warranty}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (post.category === 'usados') {
    return (
      <div className='space-y-3'>
        <h2 className='text-xl font-semibold text-foreground'>Detalles del usado</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground'>
          {post.usageTime && (
            <div className='flex items-center gap-2'>
              <History className='text-orange-600 w-5 h-5' />
              <span>Tiempo de uso: {post.usageTime}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (post.category === 'cursos') {
    return (
      <div className='space-y-3'>
        <h2 className='text-xl font-semibold text-foreground'>Detalles del curso</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground'>
          {post.mode && (
            <div className='flex items-center gap-2'>
              <Laptop className='text-green-600 w-5 h-5' />
              <span>Modalidad: {post.mode}</span>
            </div>
          )}
          {post.duration && (
            <div className='flex items-center gap-2'>
              <Calendar className='text-green-600 w-5 h-5' />
              <span>Duración: {post.duration}</span>
            </div>
          )}
          {post.schedule && (
            <div className='flex items-center gap-2'>
              <Calendar className='text-green-600 w-5 h-5' />
              <span>Cronograma: {post.schedule}</span>
            </div>
          )}
          {post.level && (
            <div className='flex items-center gap-2'>
              <Medal className='text-amber-600 w-5 h-5' />
              <span>Nivel: {post.level}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (post.category === 'pedidos') {
    const needed = formatDate(post.neededBy);
    return (
      <div className='space-y-3'>
        <h2 className='text-xl font-semibold text-foreground'>Detalles del pedido</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-muted-foreground'>
          {needed && (
            <div className='flex items-center gap-2'>
              <Calendar className='text-red-600 w-5 h-5' />
              <span>Necesidad hasta: {needed}</span>
            </div>
          )}
          {post.budgetRange && (
            <div className='flex items-center gap-2'>
              <Banknote className='text-red-600 w-5 h-5' />
              <span>Presupuesto: {post.budgetRange}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
