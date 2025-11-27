import Image from 'next/image';
import Link from 'next/link';
import type { PostInput } from '@/lib/validation/post';
import { categoryOptions, paymentMethodOptions } from '@/lib/validation/post';
import { getCategory } from '@/lib/categories';
import {
	FaMapMarkerAlt,
	FaStar,
	FaMoneyBill,
	FaCreditCard,
	FaUniversity,
	FaBitcoin,
	FaHandshake,
	FaClock,
	FaTag,
	FaWallet,
	FaMoneyCheckAlt,
	FaCalendarAlt,
	FaUsers,
	FaLaptop,
	FaShieldAlt,
	FaBoxOpen,
	FaHistory,
	FaMedal,
	FaSignal,
	FaQuestionCircle,
	FaGlobe,
	FaShoppingCart,
	FaCalendarCheck,
	FaInfoCircle,
	FaEnvelope,
	FaWhatsapp,
	FaInstagram,
	FaTelegramPlane,
	FaPaperPlane,
	FaTools,
	FaStore,
	FaExchangeAlt,
	FaGraduationCap,
	FaSearch,
} from 'react-icons/fa';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// Tipos básicos
type Category = typeof categoryOptions[number];
type PaymentMethod = typeof paymentMethodOptions[number];
type PostCardProps = { post: PostInput };

function formatPrice(value?: number, label?: string): string | null {
	if (label && label.trim().length > 0) return label;
	if (typeof value !== 'number') return null;
	if (value === 0) return 'Gratuito';
	return `$ ${value.toLocaleString('es-AR')}`;
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
		icon: FaMoneyBill,
		className: 'text-slate-500',
		label: 'Efectivo',
	},
	debit: { icon: FaCreditCard, className: 'text-slate-500', label: 'Débito' },
	credit: {
		icon: FaCreditCard,
		className: 'text-slate-500',
		label: 'Crédito',
	},
	transfer: {
		icon: FaUniversity,
		className: 'text-slate-500',
		label: 'Transferencia',
	},
	mercadopago: {
		icon: FaWallet,
		className: 'text-slate-500',
		label: 'Billetera virtual',
	},
	crypto: { icon: FaBitcoin, className: 'text-slate-500', label: 'Cripto' },
	barter: {
		icon: FaHandshake,
		className: 'text-slate-500',
		label: 'Canje',
	},
	all: {
		icon: FaMoneyCheckAlt,
		className: 'text-slate-500',
		label: 'Todos los medios',
	},
};

// Info extra por categoría (icono + valor) tipado estricto
type InfoItem = { key: string; icon: React.ElementType; value: string };
function getExtraInfo(post: PostInput): InfoItem[] {
	const items: InfoItem[] = [];

	// Ubicación unificada como primer chip
	if (post.location) items.push({ key: 'location', icon: FaMapMarkerAlt, value: post.location });

	switch (post.category) {
    case 'eventos': {
            const p = post;
			const date = formatDateTime(p.startDate);
			if (date) items.push({ key: 'date', icon: FaCalendarAlt, value: date });
			break;
		}
    case 'servicios': {
            const p = post;
			if (p.experienceYears != null) items.push({ key: 'exp', icon: FaMedal, value: `${p.experienceYears} años` });
			if (p.availability) items.push({ key: 'avail', icon: FaClock, value: p.availability });
			break;
		}
    case 'productos': {
            const p = post;
			const cond = mapConditionLabel(p.condition);
			if (cond) items.push({ key: 'cond', icon: FaTag, value: cond });
			break;
		}
    case 'usados': {
            const p = post;
			if (p.usageTime) items.push({ key: 'usage', icon: FaHistory, value: p.usageTime });
			items.push({ key: 'cond', icon: FaTag, value: 'usado' });
			break;
		}
    case 'cursos': {
            const p = post;
			if (p.duration) items.push({ key: 'dur', icon: FaClock, value: p.duration });
			if (p.schedule) items.push({ key: 'sch', icon: FaClock, value: p.schedule });
			if (p.level) items.push({ key: 'lvl', icon: FaSignal, value: p.level });
			break;
		}
    case 'pedidos': {
            const p = post;
			if (p.neededBy) items.push({ key: 'need', icon: FaCalendarAlt, value: p.neededBy });
			if (p.budgetRange) items.push({ key: 'budget', icon: FaMoneyBill, value: p.budgetRange });
			break;
		}
	}
	return items;
}

export default function PostCard({ post }: PostCardProps) {
	const priceText = formatPrice(post.price, post.priceLabel);
	const extra = getExtraInfo(post).slice(0, 6);
	const categoryDef = getCategory(post.category);
	const CategoryIcon = categoryDef.icon;

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
						<div className='bg-black/70 pl-13 rounded-full pr-3 py-1.5 flex items-center top-1/2 -translate-y-1/2 ring-1 ring-white/10 shadow-md absolute backdrop-blur-sm'>
							<span className='max-w-[140px] truncate inline-flex items-center text-xs font-medium text-white drop-shadow-sm '>
								{post.author}
							</span>
						</div>
						<Avatar className='h-10 w-10 ring-2 ring-white/20 shadow-md'>
							<AvatarImage src={post.authorAvatar} alt={post.author} />
							<AvatarFallback className='font-medium bg-slate-100 text-slate-600'>{post.author.slice(0, 2).toUpperCase()}</AvatarFallback>
						</Avatar>
					</div>
				</div>
			</div>

			<div className='p-4 h-full flex flex-col'>
		<h3 className='line-clamp-2 font-semibold text-slate-900 text-[15px] sm:text-base group-hover:text-primary transition-colors'>{post.title}</h3>
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
									className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium border ${categoryDef.bgColor} ${categoryDef.textColor} ${categoryDef.borderColor}`}
								>
									<Icon className='opacity-80 text-[10px]' />
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
							{post.barterAccepted && !(post.payment ?? []).includes('barter') && (
								<Tooltip>
									<TooltipTrigger asChild>
										<span
											className={`inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors ${paymentMeta.barter.className}`}
											aria-label='Acepta canje'
										>
											<FaHandshake className="w-4 h-4" />
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
