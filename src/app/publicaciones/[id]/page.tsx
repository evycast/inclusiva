'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import type { PostInput } from '@/lib/validation/post';
import { categoryGradients } from '@/utils/categoryPatterns';
import { usePostQuery } from '@/hooks/usePost';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
	FaArrowLeft,
	FaExternalLinkAlt,
	FaPhone,
	FaHeart,
	FaShare,
	FaTimesCircle,
} from 'react-icons/fa';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import CommentForm from '@/components/CommentForm';
import CommentList from '@/components/CommentList';

type PageProps = { params: { id: string } };

const categoryLabel: Record<string, string> = {
	eventos: 'Eventos',
	servicios: 'Servicios',
	productos: 'Productos',
	usados: 'Usados',
	cursos: 'Cursos',
	pedidos: 'Pedidos',
};

const categoryIcon: Record<string, React.ElementType> = {
	eventos: FaCalendarAlt,
	servicios: FaTools,
	productos: FaStore,
	usados: FaExchangeAlt,
	cursos: FaGraduationCap,
	pedidos: FaSearch,
};

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
		return d.toLocaleString('es-AR', {
			day: '2-digit',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	} catch {
		return iso;
	}
}

const paymentMeta: Record<string, { icon: React.ElementType; className: string; label: string }> = {
	cash: { icon: FaMoneyBill, className: 'text-green-400', label: 'Efectivo' },
	debit: { icon: FaCreditCard, className: 'text-blue-400', label: 'Débito' },
	credit: { icon: FaCreditCard, className: 'text-purple-400', label: 'Crédito' },
	transfer: { icon: FaUniversity, className: 'text-cyan-400', label: 'Transferencia' },
	mercadopago: { icon: FaWallet, className: 'text-sky-400', label: 'Billetera virtual' },
	crypto: { icon: FaBitcoin, className: 'text-orange-400', label: 'Cripto' },
	barter: { icon: FaHandshake, className: 'text-amber-400', label: 'Canje' },
	all: { icon: FaMoneyCheckAlt, className: 'text-slate-400', label: 'Todos los medios' },
};

const contactMeta: Record<string, { icon: React.ElementType; className: string; label: string }> = {
	whatsapp: { icon: FaWhatsapp, className: 'text-green-400', label: 'WhatsApp' },
	instagram: { icon: FaInstagram, className: 'text-pink-400', label: 'Instagram' },
	telegram: { icon: FaTelegramPlane, className: 'text-blue-400', label: 'Telegram' },
	email: { icon: FaEnvelope, className: 'text-slate-400', label: 'Email' },
	website: { icon: FaGlobe, className: 'text-cyan-400', label: 'Sitio web' },
};

export default function PostDetailPage() {
	const params = useParams();
	const router = useRouter();
	const [copied, setCopied] = useState(false);
	const { data, isLoading, isError } = usePostQuery((params.id as string) || '');
	const post: PostInput | undefined = data?.data;

	// Si hay error o no se encuentra la publicación, redirige a /publicaciones
	useEffect(() => {
		if (!isLoading && (isError || !post)) {
			router.replace('/publicaciones');
		}
	}, [isLoading, isError, post, router]);

	const handleShare = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (e) {
			console.error('Error al copiar el enlace:', e);
		}
	};

	if (isLoading) {
		return (
			<div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
				<div className='max-w-5xl mx-auto p-6'>
					<Skeleton className='h-[40vh] rounded-2xl' />
					<div className='mt-6 space-y-4'>
						<Skeleton className='h-6 w-1/2 rounded' />
						<Skeleton className='h-4 w-2/3 rounded' />
					</div>
				</div>
			</div>
		);
	}

	if (isError || !post) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-center text-destructive'>No se encontró la publicación</div>
			</div>
		);
	}

	const priceText = formatPrice(post.price, post.priceLabel);
	const CategoryIcon = categoryIcon[post.category];

	const statusMeta = (() => {
		const s = post.status;
		if (!s) return null;
		if (s === 'pending') {
			return {
				label: 'Pendiente de aprobación',
				className: 'border-amber-500 text-amber-400 bg-amber-500/15',
				Icon: FaClock,
			};
		}
		if (s === 'rejected') {
			return {
				label: 'Rechazada',
				className: 'border-red-500 text-red-400 bg-red-500/15',
				Icon: FaTimesCircle,
			};
		}
		return null;
	})();

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      <div className='max-w-5xl mx-auto'>
				{/* Header con botón de regreso */}
				<div className='flex items-center justify-between p-6'>
					<Link href='/publicaciones'>
						<Button
							variant='outline'
							size='sm'
							className='border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors'
						>
							<FaArrowLeft className='mr-2' />
							Volver
						</Button>
					</Link>

					<div className='flex items-center gap-2'>
						<Button
							variant='ghost'
							size='sm'
							className='text-slate-400 hover:text-white'
							onClick={handleShare}
						>
							<FaShare className='w-4 h-4' />
						</Button>
						{copied && (
							<span className='text-xs text-green-400' aria-live='polite'>Enlace copiado</span>
						)}
					</div>
				</div>

        {/* Imagen principal */}
        <div className='relative h-[40vh] lg:h-[50vh] mx-6 rounded-2xl overflow-hidden'>
          <Image src={post.image} alt={post.title} fill className='object-cover' priority />
        </div>

				{/* Contenido principal */}
          <div className='p-6 space-y-8'>
            <div className='rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground'>
              Importante: el contacto y la contratación se gestionan fuera de la plataforma. Usá tu criterio y precaución.
            </div>
					{/* Header de información */}
					<div className='space-y-6'>
						<div className='flex flex-wrap items-center justify-between gap-4'>
							<div className='flex flex-wrap items-center gap-3'>
								<Badge
									variant='secondary'
									className={`text-white rounded-full px-4 py-2 text-sm font-medium ${
										categoryGradients[post.category]
									}`}
								>
									<CategoryIcon className='mr-2 w-4 h-4' />
									{categoryLabel[post.category]}
								</Badge>
								{statusMeta && (
									<Badge
										variant='outline'
										className={`rounded-full px-3 py-1 text-xs font-medium ${statusMeta.className}`}
									>
										{statusMeta.Icon && <statusMeta.Icon className='mr-1 inline w-3 h-3' />}
										{statusMeta.label}
									</Badge>
								)}
								{post.urgent && (
									<Badge variant='destructive' className='bg-red-500 text-white font-medium px-3 py-1 rounded-full'>
										<FaInfoCircle className='mr-1 w-3 h-3' />
										Urgente
									</Badge>
								)}
							</div>

							<div className='text-slate-400 text-sm flex items-center gap-2'>
								<FaCalendarAlt className='w-4 h-4' />
								<span>
									Publicado el
									{post?.date
										? new Date(post.date).toLocaleDateString('es-AR', {
												day: 'numeric',
												month: 'long',
												year: 'numeric',
										  })
										: 'Fecha no disponible'}
								</span>
							</div>
						</div>

						<h1 className='text-2xl lg:text-3xl font-bold text-white leading-tight'>{post.title}</h1>

						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6'>
							<div className='flex items-center gap-4'>
								<Avatar className='w-12 h-12 ring-2 ring-slate-600'>
									<AvatarImage src={post.authorAvatar} alt={post.author} />
									<AvatarFallback className='bg-slate-700 text-white font-semibold'>
										{post.author.slice(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
								<div className='flex flex-col'>
									<span className='font-semibold text-slate-200'>{post.author}</span>
									{/* {typeof post.rating === 'number' && post.rating > 0 && (
										<div className='flex items-center gap-1'>
											<FaStar className='text-yellow-400 w-4 h-4' />
											<span className='font-medium text-slate-300'>{post.rating}</span>
											{post.ratingCount && <span className='text-sm text-slate-400'>({post.ratingCount} reseñas)</span>}
										</div>
									)} */}
								</div>
							</div>

							{priceText && <div className='text-3xl lg:text-4xl font-bold text-green-400'>{priceText}</div>}
						</div>
					</div>

					<Separator className='bg-slate-700' />

					{/* Grid de contenido */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						{/* Columna principal */}
						<div className='lg:col-span-2 space-y-6'>
					{/* Descripción: mostrar subtítulo y descripción */}
					<div className='space-y-3'>
						<h2 className='text-xl font-semibold text-slate-100'>Descripción</h2>
						{post.subtitle && (
							<p className='text-slate-200 leading-relaxed text-base font-medium'>{post.subtitle}</p>
						)}
						{post.description && (
							<p className='text-slate-300 leading-relaxed text-base'>{post.description}</p>
						)}
					</div>

							{/* Información específica por categoría */}
							{renderCategorySpecificInfo(post)}

							{/* Ubicación */}
							<div className='space-y-3'>
								<h2 className='text-xl font-semibold text-slate-100'>Ubicación</h2>
								<div className='flex items-center gap-3 text-slate-300'>
									<FaMapMarkerAlt className='text-red-400 w-5 h-5' />
									<span className='text-base'>{post.location}</span>
								</div>
							</div>

							{/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className='space-y-3'>
                                    <h2 className='text-xl font-semibold text-slate-100'>Etiquetas</h2>
                                    <div className='flex flex-wrap gap-2'>
                                        {post.tags.map((tag, index) => (
                                            <Badge
                                                key={index}
                                                variant='outline'
                                                className='border-slate-600 text-slate-300 hover:bg-slate-700'
                                            >
                                                <FaTag className='mr-2 text-xs' />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className='space-y-3'>
                                <h2 className='text-xl font-semibold text-slate-100'>Comentarios</h2>
                                <CommentForm postId={params.id as string} />
                                <div className='mt-4'>
                                    <CommentList postId={params.id as string} />
                                </div>
                            </div>
						</div>

						{/* Sidebar de contacto y pago */}
						<div className='space-y-6'>
							{/* Contacto / redes sociales */}
							{post.socials && post.socials.length > 0 && (
								<Card className='bg-slate-800 border-slate-700'>
									<CardContent className='p-6'>
										<h3 className='text-lg font-semibold text-slate-100 mb-4'>Contacto</h3>
                                        <div className='space-y-3 mb-6'>
                                            {post.socials.map(({ name, url }, idx) => {
                                                const meta = contactMeta[name] || {
                                                    icon: FaExternalLinkAlt,
                                                    className: 'text-slate-400',
                                                    label: name,
                                                };
                                                const Icon = meta.icon;
                                                const isLink = typeof url === 'string' && url.toLowerCase().startsWith('http');

                                                if (isLink) {
                                                    return (
                                                        <a
                                                            key={`${name}-${idx}`}
                                                            href={url}
                                                            target='_blank'
                                                            rel='noopener noreferrer'
                                                            className='flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors'
                                                        >
                                                            <Icon className={`${meta.className} text-lg`} />
                                                            <div className='flex-1 min-w-0'>
                                                                {/* Mostrar nombre de la red social */}
                                                                <div className='text-slate-100 text-sm font-medium'>{meta.label}</div>
                                                            </div>
                                                            {/* Indicador de que abrirá una página */}
                                                            <FaExternalLinkAlt className='text-slate-400' aria-label='Abrir página externa' />
                                                        </a>
                                                    );
                                                }

                                                return (
                                                    <div
                                                        key={`${name}-${idx}`}
                                                        className='flex items-center gap-3 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors'
                                                    >
                                                        <Icon className={`${meta.className} text-lg`} />
                                                        <div className='flex-1 min-w-0'>
                                                            {/* Mostrar directamente el valor cuando no es enlace */}
                                                            <div className='text-slate-100 text-sm truncate'>{url}</div>
                                                        </div>
                                                        <Button
                                                            variant='outline'
                                                            size='sm'
                                                            className='text-slate-200 border-slate-600 hover:bg-slate-600'
                                                            onClick={async () => {
                                                                try {
                                                                    await navigator.clipboard.writeText(url)
                                                                    setCopied(true)
                                                                    setTimeout(() => setCopied(false), 2000)
                                                                } catch (e) {
                                                                    console.error('Error al copiar', e)
                                                                }
                                                            }}
                                                        >
                                                            Copiar
                                                        </Button>
                                                        {copied && <span className='ml-2 text-xs text-green-400'>Copiado</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
									</CardContent>
								</Card>
							)}

							{/* Métodos de pago */}
							{post.payment && post.payment.length > 0 && (
								<Card className='bg-slate-800 border-slate-700'>
									<CardContent className='p-6'>
										<h3 className='text-lg font-semibold text-slate-100 mb-4'>Métodos de pago</h3>

										<div className='space-y-3'>
											{post.payment.map((method) => {
												const meta = paymentMeta[method];
												if (!meta) return null;
												const Icon = meta.icon;
												return (
													<div key={method} className='flex items-center gap-4 p-2 rounded bg-slate-700/30 text-sm'>
														<Icon className={`${meta.className}`} />
														<span className='text-slate-300'>{meta.label}</span>
													</div>
												);
											})}
											{post.barterAccepted && !post.payment.includes('barter') && (
												<div className='flex items-center gap-4 p-2 rounded bg-slate-700/30 text-sm'>
													<FaHandshake className='text-amber-400' />
													<span className='text-slate-300'>Acepta canje</span>
												</div>
											)}
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

function renderCategorySpecificInfo(post: PostInput) {
	switch (post.category) {
		case 'eventos': {
			const eventPost = post;
			return (
				<div className='space-y-6'>
					<div className='bg-card border border-border rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-slate-100 mb-4'>Detalles del Evento</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='space-y-3'>
								<div className='flex items-center gap-4'>
									<FaCalendarAlt className='text-blue-400' />
									<div>
										<p className='text-slate-200 font-medium'>Inicio</p>
										<p className='text-slate-400 text-sm'>{formatDateTime(eventPost.startDate)}</p>
									</div>
								</div>
								{eventPost.endDate && (
									<div className='flex items-center gap-4'>
										<FaCalendarCheck className='text-green-400' />
										<div>
											<p className='text-slate-200 font-medium'>Fin</p>
											<p className='text-slate-400 text-sm'>{formatDateTime(eventPost.endDate)}</p>
										</div>
									</div>
								)}
							</div>
							<div className='space-y-3'>
								<div className='flex items-center gap-4'>
									<FaMapMarkerAlt className='text-red-400' />
									<div>
										<p className='text-slate-200 font-medium'>Lugar</p>
										<p className='text-slate-400 text-sm'>{eventPost.venue}</p>
									</div>
								</div>
								<div className='flex items-center gap-4'>
									<FaLaptop className='text-purple-400' />
									<div>
										<p className='text-slate-200 font-medium'>Modalidad</p>
										<p className='text-slate-400 text-sm capitalize'>{eventPost.mode}</p>
									</div>
								</div>
								{eventPost.capacity && (
									<div className='flex items-center gap-4'>
										<FaUsers className='text-cyan-400' />
										<div>
											<p className='text-slate-200 font-medium'>Capacidad</p>
											<p className='text-slate-400 text-sm'>{eventPost.capacity} personas</p>
										</div>
									</div>
								)}
								{eventPost.organizer && (
									<div className='flex items-center gap-4'>
										<FaInfoCircle className='text-amber-400' />
										<div>
											<p className='text-slate-200 font-medium'>Organiza</p>
											<p className='text-slate-400 text-sm'>{eventPost.organizer}</p>
										</div>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			);
		}

		case 'servicios': {
			const servicePost = post;
			return (
				<div className='space-y-6'>
					<div className='bg-card border border-border rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-slate-100 mb-4'>Detalles del Servicio</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{servicePost.experienceYears && (
								<div className='flex items-center gap-4'>
									<FaMedal className='text-yellow-400' />
									<div>
										<p className='text-slate-200 font-medium'>Experiencia</p>
										<p className='text-slate-400 text-sm'>{servicePost.experienceYears} años</p>
									</div>
								</div>
							)}
							{servicePost.availability && (
								<div className='flex items-center gap-4'>
									<FaClock className='text-green-400' />
									<div>
										<p className='text-slate-200 font-medium'>Disponibilidad</p>
										<p className='text-slate-400 text-sm'>{servicePost.availability}</p>
									</div>
								</div>
							)}
							{servicePost.serviceArea && (
								<div className='flex items-center gap-4'>
									<FaMapMarkerAlt className='text-red-400' />
									<div>
										<p className='text-slate-200 font-medium'>Zona de servicio</p>
										<p className='text-slate-400 text-sm'>{servicePost.serviceArea}</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			);
		}

		case 'productos': {
			const productPost = post;
			return (
				<div className='space-y-6'>
					<div className='bg-card border border-border rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-slate-100 mb-4'>Detalles del Producto</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='flex items-center gap-4'>
								<FaTag className='text-blue-400' />
								<div>
									<p className='text-slate-200 font-medium'>Condición</p>
									<p className='text-slate-400 text-sm capitalize'>{productPost.condition}</p>
								</div>
							</div>
							{productPost.stock && (
								<div className='flex items-center gap-4'>
									<FaBoxOpen className='text-green-400' />
									<div>
										<p className='text-slate-200 font-medium'>Stock</p>
										<p className='text-slate-400 text-sm'>{productPost.stock} unidades</p>
									</div>
								</div>
							)}
							{productPost.warranty && (
								<div className='flex items-center gap-4'>
									<FaShieldAlt className='text-purple-400' />
									<div>
										<p className='text-slate-200 font-medium'>Garantía</p>
										<p className='text-slate-400 text-sm'>{productPost.warranty}</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			);
		}

		case 'usados': {
			const usedPost = post;
			return (
				<div className='space-y-6'>
					<div className='bg-card border border-border rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-slate-100 mb-4'>Detalles del Producto Usado</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='flex items-center gap-4'>
								<FaTag className='text-orange-400' />
								<div>
									<p className='text-slate-200 font-medium'>Condición</p>
									<p className='text-slate-400 text-sm capitalize'>{usedPost.condition}</p>
								</div>
							</div>
							{usedPost.usageTime && (
								<div className='flex items-center gap-4'>
									<FaHistory className='text-cyan-400' />
									<div>
										<p className='text-slate-200 font-medium'>Tiempo de uso</p>
										<p className='text-slate-400 text-sm'>{usedPost.usageTime}</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			);
		}

		case 'cursos': {
			const coursePost = post;
			return (
				<div className='space-y-6'>
					<div className='bg-card border border-border rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-slate-100 mb-4'>Detalles del Curso</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='flex items-center gap-4'>
								<FaLaptop className='text-purple-400' />
								<div>
									<p className='text-slate-200 font-medium'>Modalidad</p>
									<p className='text-slate-400 text-sm capitalize'>{coursePost.mode}</p>
								</div>
							</div>
							{coursePost.duration && (
								<div className='flex items-center gap-4'>
									<FaClock className='text-green-400' />
									<div>
										<p className='text-slate-200 font-medium'>Duración</p>
										<p className='text-slate-400 text-sm'>{coursePost.duration}</p>
									</div>
								</div>
							)}
							{coursePost.schedule && (
								<div className='flex items-center gap-4'>
									<FaCalendarAlt className='text-blue-400' />
									<div>
										<p className='text-slate-200 font-medium'>Horarios</p>
										<p className='text-slate-400 text-sm'>{coursePost.schedule}</p>
									</div>
								</div>
							)}
							{coursePost.level && (
								<div className='flex items-center gap-4'>
									<FaSignal className='text-amber-400' />
									<div>
										<p className='text-slate-200 font-medium'>Nivel</p>
										<p className='text-slate-400 text-sm capitalize'>{coursePost.level}</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			);
		}

		case 'pedidos': {
			const requestPost = post;
			return (
				<div className='space-y-6'>
					<div className='bg-card border border-border rounded-lg p-6'>
						<h3 className='text-lg font-semibold text-slate-100 mb-4'>Detalles del Pedido</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{requestPost.neededBy && (
								<div className='flex items-center gap-4'>
									<FaCalendarAlt className='text-red-400' />
									<div>
										<p className='text-slate-200 font-medium'>Necesario para</p>
										<p className='text-slate-400 text-sm'>{requestPost.neededBy}</p>
									</div>
								</div>
							)}
							{requestPost.budgetRange && (
								<div className='flex items-center gap-4'>
									<FaMoneyBill className='text-green-400' />
									<div>
										<p className='text-slate-200 font-medium'>Presupuesto</p>
										<p className='text-slate-400 text-sm'>{requestPost.budgetRange}</p>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			);
		}

		default:
			return null;
	}
}
