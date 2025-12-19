import Link from 'next/link';
import {
	Heart,
	Users,
	GraduationCap,
	Wrench,
	ShoppingBag,
	Calendar,
	Repeat,
	Handshake,
	MessageSquare,
	Search,
	Filter,
	Plus,
	Box,
} from 'lucide-react';

export default function GuiaPage() {
	return (
		<div className='container mx-auto max-w-4xl px-4 py-8 mt-20'>
			{/* Header */}
			<div className='text-center mb-12'>
				<div className='flex items-center justify-center gap-3 mb-4'>
					<h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent'>
						Guía de Inclusiva
					</h1>
				</div>
				<p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
					Tu espacio seguro para conectar, compartir y construir comunidad. Aquí te explicamos todo lo que necesitás
					saber para aprovechar al máximo nuestra plataforma.
				</p>
			</div>

			{/* Bienvenida */}
			<section className='bg-card/50 rounded-2xl p-6 mb-8 border border-border/50'>
				<h2 className='text-2xl font-semibold mb-4 gap-2'>¡Bienvenide a nuestra comunidad!</h2>
				<p className='text-muted-foreground mb-4'>
					Inclusiva es más que una plataforma: es un hogar digital donde la diversidad se celebra y todas las voces
					importan. Aquí podés encontrar personas afines, compartir experiencias, buscar apoyo y ofrecer el tuyo.
				</p>
				<div className='bg-gradient-to-r from-pink-500/10 to-violet-500/10 rounded-lg p-4 border border-pink-500/20'>
					<p className='text-sm font-medium text-pink-600 dark:text-pink-400'>
						💡 <strong>Recordá:</strong> Este es un espacio seguro. Tratamos a todes con respeto, empatía y amor.
					</p>
				</div>
			</section>

			{/* Categorías */}
			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-6'>📂 Categorías disponibles</h2>
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					<div className='bg-gradient-to-br from-red-500/10 to-red-600/10 rounded-xl p-4 border border-red-500/20 hover:border-red-500/40 transition-colors'>
						<div className='flex items-center gap-3 mb-2'>
							<Calendar className='text-red-500' />
							<h3 className='font-semibold'>Eventos</h3>
						</div>
						<p className='text-sm text-muted-foreground'>
							Encuentros, meetups, fiestas y actividades comunitarias. Conectá en persona con gente increíble.
						</p>
					</div>

					<div className='bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-4 border border-blue-500/20 hover:border-blue-500/40 transition-colors'>
						<div className='flex items-center gap-3 mb-2'>
							<Wrench className='text-blue-500' />
							<h3 className='font-semibold'>Servicios</h3>
						</div>
						<p className='text-sm text-muted-foreground'>
							Profesionales inclusivos: terapeutas, médiques, abogades y más. Encontrá quien te entienda.
						</p>
					</div>

					<div className='bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-4 border border-orange-500/20 hover:border-orange-500/40 transition-colors'>
						<div className='flex items-center gap-3 mb-2'>
							<ShoppingBag className='text-orange-500' />
							<h3 className='font-semibold'>Productos</h3>
						</div>
						<p className='text-sm text-muted-foreground'>
							Emprendimientos, arte, ropa y productos hechos con amor por nuestra comunidad.
						</p>
					</div>

					<div className='bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-4 border border-green-500/20 hover:border-green-500/40 transition-colors'>
						<div className='flex items-center gap-3 mb-2'>
							<GraduationCap className='text-green-500' />
							<h3 className='font-semibold'>Cursos</h3>
						</div>
						<p className='text-sm text-muted-foreground'>
							Talleres, capacitaciones y espacios de aprendizaje para crecer juntes.
						</p>
					</div>

					<div className='bg-gradient-to-br from-violet-500/10 to-violet-600/10 rounded-xl p-4 border border-violet-500/20 hover:border-violet-500/40 transition-colors'>
						<div className='flex items-center gap-3 mb-2'>
							<Repeat className='text-violet-500' />
							<h3 className='font-semibold'>Usados</h3>
						</div>
						<p className='text-sm text-muted-foreground'>
							Intercambio y venta de productos de segunda mano. Dale una nueva vida a tus cosas.
						</p>
					</div>

					<div className='bg-gradient-to-br from-pink-500/10 to-pink-600/10 rounded-xl p-4 border border-pink-500/20 hover:border-pink-500/40 transition-colors'>
						<div className='flex items-center gap-3 mb-2'>
							<Search className='text-pink-500' />
							<h3 className='font-semibold'>Pedidos</h3>
						</div>
						<p className='text-sm text-muted-foreground'>
							¿Necesitás ayuda, consejo o apoyo? La comunidad está acá para vos.
						</p>
					</div>
				</div>
			</section>

			{/* Cómo usar */}
			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-6'>🚀 Cómo usar Inclusiva</h2>
				<div className='space-y-6'>
					<div className='bg-card/50 rounded-xl p-6 border border-border/50'>
						<div className='flex items-start gap-4'>
							<div className='bg-gradient-to-br from-pink-500 to-violet-600 p-2 rounded-lg flex-shrink-0'>
								<Box className='w-5 h-5 text-white' />
							</div>
							<div>
								<h3 className='font-semibold mb-2'>1. Navegá por categorías</h3>
								<p className='text-muted-foreground mb-3'>
									En la página principal encontrás botones coloridos para cada categoría. Hacé clic en el que te
									interese para ver todas las publicaciones de ese tipo.
								</p>
								<div className='bg-muted/50 rounded-lg p-3 text-sm'>
									<strong>Tip:</strong> Cada categoría tiene su propio icono y color para facilitar la navegación
								</div>
							</div>
						</div>
					</div>

					<div className='bg-card/50 rounded-xl p-6 border border-border/50'>
						<div className='flex items-start gap-4'>
							<div className='bg-gradient-to-br from-violet-500 to-blue-500 p-2 rounded-lg flex-shrink-0'>
								<Search className='w-5 h-5 text-white' />
							</div>
							<div>
								<h3 className='font-semibold mb-2'>2. Buscá y filtrá</h3>
								<p className='text-muted-foreground mb-3'>
									Usá la barra de búsqueda para encontrar publicaciones específicas. Podés filtrar por categoría usando
									los chips coloridos y ordenar por fecha, precio o valoración.
								</p>
                                <div className='bg-muted/50 rounded-lg p-3 text-sm'>
                                    <strong>Tip:</strong> Probá buscar &quot;terapia trans&quot;, &quot;bar friendly&quot; o &quot;grupo de apoyo&quot;
                                </div>
							</div>
						</div>
					</div>

					<div className='bg-card/50 rounded-xl p-6 border border-border/50'>
						<div className='flex items-start gap-4'>
							<div className='bg-gradient-to-br from-blue-500 to-green-500 p-2 rounded-lg flex-shrink-0'>
								<MessageSquare className='w-5 h-5 text-white' />
							</div>
							<div>
								<h3 className='font-semibold mb-2'>3. Conectá y conversá</h3>
								<p className='text-muted-foreground mb-3'>
									Cada publicación muestra información de contacto. Podés comunicarte directamente a través de WhatsApp,
									Instagram o el medio que la persona prefiera.
								</p>
								<div className='bg-muted/50 rounded-lg p-3 text-sm'>
									<strong>Importante:</strong> Siempre respetá los límites y la privacidad de otres
								</div>
							</div>
						</div>
					</div>

					<div className='bg-card/50 rounded-xl p-6 border border-border/50'>
						<div className='flex items-start gap-4'>
							<div className='bg-gradient-to-br from-green-500 to-orange-500 p-2 rounded-lg flex-shrink-0'>
								<Plus className='w-5 h-5 text-white' />
							</div>
							<div>
								<h3 className='font-semibold mb-2'>4. Compartí tu contenido</h3>
								<p className='text-muted-foreground mb-3'>
                  ¿Querés crear una publicación o necesitás ayuda con algo?
                  Usá el botón
                                    <Link
                                        href={'/publicaciones/crear'}
                                        className='bg-gradient-to-br from-pink-500 to-violet-600 p-2 rounded-full inline-flex items-center justify-center mx-2'
                                    >
                                        <Plus className='w-3 h-3 text-white inline' />
                                    </Link>
									flotante para crear una publicación. Cada aporte ayuda a fortalecer la comunidad.
								</p>
								<div className='bg-muted/50 rounded-lg p-3 text-sm'>
									<strong>Recordá:</strong> Incluí fotos, descripción clara y datos de contacto
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Valores */}
			<section className='mb-8'>
				<h2 className='text-2xl font-semibold mb-6'>💖 Nuestros valores</h2>
				<div className='bg-gradient-to-r from-pink-500/10 via-violet-500/10 to-blue-500/10 rounded-2xl p-6 border border-pink-500/20'>
					<div className='grid gap-4 sm:grid-cols-2'>
						<div className='flex items-center gap-3'>
							<Heart className='text-pink-500 flex-shrink-0' />
							<span className='font-medium'>Respeto y amor incondicional</span>
						</div>
						<div className='flex items-center gap-3'>
							<Users className='text-violet-500 flex-shrink-0' />
							<span className='font-medium'>Diversidad como fortaleza</span>
						</div>
						<div className='flex items-center gap-3'>
							<Handshake className='text-blue-500 flex-shrink-0' />
							<span className='font-medium'>Apoyo mutuo y solidaridad</span>
						</div>
						<div className='flex items-center gap-3'>
							<MessageSquare className='text-green-500 flex-shrink-0' />
							<span className='font-medium'>Comunicación empática</span>
						</div>
					</div>
				</div>
			</section>

			{/* Feedback */}
			<section className='text-center bg-card/50 rounded-2xl p-8 border border-border/50'>
				<h2 className='text-2xl font-semibold mb-4'>🌟 Tu opinión importa</h2>
				<p className='text-muted-foreground mb-6 max-w-2xl mx-auto'>
					Inclusiva crece con vos. Si tenés ideas, sugerencias o encontraste algún problema, no dudes en contactarnos.
					Cada feedback nos ayuda a ser mejores.
				</p>
				<div className='flex flex-col items-center sm:flex-row gap-4 justify-center text-center'>
					<a
						href='https://wa.me/5492236032601'
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-violet-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-center'
					>
						<MessageSquare className='w-4 h-4' />
						Enviar feedback
					</a>
					<a
						href='https://wa.me/5492236032601'
						target='_blank'
						rel='noopener noreferrer'
						className='inline-flex items-center gap-2 border border-border px-6 py-3 rounded-xl font-medium hover:bg-muted/50 transition-colors text-center'
					>
						<Users className='w-4 h-4' />
						Unirse a la comunidad
					</a>
				</div>
			</section>
		</div>
	);
}
