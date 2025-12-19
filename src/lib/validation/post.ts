import { z } from 'zod';

export const paymentMethodOptions = [
	'cash',
	'debit',
	'credit',
	'transfer',
	'mercadopago',
	'crypto',
] as const;

export const categoryOptions = ['eventos', 'servicios', 'productos', 'usados', 'cursos', 'pedidos'] as const;

export const tagOptions = [
	// generales
	'oferta',
	'promocion',
	'descuento',
	'urgente',
	'nuevo',
	'usado',
	'reacondicionado',
	'evento',
	'servicio',
	'producto',
	'curso',
	'pedido',
	// comercio/pago
	'efectivo',
	'transferencia',
	'mercadopago',
	'crypto',
	'canje',
	// tematicas
	'salud',
	'educacion',
	'tecnologia',
	'hogar',
	'alimentacion',
	'arte',
	'deporte',
	'musica',
	'cultura',
	'comunidad',
	'juegos',
	// actividades y expresion
	'danza',
	'voguing',
	'lectura',
	'estudio',
	// inclusion y diversidad
	'inclusion',
	'diversidad',
	'accesibilidad',
	'lgbtq+',
	'sin genero',
	'trans',
	// productos y rubros
	'indumentaria',
	'talles reales',
	'ropa interior',
	'muebles',
	'celular',
	'samsung',
	'bicicleta',
	// entorno
	'hogareno',
	'huerta',
	'sustentable',
	'mar',
	// servicios especificos
	'acompanamiento',
	'tramites',
	'programacion',
	// modos
	'local',
	'online',
	'hibrido',
] as const;

const emptyToUndefined = (val?: string) => {
	const v = (val ?? '').trim();
	return v === '' ? undefined : v;
};

const isBlank = (v?: string) => (v ?? '').trim() === '';
const trim = (v?: string) => (v ?? '').trim();

const socialItemSchema = z.object({
	name: z.string().transform(trim),
	url: z.string().transform(trim),
});

const socialsSchema = z
	.array(socialItemSchema)
	.superRefine((arr, ctx) => {
		let hasComplete = false;
		arr.forEach((item, idx) => {
			const nameFilled = !isBlank(item.name);
			const urlFilled = !isBlank(item.url);
			if (idx === 0) {
				if (!nameFilled)
					ctx.addIssue({ code: z.ZodIssueCode.custom, path: [idx, 'name'], message: 'Seleccione una red' });
				if (!urlFilled)
					ctx.addIssue({ code: z.ZodIssueCode.custom, path: [idx, 'url'], message: 'Ingrese un dato de contacto' });
				if (nameFilled && urlFilled) hasComplete = true;
			} else {
				// Filas adicionales: o ambas vacías, o ambas completas
				if (nameFilled || urlFilled) {
					if (!nameFilled)
						ctx.addIssue({ code: z.ZodIssueCode.custom, path: [idx, 'name'], message: 'Seleccione una red' });
					if (!urlFilled)
						ctx.addIssue({ code: z.ZodIssueCode.custom, path: [idx, 'url'], message: 'Ingrese un dato de contacto' });
					if (nameFilled && urlFilled) hasComplete = true;
				}
			}
		});
		if (!hasComplete) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['socials'],
				message: 'Debe agregar al menos un contacto completo',
			});
		}
	})
	.transform((arr) => arr.filter((i) => !isBlank(i.name) && !isBlank(i.url)));

// Schema base para todas las publicaciones
const basePostSchema = z
	.object({
		id: z.string().optional(),
		category: z.enum(categoryOptions),
		title: z.string('El título es requerido').min(3, 'El título debe tener al menos 3 caracteres'),
		subtitle: z
			.string()
			.min(3, 'El subtítulo debe tener al menos 3 caracteres')
			.max(160, 'El subtítulo no debe superar 160 caracteres')
			.transform(emptyToUndefined)
			.optional(),
		description: z.string('La descripción es requerida').min(10, 'La descripción debe tener al menos 10 caracteres'),
		image: z.string('La imagen es requerida').url('Debe ser una URL válida'),
		// Precio ahora es texto libre
		price: z
			.string()
			.max(50, 'El precio no debe superar 50 caracteres')
			.transform(emptyToUndefined)
			.optional(),
		rating: z.number().min(0).max(5).optional(),
		ratingCount: z.number().int().nonnegative().optional(),
		tags: z.array(z.enum(tagOptions)).optional(),
		urgent: z.boolean().optional(),
		date: z.string().optional(),
		status: z.enum(['pending', 'approved', 'rejected']).optional(),
		// Contactos
		socials: socialsSchema,
		payment: z.array(z.enum(paymentMethodOptions)).optional(),
		barterAccepted: z.boolean().optional(),
		// Visibilidad siempre gated por defecto
		contactVisibility: z.enum(['public', 'gated']).default('gated').optional(),
		contactFlow: z.enum(['seller_contacts', 'buyer_contacts_first']).default('seller_contacts').optional(),
		// Términos (un solo check)
		termsAccepted: z.boolean().optional(),
		// Datos privados para moderación
		privateFullName: z
			.string()
			.min(2, 'El nombre completo debe tener al menos 2 caracteres')
			.max(100, 'El nombre no debe superar 100 caracteres')
			.transform(emptyToUndefined)
			.optional(),
		privatePhone: z
			.string()
			.min(6, 'El teléfono debe tener al menos 6 caracteres')
			.max(20, 'El teléfono no debe superar 20 caracteres')
			.transform(emptyToUndefined)
			.optional(),
		privateEmail: z
			.string()
			.email('Debe ser un email válido')
			.transform(emptyToUndefined)
			.optional(),
		privateDni: z
			.string()
			.min(6, 'El DNI debe tener al menos 6 caracteres')
			.max(15, 'El DNI no debe superar 15 caracteres')
			.transform(emptyToUndefined)
			.optional(),
		privateDescription: z
			.string()
			.max(2000, 'La descripción privada no debe superar 2000 caracteres')
			.transform(emptyToUndefined)
			.optional(),
	})
	.superRefine((data, ctx) => {
		// Validar que se acepten los términos
		if (!data.termsAccepted) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ['termsAccepted'],
				message: 'Debes aceptar los términos y condiciones',
			});
		}
	});

// Schema específico para eventos
export const eventSchema = basePostSchema.extend({
	category: z.literal('eventos'),
	startDate: z.string('La fecha de inicio es requerida').min(1, 'La fecha de inicio es requerida'),
	endDate: z.string().optional(),
	venue: z.string('El lugar del evento es requerido').min(1, 'El lugar del evento es requerido'),
	mode: z.enum(['presencial', 'online', 'hibrido'], { message: 'Seleccione la modalidad del evento' }),
	capacity: z.number().int().nonnegative().optional(),
	organizer: z.string().optional(),
});

export const serviceSchema = basePostSchema.extend({
	category: z.literal('servicios'),
	experienceYears: z
		.number('Los años de experiencia deben ser un número')
		.int('Los años de experiencia deben ser enteros')
		.nonnegative('Los años de experiencia deben ser 0 o más')
		.optional(),
	availability: z.string().transform(emptyToUndefined).optional(),
	serviceArea: z.string().transform(emptyToUndefined).optional(),
});

export const productSchema = basePostSchema.extend({
	category: z.literal('productos'),
	condition: z.enum(['nuevo', 'reacondicionado'], { message: 'Seleccione la condición del producto' }),
	stock: z.number().int().nonnegative().optional(),
	warranty: z.string().optional(),
});

export const usedSchema = basePostSchema.extend({
	category: z.literal('usados'),
	condition: z.literal('usado'),
	usageTime: z.string().optional(),
});

export const courseSchema = basePostSchema.extend({
	category: z.literal('cursos'),
	mode: z.enum(['presencial', 'online', 'hibrido'], { message: 'Seleccione la modalidad del curso' }),
	duration: z.string('La duración del curso es requerida').min(1, 'La duración del curso es requerida'),
	schedule: z.string().optional(),
	level: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
});

export const requestSchema = basePostSchema.extend({
	category: z.literal('pedidos'),
	neededBy: z.string().optional(),
	budgetRange: z.string().optional(),
});

export const postSchema = z.discriminatedUnion('category', [
	eventSchema,
	serviceSchema,
	productSchema,
	usedSchema,
	courseSchema,
	requestSchema,
]);

export type PostInput = z.infer<typeof postSchema>;

// Schema específico para actualizaciones
export const updatePostSchema = z.object({
	id: z.string().optional(),
	category: z.enum(categoryOptions).optional(),
	title: z.string().min(3).optional(),
	subtitle: z.string().min(3).max(160).optional(),
	description: z.string().min(10).optional(),
	image: z.string().url().optional(),
	price: z.string().max(50).optional(),
	rating: z.number().min(0).max(5).optional(),
	ratingCount: z.number().int().nonnegative().optional(),
	tags: z.array(z.enum(tagOptions)).optional(),
	urgent: z.boolean().optional(),
	date: z.string().optional(),
	status: z.enum(['pending', 'approved', 'rejected']).optional(),
	expiresAt: z.string().optional(),
	socials: z.array(z.object({ name: z.string().min(1), url: z.string().min(1) })).optional(),
	payment: z.array(z.enum(paymentMethodOptions)).optional(),
	barterAccepted: z.boolean().optional(),
	contactVisibility: z.enum(['public', 'gated']).optional(),
	contactFlow: z.enum(['seller_contacts', 'buyer_contacts_first']).optional(),
	termsAccepted: z.boolean().optional(),
	// Datos privados
	privateFullName: z.string().optional(),
	privatePhone: z.string().optional(),
	privateEmail: z.string().optional(),
	privateDni: z.string().optional(),
	privateDescription: z.string().optional(),
	// Evento
	startDate: z.string().optional(),
	endDate: z.string().optional(),
	venue: z.string().optional(),
	mode: z.enum(['presencial', 'online', 'hibrido']).optional(),
	capacity: z.number().int().nonnegative().optional(),
	organizer: z.string().optional(),
	// Servicio
	experienceYears: z.number().int().nonnegative().optional(),
	availability: z.string().optional(),
	serviceArea: z.string().optional(),
	// Producto
	condition: z.enum(['nuevo', 'reacondicionado', 'usado']).optional(),
	stock: z.number().int().nonnegative().optional(),
	warranty: z.string().optional(),
	// Usado
	usageTime: z.string().optional(),
	// Curso
	duration: z.string().optional(),
	schedule: z.string().optional(),
	level: z.enum(['principiante', 'intermedio', 'avanzado']).optional(),
	// Pedido
	neededBy: z.string().optional(),
	budgetRange: z.string().optional(),
});

// Etiquetas en español para métodos de pago (para UI)
export const paymentMethodLabelsEs: Record<(typeof paymentMethodOptions)[number], string> = {
	cash: 'Efectivo',
	debit: 'Débito',
	credit: 'Crédito',
	transfer: 'Transferencia',
	mercadopago: 'Billetera virtual',
	crypto: 'Cripto',
};
