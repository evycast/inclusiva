import Link from 'next/link'

export default async function VerifiedPage({ searchParams }: { searchParams?: Promise<Record<string, string | string[]>> }) {
  const params = (searchParams ? await searchParams : undefined) ?? {}
  const ok = params?.ok === '1'
  const error = typeof params?.error === 'string' ? params?.error : undefined
  return (
    <div className="min-h-[calc(100vh-3rem)] flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      <div className="w-full max-w-md border-border/50 bg-card/ py-8 rounded-xl border shadow">
        <div className="px-6">
          <h1 className="text-2xl font-semibold">
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-sky-400 bg-clip-text text-transparent">Verificación de email</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {ok ? 'Tu email fue verificado correctamente.' : 'No pudimos verificar tu email.'}
          </p>
          {!ok && (
            <p className="text-muted-foreground text-sm mt-1">Código: {error ?? 'error'}</p>
          )}
          <div className="mt-6">
            <Link href="/admin/login" className="inline-flex items-center rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-3 py-2 font-medium text-white shadow-lg">
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
