import Link from 'next/link';

export default function Page() {
  return (
    <div className='container mx-auto px-6 py-10'>
      <h2 className='text-2xl font-semibold mb-3'>Aportes</h2>
      <p className='text-muted-foreground mb-6'>
        Tu apoyo ayuda a sostener el proyecto y su desarrollo.
      </p>
      <div className='grid gap-6 sm:grid-cols-2'>
        <div className='rounded-xl border border-border/50 bg-card p-6'>
          <h3 className='text-lg font-medium mb-2'>Transferencia</h3>
          <p className='text-sm text-muted-foreground'>
            Solicita los datos por contacto.
          </p>
        </div>
        <div className='rounded-xl border border-border/50 bg-card p-6'>
          <h3 className='text-lg font-medium mb-2'>Mercado Pago</h3>
          <p className='text-sm text-muted-foreground'>
            En breve habilitaremos enlaces directos.
          </p>
        </div>
      </div>
      <div className='mt-8'>
        <Link href='/contacto' className='text-sm text-muted-foreground hover:text-foreground'>
          Contacto
        </Link>
      </div>
    </div>
  );
}
