'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { serviceSchema } from '@/lib/validation/post';
import { paymentMethodOptions, paymentMethodLabelsEs } from '@/lib/validation/post';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function CrearServicioPage() {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);

	const form = useForm<ServiceFormValues>({
		resolver: zodResolver(serviceSchema),
		mode: 'onSubmit',
		defaultValues: {
			category: 'servicios',
			title: '',
			description: '',
			image:
				'https://image.pollinations.ai/prompt/Board%20game%20afternoon%20in%20community%20center%2C%20diverse%20group%2C%20Mar%20del%20Plata%20Camet%2C%20photorealistic%2C%20warm%20light?width=1200&height=800&model=flux-realism&enhance=true&nologo=true',
			socials: [{ name: '', url: '' }],
			payment: [],
			termsAccepted: false,
		},
	});

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

	async function onSubmit(values: ServiceFormValues) {
		setSubmitting(true);
		try {
			const payload = {
				...values,
				category: 'servicios' as const,
			};

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

			toast.success('Tu publicación se envió para validación. Redirigiendo...');
			router.push('/publicaciones');
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
				<h1 className='text-2xl font-semibold'>Publicar servicio</h1>
				<p className='text-muted-foreground'>Completa los datos básicos del servicio</p>
			</div>

			<Form {...form}>
				<form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
					{/* Título */}
					<FormField
						control={form.control}
						name='title'
						render={({ field }) => (
							<FormItem>
								<div className='flex items-center gap-2'>
									<FormLabel>Título</FormLabel>
									<Badge variant='outline'>Requerido</Badge>
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

					{/* Imagen (URL) */}
					<FormField
						control={form.control}
						name='image'
						render={({ field }) => (
							<FormItem>
								<div className='flex items-center gap-2'>
									<FormLabel>Imagen (URL)</FormLabel>
									<Badge variant='outline'>Requerido</Badge>
								</div>
								<FormControl>
									<Input
										{...field}
										value={field.value ?? ''}
										onBlur={() => {
											field.onBlur();
											form.trigger('image');
										}}
										placeholder='https://...'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>


					{/* Subtítulo */}
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

					{/* Descripción */}
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


					{/* Métodos de pago (multiselección) */}
					<FormField
						control={form.control}
						name='payment'
						render={({ field }) => (
							<FormItem>
								<div className='flex items-center gap-2'>
									<FormLabel>Métodos de pago</FormLabel>
									<Badge variant='outline'>Opcional</Badge>
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

					{/* Disponibilidad */}
					<FormField
						control={form.control}
						name='availability'
						render={({ field }) => (
							<FormItem>
								<div className='flex items-center gap-2'>
									<FormLabel>Disponibilidad</FormLabel>
									<Badge variant='outline'>Opcional</Badge>
								</div>
								<FormControl>
									<Input
										{...field}
										value={field.value ?? ''}
										onBlur={() => {
											const v = (field.value ?? '').toString().trim();
											if (v === '') {
												form.setValue('availability', undefined, { shouldValidate: true });
												form.clearErrors('availability');
											} else {
												field.onBlur();
												form.trigger('availability');
											}
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Área de servicio */}
					<FormField
						control={form.control}
						name='serviceArea'
						render={({ field }) => (
							<FormItem>
								<div className='flex items-center gap-2'>
									<FormLabel>Área de servicio</FormLabel>
									<Badge variant='outline'>Opcional</Badge>
								</div>
								<FormControl>
									<Input
										{...field}
										value={field.value ?? ''}
										onBlur={() => {
											const v = (field.value ?? '').toString().trim();
											if (v === '') {
												form.setValue('serviceArea', undefined, { shouldValidate: true });
												form.clearErrors('serviceArea');
											} else {
												field.onBlur();
												form.trigger('serviceArea');
											}
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					{/* Redes / Contactos */}
					<div className='space-y-3'>
						<div className='flex items-center gap-2'>
							<FormLabel>Redes / Contactos</FormLabel>
							<Badge variant='outline'>Requerido</Badge>
						</div>
						{socialsFieldArray.fields.map((f, idx) => (
							<div key={f.id} className='grid gap-3 sm:grid-cols-[1fr_2fr_auto] items-end'>
								{/* Select de nombre */}
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
								{/* Valor */}
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

					{/* Precio */}
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
										placeholder='Ej: $5000/hora, A convenir'
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

					{/* Años de experiencia */}
					<FormField
						control={form.control}
						name='experienceYears'
						render={({ field }) => (
							<FormItem>
								<div className='flex items-center gap-2'>
									<FormLabel>Años de experiencia</FormLabel>
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
											form.trigger('experienceYears');
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>


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

					<div className='flex justify-center'>
						<Button type='submit' disabled={submitting || !form.watch('termsAccepted')}>
							{submitting ? 'Enviando...' : 'Publicar servicio'}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
