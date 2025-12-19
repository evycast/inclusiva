'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';

interface TermsModalProps {
  onAccept: () => void;
  trigger?: React.ReactNode;
}

export function TermsModal({ onAccept, trigger }: TermsModalProps) {
  const [open, setOpen] = useState(false);

  const handleAccept = () => {
    onAccept();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="link" className="p-0 h-auto text-primary underline">
            Ver términos y condiciones
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Términos y Condiciones</DialogTitle>
          <DialogDescription>
            Por favor leé atentamente antes de publicar
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[50vh] pr-4">
          <div className="space-y-4 text-sm text-muted-foreground">
            <section>
              <h3 className="font-semibold text-foreground mb-2">1. Uso de la plataforma</h3>
              <p>
                Inclusiva es una plataforma comunitaria que busca conectar personas con productos,
                servicios y eventos de manera inclusiva y respetuosa. Al publicar contenido,
                aceptás ser parte de esta comunidad y respetar sus valores.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">2. Contenido publicado</h3>
              <p>
                Sos responsable del contenido que publicás. Debe ser veraz, no discriminatorio
                y respetar las leyes vigentes. No se permite contenido que promueva el odio,
                la violencia o la discriminación de ningún tipo.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">3. Datos personales</h3>
              <p>
                Los datos que proporcionás para moderación (nombre completo, teléfono, email, DNI)
                son confidenciales y solo serán utilizados por el equipo de moderación para
                verificar tu identidad. No se compartirán públicamente ni con terceros.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">4. Moderación</h3>
              <p>
                Todas las publicaciones pasan por un proceso de moderación antes de ser visibles.
                Nos reservamos el derecho de rechazar o eliminar publicaciones que no cumplan
                con las normas de la comunidad.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">5. Compromiso comunitario</h3>
              <p>
                Al publicar, te comprometés a:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Tratar con respeto a todas las personas</li>
                <li>Proporcionar información veraz y actualizada</li>
                <li>Responder de manera oportuna a los interesados</li>
                <li>Reportar cualquier comportamiento inapropiado</li>
                <li>Contribuir a mantener un espacio seguro e inclusivo</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">6. Privacidad y seguridad</h3>
              <p>
                Protegemos tu privacidad. Tu información de contacto estará protegida y solo
                será visible para quienes demuestren interés genuino en tu publicación.
                Usamos el sistema de &quot;gated contact&quot; para evitar el spam.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">7. Responsabilidad</h3>
              <p>
                Inclusiva actúa como intermediaria y no se hace responsable por transacciones
                entre usuarios. Te recomendamos tomar las precauciones necesarias al acordar
                encuentros o intercambios.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-foreground mb-2">8. Modificaciones</h3>
              <p>
                Estos términos pueden ser modificados. Te notificaremos de cambios importantes.
                El uso continuado de la plataforma implica la aceptación de los términos vigentes.
              </p>
            </section>
          </div>
        </ScrollArea>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cerrar
          </Button>
          <Button type="button" onClick={handleAccept}>
            Aceptar términos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
