import { z } from 'zod'

// Esquemas de validación para usuarios
export const createUserSchema = z.object({
  userFirebaseUID: z.string().min(1, 'Firebase UID es requerido'),
  userEmail: z.string().email('Email inválido'),
  userName: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').optional(),
  userPhotoURL: z.string().url('URL de foto inválida').optional(),
  userAppVersion: z.string().length(1, 'Versión de app debe ser 1 caracter'),
})

export const updateUserSchema = createUserSchema.partial()

// Esquemas de validación para vehículos
export const createVehicleSchema = z.object({
  vehicleBrandID: z.number().int().positive('ID de marca inválido'),
  vehicleModelID: z.number().int().positive('ID de modelo inválido'),
  vehicleVersionID: z.number().int().positive('ID de versión inválido'),
  vehicleCategoryID: z.number().int().positive('ID de categoría inválido'),
  vehicleYear: z.number()
    .int()
    .min(1900, 'Año debe ser mayor a 1900')
    .max(new Date().getFullYear() + 1, 'Año inválido'),
  vehiclePrice: z.number().int().positive('Precio debe ser positivo'),
})

export const updateVehicleSchema = createVehicleSchema.partial()

// Esquemas para opiniones
export const createOpinionSchema = z.object({
  opinionRate: z.number().int().min(1).max(5, 'Calificación debe estar entre 1 y 5'),
  opinionComment: z.string().max(255, 'Comentario muy largo').optional(),
  opinionVehicleID: z.number().int().positive('ID de vehículo inválido'),
  opinionUserId: z.number().int().positive('ID de usuario inválido'),
})

export const updateOpinionSchema = z.object({
  opinionRate: z.number().int().min(1).max(5, 'Calificación debe estar entre 1 y 5').optional(),
  opinionComment: z.string().max(255, 'Comentario muy largo').optional(),
}).refine(data => data.opinionRate !== undefined || data.opinionComment !== undefined, {
  message: 'Debe proporcionar al menos un campo para actualizar',
})

// Esquemas para comunidades
export const createCommunitySchema = z.object({
  communityName: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(255),
  communityLocationLat: z.string().max(20).optional(),
  communityLocationLon: z.string().max(20).optional(),
})

export const createCommunityMessageSchema = z.object({
  messageContent: z.string().min(1).max(4000, 'Mensaje muy largo'),
  messageCommunityID: z.number().int().positive('ID de comunidad inválido'),
  messageUserId: z.number().int().positive('ID de usuario inválido'),
})

// Esquemas para preferencias de usuario
export const createUserPreferenceSchema = z.object({
  preferenceBrandID: z.number().int().positive('ID de marca inválido'),
  preferenceCategoryID: z.number().int().positive('ID de categoría inválido'),
  preferencePriceMax: z.number().int().positive('Precio máximo debe ser positivo'),
  preferenceUserId: z.number().int().positive('ID de usuario inválido'),
})

export const updateUserPreferenceSchema = z.object({
  preferenceBrandID: z.number().int().positive('ID de marca inválido').optional(),
  preferenceCategoryID: z.number().int().positive('ID de categoría inválido').optional(),
  preferencePriceMax: z.number().int().positive('Precio máximo debe ser positivo').optional(),
})

// Esquemas para comparaciones
export const createComparisonSchema = z.object({
  vehicleIds: z.array(z.number().int().positive()).min(1, 'Debe incluir al menos un vehículo'),
})

// Esquemas para feedback
export const createFeedbackSchema = z.object({
  feedbackContent: z.string().min(1, 'Contenido requerido').max(4000, 'Contenido muy largo'),
})

// Esquemas de paginación
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

// Esquema para búsqueda de vehículos
export const searchVehiclesSchema = paginationSchema.extend({
  brandID: z.coerce.number().int().positive().optional(),
  categoryID: z.coerce.number().int().positive().optional(),
  yearMin: z.coerce.number().int().optional(),
  yearMax: z.coerce.number().int().optional(),
  priceMin: z.coerce.number().int().optional(),
  priceMax: z.coerce.number().int().optional(),
  sortBy: z.enum(['price', 'year', 'brand']).default('price'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type CreateVehicleInput = z.infer<typeof createVehicleSchema>
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>
export type CreateOpinionInput = z.infer<typeof createOpinionSchema>
export type UpdateOpinionInput = z.infer<typeof updateOpinionSchema>
export type CreateCommunityInput = z.infer<typeof createCommunitySchema>
export type CreateCommunityMessageInput = z.infer<typeof createCommunityMessageSchema>
export type CreateUserPreferenceInput = z.infer<typeof createUserPreferenceSchema>
export type UpdateUserPreferenceInput = z.infer<typeof updateUserPreferenceSchema>
export type CreateComparisonInput = z.infer<typeof createComparisonSchema>
export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>
export type SearchVehiclesInput = z.infer<typeof searchVehiclesSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
