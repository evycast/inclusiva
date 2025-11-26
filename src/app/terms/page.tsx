import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Términos y Condiciones • Inclusiva',
  description:
    'Condiciones de uso, publicación y privacidad para participar en la comunidad Inclusiva.',
};

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold">Términos y condiciones</h1>
      <p className="mt-3 text-muted-foreground">
        Última actualización: {new Date().getFullYear()}
      </p>

      <section className="mt-8 space-y-4">
        <h2 className="text-xl font-medium">1. Introducción</h2>
        <p>
          Inclusiva es una plataforma comunitaria orientada a visibilizar eventos, servicios,
          productos y proyectos con enfoque inclusivo y diverso. Al usar el sitio aceptás estos
          términos.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">2. Uso de la plataforma</h2>
        <p>
          Te comprometés a brindar información veraz y a respetar a las demás personas. No se
          permite contenido discriminatorio, ilegal, engañoso o que vulnere derechos.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">3. Publicaciones y moderación</h2>
        <p>
          Las publicaciones pueden ser revisadas y moderadas para asegurar la calidad y seguridad
          de la comunidad. Podemos editar o remover contenidos que incumplan estas reglas.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">4. Privacidad y datos</h2>
        <p>
          Tratamos tus datos con responsabilidad. Usamos la información sólo para el funcionamiento
          del sitio y la mejora de la experiencia. Para solicitudes vinculadas a datos, escribinos.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">5. Responsabilidades</h2>
        <p>
          Cada persona usuaria es responsable por lo que publica. Inclusiva no garantiza
          resultados comerciales ni se hace responsable por acuerdos entre partes.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">6. Cambios en los términos</h2>
        <p>
          Podemos actualizar estos términos para mejorar la plataforma. Las modificaciones se
          publicarán en esta página.
        </p>
      </section>

      <section className="mt-6 space-y-4">
        <h2 className="text-xl font-medium">7. Contacto</h2>
        <p>
          Si tenés dudas o sugerencias, escribinos por WhatsApp al contacto publicado en el footer.
        </p>
      </section>

      <div className="mt-10">
        <Link href='/' className='text-violet-500 hover:text-violet-600'>Volver al inicio</Link>
      </div>
    </main>
  );
}

