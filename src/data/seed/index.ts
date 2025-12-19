// Exportar todos los datos de seed
export * from './types';
export { eventPosts } from './events';
export { servicePosts } from './services';
export { productPosts } from './products';
export { usedPosts } from './used';
export { coursePosts } from './courses';
export { requestPosts } from './requests';

import type { SeedPost } from './types';
import { eventPosts } from './events';
import { servicePosts } from './services';
import { productPosts } from './products';
import { usedPosts } from './used';
import { coursePosts } from './courses';
import { requestPosts } from './requests';

// Combinar todos los posts
export const allSeedPosts: SeedPost[] = [
  ...eventPosts,
  ...servicePosts,
  ...productPosts,
  ...usedPosts,
  ...coursePosts,
  ...requestPosts,
];
