'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

import { postSchema, paymentMethodOptions, paymentMethodLabelsEs, type PostInput } from '@/lib/validation/post';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle, Check, Sparkles, X, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { getCategory, CategoryKey, CATEGORIES } from '@/lib/categories';
import { TermsModal } from '@/components/publications/TermsModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Categorías disponibles
const CATEGORY_KEYS: CategoryKey[] = ['eventos', 'servicios', 'productos', 'usados', 'cursos', 'pedidos'];

const CREATOR_LABELS: Record<CategoryKey, string> = {
  eventos: 'Evento',
  servicios: 'Servicio',
  productos: 'Producto',
  usados: 'Usado',
  cursos: 'Curso',
  pedidos: 'Pedido',
  todos: 'Todos',
};

const CREATOR_DESCRIPTIONS: Record<CategoryKey, string> = {
  eventos: 'Publicá una actividad, taller o encuentro.',
  servicios: 'Publicá un servicio que ofrecés.',
  productos: 'Publicá un producto que vendés.',
  usados: 'Publicá un usado que querés vender o donar.',
  cursos: 'Publicá un curso o taller.',
  pedidos: 'Publicá un pedido o solicitud.',
  todos: 'Elegí qué querés publicar.',
};

// Textos de ayuda para cada campo
const FIELD_HELP: Record<string, string> = {
  title: 'Un título claro y atractivo que describa tu publicación en pocas palabras.',
  subtitle: 'Una frase corta que complemente el título (opcional).',
  description: 'Contá de qué se trata, qué incluye, a quién está dirigido, etc.',
  image: 'Podés generar una imagen automática basada en el título.',
  price: 'Podés poner un número, "Gratis", "A voluntad", "A convenir", etc.',
  payment: 'Seleccioná los medios de pago que aceptás.',
  barterAccepted: 'Permite que te ofrezcan intercambios en lugar de pago.',
  socials: 'Agregá al menos un medio de contacto.',
  contactFlow: 'Elegí cómo preferís que funcione el contacto.',
  // Eventos
  startDate: 'Cuándo empieza tu evento.',
  endDate: 'Si tu evento dura más de un día (opcional).',
  venue: 'Dirección o nombre del lugar donde se realizará.',
  mode: 'Cómo se realizará (presencial, online o híbrido).',
  capacity: 'Cantidad máxima de asistentes (opcional).',
  organizer: 'Nombre de quien organiza (opcional).',
  // Servicios
  experienceYears: 'Cuántos años de experiencia tenés en este servicio.',
  availability: 'Cuándo estás disponible (ej: Lunes a viernes de 9 a 18).',
  serviceArea: 'Zona donde prestás el servicio.',
  // Productos
  condition: 'Estado del producto (nuevo o reacondicionado).',
  stock: 'Cantidad disponible (opcional).',
  warranty: 'Información sobre garantía (opcional).',
  // Usados
  usageTime: 'Cuánto tiempo fue usado el artículo.',
  // Cursos
  duration: 'Duración total del curso (ej: 3 meses, 8 clases).',
  schedule: 'Días y horarios del curso (opcional).',
  level: 'Nivel requerido (principiante, intermedio, avanzado).',
  // Pedidos
  neededBy: 'Fecha límite para lo que necesitás (opcional).',
  budgetRange: 'Rango de presupuesto disponible (opcional).',
  // Moderación
  privateFullName: 'Tu nombre real para verificación.',
  privatePhone: 'Número de contacto privado.',
  privateEmail: 'Tu email personal para contacto.',
  privateDni: 'Documento de identidad para verificación.',
  privateDescription: 'Información adicional que quieras compartir con moderación.',
};

// Componente para campo de ayuda con tooltip
function FieldHelp({ fieldKey }: { fieldKey: string }) {
  const text = FIELD_HELP[fieldKey];
  if (!text) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="h-5 w-5 p-0" aria-label="Ayuda">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {text}
      </TooltipContent>
    </Tooltip>
  );
}

// Componente para indicador de campo requerido
function RequiredMark() {
  return <span className="text-destructive ml-0.5">*</span>;
}

// Genera la URL de imagen basada en el título
function generateImageUrl(title: string, category: CategoryKey): string {
  const categoryPrompts: Record<CategoryKey, string> = {
    eventos: 'community event, inclusive gathering, diverse group, warm atmosphere',
    servicios: 'professional service, skilled worker, friendly, modern workspace',
    productos: 'product showcase, clean background, professional photography, studio lighting',
    usados: 'second-hand item, well-maintained, sustainable, eco-friendly',
    cursos: 'learning environment, classroom, workshop, educational setting',
    pedidos: 'helping hands, community support, solidarity, assistance',
    todos: 'diverse marketplace, community, inclusive',
  };
  
  const basePrompt = encodeURIComponent(
    `${title}, ${categoryPrompts[category]}, photorealistic, high quality, warm lighting, inclusive community`
  );
  
  return `https://image.pollinations.ai/prompt/${basePrompt}?width=1200&height=800&model=flux-realism&enhance=true&nologo=true`;
}

// Schema dinámico que incluye todos los campos posibles
const wizardSchema = z.object({
  category: z.enum(['eventos', 'servicios', 'productos', 'usados', 'cursos', 'pedidos']),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  subtitle: z.string().min(3).max(160).optional().or(z.literal('')),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  image: z.string().url('Debe ser una URL válida'),
  price: z.string().max(50).optional().or(z.literal('')),
  socials: z.array(z.object({ name: z.string(), url: z.string() })),
  payment: z.array(z.enum(['cash', 'debit', 'credit', 'transfer', 'mercadopago', 'crypto'])).optional(),
  barterAccepted: z.boolean().optional(),
  contactVisibility: z.enum(['public', 'gated']).optional(),
  contactFlow: z.enum(['seller_contacts', 'buyer_contacts_first']).optional(),
  termsAccepted: z.boolean(),
  // Datos privados
  privateFullName: z.string().optional().or(z.literal('')),
  privatePhone: z.string().optional().or(z.literal('')),
  privateEmail: z.string().email().optional().or(z.literal('')),
  privateDni: z.string().optional().or(z.literal('')),
  privateDescription: z.string().optional().or(z.literal('')),
  // Eventos
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  venue: z.string().optional(),
  mode: z.enum(['presencial', 'online', 'hibrido']).optional(),
  capacity: z.number().int().nonnegative().optional(),
  organizer: z.string().optional(),
  // Servicios
  experienceYears: z.number().int().nonnegative().optional(),
  availability: z.string().optional(),
  serviceArea: z.string().optional(),
  // Productos
  condition: z.enum(['nuevo', 'reacondicionado']).optional(),
  stock: z.number().int().nonnegative().optional(),
  warranty: z.string().optional(),
  // Usados
  usageTime: z.string().optional(),
  // Cursos
  duration: z.string().optional(),
  schedule: z.string().optional(),
  level: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
  // Pedidos
  neededBy: z.string().optional(),
  budgetRange: z.string().optional(),
});

type WizardFormValues = z.infer<typeof wizardSchema>;

export default function CrearWizardClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  const form = useForm<WizardFormValues>({
    resolver: zodResolver(wizardSchema),
    mode: 'onBlur',
    defaultValues: {
      category: 'eventos',
      title: '',
      description: '',
      image: '',
      price: '',
      socials: [{ name: '', url: '' }],
      payment: [],
      contactVisibility: 'gated',
      contactFlow: 'seller_contacts',
      barterAccepted: false,
      termsAccepted: false,
      privateFullName: '',
      privatePhone: '',
      privateEmail: '',
      privateDni: '',
      privateDescription: '',
      // Eventos
      startDate: '',
      endDate: '',
      venue: '',
      mode: 'presencial',
      capacity: undefined,
      organizer: '',
      // Servicios
      experienceYears: undefined,
      availability: '',
      serviceArea: '',
      // Productos
      condition: 'nuevo',
      stock: undefined,
      warranty: '',
      // Usados
      usageTime: '',
      // Cursos
      duration: '',
      schedule: '',
      level: undefined,
      // Pedidos
      neededBy: '',
      budgetRange: '',
    },
  });

  const termsAcceptedVal = form.watch('termsAccepted');
  const paymentVal = form.watch('payment') ?? [];
  const titleVal = form.watch('title');
  const imageVal = form.watch('image');

  const socialsFieldArray = useFieldArray({ control: form.control, name: 'socials' });

  // Pasos del wizard
  const steps = ['Categoría', 'Datos', 'Precio y pagos', 'Contacto', 'Moderación'] as const;

  // Generar imagen con la API de Pollinations
  async function handleGenerateImage() {
    if (!titleVal || titleVal.trim().length < 3) {
      toast.error('Escribí un título primero para generar la imagen');
      return;
    }
    if (!selectedCategory) return;
    
    setGeneratingImage(true);
    try {
      const imageUrl = generateImageUrl(titleVal.trim(), selectedCategory);
      form.setValue('image', imageUrl, { shouldValidate: true });
      toast.success('¡Imagen generada!');
    } catch {
      toast.error('No se pudo generar la imagen');
    } finally {
      setGeneratingImage(false);
    }
  }

  // Manejar métodos de pago
  function handlePaymentChange(method: typeof paymentMethodOptions[number], checked: boolean) {
    const current = new Set(paymentVal);
    if (checked) {
      current.add(method);
    } else {
      current.delete(method);
    }
    form.setValue('payment', Array.from(current), { shouldValidate: true });
  }

  function selectAllPayments() {
    form.setValue('payment', [...paymentMethodOptions], { shouldValidate: true });
  }

  function clearAllPayments() {
    form.setValue('payment', [], { shouldValidate: true });
  }

  async function validateStep(stepIdx: number): Promise<boolean> {
    if (stepIdx === 0) {
      return !!selectedCategory;
    }
    if (stepIdx === 1) {
      // Validar campos según categoría
      const baseFields: (keyof WizardFormValues)[] = ['title', 'image', 'description'];
      let categoryFields: (keyof WizardFormValues)[] = [];
      
      switch (selectedCategory) {
        case 'eventos':
          categoryFields = ['startDate', 'venue', 'mode'];
          break;
        case 'servicios':
          categoryFields = [];
          break;
        case 'productos':
          categoryFields = ['condition'];
          break;
        case 'usados':
          categoryFields = [];
          break;
        case 'cursos':
          categoryFields = ['mode', 'duration'];
          break;
        case 'pedidos':
          categoryFields = [];
          break;
      }
      
      return await form.trigger([...baseFields, ...categoryFields]);
    }
    if (stepIdx === 2) {
      return await form.trigger(['price', 'payment', 'barterAccepted']);
    }
    if (stepIdx === 3) {
      return await form.trigger(['socials', 'contactFlow']);
    }
    if (stepIdx === 4) {
      return await form.trigger(['termsAccepted']);
    }
    return true;
  }

  async function goNext() {
    const ok = await validateStep(currentStep);
    if (!ok) {
      if (currentStep === 0) {
        toast.error('Elegí una categoría para continuar');
      } else {
        toast.error('Revisá los campos marcados en rojo');
      }
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function goPrev() {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(values: WizardFormValues) {
    setSubmitting(true);
    const toastId = toast.loading('Enviando publicación...');
    try {
      // Limpiar valores opcionales vacíos
      const cleanValue = (v: string | undefined) => (v && v.trim() !== '' ? v.trim() : undefined);
      
      // Construir el payload según la categoría seleccionada
      const basePayload = {
        category: selectedCategory!,
        title: values.title,
        subtitle: cleanValue(values.subtitle),
        description: values.description,
        image: values.image,
        price: cleanValue(values.price),
        socials: values.socials.filter(s => s.name && s.url),
        payment: values.payment,
        barterAccepted: values.barterAccepted,
        contactVisibility: values.contactVisibility,
        contactFlow: values.contactFlow,
        termsAccepted: values.termsAccepted,
        privateFullName: cleanValue(values.privateFullName),
        privatePhone: cleanValue(values.privatePhone),
        privateEmail: cleanValue(values.privateEmail),
        privateDni: cleanValue(values.privateDni),
        privateDescription: cleanValue(values.privateDescription),
      };

      let categoryPayload: Partial<PostInput> = {};

      switch (selectedCategory) {
        case 'eventos':
          categoryPayload = {
            startDate: values.startDate,
            endDate: cleanValue(values.endDate),
            venue: values.venue,
            mode: values.mode,
            capacity: values.capacity,
            organizer: cleanValue(values.organizer),
          };
          break;
        case 'servicios':
          categoryPayload = {
            experienceYears: values.experienceYears,
            availability: cleanValue(values.availability),
            serviceArea: cleanValue(values.serviceArea),
          };
          break;
        case 'productos':
          categoryPayload = {
            condition: values.condition,
            stock: values.stock,
            warranty: cleanValue(values.warranty),
          };
          break;
        case 'usados':
          categoryPayload = {
            condition: 'usado',
            usageTime: cleanValue(values.usageTime),
          };
          break;
        case 'cursos':
          categoryPayload = {
            mode: values.mode,
            duration: values.duration,
            schedule: cleanValue(values.schedule),
            level: values.level,
          };
          break;
        case 'pedidos':
          categoryPayload = {
            neededBy: cleanValue(values.neededBy),
            budgetRange: cleanValue(values.budgetRange),
          };
          break;
      }

      const payload = { ...basePayload, ...categoryPayload };

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
          }
        } catch {
          const text = await res.text().catch(() => '');
          if (text) message = text;
        }
        throw new Error(message || 'Error al crear la publicación');
      }

      const created = (await res.json()) as { data?: { id?: string } };
      toast.success('¡Tu publicación se envió para validación!', { id: toastId });
      
      if (created.data?.id) {
        router.push(`/publicaciones/${created.data.id}`);
      } else {
        router.push('/profile');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'No pudimos crear tu publicación';
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  }

  const allPaymentsSelected = paymentMethodOptions.every((pm) => paymentVal.includes(pm));

  // Componente de DatePicker con mejor control de errores
  function DatePickerField({ 
    value, 
    onChange, 
    placeholder = 'Seleccionar fecha',
    minDate,
  }: { 
    value?: string; 
    onChange: (date: string | undefined) => void; 
    placeholder?: string;
    minDate?: Date;
  }) {
    const dateValue = value ? parseISO(value) : undefined;
    const validDate = dateValue && isValid(dateValue) ? dateValue : undefined;

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !validDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {validDate ? format(validDate, "PPP", { locale: es }) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={validDate}
            onSelect={(date) => {
              if (date) {
                onChange(format(date, 'yyyy-MM-dd'));
              } else {
                onChange(undefined);
              }
            }}
            locale={es}
            disabled={minDate ? (date) => date < minDate : undefined}
          />
        </PopoverContent>
      </Popover>
    );
  }

  // Renderizar campos específicos según categoría
  function renderCategoryFields() {
    switch (selectedCategory) {
      case 'eventos':
        return (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Fecha inicio <RequiredMark /></FormLabel>
                      <FieldHelp fieldKey="startDate" />
                    </div>
                    <FormControl>
                      <DatePickerField
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Seleccionar fecha"
                        minDate={new Date()}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Fecha fin</FormLabel>
                      <FieldHelp fieldKey="endDate" />
                    </div>
                    <FormControl>
                      <DatePickerField
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Opcional"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="venue"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Lugar <RequiredMark /></FormLabel>
                    <FieldHelp fieldKey="venue" />
                  </div>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Centro Cultural X, Av. Colón 1234" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Modalidad <RequiredMark /></FormLabel>
                      <FieldHelp fieldKey="mode" />
                    </div>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Capacidad</FormLabel>
                      <FieldHelp fieldKey="capacity" />
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={field.value ?? ''}
                        placeholder="Ej: 30"
                        onChange={(e) => {
                          const num = e.target.value === '' ? undefined : Number(e.target.value);
                          field.onChange(num);
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
              name="organizer"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Organizador</FormLabel>
                    <FieldHelp fieldKey="organizer" />
                  </div>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Colectivo Cultural" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'servicios':
        return (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="experienceYears"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Años de experiencia</FormLabel>
                      <FieldHelp fieldKey="experienceYears" />
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={field.value ?? ''}
                        placeholder="Ej: 5"
                        onChange={(e) => {
                          const num = e.target.value === '' ? undefined : Number(e.target.value);
                          field.onChange(num);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="availability"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Disponibilidad</FormLabel>
                      <FieldHelp fieldKey="availability" />
                    </div>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Lunes a viernes de 9 a 18" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="serviceArea"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Zona de servicio</FormLabel>
                    <FieldHelp fieldKey="serviceArea" />
                  </div>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Mar del Plata, zona centro" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'productos':
        return (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Condición <RequiredMark /></FormLabel>
                      <FieldHelp fieldKey="condition" />
                    </div>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nuevo">Nuevo</SelectItem>
                          <SelectItem value="reacondicionado">Reacondicionado</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Stock</FormLabel>
                      <FieldHelp fieldKey="stock" />
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={field.value ?? ''}
                        placeholder="Ej: 10"
                        onChange={(e) => {
                          const num = e.target.value === '' ? undefined : Number(e.target.value);
                          field.onChange(num);
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
              name="warranty"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Garantía</FormLabel>
                    <FieldHelp fieldKey="warranty" />
                  </div>
                  <FormControl>
                    <Input {...field} placeholder="Ej: 6 meses de garantía oficial" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        );

      case 'usados':
        return (
          <FormField
            control={form.control}
            name="usageTime"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <FormLabel>Tiempo de uso</FormLabel>
                  <FieldHelp fieldKey="usageTime" />
                </div>
                <FormControl>
                  <Input {...field} placeholder="Ej: 2 años, poco uso" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'cursos':
        return (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="mode"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Modalidad <RequiredMark /></FormLabel>
                      <FieldHelp fieldKey="mode" />
                    </div>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="hibrido">Híbrido</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Duración <RequiredMark /></FormLabel>
                      <FieldHelp fieldKey="duration" />
                    </div>
                    <FormControl>
                      <Input {...field} placeholder="Ej: 3 meses, 8 clases" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="schedule"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Horario</FormLabel>
                      <FieldHelp fieldKey="schedule" />
                    </div>
                    <FormControl>
                      <Input {...field} placeholder="Ej: Martes y jueves 19hs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Nivel</FormLabel>
                      <FieldHelp fieldKey="level" />
                    </div>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="principiante">Principiante</SelectItem>
                          <SelectItem value="intermedio">Intermedio</SelectItem>
                          <SelectItem value="avanzado">Avanzado</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        );

      case 'pedidos':
        return (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="neededBy"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Fecha límite</FormLabel>
                    <FieldHelp fieldKey="neededBy" />
                  </div>
                  <FormControl>
                    <Input {...field} placeholder="Ej: Lo antes posible, para marzo" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budgetRange"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2">
                    <FormLabel>Presupuesto</FormLabel>
                    <FieldHelp fieldKey="budgetRange" />
                  </div>
                  <FormControl>
                    <Input {...field} placeholder="Ej: $10.000 - $20.000" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Crear publicación</h1>
        <p className="text-muted-foreground">Completá los pasos para publicar</p>
      </div>

      {/* Indicador de pasos - scroll horizontal en mobile */}
      <div className="mb-6 overflow-x-auto pb-2">
        <ol className="flex items-center gap-2 min-w-max">
          {steps.map((label, idx) => {
            const active = idx === currentStep;
            const done = idx < currentStep;
            const base = 'px-3 py-1.5 rounded-full text-xs border whitespace-nowrap flex items-center gap-1 transition-colors';
            const cls = active
              ? `${base} bg-gradient-to-r from-pink-500 to-violet-600 text-white border-transparent`
              : done
                ? `${base} bg-muted text-muted-foreground border-transparent`
                : `${base} bg-card text-muted-foreground border-border`;
            return (
              <li key={label} className={cls}>
                {done && <Check className="h-3 w-3" />}
                {idx + 1}. {label}
              </li>
            );
          })}
        </ol>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          {/* PASO 0: Categoría */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {CATEGORY_KEYS.map((key) => {
                  const def = getCategory(key);
                  const Icon = def.icon;
                  const selected = selectedCategory === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-label={`Elegir ${def.label}`}
                      aria-pressed={selected}
                      onClick={() => {
                        setSelectedCategory(key);
                        form.setValue('category', key as WizardFormValues['category']);
                      }}
                      className={cn(
                        "group flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200",
                        "border-2 min-h-36 sm:min-h-40",
                        "hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary",
                        selected
                          ? `border-transparent bg-gradient-to-br ${def.gradient} text-white shadow-lg`
                          : "border-border bg-card hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center mb-2",
                        selected ? "bg-white/20" : "bg-muted"
                      )}>
                        <Icon className={cn("w-5 h-5", selected ? "text-white" : "text-muted-foreground")} />
                      </div>
                      <span className={cn("font-medium text-sm mb-1", selected ? "text-white" : "text-foreground")}>
                        {CREATOR_LABELS[key]}
                      </span>
                      <span className={cn("text-xs text-center leading-tight px-1", selected ? "text-white/80" : "text-muted-foreground")}>
                        {CREATOR_DESCRIPTIONS[key]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={goNext} disabled={!selectedCategory}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* PASO 1: Datos */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Título <RequiredMark /></FormLabel>
                      <FieldHelp fieldKey="title" />
                    </div>
                    <FormControl>
                      <Input {...field} placeholder={`Ej: ${selectedCategory === 'eventos' ? 'Taller de cerámica inclusivo' : 'Mi publicación'}`} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Generador de imagen */}
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Imagen <RequiredMark /></FormLabel>
                      <FieldHelp fieldKey="image" />
                    </div>
                    <FormControl>
                      <div className="space-y-3">
                        {field.value && (
                          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                            <img src={field.value} alt="Preview" className="w-full h-full object-cover" />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() => form.setValue('image', '', { shouldValidate: true })}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                        {!field.value && (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-32 border-dashed flex flex-col gap-2"
                            onClick={handleGenerateImage}
                            disabled={generatingImage || !titleVal || titleVal.trim().length < 3}
                          >
                            {generatingImage ? (
                              <>
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Generando...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="h-6 w-6 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  {titleVal && titleVal.trim().length >= 3 
                                    ? 'Generar imagen con IA' 
                                    : 'Escribí un título primero'}
                                </span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subtitle"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Subtítulo</FormLabel>
                      <FieldHelp fieldKey="subtitle" />
                    </div>
                    <FormControl>
                      <Input {...field} placeholder="Opcional - complementá el título" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Descripción <RequiredMark /></FormLabel>
                      <FieldHelp fieldKey="description" />
                    </div>
                    <FormControl>
                      <Textarea rows={4} {...field} placeholder="Contá de qué se trata..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos específicos por categoría */}
              {renderCategoryFields()}

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={goPrev}>
                  Volver
                </Button>
                <Button type="button" onClick={goNext}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* PASO 2: Precio y pagos */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Precio</FormLabel>
                      <FieldHelp fieldKey="price" />
                    </div>
                    <FormControl>
                      <Input {...field} placeholder='Ej: 5000, Gratis, A voluntad' />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="payment"
                render={() => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Métodos de pago</FormLabel>
                      <FieldHelp fieldKey="payment" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={allPaymentsSelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={allPaymentsSelected ? clearAllPayments : selectAllPayments}
                        >
                          {allPaymentsSelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {paymentMethodOptions.map((pm) => (
                          <label key={pm} className="flex items-center gap-2 rounded-md border p-2.5 cursor-pointer hover:bg-muted/50 transition-colors">
                            <Checkbox
                              checked={paymentVal.includes(pm)}
                              onCheckedChange={(checked) => handlePaymentChange(pm, !!checked)}
                            />
                            <span className="text-sm">{paymentMethodLabelsEs[pm]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="barterAccepted"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-base font-medium">¿Aceptás canje?</FormLabel>
                          <FieldHelp fieldKey="barterAccepted" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Habilitar si aceptás intercambios o trueques
                        </p>
                      </div>
                      <FormControl>
                        <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={goPrev}>
                  Volver
                </Button>
                <Button type="button" onClick={goNext}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* PASO 3: Contacto */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Flujo de contacto</CardTitle>
                  <CardDescription>
                    Elegí cómo preferís que funcione el contacto con interesados
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <FormField
                    control={form.control}
                    name="contactFlow"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                            <label
                              className={cn(
                                "flex flex-col p-4 rounded-lg border cursor-pointer transition-all",
                                field.value === 'buyer_contacts_first'
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <input
                                type="radio"
                                className="sr-only"
                                checked={field.value === 'buyer_contacts_first'}
                                onChange={() => field.onChange('buyer_contacts_first')}
                              />
                              <span className="font-medium">Que me contacten</span>
                              <span className="text-sm text-muted-foreground mt-1">
                                Los interesados verán tus datos y te escribirán
                              </span>
                            </label>
                            <label
                              className={cn(
                                "flex flex-col p-4 rounded-lg border cursor-pointer transition-all",
                                field.value === 'seller_contacts'
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              )}
                            >
                              <input
                                type="radio"
                                className="sr-only"
                                checked={field.value === 'seller_contacts'}
                                onChange={() => field.onChange('seller_contacts')}
                              />
                              <span className="font-medium">Yo contacto</span>
                              <span className="text-sm text-muted-foreground mt-1">
                                Recibirás los datos de quienes estén interesados
                              </span>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FormLabel>Redes / Contactos <RequiredMark /></FormLabel>
                  <FieldHelp fieldKey="socials" />
                </div>
                {socialsFieldArray.fields.map((f, idx) => (
                  <div key={f.id} className="grid gap-2 grid-cols-[1fr_2fr_auto] items-start">
                    <FormField
                      control={form.control}
                      name={`socials.${idx}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value ?? ''}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {['instagram', 'facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'website', 'otro'].map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
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
                      name={`socials.${idx}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="@usuario / número / enlace" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 mt-0.5"
                      disabled={socialsFieldArray.fields.length <= 1}
                      onClick={() => socialsFieldArray.remove(idx)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => socialsFieldArray.append({ name: '', url: '' })}>
                  + Agregar contacto
                </Button>
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={goPrev}>
                  Volver
                </Button>
                <Button type="button" onClick={goNext}>
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* PASO 4: Moderación */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Datos para moderación</CardTitle>
                  <CardDescription>
                    Estos datos son confidenciales y solo serán usados por nuestro equipo de moderación
                    para verificar tu identidad. No se mostrarán públicamente.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2 space-y-4">
                  <FormField
                    control={form.control}
                    name="privateFullName"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Nombre completo</FormLabel>
                          <FieldHelp fieldKey="privateFullName" />
                        </div>
                        <FormControl>
                          <Input {...field} placeholder="Ej: María García" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="privatePhone"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Teléfono</FormLabel>
                            <FieldHelp fieldKey="privatePhone" />
                          </div>
                          <FormControl>
                            <Input type="tel" {...field} placeholder="Ej: +54 9 223 1234567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="privateEmail"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel>Email</FormLabel>
                            <FieldHelp fieldKey="privateEmail" />
                          </div>
                          <FormControl>
                            <Input type="email" {...field} placeholder="tu@email.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="privateDni"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>DNI</FormLabel>
                          <FieldHelp fieldKey="privateDni" />
                        </div>
                        <FormControl>
                          <Input {...field} placeholder="Ej: 12345678" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="privateDescription"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel>Descripción adicional</FormLabel>
                          <FieldHelp fieldKey="privateDescription" />
                        </div>
                        <FormControl>
                          <Textarea rows={3} {...field} placeholder="Cualquier información adicional relevante..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="termsAccepted"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-start gap-3">
                          <FormControl>
                            <Checkbox
                              checked={!!field.value}
                              onCheckedChange={field.onChange}
                              className="mt-1"
                            />
                          </FormControl>
                          <div className="space-y-1">
                            <div className="text-sm">
                              Acepto los{' '}
                              <TermsModal
                                onAccept={() => field.onChange(true)}
                                trigger={
                                  <button type="button" className="text-primary underline hover:no-underline">
                                    términos y condiciones
                                  </button>
                                }
                              />{' '}
                              y me comprometo a respetar las normas de la comunidad
                            </div>
                            <FormMessage />
                          </div>
                        </div>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={goPrev} disabled={submitting}>
                  Volver
                </Button>
                <Button type="submit" disabled={submitting || !termsAcceptedVal}>
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
