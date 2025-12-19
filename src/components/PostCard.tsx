"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ApiPost } from '@/types/api';
import { categoryOptions, paymentMethodOptions } from '@/lib/validation/post';
import { getCategory } from '@/lib/categories';
import { 
    MapPin as LucideMapPin,
    Banknote as LucideBanknote,
    CreditCard as LucideCreditCard,
    Landmark as LucideLandmark,
    Bitcoin as LucideBitcoin,
    Handshake as LucideHandshake,
    Clock as LucideClock,
    Tag as LucideTag,
    Wallet as LucideWallet,
    Calendar as LucideCalendar,
    Medal as LucideMedal,
    Signal as LucideSignal,
    BadgeCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

// Tipos básicos
type Category = typeof categoryOptions[number];
type PaymentMethod = typeof paymentMethodOptions[number];
type PostCardProps = { post: ApiPost };

function formatPrice(value?: string): string | null {
	if (!value || value.trim().length === 0) return null;
	// Si es un número, formatearlo
	const num = Number(value);
	if (!isNaN(num) && num === 0) return 'Gratuito';
	if (!isNaN(num)) return `$ ${num.toLocaleString('es-AR')}`;
	// Si es texto, mostrarlo tal cual
	return value;
}

function formatDateTime(iso?: string): string | null {
	if (!iso) return null;
	try {
		const d = new Date(iso);
		return d.toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
	} catch {
		return iso;
	}
}

function mapConditionLabel(cond?: string): string | null {
	if (!cond) return null;
	if (cond === 'reacondicionado') return 'reacond.';
	return cond;
}

// Métodos de pago con colores unificados
const paymentMeta: Record<PaymentMethod, { icon: React.ElementType; className: string; label: string }> = {
    cash: {
        icon: LucideBanknote,
        className: 'text-slate-500',
        label: 'Efectivo',
    },
    debit: { icon: LucideCreditCard, className: 'text-slate-500', label: 'Débito' },
    credit: {
        icon: LucideCreditCard,
        className: 'text-slate-500',
        label: 'Crédito',
    },
    transfer: {
        icon: LucideLandmark,
        className: 'text-slate-500',
        label: 'Transferencia',
    },
    mercadopago: {
        icon: LucideWallet,
        className: 'text-slate-500',
        label: 'Billetera virtual',
    },
    crypto: { icon: LucideBitcoin, className: 'text-slate-500', label: 'Cripto' },
};

// Info extra por categoría (icono + valor) tipado estricto
type InfoItem = { key: string; icon: React.ElementType; value: string };
function getExtraInfo(post: ApiPost): InfoItem[] {
	const items: InfoItem[] = [];

	// Ubicación: usar venue para eventos, serviceArea para servicios
	const location = post.category === 'eventos' ? post.venue : (post.category === 'servicios' ? post.serviceArea : undefined);
    if (location) items.push({ key: 'location', icon: LucideMapPin, value: location });

	switch (post.category) {
    case 'eventos': {
            const p = post;
            const date = formatDateTime(p.startDate);
            if (date) items.push({ key: 'date', icon: LucideCalendar, value: date });
			break;
		}
    case 'servicios': {
            const p = post;
            if (p.experienceYears != null) items.push({ key: 'exp', icon: LucideMedal, value: `${p.experienceYears} años` });
            if (p.availability) items.push({ key: 'avail', icon: LucideClock, value: p.availability });
			break;
		}
    case 'productos': {
            const p = post;
			const cond = mapConditionLabel(p.condition);
            if (cond) items.push({ key: 'cond', icon: LucideTag, value: cond });
			break;
		}
    case 'usados': {
            const p = post;
            if (p.usageTime) items.push({ key: 'usage', icon: LucideClock, value: p.usageTime });
            items.push({ key: 'cond', icon: LucideTag, value: 'usado' });
			break;
		}
    case 'cursos': {
            const p = post;
            if (p.duration) items.push({ key: 'dur', icon: LucideClock, value: p.duration });
            if (p.schedule) items.push({ key: 'sch', icon: LucideClock, value: p.schedule });
            if (p.level) items.push({ key: 'lvl', icon: LucideSignal, value: p.level });
			break;
		}
    case 'pedidos': {
            const p = post;
            if (p.neededBy) items.push({ key: 'need', icon: LucideCalendar, value: p.neededBy });
            if (p.budgetRange) items.push({ key: 'budget', icon: LucideBanknote, value: p.budgetRange });
			break;
		}
	}
	return items;
}

export default function PostCard({ post }: PostCardProps) {
	const router = useRouter();
	const priceText = formatPrice(post.price);
	const extra = getExtraInfo(post).slice(0, 6);
	const categoryDef = getCategory(post.category);
	const CategoryIcon = categoryDef.icon;

	// Obtener nombre y avatar del autor desde la relación User
	const authorName = post.authorName ?? 'Anónimo';
	const authorAvatar = post.authorAvatar ?? undefined;

	const titleHoverClass =
		post.category === 'servicios' ? 'group-hover:text-violet-600' :
		post.category === 'productos' ? 'group-hover:text-pink-600' :
		post.category === 'usados' ? 'group-hover:text-orange-600' :
		post.category === 'eventos' ? 'group-hover:text-blue-600' :
		post.category === 'cursos' ? 'group-hover:text-green-600' :
		post.category === 'pedidos' ? 'group-hover:text-red-600' :
		'group-hover:text-slate-600';

	const avatarRingHoverClass =
		post.category === 'servicios' ? 'hover:ring-violet-400' :
		post.category === 'productos' ? 'hover:ring-pink-400' :
		post.category === 'usados' ? 'hover:ring-orange-400' :
		post.category === 'eventos' ? 'hover:ring-blue-400' :
		post.category === 'cursos' ? 'hover:ring-green-400' :
		post.category === 'pedidos' ? 'hover:ring-red-400' :
		'hover:ring-slate-400';

	return (
		<Link href={`/publicaciones/${post.id}`} className="block">
			<Card className='group overflow-hidden bg-card border border-border/50 transition-all duration-300 hover:shadow-friendly-hover cursor-pointer h-full'>
			<div className='relative aspect-[16/10] '>
				<Image src={post.image} alt={post.title} fill sizes='(max-width: 640px) 100vw, 33vw' className='object-cover transition-transform duration-500 group-hover:scale-105' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 via-black/40 to-transparent' />
				{/* Badge de categoría a la derecha con ícono */}
				<div className='absolute right-3 top-3 flex items-center gap-2'>
                    <Badge className={`text-white rounded-full px-3 py-1.5 shadow-sm bg-gradient-to-r ${categoryDef.gradient}`}>
						<CategoryIcon className='mr-1.5 w-3.5 h-3.5' />
						{categoryDef.label}
					</Badge>
				</div>
				{/* Overlay autor + rating */}
					<div className='absolute bottom-3 left-3'>
						<div className='rounded-full relative'>
							<div
								className='bg-black/70 pl-13 rounded-full pr-3 py-1.5 flex items-center top-1/2 -translate-y-1/2 ring-1 ring-white/10 shadow-md absolute'
								role='button'
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									if (post.authorId) router.push(`/perfil/${post.authorId}`);
								}}
							>
								<span className='max-w-[140px] truncate inline-flex items-center gap-1 text-xs font-medium text-white drop-shadow-sm'>
									{authorName}
									{post.authorVerified && (
										<BadgeCheck className='w-3.5 h-3.5 text-emerald-400 shrink-0' />
									)}
								</span>
							</div>
                            <Avatar
                                className={`h-10 w-10 ring-2 ring-white/20 shadow-md transition-transform duration-200 hover:scale-110 ${avatarRingHoverClass}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (post.authorId) router.push(`/perfil/${post.authorId}`);
                                }}
                            >
								<AvatarImage src={authorAvatar} alt={authorName} />
								<AvatarFallback className='font-medium bg-slate-100 text-slate-600'>{authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
							</Avatar>
						</div>
					</div>
			</div>

			<div className='p-4 h-full flex flex-col'>
        <h3 className={`line-clamp-2 font-semibold text-slate-900 text-[15px] sm:text-base transition-colors ${titleHoverClass}`}>{post.title}</h3>
		{post.subtitle ? (
			<p className='mt-1 line-clamp-2 text-[13px] text-slate-600'>{post.subtitle}</p>
		) : (
			post.description && (
				<p className='mt-1 line-clamp-2 text-[13px] text-slate-600'>{post.description}</p>
			)
		)}

				{/* Badges de información con colores por categoría */}
				{extra.length > 0 && (
					<div className='mt-3 flex flex-wrap items-center gap-2'>
						{extra.map((item) => {
							const Icon = item.icon;
							return (
                                <span
                                    key={item.key}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${categoryDef.bgColor} ${categoryDef.textColor} ${categoryDef.borderColor}`}
                                >
                                    <Icon className='opacity-80 w-3.5 h-3.5' />
                                    <span className='truncate max-w-[160px]'>{item.value}</span>
                                </span>
                            );
						})}
					</div>
				)}

				{/* Precio + métodos de pago */}
                        <div className='mt-auto pt-4'>
                            <div className='flex items-center justify-between gap-2'>
                                <div className='min-w-0 text-lg text-slate-900'>
                                    {priceText && <span className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700'>{priceText}</span>}
                                </div>
                                <div className='flex items-center gap-1.5'>
							{(post.payment ?? []).slice(0, 6).map((pm) => {
								const meta = paymentMeta[pm as keyof typeof paymentMeta];
								if (!meta) return null;
								const Icon = meta.icon;
								return (
									<Tooltip key={pm}>
										<TooltipTrigger asChild>
											<span
												className={`inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors ${meta.className}`}
												aria-label={meta.label}
											>
												<Icon className="w-4 h-4" />
											</span>
										</TooltipTrigger>
										<TooltipContent>{meta.label}</TooltipContent>
									</Tooltip>
								);
							})}
                            {post.barterAccepted && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span
                                            className='inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors text-slate-500'
                                            aria-label='Acepta canje'
                                        >
                                            <LucideHandshake className="w-4 h-4" />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>Acepta canje</TooltipContent>
                                </Tooltip>
                            )}
						</div>
					</div>
                </div>
            </div>
        </Card>
        </Link>
	);
}
