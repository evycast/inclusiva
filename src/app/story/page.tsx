import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Historia • Inclusiva',
  description:
    'Cómo nace Inclusiva: origen, proceso de creación y nuestro enfoque accesible.',
};

export default function StoryPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Nuestra historia</h1>
      <p className="mt-3 text-muted-foreground">
        Un recorrido por el origen de la plataforma y lo que nos guía.
      </p>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-medium">Origen</h2>
        <p>
          Inclusiva surge de una necesidad concreta: conectar iniciativas y personas
          desde una perspectiva inclusiva y diversa. Empezó como un proyecto pequeño
          y fue creciendo con aportes de la comunidad.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">Proceso de creación</h2>
        <p>
          Nos enfocamos en construir algo simple y útil. Priorizamos claridad,
          performance y accesibilidad, evitando complejidad innecesaria y manteniendo
          un diseño funcional.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">Accesibilidad primero</h2>
        <p>
          Buscamos que la plataforma sea fácil de usar, con textos claros, contraste
          suficiente y navegación directa. Escuchamos sugerencias para mejorar
          continuamente.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">Lo que sigue</h2>
        <p>
          La comunidad guía la evolución de Inclusiva. Sumamos mejoras paso a paso,
          manteniendo el enfoque en lo que aporta valor real.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">Contacto</h2>
        <p>
          Si querés colaborar o compartir una idea, escribinos por WhatsApp desde el
          enlace del footer.
        </p>
      </section>

      <div className="mt-10">
        <Link href='/' className='text-violet-500 hover:text-violet-600'>Volver al inicio</Link>
      </div>
    </main>
  );
}

