'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { eventSchema, paymentMethodOptions, paymentMethodLabelsEs } from '@/lib/validation/post';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

type EventFormValues = z.infer<typeof eventSchema>;

export default function CrearEventoPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm<EventFormValues>({
		resolver: zodResolver(eventSchema),
		mode: 'onSubmit',
		defaultValues: {
			category: 'eventos',
			title: '',
			description: '',
			image:
				'https://image.pollinations.ai/prompt/Board%20game%20afternoon%20in%20community%20center%2C%20diverse%20group%2C%20Mar%20del%20Plata%20Camet%2C%20photorealistic%2C%20warm%20light?width=1200&height=800&model=flux-realism&enhance=true&nologo=true',
			socials: [{ name: '', url: '' }],
			payment: [],
			contactVisibility: 'gated',
			contactFlow: 'seller_contacts',
			barterAccepted: false,
			startDate: '',
			endDate: undefined,
			venue: '',
			mode: 'presencial',
			capacity: undefined,
			organizer: undefined,
			termsAccepted: false,
		},
	});

  const termsAcceptedVal = form.watch('termsAccepted');

  const socialNameOptions = [
    'instagram',
    'facebook',
    'twitter',
    'whatsapp',
    'telegram',
    'email',
    'website',
    'otro',
  ] as const;

  const socialsFieldArray = useFieldArray({ control: form.control, name: 'socials' });

  const steps = useMemo(() => ['Categoría', 'Evento', 'Contacto y pagos', 'Moderación'] as const, []);

  useEffect(() => {
    // No paso de cuenta: el flujo comienza en "Categoría"
    setCurrentStep(0);
  }, []);

  async function validateStep(stepIdx: number): Promise<boolean> {
    // Paso 0: Categoría
    if (stepIdx === 0) {
      return true;
    }
    // Paso 1: Evento
    if (stepIdx === 1) {
      const valid = await form.trigger(['title', 'image', 'description', 'startDate', 'venue', 'mode', 'price']);
      return valid;
    }
    // Paso 2: Contacto y pagos
    if (stepIdx === 2) {
      const valid = await form.trigger(['socials', 'payment', 'contactVisibility', 'contactFlow']);
      return valid;
    }
    // Paso 3: Moderación
    if (stepIdx === 3) {
      const valid = await form.trigger(['privateDescription', 'termsAccepted']);
      return valid;
    }
    return true;
  }

  async function goNext() {
    const ok = await validateStep(currentStep);
    if (!ok) {
      toast.error('Revisá los campos marcados en rojo');
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }
  function goPrev() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: EventFormValues) {
    setSubmitting(true);
    try {
      const payload = { ...values, category: 'eventos' as const };
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let message = `Error ${res.status}`;
        try {
          const data: unknown = await res.json();
          if (typeof data === 'object' && data && 'error' in data) {
            const err = (data as { error: unknown }).error;
            if (typeof err === 'string') message = err;
          } else if (typeof data === 'object' && data && 'message' in data) {
            const msg = (data as { message: unknown }).message;
            if (typeof msg === 'string') message = msg;
          }
        } catch {
          const text = await res.text().catch(() => '');
          if (text) message = text;
        }
        throw new Error(message || 'Error al crear la publicación');
      }
      const created = (await res.json()) as unknown;
      const id =
        typeof created === 'object' && created && 'data' in created && typeof (created as { data: unknown }).data === 'object' && (created as { data: { id?: string } }).data?.id
          ? (created as { data: { id?: string } }).data?.id
          : undefined;
      toast.success('Tu publicación se envió para validación');
      if (id) {
        router.push(`/publicaciones/${id}`);
      } else {
        router.push('/profile');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No pudimos crear tu publicación';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <div className='mb-6'>
        <h1 className='text-2xl font-semibold'>Publicar evento</h1>
        <p className='text-muted-foreground'>Flujo por pasos para completar la publicación</p>
      </div>

      <div className='mb-6'>
        <ol className='flex flex-wrap items-center gap-2'>
          {steps.map((label, idx) => {
            const active = idx === currentStep;
            const done = idx < currentStep;
            const base = 'px-3 py-1.5 rounded-full text-xs border';
            const cls = active
              ? `${base} bg-gradient-to-r from-pink-500 to-violet-600 text-white border-transparent`
              : done
              ? `${base} bg-muted text-muted-foreground border-transparent`
              : `${base} bg-card text-muted-foreground border-border`;
            return (
              <li key={label} className={cls}>
                {idx + 1}. {label}
              </li>
            );
          })}
        </ol>
      </div>

      <Form {...form}>
        <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
          {currentStep === 0 && (
            <div className='space-y-6'>
              <FormField
                control={form.control}
                name='category'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Categoría</FormLabel>
                      <Badge variant='outline'>Requerido</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type='button' variant='ghost' size='icon' aria-label='Ayuda'>
                            <HelpCircle className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Elegí la categoría. Este flujo está listo para “Eventos”.</TooltipContent>
                      </Tooltip>
                    </div>
                    <FormControl>
                      <Select
                        onValueChange={(v) => {
                          field.onChange(v);
                          if (v !== 'eventos') {
                            router.push(`/publicaciones/crear/${v}`);
                          }
                        }}
                        value={field.value ?? ''}
                      >
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Seleccionar' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='eventos'>eventos</SelectItem>
                          <SelectItem value='servicios'>servicios</SelectItem>
                          <SelectItem value='productos'>productos</SelectItem>
                          <SelectItem value='usados'>usados</SelectItem>
                          <SelectItem value='cursos'>cursos</SelectItem>
                          <SelectItem value='pedidos'>pedidos</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className='flex justify-between'>
                <Button type='button' variant='outline' onClick={goPrev}>
                  Volver
                </Button>
                <Button type='button' onClick={goNext}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className='space-y-6'>
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Título</FormLabel>
                      <Badge variant='outline'>Requerido</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type='button' variant='ghost' size='icon' aria-label='Ayuda'>
                            <HelpCircle className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>El título debe ser claro y breve.</TooltipContent>
                      </Tooltip>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        onBlur={() => {
                          field.onBlur();
                          form.trigger('title');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='image'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Imagen (URL)</FormLabel>
                      <Badge variant='outline'>Requerido</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type='button' variant='ghost' size='icon' aria-label='Ayuda'>
                            <HelpCircle className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Usá una URL por ahora. Más adelante se habilitará subida.</TooltipContent>
                      </Tooltip>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder='https://...'
                        onBlur={() => {
                          field.onBlur();
                          form.trigger('image');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name='subtitle'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Subtítulo</FormLabel>
                      <Badge variant='outline'>Opcional</Badge>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        onBlur={() => {
                          const v = (field.value ?? '').toString().trim();
                          if (v === '') {
                            form.setValue('subtitle', undefined, { shouldValidate: true });
                            form.clearErrors('subtitle');
                          } else {
                            field.onBlur();
                            form.trigger('subtitle');
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Descripción</FormLabel>
                      <Badge variant='outline'>Requerido</Badge>
                    </div>
                    <FormControl>
                      <Textarea
                        rows={5}
                        {...field}
                        value={field.value ?? ''}
                        onBlur={() => {
                          field.onBlur();
                          form.trigger('description');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <FormField
                control={form.control}
                name='price'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Precio</FormLabel>
                      <Badge variant='outline'>Opcional</Badge>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder='Ej: $5000, Gratis, A voluntad'
                        onBlur={() => {
                          field.onBlur();
                          form.trigger('price');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='startDate'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-2'>
                        <FormLabel>Fecha inicio</FormLabel>
                        <Badge variant='outline'>Requerido</Badge>
                      </div>
                      <FormControl>
                        <Input
                          type='date'
                          {...field}
                          value={field.value ?? ''}
                          onBlur={() => {
                            field.onBlur();
                            form.trigger('startDate');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='endDate'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-2'>
                        <FormLabel>Fecha fin</FormLabel>
                        <Badge variant='outline'>Opcional</Badge>
                      </div>
                      <FormControl>
                        <Input
                          type='date'
                          {...field}
                          value={field.value ?? ''}
                          onBlur={() => {
                            const v = (field.value ?? '').toString().trim();
                            if (v === '') {
                              form.setValue('endDate', undefined, { shouldValidate: true });
                              form.clearErrors('endDate');
                            } else {
                              field.onBlur();
                              form.trigger('endDate');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='venue'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Lugar</FormLabel>
                      <Badge variant='outline'>Requerido</Badge>
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        onBlur={() => {
                          field.onBlur();
                          form.trigger('venue');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='mode'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Modalidad</FormLabel>
                      <Badge variant='outline'>Requerido</Badge>
                    </div>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger className='w-full'>
                          <SelectValue placeholder='Seleccionar' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='presencial'>presencial</SelectItem>
                          <SelectItem value='online'>online</SelectItem>
                          <SelectItem value='hibrido'>hibrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='capacity'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-2'>
                        <FormLabel>Capacidad</FormLabel>
                        <Badge variant='outline'>Opcional</Badge>
                      </div>
                      <FormControl>
                        <Input
                          type='number'
                          inputMode='numeric'
                          pattern='[0-9]*'
                          step='1'
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = raw === '' ? undefined : Number(raw);
                            field.onChange(num);
                          }}
                          onBlur={() => {
                            field.onBlur();
                            form.trigger('capacity');
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='organizer'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-2'>
                        <FormLabel>Organizador</FormLabel>
                        <Badge variant='outline'>Opcional</Badge>
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value ?? ''}
                          onBlur={() => {
                            const v = (field.value ?? '').toString().trim();
                            if (v === '') {
                              form.setValue('organizer', undefined, { shouldValidate: true });
                              form.clearErrors('organizer');
                            } else {
                              field.onBlur();
                              form.trigger('organizer');
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex justify-between'>
                <Button type='button' variant='outline' onClick={goPrev}>
                  Volver
                </Button>
                <Button type='button' onClick={goNext}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className='space-y-6'>
              <FormField
                control={form.control}
                name='payment'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Métodos de pago</FormLabel>
                      <Badge variant='outline'>Opcional</Badge>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button type='button' variant='ghost' size='icon' aria-label='Ayuda'>
                            <HelpCircle className='h-4 w-4' />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Seleccioná los medios de pago que aceptás.</TooltipContent>
                      </Tooltip>
                    </div>
                    <div className='grid grid-cols-2 gap-2 sm:grid-cols-3'>
                      {paymentMethodOptions.map((pm) => (
                        <label key={pm} className='flex items-center gap-2 rounded-md border p-2'>
                          <Checkbox
                            checked={field.value?.includes(pm) ?? false}
                            onCheckedChange={(checked) => {
                              const set = new Set(field.value || []);
                              if (checked) set.add(pm);
                              else set.delete(pm);
                              field.onChange(Array.from(set));
                            }}
                          />
                          <span>{paymentMethodLabelsEs[pm]}</span>
                        </label>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='grid gap-4 sm:grid-cols-2'>
                <FormField
                  control={form.control}
                  name='contactVisibility'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-2'>
                        <FormLabel>Visibilidad de contacto</FormLabel>
                        <Badge variant='outline'>Default público</Badge>
                      </div>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value ?? 'public'}>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Seleccionar' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='public'>public</SelectItem>
                            <SelectItem value='gated'>gated</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='contactFlow'
                  render={({ field }) => (
                    <FormItem>
                      <div className='flex items-center gap-2'>
                        <FormLabel>Flujo de contacto</FormLabel>
                        <Badge variant='outline'>Default autor visible</Badge>
                      </div>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value ?? 'seller_contacts'}>
                          <SelectTrigger className='w-full'>
                            <SelectValue placeholder='Seleccionar' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='seller_contacts'>seller_contacts</SelectItem>
                            <SelectItem value='buyer_contacts_first'>buyer_contacts_first</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name='barterAccepted'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Aceptás canje</FormLabel>
                      <Badge variant='outline'>Opcional</Badge>
                    </div>
                    <FormControl>
                      <div className='flex items-center gap-2'>
                        <Switch checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                        <span className='text-sm text-muted-foreground'>Permite intercambio en lugar de pago</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <FormLabel>Redes / Contactos</FormLabel>
                  <Badge variant='outline'>Requerido</Badge>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button type='button' variant='ghost' size='icon' aria-label='Ayuda'>
                        <HelpCircle className='h-4 w-4' />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Agregá al menos un contacto completo.</TooltipContent>
                  </Tooltip>
                </div>
                {socialsFieldArray.fields.map((f, idx) => (
                  <div key={f.id} className='grid gap-3 sm:grid-cols-[1fr_2fr_auto] items-end'>
                    <FormField
                      control={form.control}
                      name={`socials.${idx}.name` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className='w-full'>
                                <SelectValue placeholder='Seleccionar' />
                              </SelectTrigger>
                              <SelectContent>
                                {socialNameOptions.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`socials.${idx}.url` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder='@usuario / número / enlace' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='flex justify-end'>
                      <Button
                        type='button'
                        variant='ghost'
                        disabled={socialsFieldArray.fields.length <= 1}
                        onClick={() => socialsFieldArray.remove(idx)}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                ))}
                <div className='flex gap-2'>
                  <Button type='button' variant='outline' onClick={() => socialsFieldArray.append({ name: '', url: '' })}>
                    Agregar contacto
                  </Button>
                </div>
              </div>

              <div className='flex justify-between'>
                <Button type='button' variant='outline' onClick={goPrev}>
                  Volver
                </Button>
                <Button type='button' onClick={goNext}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className='space-y-6'>
              <FormField
                control={form.control}
                name='privateDescription'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <FormLabel>Información privada para moderación</FormLabel>
                      <Badge variant='outline'>Opcional</Badge>
                    </div>
                    <FormControl>
                      <Textarea
                        rows={4}
                        {...field}
                        value={field.value ?? ''}
                        onBlur={() => {
                          const v = (field.value ?? '').toString().trim();
                          if (v === '') {
                            form.setValue('privateDescription', undefined, { shouldValidate: true });
                            form.clearErrors('privateDescription');
                          } else {
                            field.onBlur();
                            form.trigger('privateDescription');
                          }
                        }}
                        placeholder='Datos personales para validación (no se mostrarán públicamente)'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='termsAccepted'
                render={({ field }) => (
                  <FormItem>
                    <div className='flex items-center gap-2'>
                      <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                      <span className='text-sm'>Acepto los términos, condiciones y normas de la comunidad</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className='flex justify-between'>
                <Button type='button' variant='outline' onClick={goPrev} disabled={submitting}>
                  Volver
                </Button>
                <Button type='submit' disabled={submitting || !termsAcceptedVal}>
                  {submitting ? 'Enviando...' : 'Enviar publicación'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
}
