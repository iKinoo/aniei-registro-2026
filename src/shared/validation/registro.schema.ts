import { z } from 'zod/v4';

export const registroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(125),
  apellido: z.string().min(1, 'El apellido es requerido').max(256),
  correo: z.email('Formato de correo inválido'),
  telefono: z.string().max(20).optional().or(z.literal('')),
  lada: z.string().max(10).optional().or(z.literal('')),
  extension: z.string().max(10).optional().or(z.literal('')),
  genero: z.enum(['M', 'F', 'O'], { message: 'Seleccione un género' }),
  carrera: z.string().max(128).optional().or(z.literal('')),
  dependencia: z.string().max(128).optional().or(z.literal('')),
  idTitulo: z.coerce.number().int().positive('Seleccione un título'),
  idInstitucion: z.coerce.number().int().positive('Seleccione una institución'),
  idEntidadFederativa: z.coerce.number().int().positive('Seleccione un estado'),
});

export const depositoSchema = z.object({
  bancoSucursal: z.string().max(100).optional().or(z.literal('')),
  ciudad: z.string().max(100).optional().or(z.literal('')),
  referencia: z.string().min(1, 'La referencia es requerida').max(50),
  monto: z.coerce.number().positive('El monto debe ser mayor a 0'),
  fechaDeposito: z.coerce.date({ error: 'Ingrese una fecha de depósito válida' }),
});

export const facturacionSchema = z.object({
  razonSocial: z.string().min(1, 'La razón social es requerida').max(150),
  rfc: z
    .string()
    .min(1, 'El RFC es requerido')
    .max(20)
    .regex(/^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/i, 'Formato de RFC inválido (Ej. XAXX010101000)'),
  calle: z.string().max(100).optional().or(z.literal('')),
  numExterior: z.string().max(20).optional().or(z.literal('')),
  numInterior: z.string().max(20).optional().or(z.literal('')),
  colonia: z.string().max(100).optional().or(z.literal('')),
  municipio: z.string().max(100).optional().or(z.literal('')),
  codigoPostal: z.string().max(10).optional().or(z.literal('')),
  idEntidadFederativaRfc: z.coerce.number().int().positive('Seleccione un estado').optional(),
});

export type RegistroFormData = z.infer<typeof registroSchema>;
export type DepositoFormData = z.infer<typeof depositoSchema>;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];

export function validarArchivo(file: File): string | null {
  if (!file || file.size === 0) {
    return 'El comprobante de pago es requerido';
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Tipo de archivo no permitido. Use PNG, JPG o PDF';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'El archivo excede el tamaño máximo de 5 MB';
  }
  return null;
}
