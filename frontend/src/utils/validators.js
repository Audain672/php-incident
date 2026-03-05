/**
 * Validation schemas using Zod
 * @module validators
 */

import { z } from 'zod';
import { LIMITS, FILE_CONSTRAINTS } from './constants.js';

/**
 * Schema for user login validation
 * @type {z.ZodObject}
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"),
});

/**
 * Schema for user registration validation
 * @type {z.ZodObject}
 */
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le prénom ne peut contenir que des lettres, espaces et tirets"),
  lastName: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le nom ne peut contenir que des lettres, espaces et tirets"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"),
  confirmPassword: z
    .string()
    .min(1, "La confirmation du mot de passe est requise"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

/**
 * Schema for incident creation/update validation
 * @type {z.ZodObject}
 */
export const incidentSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(LIMITS.MAX_TITLE_LENGTH, `Le titre ne peut pas dépasser ${LIMITS.MAX_TITLE_LENGTH} caractères`)
    .trim(),
  description: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(LIMITS.MAX_DESCRIPTION_LENGTH, `La description ne peut pas dépasser ${LIMITS.MAX_DESCRIPTION_LENGTH} caractères`)
    .trim(),
  type: z
    .string()
    .min(1, "Le type d'incident est requis"),
  severity: z
    .string()
    .min(1, "Le niveau de gravité est requis"),
  latitude: z
    .number()
    .min(-90, "La latitude doit être entre -90 et 90")
    .max(90, "La latitude doit être entre -90 et 90"),
  longitude: z
    .number()
    .min(-180, "La longitude doit être entre -180 et 180")
    .max(180, "La longitude doit être entre -180 et 180"),
  locationName: z
    .string()
    .max(LIMITS.MAX_LOCATION_NAME_LENGTH, 
      `Le nom du lieu ne peut pas dépasser ${LIMITS.MAX_LOCATION_NAME_LENGTH} caractères`)
    .optional()
    .nullable(),
  image: z
    .any()
    .optional()
    .nullable()
    .refine((file) => {
      if (!file) return true; // Image is optional
      return file instanceof File;
    }, "Le fichier doit être un fichier valide")
    .refine((file) => {
      if (!file) return true; // Image is optional
      return FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type);
    }, {
      message: `Type de fichier non autorisé. Types acceptés: ${FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.join(', ')}`,
    })
    .refine((file) => {
      if (!file) return true; // Image is optional
      return file.size <= FILE_CONSTRAINTS.MAX_SIZE;
    }, {
      message: `La taille du fichier ne peut pas dépasser ${FILE_CONSTRAINTS.MAX_SIZE_MB}MB`,
    }),
  status: z
    .string()
    .optional(),
});

/**
 * Schema for incident filtering/searching
 * @type {z.ZodObject}
 */
export const incidentFilterSchema = z.object({
  type: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
});

/**
 * Schema for user profile update
 * @type {z.ZodObject}
 */
export const userProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "Le prénom est requis")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le prénom ne peut contenir que des lettres, espaces et tirets"),
  lastName: z
    .string()
    .min(1, "Le nom est requis")
    .max(50, "Le nom ne peut pas dépasser 50 caractères")
    .regex(/^[a-zA-ZÀ-ÿ\s-]+$/, "Le nom ne peut contenir que des lettres, espaces et tirets"),
  email: z
    .string()
    .min(1, "L'email est requis")
    .email("Format d'email invalide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  phone: z
    .string()
    .regex(/^[+]?[\d\s-()]+$/, "Format de numéro de téléphone invalide")
    .optional(),
});

/**
 * Schema for password change
 * @type {z.ZodObject}
 */
export const passwordChangeSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Le mot de passe actuel est requis"),
  newPassword: z
    .string()
    .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le nouveau mot de passe ne peut pas dépasser 128 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre"),
  confirmPassword: z
    .string()
    .min(1, "La confirmation du nouveau mot de passe est requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les nouveaux mots de passe ne correspondent pas",
  path: ["confirmPassword"],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "Le nouveau mot de passe doit être différent de l'ancien",
  path: ["newPassword"],
});

/**
 * Note: For TypeScript projects, you can use these type definitions:
 * import { z } from 'zod';
 * export const loginSchemaType = z.infer<typeof loginSchema>;
 * export const registerSchemaType = z.infer<typeof registerSchema>;
 * export const incidentSchemaType = z.infer<typeof incidentSchema>;
 * export const incidentFilterSchemaType = z.infer<typeof incidentFilterSchema>;
 * export const userProfileSchemaType = z.infer<typeof userProfileSchema>;
 * export const passwordChangeSchemaType = z.infer<typeof passwordChangeSchema>;
 */
