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
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SafetyNoticeModal from '@/components/publications/SafetyNoticeModal';
import { CategorySpecificInfo } from '@/components/publications/CategorySpecificInfo';
import { ContactCard } from '@/components/publications/ContactCard';
import { PaymentMethodsCard } from '@/components/publications/PaymentMethodsCard';
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
        <SafetyNoticeModal
          title={<span className='flex items-center gap-2'><FaShieldAlt className='text-amber-400' /> Advertencia y recomendaciones</span>}
          description={<span>Cuidá tu seguridad y tomá decisiones informadas antes de avanzar.</span>}
          acceptLabel={<span>Acepto y asumo la responsabilidad</span>}
        >
          <div className='space-y-3 text-sm text-slate-300'>
            <ul className='list-disc pl-5 space-y-2'>
              <li>Verificá identidad y referencias del proveedor.</li>
              <li>Evitá pagos por adelantado sin garantías claras.</li>
              <li>Usá medios de pago seguros y con comprobantes.</li>
              <li>No compartas datos sensibles ni contraseñas.</li>
              <li>Coordiná encuentros en lugares públicos y seguros.</li>
              <li>Revisá reputación y experiencias previas de otros usuarios.</li>
              <li>Guardá registros de conversaciones y acuerdos.</li>
              <li>Si algo te parece sospechoso, no avances y reportá.</li>
            </ul>
            <p className='text-sm text-muted-foreground'>
              No podemos garantizar la seguridad, calidad, veracidad o legalidad de los servicios, productos o información publicada. Usá tu criterio.
            </p>
          </div>
        </SafetyNoticeModal>
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
									Publicado el {' '}
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

                            <CategorySpecificInfo post={post} />

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

                            
						</div>

						{/* Sidebar de contacto y pago */}
						<div className='space-y-6'>
                            {post.socials && post.socials.length > 0 && (
                                <ContactCard socials={post.socials} />
                            )}

                            {post.payment && post.payment.length > 0 && (
                                <PaymentMethodsCard payment={post.payment} barterAccepted={post.barterAccepted} />
                            )}
						</div>
					</div>
				</div>

				{/* Comentarios */}
				<div className='px-6 mt-8 pb-12'>
					<div className='max-w-5xl mx-auto space-y-4'>
						<CommentForm postId={params.id as string} />
						<CommentList postId={params.id as string} />
					</div>
				</div>
			</div>
		</div>
	);
}

 
