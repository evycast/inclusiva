'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Report {
  id: string;
  postId: string;
  userId?: string | null;
  reason: string;
  message?: string | null;
  createdAt: string;
  post?: {
    id: string;
    title: string;
    category: string;
  };
}

interface ReportsResponse {
  data: Report[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const REASON_LABELS: Record<string, string> = {
  contenido_inapropiado: 'Contenido inapropiado',
  fraude_estafa: 'Fraude / estafa',
  spam: 'Spam',
  informacion_falsa: 'Información falsa',
  suplantacion: 'Suplantación de identidad',
  violencia_odio: 'Violencia / discurso de odio',
  otro: 'Otro',
};

export default function AdminReportsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [detailReport, setDetailReport] = useState<Report | null>(null);
  const [deleteReport, setDeleteReport] = useState<Report | null>(null);

  const { data, isLoading, isError } = useQuery<ReportsResponse>({
    queryKey: ['admin-reports', page],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports?page=${page}&pageSize=${pageSize}`);
      if (res.status === 401) {
        router.push('/admin/login');
        throw new Error('No autorizado');
      }
      if (!res.ok) throw new Error('Error al cargar reportes');
      return res.json();
    },
  });

  const reports = data?.data ?? [];
  const pagination = data?.pagination;

  async function handleDelete(id: string) {
    const p = (async () => {
      const res = await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) throw new Error('Error al eliminar');
      setDeleteReport(null);
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
    })();
    await toast.promise(p, {
      loading: 'Eliminando…',
      success: 'Reporte eliminado',
      error: 'Error al eliminar',
    });
  }

  return (
    <div className='px-4 max-w-7xl mx-auto py-6 min-h-[calc(100svh-5rem)] flex flex-col'>
      <div className='mb-6'>
        <h1 className='text-xl font-semibold'>Reportes</h1>
        <p className='text-sm text-muted-foreground'>Reportes enviados por usuarios sobre publicaciones</p>
      </div>

      <div className='rounded-md border overflow-x-auto w-full'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Motivo</TableHead>
              <TableHead>Publicación</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell><Skeleton className='h-5 w-32' /></TableCell>
                    <TableCell><Skeleton className='h-5 w-48' /></TableCell>
                    <TableCell><Skeleton className='h-5 w-24' /></TableCell>
                    <TableCell><Skeleton className='h-5 w-20' /></TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={4}>Error al cargar reportes.</TableCell>
              </TableRow>
            )}
            {!isLoading && reports.length === 0 && (
              <TableRow>
                <TableCell colSpan={4}>No hay reportes.</TableCell>
              </TableRow>
            )}
            {reports.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <Badge variant='outline'>
                    {REASON_LABELS[r.reason] || r.reason}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className='max-w-xs truncate'>
                    {r.post?.title || r.postId}
                  </div>
                  {r.post?.category && (
                    <span className='text-xs text-muted-foreground capitalize'>{r.post.category}</span>
                  )}
                </TableCell>
                <TableCell className='text-sm text-muted-foreground'>
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: es })}
                </TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-1.5'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label='Ver detalles'
                          onClick={() => setDetailReport(r)}
                        >
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver detalles</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label='Ver publicación'
                          onClick={() => router.push(`/publicaciones/${r.postId}`)}
                        >
                          <ExternalLink className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver publicación</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          aria-label='Eliminar'
                          className='text-red-600'
                          onClick={() => setDeleteReport(r)}
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

      {pagination && pagination.totalPages > 1 && (
        <div className='flex items-center justify-between mt-auto pt-4'>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              disabled={!pagination.hasPrev}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span className='text-sm'>
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <Button variant='outline' disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {/* Modal de detalles */}
      <Dialog open={!!detailReport} onOpenChange={(o) => !o && setDetailReport(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalles del reporte</DialogTitle>
          </DialogHeader>
          {detailReport && (
            <div className='space-y-4'>
              <div>
                <span className='text-xs text-muted-foreground'>Motivo</span>
                <p className='font-medium'>{REASON_LABELS[detailReport.reason] || detailReport.reason}</p>
              </div>
              {detailReport.message && (
                <div>
                  <span className='text-xs text-muted-foreground'>Mensaje</span>
                  <p className='text-sm'>{detailReport.message}</p>
                </div>
              )}
              <div>
                <span className='text-xs text-muted-foreground'>Publicación</span>
                <p className='font-medium'>{detailReport.post?.title || detailReport.postId}</p>
              </div>
              <div>
                <span className='text-xs text-muted-foreground'>Fecha</span>
                <p className='text-sm'>{new Date(detailReport.createdAt).toLocaleString('es-AR')}</p>
              </div>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setDetailReport(null)}>
                  Cerrar
                </Button>
                <Button onClick={() => router.push(`/publicaciones/${detailReport.postId}`)}>
                  Ver publicación
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmar eliminar */}
      <AlertDialog open={!!deleteReport} onOpenChange={(o) => !o && setDeleteReport(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este reporte?</AlertDialogTitle>
          </AlertDialogHeader>
          <div className='text-sm text-muted-foreground'>Esta acción no puede deshacerse.</div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteReport && handleDelete(deleteReport.id)}
              className='bg-red-600 hover:bg-red-700'
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
