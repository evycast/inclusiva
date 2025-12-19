// Re-exportar tipos y datos de la nueva estructura de seed
export type { SeedPost as Post, PaymentMethod, BaseSeedPost as BasePost } from './seed/types';
export { allSeedPosts as posts } from './seed';

export type Category = 'eventos' | 'servicios' | 'productos' | 'usados' | 'cursos' | 'pedidos';

export const categoryToGradientClass: Record<Category, string> = {
  eventos: 'category-overlay-red',
  servicios: 'category-overlay-blue',
  productos: 'category-overlay-orange',
  usados: 'category-overlay-violet',
  cursos: 'category-overlay-green',
  pedidos: 'category-overlay-pink',
};

export const categoryToTileClass: Record<Category, string> = {
  eventos: 'bg-grad-red',
  servicios: 'bg-grad-blue',
  productos: 'bg-grad-orange',
  usados: 'bg-grad-violet',
  cursos: 'bg-grad-green',
  pedidos: 'bg-grad-pink',
};
