"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import type { ApiUser, UsersListResponse, UserRole } from "@/types/api"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import type { AdminStatus } from "@/components/admin/StatusInlineControl"
import { Eye, Edit, Ban, CheckCircle2 as CheckIcon, XCircle, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

type Status = AdminStatus

export default function AdminUsersPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const [q, setQ] = useState("")
  const [role, setRole] = useState<UserRole | "">("")
  const [status, setStatus] = useState<Status | "">("")
  const [page, setPage] = useState(1)
  const pageSize = 24

  const params = useMemo(() => {
    const sp = new URLSearchParams()
    if (q.trim()) sp.set("q", q.trim())
    if (role) sp.set("role", role)
    if (status) sp.set("status", status)
    sp.set("page", String(page))
    sp.set("pageSize", String(pageSize))
    return sp.toString()
  }, [q, role, status, page])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [q, role, status, page])

  const { data, isLoading, isError } = useQuery<{ data: ApiUser[]; pagination: UsersListResponse["pagination"] }>({
    queryKey: ["admin-users", params],
    queryFn: async () => {
      const res = await fetch(`/api/admin/users?${params}`)
      if (res.status === 401) {
        router.push("/admin/login")
        throw new Error("No autorizado")
      }
      if (!res.ok) throw new Error("Error al cargar usuarios")
      return res.json()
    },
  })

  const users = data?.data ?? []
  const pagination = data?.pagination

  const [detailUser, setDetailUser] = useState<ApiUser | null>(null)
  const [changingId, setChangingId] = useState<string | null>(null)
  const [verifyDialog, setVerifyDialog] = useState<{ user: ApiUser; next: boolean } | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<ApiUser | null>(null)
  const [editDialog, setEditDialog] = useState<ApiUser | null>(null)
  const [createDialog, setCreateDialog] = useState(false)
  const [createEmail, setCreateEmail] = useState('')
  const [createPassword, setCreatePassword] = useState('')
  const [createPassword2, setCreatePassword2] = useState('')
  const [showPass1, setShowPass1] = useState(false)
  const [showPass2, setShowPass2] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createPhone, setCreatePhone] = useState('')
  const [createDni, setCreateDni] = useState('')
  const [createRole, setCreateRole] = useState<UserRole>('user')

  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editDni, setEditDni] = useState('')
  const [editRole, setEditRole] = useState<UserRole>('user')
  const [editEmailVerified, setEditEmailVerified] = useState(false)
  const [editVerifiedPublic, setEditVerifiedPublic] = useState(false)

  type UserPatch = { role?: UserRole; status?: Status; verifiedPublic?: boolean; emailVerified?: boolean; name?: string; phone?: string; dni?: string }
  async function patchUser(id: string, updates: UserPatch) {
    setChangingId(id)
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })
    if (res.status === 401) {
      router.push("/admin/login")
      return
    }
    qc.invalidateQueries({ queryKey: ["admin-users"] })
    setChangingId(null)
  }

  return (
    <div className='px-4 max-w-7xl mx-auto py-6 min-h-[calc(100svh-5rem)] flex flex-col'>
      <div className='flex items-center justify-between gap-4 mb-6'>
        <h1 className='text-xl font-semibold'>Panel de Admin · Usuarios</h1>
        <Button variant='default' onClick={() => setCreateDialog(true)}>Crear usuario</Button>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-4 items-end'>
        <div className='col-span-2'>
          <Input placeholder='Buscar…' value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={role || 'any'} onValueChange={(v) => setRole((v === 'any' ? '' : v) as UserRole)}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder='Rol' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Rol</SelectLabel>
              <SelectItem value='any'>Todos</SelectItem>
              <SelectItem value='user'>User</SelectItem>
              <SelectItem value='moderator'>Moderator</SelectItem>
              <SelectItem value='admin'>Admin</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div />
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Verificado</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className='text-right'>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell>
                      <div className='h-6 w-24 bg-muted rounded' />
                    </TableCell>
                    <TableCell>
                      <div className='h-6 w-20 bg-muted rounded' />
                    </TableCell>
                    <TableCell>
                      <div className='h-5 w-48 bg-muted rounded' />
                    </TableCell>
                    <TableCell>
                      <div className='h-5 w-40 bg-muted rounded' />
                    </TableCell>
                    <TableCell>
                      <div className='h-5 w-20 bg-muted rounded' />
                    </TableCell>
                    <TableCell>
                      <div className='h-5 w-28 bg-muted rounded' />
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='h-8 w-24 bg-muted rounded' />
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {isError && (
              <TableRow>
                <TableCell colSpan={7}>Error al cargar usuarios.</TableCell>
              </TableRow>
            )}
            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>No hay usuarios.</TableCell>
              </TableRow>
            )}
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <Avatar>
                      <AvatarImage src={''} alt={u.name ?? u.email} />
                      <AvatarFallback>{(u.name ?? u.email).split(' ').slice(0,2).map(s => s[0]?.toUpperCase() || '').join('')}</AvatarFallback>
                    </Avatar>
                    <span>{u.name ?? <span className='text-muted-foreground'>—</span>}</span>
                  </div>
                </TableCell>
                <TableCell>{u.phone ?? <span className='text-muted-foreground'>—</span>}</TableCell>
                <TableCell>
                  <div className='flex items-center gap-2'>
                    <span>{u.email}</span>
                    {u.emailVerified ? (
                      <CheckIcon className='h-4 w-4 text-emerald-600' />
                    ) : (
                      <XCircle className='h-4 w-4 text-muted-foreground' />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    aria-label='Verificado'
                    className='data-[state=checked]:bg-emerald-600 dark:data-[state=checked]:bg-emerald-500'
                    checked={u.verifiedPublic}
                    disabled={changingId === u.id}
                    onCheckedChange={(c) => setVerifyDialog({ user: u, next: c })}
                  />
                </TableCell>
                <TableCell className='capitalize'>{u.role}</TableCell>
                <TableCell className='text-right'>
                  <div className='flex justify-end gap-1.5'>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant='ghost' size='icon' aria-label='Ver' onClick={() => setDetailUser(u)}>
                          <Eye className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ver</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant='ghost' size='icon' aria-label='Editar' onClick={() => {
                          setEditDialog(u)
                          setEditName(u.name ?? '')
                          setEditPhone(u.phone ?? '')
                          setEditDni(u.dni ?? '')
                          setEditRole(u.role)
                          setEditEmailVerified(!!u.emailVerified)
                          setEditVerifiedPublic(u.verifiedPublic)
                        }}>
                          <Edit className='h-4 w-4' />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Editar</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant='ghost' size='icon' aria-label='Eliminar' onClick={() => setDeleteDialog(u)}>
                          <Ban className='h-4 w-4 text-red-600' />
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

      {pagination?.totalPages && pagination?.totalPages > 1 && (
        <div className='flex items-center justify-between mt-auto pt-4'>
          <div className='flex items-center gap-2'>
            <Button variant='outline' disabled={!pagination?.hasPrev} onClick={() => setPage((p) => Math.max(1, p - 1))}>
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

      <Dialog open={!!detailUser} onOpenChange={(o) => !o && setDetailUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle de usuario</DialogTitle>
          </DialogHeader>
          {detailUser && (
            <div className='space-y-2 text-sm'>
              <div><span className='text-muted-foreground'>Email:</span> {detailUser.email}</div>
              <div><span className='text-muted-foreground'>Nombre:</span> {detailUser.name ?? '—'}</div>
              <div><span className='text-muted-foreground'>Rol:</span> {detailUser.role}</div>
              <div><span className='text-muted-foreground'>Verificado:</span> {detailUser.verifiedPublic ? 'Sí' : 'No'}</div>
              <div><span className='text-muted-foreground'>Email verificado:</span> {detailUser.emailVerified ? 'Sí' : 'No'}</div>
              <div><span className='text-muted-foreground'>Creado:</span> {new Date(detailUser.createdAt).toLocaleString()}</div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!verifyDialog} onOpenChange={(o) => !o && setVerifyDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Advertencia</AlertDialogTitle>
          </AlertDialogHeader>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <div>Marcar como verificado mostrará un distintivo público de verificación en el perfil y publicaciones relacionadas.</div>
            <div>Usá esta acción sólo si confirmaste la identidad del usuario.</div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!verifyDialog) return
                const { user, next } = verifyDialog
                setVerifyDialog(null)
                const p = patchUser(user.id, { verifiedPublic: next })
                await toast.promise(p, { loading: 'Actualizando…', success: 'Verificado actualizado', error: 'Error al actualizar' })
              }}
            >
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteDialog} onOpenChange={(o) => !o && setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
          </AlertDialogHeader>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <div>Eliminar permanentemente borra el usuario y sus datos asociados (publicaciones, comentarios y actividad).</div>
            <div>Bloquear lo deshabilita: permanece en la base de datos, pero no es visible ni puede acceder.</div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant='destructive'
              onClick={async () => {
                if (!deleteDialog) return
                const id = deleteDialog.id
                setDeleteDialog(null)
                const p = (async () => {
                  setChangingId(id)
                  const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
                  if (res.status === 401) {
                    router.push('/admin/login')
                    return
                  }
                  qc.invalidateQueries({ queryKey: ['admin-users'] })
                  setChangingId(null)
                })()
                await toast.promise(p, { loading: 'Eliminando…', success: 'Usuario eliminado', error: 'Error al eliminar' })
              }}
            >
              Eliminar permanentemente
            </Button>
            <AlertDialogAction
              onClick={async () => {
                if (!deleteDialog) return
                const id = deleteDialog.id
                setDeleteDialog(null)
                const p = patchUser(id, { status: 'rejected', verifiedPublic: false })
                await toast.promise(p, { loading: 'Bloqueando…', success: 'Usuario bloqueado', error: 'Error al bloquear' })
              }}
            >
              Bloquear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!editDialog} onOpenChange={(o) => !o && setEditDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar usuario</DialogTitle>
          </DialogHeader>
          {editDialog && (
            <div className='grid gap-3'>
              <Input placeholder='Nombre' value={editName} onChange={(e) => setEditName(e.target.value)} />
              <Input placeholder='Teléfono' value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              <Input placeholder='DNI' value={editDni} onChange={(e) => setEditDni(e.target.value)} />
              <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Rol' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='user'>User</SelectItem>
                  <SelectItem value='moderator'>Moderator</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                </SelectContent>
              </Select>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Email verificado</span>
                <Switch checked={editEmailVerified} onCheckedChange={setEditEmailVerified} />
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm'>Verificado público</span>
                <Switch checked={editVerifiedPublic} onCheckedChange={setEditVerifiedPublic} />
              </div>
              <div className='flex justify-end gap-2'>
                <Button variant='outline' onClick={() => setEditDialog(null)}>Cancelar</Button>
                <Button
                  onClick={async () => {
                    const p = patchUser(editDialog.id, {
                      name: editName || undefined,
                      phone: editPhone || undefined,
                      dni: editDni || undefined,
                      role: editRole,
                      emailVerified: editEmailVerified,
                      verifiedPublic: editVerifiedPublic,
                    })
                    await toast.promise(p, { loading: 'Actualizando…', success: 'Usuario actualizado', error: 'Error al actualizar' })
                    setEditDialog(null)
                  }}
                >
                  Guardar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear usuario</DialogTitle>
          </DialogHeader>
          <div className='grid gap-3'>
            <div className='grid gap-1'>
              <Input placeholder='Nombre' value={createName} onChange={(e) => setCreateName(e.target.value)} />
            </div>
            <div className='grid gap-1'>
              <Input placeholder='Email' value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
            </div>
            <div className='grid gap-1'>
              <div className='flex items-center gap-2'>
                <Input placeholder='Contraseña' type={showPass1 ? 'text' : 'password'} value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} />
                <Button type='button' variant='outline' size='icon' onClick={() => setShowPass1((s) => !s)} aria-label='Ver contraseña'>
                  {showPass1 ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </Button>
              </div>
            </div>
            <div className='grid gap-1'>
              <div className='flex items-center gap-2'>
                <Input placeholder='Confirmar contraseña' type={showPass2 ? 'text' : 'password'} value={createPassword2} onChange={(e) => setCreatePassword2(e.target.value)} />
                <Button type='button' variant='outline' size='icon' onClick={() => setShowPass2((s) => !s)} aria-label='Ver contraseña'>
                  {showPass2 ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </Button>
              </div>
            </div>
            <div className='grid gap-1'>
              <Input placeholder='Teléfono' value={createPhone} onChange={(e) => setCreatePhone(e.target.value)} />
            </div>
            <div className='grid gap-1'>
              <Input placeholder='DNI' value={createDni} onChange={(e) => setCreateDni(e.target.value)} />
            </div>
            <div className='grid gap-1'>
              <Select value={createRole} onValueChange={(v) => setCreateRole(v as UserRole)}>
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Rol' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='user'>User</SelectItem>
                  <SelectItem value='moderator'>Moderator</SelectItem>
                  <SelectItem value='admin'>Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setCreateDialog(false)}>Cancelar</Button>
              <Button
                onClick={async () => {
                  if (createPassword !== createPassword2) {
                    toast.error('Las contraseñas no coinciden')
                    return
                  }
                  const p = (async () => {
                    const res = await fetch('/api/admin/users', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: createEmail, password: createPassword, name: createName || undefined, phone: createPhone || undefined, dni: createDni || undefined, role: createRole }),
                    })
                    if (!res.ok) throw new Error('Error al crear usuario')
                    setCreateDialog(false)
                    setCreateEmail('')
                    setCreatePassword('')
                    setCreatePassword2('')
                    setCreateName('')
                    setCreatePhone('')
                    setCreateDni('')
                    setCreateRole('user')
                    qc.invalidateQueries({ queryKey: ['admin-users'] })
                  })()
                  await toast.promise(p, { loading: 'Creando…', success: 'Usuario creado', error: 'Error al crear' })
                }}
              >
                Crear
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
