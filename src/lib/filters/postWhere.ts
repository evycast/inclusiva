import type { Prisma, Category, Mode } from '@prisma/client'

export type ListParams = {
	q?: string;
	category?: string;
	status?: 'pending' | 'approved' | 'rejected';
	urgent?: boolean;
	mode?: 'presencial' | 'online' | 'hibrido';
	payment?: ('cash'|'debit'|'credit'|'transfer'|'mercadopago'|'crypto')[];
	location?: string;
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

	if (params.mode) {
		where.mode = params.mode as Mode;
	}

	if (params.payment && params.payment.length > 0) {
		const pay: Prisma.EnumPaymentMethodNullableListFilter = { hasSome: params.payment as unknown as Prisma.EnumPaymentMethodNullableListFilter['hasSome'] }
		where.payment = pay
	}

	// Buscar por venue (lugar del evento)
	if (params.location && params.location.trim().length > 0) {
		where.venue = { contains: params.location.trim(), mode: 'insensitive' }
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
				{ venue: { contains: q, mode: 'insensitive' } },
				{ tags: { has: q } },
				// Buscar por nombre del usuario autor
				{ user: { name: { contains: q, mode: 'insensitive' } } },
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

export type SortKey = 'recent' | 'rating_desc';

export function resolveOrderBy(sort?: SortKey): Prisma.PostOrderByWithRelationInput | Prisma.PostOrderByWithRelationInput[] {
	switch (sort) {
		case 'rating_desc':
			return [{ status: 'asc' }, { rating: 'desc' }, { ratingCount: 'desc' }, { createdAt: 'desc' }];
		case 'recent':
		default:
			return [{ status: 'asc' }, { createdAt: 'desc' }, { id: 'desc' }];
	}
}
