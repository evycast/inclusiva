'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApiPost } from '@/types/api';
import { getCategory } from '@/lib/categories';
import { usePostQuery } from '@/hooks/usePost';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import SafetyNoticeModal from '@/components/publications/SafetyNoticeModal';
import { ContactCard } from '@/components/publications/ContactCard';
import { PaymentMethodsCard } from '@/components/publications/PaymentMethodsCard';
import CategorySpecificInfo from '@/components/publications/CategorySpecificInfo';
import { Clock, Calendar, ShieldAlert, AlertCircle, ArrowLeft, Share2, Flag, XCircle, MapPin as LucideMapPin, Tag as LucideTag, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

function formatPrice(value?: string): string | null {
	if (!value || value.trim().length === 0) return null;
	const num = Number(value);
	if (!isNaN(num) && num === 0) return 'Gratuito';
	if (!isNaN(num)) return `$ ${num.toLocaleString('es-AR')}`;
	return value;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const { data, isLoading, isError } = usePostQuery((params.id as string) || '');
  const post: ApiPost | undefined = data?.data;

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

  const [reportOpen, setReportOpen] = useState(false)
  const [reportReason, setReportReason] = useState('')
  const [reportDetails, setReportDetails] = useState('')
  const [sendingReport, setSendingReport] = useState(false)
  const handleReport = () => setReportOpen(true)

  const [canViewContact, setCanViewContact] = useState(false)
  const [contacts, setContacts] = useState<ReadonlyArray<{ name: string; url: string }>>([])
  const [gateName, setGateName] = useState('')
  const [gateEmail, setGateEmail] = useState('')
  const [gatePhone, setGatePhone] = useState('')
  const [requestOpen, setRequestOpen] = useState(false)
  const [reqName, setReqName] = useState('')
  const [reqPhone, setReqPhone] = useState('')
  const [reqEmail, setReqEmail] = useState('')
  const [reqMessage, setReqMessage] = useState('')
  const [requesting, setRequesting] = useState(false)
  const [hideReveal, setHideReveal] = useState(false)
  const [revealOpen, setRevealOpen] = useState(false)

  useEffect(() => {
    if (!post) return
    try {
      const saved = localStorage.getItem('contactUser')
      if (saved) {
        const s = JSON.parse(saved) as { name?: string; email?: string; phone?: string }
        if (s?.name) setGateName(s.name)
        if (s?.email) setGateEmail(s.email ?? '')
        if (s?.phone) setGatePhone(s.phone ?? '')
        if (s?.name) setReqName(s.name)
        if (s?.email) setReqEmail(s.email ?? '')
        if (s?.phone) setReqPhone(s.phone ?? '')
      }
    } catch {}
  }, [params.id, post?.id])

  async function onReveal() {
    const p = (async () => {
      const res = await fetch(`/api/posts/${params.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: gateName.trim(), email: gateEmail.trim(), phone: gatePhone.trim() })
      })
      if (!res.ok) {
        setHideReveal(true)
        const j = await res.json().catch(() => ({}))
        const err = (j as { error?: string }).error
        if (res.status === 400 && err === 'basic_required') throw new Error('Ingresá nombre, email y teléfono')
        throw new Error('Error al validar datos de contacto')
      }
      const responseData = (await res.json().catch(() => ({ data: { socials: [] } }))) as { data?: { socials?: Array<{ name: string; url: string }> } }
      try {
        const userData = { name: gateName.trim(), email: gateEmail.trim(), phone: gatePhone.trim() || undefined }
        localStorage.setItem('contactUser', JSON.stringify(userData))
      } catch {}
      const socials = responseData.data?.socials ?? []
      setContacts(socials)
      setCanViewContact(true)
      setHideReveal(false)
    })()
    await toast.promise(p, { loading: 'Validando…', success: 'Contacto habilitado', error: 'Error al habilitar' })
  }

  async function onRequestContact() {
    const p = (async () => {
      const name = reqName.trim()
      const phone = reqPhone.trim()
      if (!name || !phone) throw new Error('Ingresá nombre y teléfono')
      const res = await fetch(`/api/posts/${params.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email: reqEmail.trim() || undefined, message: reqMessage.trim() || undefined }),
      })
      if (!res.ok) {
        if (res.status === 400) {
          const j = await res.json().catch(() => ({}))
          if ((j as { error?: string }).error === 'name_phone_required') throw new Error('Nombre y teléfono son obligatorios')
        }
        throw new Error('Error al solicitar contacto')
      }
      await res.json().catch(() => ({}))
      try {
        const payload = { name, email: (reqEmail.trim() || undefined), phone: (phone || undefined) }
        localStorage.setItem('contactUser', JSON.stringify(payload))
      } catch {}
      setRequestOpen(false)
    })()
    setRequesting(true)
    await toast.promise(p, { loading: 'Enviando…', success: 'Solicitud enviada. El vendedor se contactará a la brevedad.', error: 'Error al solicitar' })
    setRequesting(false)
  }

	if (isLoading) {
		return (
			<div className='min-h-screen bg-background'>
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
			<div className='min-h-screen flex items-center justify-center bg-background'>
				<div className='text-center text-destructive'>No se encontró la publicación</div>
			</div>
		);
	}

	// Obtener datos del autor desde la relación User
	const authorName = post.authorName ?? 'Anónimo';
	const authorAvatar = post.authorAvatar ?? undefined;

	const priceText = formatPrice(post.price);
    const categoryDef = getCategory(post.category);
	const CategoryIcon = categoryDef.icon;

	// Ubicación: usar venue para eventos
	const location = post.category === 'eventos' ? post.venue : (post.category === 'servicios' ? post.serviceArea : undefined);

	const statusMeta = (() => {
		const s = post.status;
		if (!s) return null;
		if (s === 'pending') {
            return {
                label: 'Pendiente de aprobación',
                className: 'border-amber-500 text-amber-600 bg-amber-50',
                Icon: Clock,
            };
		}
		if (s === 'rejected') {
            return {
                label: 'Rechazada',
                className: 'border-red-500 text-red-600 bg-red-50',
                Icon: XCircle,
            };
		}
		return null;
	})();

  return (
    <div className='min-h-screen bg-background pb-12'>
      <div className='max-w-5xl mx-auto'>
        <SafetyNoticeModal
          title={<span className='flex items-center gap-2'><ShieldAlert className='text-amber-500' /> Advertencia y recomendaciones</span>}
          description={<span>Cuidá tu seguridad y tomá decisiones informadas antes de avanzar.</span>}
          acceptLabel={<span>Acepto y asumo la responsabilidad</span>}
        >
          <div className='space-y-3 text-sm text-muted-foreground'>
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
                            className='border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                        >
                            <ArrowLeft className='mr-2' />
                            Volver
                        </Button>
                    </Link>

          <div className='flex items-center gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='text-muted-foreground hover:text-foreground'
              onClick={handleShare}
            >
              <Share2 className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='text-muted-foreground hover:text-foreground'
              onClick={handleReport}
            >
              <Flag className='w-4 h-4 text-red-500' />
            </Button>
            {copied && (
              <span className='text-xs text-green-600' aria-live='polite'>Enlace copiado</span>
            )}
          </div>
				</div>

        {/* Imagen principal */}
        <div className='relative h-[40vh] lg:h-[50vh] mx-6 rounded-2xl overflow-hidden shadow-sm border border-border/50'>
          <Image src={post.image} alt={post.title} fill className='object-cover' priority />
        </div>

        {/* Contenido principal */}
          <div className='p-6 space-y-8'>
					{/* Header de información */}
					<div className='space-y-6'>
						<div className='flex flex-wrap items-center justify-between gap-4'>
							<div className='flex flex-wrap items-center gap-3'>
								<Badge
									className={`text-white rounded-full px-4 py-2 text-sm font-medium border-0 bg-gradient-to-r ${
										categoryDef.gradient
									}`}
								>
									<CategoryIcon className='mr-2 w-4 h-4' />
									{categoryDef.label}
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
                        <AlertCircle className='mr-1 w-3 h-3' />
                        Urgente
                    </Badge>
                )}
							</div>

                            <div className='text-muted-foreground text-sm flex items-center gap-2'>
                                <Calendar className='w-4 h-4' />
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

						<h1 className='text-2xl lg:text-3xl font-bold text-foreground leading-tight'>{post.title}</h1>

						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6'>
            <div className='flex items-center gap-4'>
                {post.authorId ? (
                  <Link href={`/perfil/${post.authorId}`} className='flex items-center gap-4'>
                    <Avatar className='w-12 h-12 ring-2 ring-border'>
                        <AvatarImage src={authorAvatar} alt={authorName} />
                        <AvatarFallback className='bg-muted text-muted-foreground font-semibold'>
                            {authorName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                        <span className='font-semibold text-foreground hover:underline flex items-center gap-1.5'>
                          {authorName}
                          {post.authorVerified && (
                            <BadgeCheck className='w-4 h-4 text-emerald-500' />
                          )}
                        </span>
                    </div>
                  </Link>
                ) : (
                  <>
                    <Avatar className='w-12 h-12 ring-2 ring-border'>
                        <AvatarImage src={authorAvatar} alt={authorName} />
                        <AvatarFallback className='bg-muted text-muted-foreground font-semibold'>
                            {authorName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className='flex flex-col'>
                        <span className='font-semibold text-foreground'>{authorName}</span>
                    </div>
                  </>
                )}
            </div>

							{priceText && <div className='text-3xl lg:text-4xl font-bold text-primary'>{priceText}</div>}
						</div>
					</div>

					<Separator className='bg-border' />

					{/* Grid de contenido */}
					<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
						{/* Columna principal */}
						<div className='lg:col-span-2 space-y-6'>
					{/* Descripción: mostrar subtítulo y descripción */}
					<div className='space-y-3'>
						<h2 className='text-xl font-semibold text-foreground'>Descripción</h2>
						{post.subtitle && (
							<p className='text-foreground/80 leading-relaxed text-base font-medium'>{post.subtitle}</p>
						)}
						{post.description && (
							<p className='text-muted-foreground leading-relaxed text-base'>{post.description}</p>
						)}
					</div>

                            <CategorySpecificInfo post={post} />

							{/* Ubicación */}
							{location && (
								<div className='space-y-3'>
									<h2 className='text-xl font-semibold text-foreground'>Ubicación</h2>
									<div className='flex items-center gap-3 text-muted-foreground'>
                                    <LucideMapPin className='text-red-500 w-5 h-5' />
										<span className='text-base'>{location}</span>
									</div>
								</div>
							)}

							{/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className='space-y-3'>
                                    <h2 className='text-xl font-semibold text-foreground'>Etiquetas</h2>
                                    <div className='flex flex-wrap gap-2'>
                                        {post.tags.map((tag, index) => (
                                            <Badge
                                                key={index}
                                                variant='outline'
                                                className='border-border text-muted-foreground hover:bg-muted'
                                            >
                                                <LucideTag className='mr-2 text-xs' />
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
						</div>

                        {/* Sidebar de contacto y pago */}
                        <div className='space-y-6'>
                            {post.hasContact && (
                              (() => {
                                const flow = post.contactFlow ?? 'buyer_contacts_first'
                                
                                // Si ya tenemos los contactos, mostrarlos
                                if (canViewContact && contacts.length > 0) {
                                  return <ContactCard socials={contacts as { name: string; url: string }[]} />
                                }
                                
                                // Flujo "seller_contacts": El vendedor contacta al interesado
                                if (flow === 'seller_contacts') {
                                  return (
                                    <div className='rounded-lg border p-4 space-y-3'>
                                      <div className='text-sm text-muted-foreground'>
                                        Dejanos tus datos y un mensaje breve para que el vendedor te contacte a la brevedad.
                                      </div>
                                      <Button onClick={() => setRequestOpen(true)}>Solicitar contacto</Button>
                                    </div>
                                  )
                                }
                                
                                // Flujo "buyer_contacts_first": El comprador ve los datos y contacta
                                return (
                                  <div className='rounded-lg border p-4 space-y-3'>
                                    <div className='text-sm text-muted-foreground'>
                                      Para ver los datos de contacto, completá tus datos básicos.
                                    </div>
                                    <Button onClick={() => setRevealOpen(true)}>Ver datos de contacto</Button>
                                    {hideReveal && (
                                      <div className='text-xs text-destructive'>Datos inválidos, completalos para continuar</div>
                                    )}
                                  </div>
                                )
                              })()
                            )}

                            {post.payment && post.payment.length > 0 && (
                                <PaymentMethodsCard payment={post.payment} barterAccepted={post.barterAccepted} />
                            )}
                        </div>
					</div>
				</div>

          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Reportar publicación</DialogTitle>
              </DialogHeader>
              <div className='space-y-3'>
                <Label htmlFor='reportReason'>Motivo</Label>
                <select id='reportReason' className='border rounded px-3 py-2 text-sm w-full' value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                  <option value=''>Seleccioná un motivo…</option>
                  <option value='contenido_inapropiado'>Contenido inapropiado</option>
                  <option value='fraude_estafa'>Fraude / estafa</option>
                  <option value='spam'>Spam</option>
                  <option value='informacion_falsa'>Información falsa</option>
                  <option value='suplantacion'>Suplantación de identidad</option>
                  <option value='violencia_odio'>Violencia / discurso de odio</option>
                  <option value='otro'>Otro</option>
                </select>
                <Label htmlFor='reportDetails'>Detalles</Label>
                <Textarea id='reportDetails' value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder='Agregá contexto, enlaces o evidencia.' />
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setReportOpen(false)}>Cancelar</Button>
                  <Button
                    disabled={sendingReport || !reportReason.trim()}
                    onClick={async () => {
                      setSendingReport(true)
                      const p = (async () => {
                        const res = await fetch('/api/reports', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            postId: params.id as string, 
                            reason: reportReason.trim(), 
                            details: reportDetails.trim() || undefined,
                          }),
                        })
                        if (!res.ok) throw new Error('Error al enviar reporte')
                        setReportOpen(false)
                        setReportReason('')
                        setReportDetails('')
                      })()
                      await toast.promise(p, { loading: 'Enviando…', success: 'Reporte enviado', error: 'Error al enviar reporte' })
                      setSendingReport(false)
                    }}
                  >Enviar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar contacto</DialogTitle>
              </DialogHeader>
              <div className='space-y-3'>
                <div className='bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground space-y-2'>
                  <p><strong>¿Cómo funciona?</strong></p>
                  <ul className='list-disc pl-4 space-y-1'>
                    <li>Dejanos tus datos de contacto</li>
                    <li>El vendedor recibirá tu solicitud</li>
                    <li>Se comunicará con vos a la brevedad</li>
                  </ul>
                  <p className='text-xs'>Tus datos solo serán compartidos con el vendedor de esta publicación.</p>
                </div>
                <Label htmlFor='reqName'>Nombre</Label>
                <input id='reqName' className='border rounded px-3 py-2 text-sm w-full' placeholder='Tu nombre' value={reqName} onChange={(e) => setReqName(e.target.value)} />
                <Label htmlFor='reqPhone'>Teléfono</Label>
                <input id='reqPhone' className='border rounded px-3 py-2 text-sm w-full' placeholder='Tu teléfono' value={reqPhone} onChange={(e) => setReqPhone(e.target.value)} />
                <Label htmlFor='reqEmail'>Email (opcional)</Label>
                <input id='reqEmail' className='border rounded px-3 py-2 text-sm w-full' placeholder='Tu email' value={reqEmail} onChange={(e) => setReqEmail(e.target.value)} />
                <Label htmlFor='reqMessage'>Mensaje (opcional)</Label>
                <Textarea id='reqMessage' value={reqMessage} onChange={(e) => setReqMessage(e.target.value)} placeholder='Escribí un mensaje breve' />
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setRequestOpen(false)}>Cancelar</Button>
                  <Button disabled={requesting || !reqName.trim() || !reqPhone.trim()} onClick={onRequestContact}>Enviar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={revealOpen} onOpenChange={setRevealOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ver datos de contacto</DialogTitle>
              </DialogHeader>
              <div className='space-y-3'>
                <div className='bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground space-y-2'>
                  <p><strong>¿Cómo funciona?</strong></p>
                  <ul className='list-disc pl-4 space-y-1'>
                    <li>Completá tus datos básicos</li>
                    <li>Una vez validados, podrás ver los datos de contacto del vendedor</li>
                    <li>Contactalo directamente por el medio que prefieras</li>
                  </ul>
                  <p className='text-xs'>Tus datos quedan guardados para futuras consultas.</p>
                </div>
                <Label htmlFor='reName'>Nombre</Label>
                <input id='reName' className='border rounded px-3 py-2 text-sm w-full' placeholder='Tu nombre' value={gateName} onChange={(e) => { setGateName(e.target.value); setHideReveal(false) }} />
                <Label htmlFor='reEmail'>Email</Label>
                <input id='reEmail' className='border rounded px-3 py-2 text-sm w-full' placeholder='Tu email' value={gateEmail} onChange={(e) => { setGateEmail(e.target.value); setHideReveal(false) }} />
                <Label htmlFor='rePhone'>Teléfono</Label>
                <input id='rePhone' className='border rounded px-3 py-2 text-sm w-full' placeholder='Tu teléfono' value={gatePhone} onChange={(e) => { setGatePhone(e.target.value); setHideReveal(false) }} />
                <div className='flex justify-end gap-2'>
                  <Button variant='outline' onClick={() => setRevealOpen(false)}>Cancelar</Button>
                  <Button onClick={async () => { await onReveal(); setRevealOpen(false) }}>Enviar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
			</div>
		</div>
	);
}
