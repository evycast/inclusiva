import React from 'react';
import { Briefcase, ShoppingBag, Repeat, Calendar, GraduationCap, HandHeart, Box, LucideIcon } from 'lucide-react';

export type CategoryKey = 'servicios' | 'productos' | 'usados' | 'eventos' | 'cursos' | 'pedidos' | 'todos';

interface CategoryDef {
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  gradient: string;
}

export const CATEGORIES: Record<CategoryKey, CategoryDef> = {
  servicios: {
    label: 'Servicios',
    description: 'Ofrecé tu talento o encontrá profesionales de confianza.',
    icon: Briefcase,
    color: 'violet',
    textColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    gradient: 'from-violet-500 to-purple-600',
  },
  productos: {
    label: 'Productos',
    description: 'Vendé lo que hacés o comprá a emprendedores locales.',
    icon: ShoppingBag,
    color: 'pink',
    textColor: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    gradient: 'from-pink-500 to-rose-500',
  },
  usados: {
    label: 'Usados',
    description: 'Dale una segunda vida a tus cosas. Economía circular.',
    icon: Repeat,
    color: 'orange',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    gradient: 'from-orange-500 to-amber-500',
  },
  eventos: {
    label: 'Eventos',
    description: 'Descubrí actividades, talleres y encuentros cerca tuyo.',
    icon: Calendar,
    color: 'blue',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    gradient: 'from-blue-500 to-cyan-500',
  },
  cursos: {
    label: 'Cursos',
    description: 'Aprendé nuevas habilidades o enseñá lo que sabés.',
    icon: GraduationCap,
    color: 'green',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    gradient: 'from-green-500 to-emerald-600',
  },
  pedidos: {
    label: 'Pedidos',
    description: 'Solicitá lo que necesitás y recibí ayuda de la comunidad.',
    icon: HandHeart,
    color: 'red',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    gradient: 'from-red-500 to-pink-600',
  },
  todos: {
    label: 'Todos',
    description: 'Explorá todas las categorías.',
    icon: Box,
    color: 'slate',
    textColor: 'text-slate-600',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200',
    gradient: 'from-slate-500 to-slate-600',
  }
};

export const getCategory = (key: string): CategoryDef => {
  const k = key.toLowerCase() as CategoryKey;
  return CATEGORIES[k] || CATEGORIES.todos;
};
