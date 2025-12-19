'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ApiPost, ListResponse } from '@/types/api';
import { categoryOptions, paymentMethodLabelsEs } from '@/lib/validation/post';
import { formatDistanceToNow } from 'date-fns';
import { RotateCcw } from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Edit, Trash2, CheckCircle2 as VerifyCheck } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner'
import { StatusInlineControl, AdminStatus } from '@/components/admin/StatusInlineControl';
import type { SortKey } from '@/lib/filters/postWhere'

type Status = AdminStatus;

export default function AdminPostsPage() {
	const router = useRouter();
	const qc = useQueryClient();
    const [q, setQ] = useState('');
    const [category, setCategory] = useState<string>('');
    const [status, setStatus] = useState<Status | ''>('');
    const [page, setPage] = useState(1);
    const [exp, setExp] = useState<'all' | 'active' | 'expired'>('all')
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [sort, setSort] = useState<SortKey>('recent')
	const pageSize = 24;

  const params = useMemo(() => {
    const sp = new URLSearchParams();
    if (q.trim()) sp.set('q', q.trim());
    if (category) sp.set('category', category);
    if (status) sp.set('status', status);
    sp.set('page', String(page));
    sp.set('pageSize', String(pageSize));
    sp.set('sort', sort);
    if (exp !== 'all') sp.set('exp', exp)
    return sp.toString();
  }, [q, category, status, exp, page, sort]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [q, category, status, exp, page]);

  const { data, isLoading, isError } = useQuery<{ data: ApiPost[]; pagination: ListResponse['pagination'] }>({
    queryKey: ['admin-posts', params],
    queryFn: async () => {
      const res = await fetch(`/api/admin/posts?${params}`);
      if (res.status === 401) {
        router.push('/admin/login');
        throw new Error('No autorizado');
      }
      if (!res.ok) throw new Error('Error al cargar publicaciones');
      return res.json();
    },
  });

	const posts = data?.data ?? [];
	const pagination = data?.pagination;

	// Quitamos modales de ver/editar
	const [detailPost, setDetailPost] = useState<ApiPost | null>(null);
  const [editPost, setEditPost] = useState<ApiPost | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletePost, setDeletePost] = useState<ApiPost | null>(null);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<{ id: string } | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  async function changeStatus(id: string, next: Status) {
    if (next === 'rejected') {
      setRejectTarget({ id })
      setRejectReason('')
      return
    }
    setChangingId(id)
    const p = (async () => {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (res.status === 401) {
        router.push('/admin/login')
        return
      }
      qc.invalidateQueries({ queryKey: ['admin-posts'] })
      setChangingId(null)
    })()
    await toast.promise(p, { loading: 'Actualizando…', success: 'Estado actualizado', error: 'Error al actualizar' })
  }

  async function applyEdit(updated: Partial<ApiPost> & { id: string }) {
    const res = await fetch(`/api/admin/posts/${updated.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
		if (res.status === 401) {
			router.push('/admin/login');
			return;
		}
		setEditPost(null);
		qc.invalidateQueries({ queryKey: ['admin-posts'] });
	}

  async function confirmDelete(id: string) {
    const p = (async () => {
      const res = await fetch(`/api/admin/posts/${id}`, { method: 'DELETE' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      setDeletePost(null);
      qc.invalidateQueries({ queryKey: ['admin-posts'] });
    })();
    await toast.promise(p, { loading: 'Eliminando…', success: 'Publicación eliminada', error: 'Error al eliminar' })
  }

	// Eliminamos render de modales de ver/editar temporalmente

  return (
		<div className='px-4 max-w-7xl mx-auto py-6 min-h-[calc(100svh-5rem)] flex flex-col overflow-x-hidden'>
			<div className='flex items-center justify-between gap-4 mb-6'>
				<h1 className='text-xl font-semibold'>Publicaciones</h1>
				<Button variant='default' onClick={() => router.push('/publicaciones/crear')}>
					Crear publicación
				</Button>
			</div>

			<div className='flex flex-wrap items-center gap-3 mb-4'>
				<Input
					className='flex-1 min-w-[240px]'
					placeholder='Buscar por texto…'
					value={q}
					onChange={(e) => setQ(e.target.value)}
				/>

				<Button variant='outline' onClick={() => setFiltersOpen(true)}>
					Filtros
				</Button>
			</div>
			<div className='flex flex-wrap gap-2 mb-4'>
				{category && (
					<Badge variant='outline' className='text-xs'>
						Categoría: {category}
					</Badge>
				)}
				{status && (
					<Badge variant='outline' className='text-xs'>
						Estado: {status}
					</Badge>
				)}
				{exp !== 'all' && (
					<Badge variant='outline' className='text-xs'>
						Expiración: {exp === 'active' ? 'vigentes' : 'expiradas'}
					</Badge>
				)}
			</div>

			<div className='rounded-md border overflow-x-auto w-full'>
				<Table className='min-w-[1200px]'>
					<TableHeader>
						<TableRow>
							<TableHead>Estado</TableHead>
							<TableHead>Autor</TableHead>
							<TableHead>Categoría</TableHead>
							<TableHead>Título</TableHead>
							<TableHead>Expira</TableHead>
							<TableHead className='text-right'>Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{isLoading && (
							<>
								{Array.from({ length: 8 }).map((_, i) => (
									<TableRow key={`skeleton-${i}`}>
										<TableCell>
											<Skeleton className='h-6 w-24' />
										</TableCell>
										<TableCell>
											<Skeleton className='h-6 w-28' />
										</TableCell>
										<TableCell>
											<div className='space-y-2'>
												<Skeleton className='h-5 w-64' />
												<Skeleton className='h-4 w-48' />
											</div>
										</TableCell>
										<TableCell>
											<Skeleton className='h-5 w-40' />
										</TableCell>
										<TableCell>
											<Skeleton className='h-5 w-24' />
										</TableCell>
										<TableCell>
											<Skeleton className='h-5 w-24' />
										</TableCell>
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												<Skeleton className='h-8 w-8 rounded-md' />
												<Skeleton className='h-8 w-8 rounded-md' />
											</div>
										</TableCell>
									</TableRow>
								))}
							</>
						)}
						{isError && (
							<TableRow>
								<TableCell colSpan={7}>Error al cargar datos.</TableCell>
							</TableRow>
						)}
						{!isLoading && posts.length === 0 && (
							<TableRow>
								<TableCell colSpan={7}>No hay publicaciones.</TableCell>
							</TableRow>
						)}
						{posts.map((p) => (
							<TableRow key={p.id}>
								<TableCell className='whitespace-nowrap'>
									<StatusInlineControl
										status={(p.status as Status) || 'pending'}
										onChange={(next) => changeStatus(p.id, next)}
										loading={changingId === p.id}
										disabled={changingId === p.id}
									/>
								</TableCell>
								<TableCell>
									<div className='flex items-center gap-2'>
										<Avatar>
											<AvatarImage src={p.authorAvatar ?? ''} alt={p.authorName ?? 'Autor'} />
											<AvatarFallback>
												{(p.authorName || '')
													.split(' ')
													.slice(0, 2)
													.map((s: string) => s[0]?.toUpperCase() || '')
													.join('')}
											</AvatarFallback>
										</Avatar>
										<span>{p.authorName}</span>
										{p.authorVerified ? <VerifyCheck className='h-4 w-4 text-emerald-600' /> : null}
									</div>
								</TableCell>
								<TableCell className='capitalize'>{p.category}</TableCell>
								<TableCell>
									<div className='font-medium'>{p.title}</div>
									{p.subtitle && <div className='text-sm text-muted-foreground'>{p.subtitle}</div>}
								</TableCell>
								<TableCell>
									{(() => {
										const exp = p.expiresAt ? new Date(p.expiresAt as unknown as string) : null;
										if (!exp) return <span className='text-muted-foreground'>—</span>;
										const now = Date.now();
										const ms = exp.getTime() - now;
										const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
										const isExpired = days <= 0;
										const isSoon = days > 0 && days <= 7;
										const className = isExpired ? 'text-red-600' : isSoon ? 'text-amber-600' : 'text-foreground';
										const short = isExpired
											? 'Expiró'
											: Math.abs(days) <= 30
												? `${Math.abs(days)} días`
												: exp.toLocaleDateString('es-AR');
										return (
											<Tooltip>
												<TooltipTrigger asChild>
													<span className={className}>{isExpired ? `Expirado` : short}</span>
												</TooltipTrigger>
												<TooltipContent>
													<div className='text-xs space-y-1'>
														<div>Creado: {new Date(p.createdAt as unknown as string).toLocaleDateString('es-AR')}</div>
														<div>Expira: {exp.toLocaleString('es-AR')}</div>
														<div>
															{isExpired
																? `Expiró ${formatDistanceToNow(exp, { addSuffix: true })}`
																: `Expira ${formatDistanceToNow(exp, { addSuffix: true })}`}
														</div>
													</div>
												</TooltipContent>
											</Tooltip>
										);
									})()}
								</TableCell>
								<TableCell className='text-right'>
									<div className='flex justify-end gap-1.5'>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant='ghost'
													size='icon'
													aria-label='Ver'
													onClick={() => router.push(`/publicaciones/${p.id}`)}
												>
													<Eye className='h-4 w-4' />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Ver</TooltipContent>
										</Tooltip>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button variant='ghost' size='icon' aria-label='Editar' onClick={() => setEditingId(p.id)}>
													<Edit className='h-4 w-4' />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Editar</TooltipContent>
										</Tooltip>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant='ghost'
													size='icon'
													aria-label='Renovar 30 días'
													onClick={async () => {
														setChangingId(p.id);
														const next = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
														const promise = (async () => {
															const res = await fetch(`/api/admin/posts/${p.id}`, {
																method: 'PATCH',
																headers: { 'Content-Type': 'application/json' },
																body: JSON.stringify({ expiresAt: next }),
															});
															if (res.status === 401) {
																router.push('/admin/login');
																return;
															}
															qc.invalidateQueries({ queryKey: ['admin-posts'] });
															setChangingId(null);
														})();
														await toast.promise(promise, {
															loading: 'Renovando…',
															success: 'Expiración renovada',
															error: 'Error al renovar',
														});
													}}
												>
													<RotateCcw className='h-4 w-4' />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Renovar 30 días</TooltipContent>
										</Tooltip>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant='ghost'
													size='icon'
													aria-label='Eliminar'
													className='text-red-600'
													onClick={() => setDeletePost(p)}
												>
													<Trash2 className='h-4 w-4' />
												</Button>
											</TooltipTrigger>
											<TooltipContent>Eliminar</TooltipContent>
										</Tooltip>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			{/* Modal de filtros */}
			<Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Filtros</DialogTitle>
					</DialogHeader>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <Label>Ordenar por</Label>
							<Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
								<SelectTrigger className='w-[160px]'>
									<SelectValue placeholder='Ordenar por' />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='recent'>Más recientes</SelectItem>
										<SelectItem value='price_asc'>Menor precio</SelectItem>
										<SelectItem value='price_desc'>Mayor precio</SelectItem>
										<SelectItem value='rating_desc'>Mejor valorados</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Categoría</Label>
							<Select value={category || 'any'} onValueChange={(v) => setCategory(v === 'any' ? '' : v)}>
								<SelectTrigger className='w-full'>
									<SelectValue placeholder='Categoría' />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='any'>Todas</SelectItem>
										{categoryOptions.map((c) => (
											<SelectItem key={c} value={c}>
												{c}
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Estado</Label>
							<Select value={status || 'any'} onValueChange={(v) => setStatus(v === 'any' ? '' : (v as Status))}>
								<SelectTrigger className='w-full'>
									<SelectValue placeholder='Estado' />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='any'>Todos</SelectItem>
										<SelectItem value='pending'>Pendiente</SelectItem>
										<SelectItem value='approved'>Aprobado</SelectItem>
										<SelectItem value='rejected'>Rechazado</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
						<div>
							<Label>Expiración</Label>
							<Select value={exp} onValueChange={(v) => setExp(v as 'all' | 'active' | 'expired')}>
								<SelectTrigger className='w-full'>
									<SelectValue placeholder='Expiración' />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										<SelectItem value='all'>Todas</SelectItem>
										<SelectItem value='active'>Vigentes</SelectItem>
										<SelectItem value='expired'>Expiradas</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					</div>
				</DialogContent>
			</Dialog>
			{pagination?.totalPages && pagination?.totalPages > 1 && (
				<div className='flex items-center justify-between mt-auto pt-4'>
					<div className='flex items-center gap-2'>
						<Button
							variant='outline'
							disabled={!pagination?.hasPrev}
							onClick={() => setPage((p) => Math.max(1, p - 1))}
						>
							Anterior
						</Button>
						<span className='text-sm'>
							Página {pagination?.page ?? page} de {pagination?.totalPages ?? 1}
						</span>
						<Button variant='outline' disabled={!pagination?.hasNext} onClick={() => setPage((p) => p + 1)}>
							Siguiente
						</Button>
					</div>
				</div>
			)}
			{/* Editar */}
			<Dialog open={!!editingId} onOpenChange={(o) => !o && setEditingId(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Editar publicación</DialogTitle>
					</DialogHeader>
					<div className='text-sm text-muted-foreground'>Función en preparación.</div>
				</DialogContent>
			</Dialog>

			{/* Eliminar */}
			<AlertDialog open={!!deletePost} onOpenChange={(o) => !o && setDeletePost(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Eliminar esta publicación?</AlertDialogTitle>
					</AlertDialogHeader>
					<div className='text-sm text-muted-foreground'>Esta acción no puede deshacerse.</div>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => deletePost && confirmDelete(deletePost.id)}
							className='bg-red-600 hover:bg-red-700'
						>
							Eliminar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Motivo de rechazo */}
			<Dialog open={!!rejectTarget} onOpenChange={(o) => !o && setRejectTarget(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Motivo de rechazo</DialogTitle>
					</DialogHeader>
					<div className='space-y-3'>
						<Label htmlFor='rejectReason'>Explicá brevemente el motivo</Label>
						<Textarea
							id='rejectReason'
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							placeholder='Ej.: Información incompleta o en contra de las reglas'
						/>
						<div className='flex justify-end gap-2'>
							<Button variant='outline' onClick={() => setRejectTarget(null)}>
								Cancelar
							</Button>
                            <Button
                                disabled={!rejectReason.trim()}
                                onClick={async () => {
                                    const id = rejectTarget?.id;
                                    if (!id) return;
                                    setRejectTarget(null);
                                    setChangingId(id);
                                    const p = (async () => {
                                        const res = await fetch(`/api/admin/posts/${id}`, {
                                            method: 'PATCH',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ status: 'rejected', reason: rejectReason.trim() || undefined }),
                                        });
                                        if (res.status === 401) {
                                            router.push('/admin/login');
                                            return;
                                        }
                                        if (res.status === 400) {
                                            const j = await res.json().catch(() => ({}))
                                            const err = (j as { error?: string }).error
                                            if (err === 'reason_required') throw new Error('Debés ingresar un motivo')
                                        }
                                        const j = await res.json().catch(() => ({}))
                                        const preview = (j as { emailPreviewUrl?: string }).emailPreviewUrl
                                        if (preview) {
                                            try { window.open(preview, '_blank') } catch {}
                                        }
                                        qc.invalidateQueries({ queryKey: ['admin-posts'] });
                                        setChangingId(null);
                                    })();
                                    await toast.promise(p, {
                                        loading: 'Rechazando…',
                                        success: 'Publicación rechazada',
                                        error: 'Error al rechazar',
                                    });
                                }}
                            >
                                Confirmar
                            </Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
