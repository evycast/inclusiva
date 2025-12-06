import type { Prisma, Category, Mode } from '@prisma/client'

export type ListParams = {
	q?: string;
	category?: string;
	status?: 'pending' | 'approved' | 'rejected';
	minPrice?: number;
	maxPrice?: number;
	urgent?: boolean;
	mode?: 'presencial' | 'online' | 'hibrido';
};

function normalize(str: string) {
	return str
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '');
}

export function buildPostWhere(params: ListParams, opts?: { includeNonApproved?: boolean }): Prisma.PostWhereInput {
    const where: Prisma.PostWhereInput = {};

	// Status: by default only approved
	if (!opts?.includeNonApproved) {
		where.status = 'approved';
	} else if (params.status) {
		where.status = params.status;
	}

    if (params.category) {
        where.category = params.category as Category;
    }

	if (params.urgent !== undefined) {
		where.urgent = params.urgent;
	}

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
        where.price = {
            ...(params.minPrice !== undefined ? { gte: params.minPrice } : {}),
            ...(params.maxPrice !== undefined ? { lte: params.maxPrice } : {}),
        };
    }

    if (params.mode) {
        where.mode = params.mode as Mode;
    }

    const andClauses: Prisma.PostWhereInput[] = []

    if (params.q && params.q.trim().length > 0) {
        const qRaw = params.q.trim();
        const q = normalize(qRaw);
        andClauses.push({
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { subtitle: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { location: { contains: q, mode: 'insensitive' } },
                { author: { contains: q, mode: 'insensitive' } },
                { tags: { has: q } },
            ],
        })
    }

    if (!opts?.includeNonApproved) {
        const now = new Date()
        andClauses.push({ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] })
    }

    if (andClauses.length > 0) where.AND = andClauses

    return where;
}

export type SortKey = 'recent' | 'price_asc' | 'price_desc' | 'rating_desc';

export function resolveOrderBy(sort?: SortKey): Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[] {
    switch (sort) {
        case 'price_asc':
            return { price: 'asc' };
        case 'price_desc':
            return { price: 'desc' };
        case 'rating_desc':
            return { rating: 'desc' };
        case 'recent':
        default:
            return [{ status: 'asc' }, { createdAt: 'desc' }];
    }
}
