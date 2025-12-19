// Tipos para los datos de seed
export type PaymentMethod = 'cash' | 'debit' | 'credit' | 'transfer' | 'mercadopago' | 'crypto';

export interface BaseSeedPost {
  id: string;
  category: 'eventos' | 'servicios' | 'productos' | 'usados' | 'cursos' | 'pedidos';
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  authorName: string;
  authorAvatar?: string;
  price?: string;
  rating?: number;
  ratingCount?: number;
  tags?: string[];
  urgent?: boolean;
  date: string;
  contact?: Record<string, string>;
  payment?: PaymentMethod[];
  barterAccepted?: boolean;
}

export interface EventSeedPost extends BaseSeedPost {
  category: 'eventos';
  startDate: string;
  endDate?: string;
  venue: string;
  mode: 'presencial' | 'online' | 'hibrido';
  capacity?: number;
  organizer?: string;
}

export interface ServiceSeedPost extends BaseSeedPost {
  category: 'servicios';
  experienceYears?: number;
  availability?: string;
  serviceArea?: string;
}

export interface ProductSeedPost extends BaseSeedPost {
  category: 'productos';
  condition: 'nuevo' | 'reacondicionado';
  stock?: number;
  warranty?: string;
}

export interface UsedSeedPost extends BaseSeedPost {
  category: 'usados';
  condition: 'usado';
  usageTime?: string;
}

export interface CourseSeedPost extends BaseSeedPost {
  category: 'cursos';
  mode: 'presencial' | 'online' | 'hibrido';
  duration: string;
  schedule?: string;
  level?: 'principiante' | 'intermedio' | 'avanzado';
}

export interface RequestSeedPost extends BaseSeedPost {
  category: 'pedidos';
  neededBy?: string;
  budgetRange?: string;
}

export type SeedPost = EventSeedPost | ServiceSeedPost | ProductSeedPost | UsedSeedPost | CourseSeedPost | RequestSeedPost;
