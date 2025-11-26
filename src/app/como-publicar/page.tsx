import Link from 'next/link';

export default function Page() {
  return (
    <div className='container mx-auto px-6 py-10'>
      <h2 className='text-2xl font-semibold mb-3'>Cómo publicar</h2>
      <p className='text-muted-foreground mb-6'>
        Para crear una publicación seleccioná la categoría, completá los datos y enviá.
      </p>
      <ol className='list-decimal pl-5 space-y-2 text-sm text-muted-foreground'>
        <li>Ingresá con tu cuenta o registrate al comenzar.</li>
        <li>Elegí la categoría: Eventos, Servicios, Productos, Usados, Cursos o Pedidos.</li>
        <li>Completá título, descripción, precio y medios de contacto.</li>
        <li>Seleccioná métodos de pago y modo (presencial/online/híbrido).
        </li>
        <li>Agregá imágenes si corresponde.</li>
        <li>Incluí un mensaje para moderación (no será público).</li>
      </ol>
      <div className='mt-8 flex items-center gap-6'>
        <Link href='/publicaciones/crear' className='inline-flex rounded-lg bg-gradient-to-r from-pink-500 to-violet-600 px-4 py-2 text-white shadow-lg'>
          Publicar
        </Link>
        <Link href='/guia' className='text-sm text-muted-foreground hover:text-foreground'>
          Guía de uso
        </Link>
      </div>
    </div>
  );
}
