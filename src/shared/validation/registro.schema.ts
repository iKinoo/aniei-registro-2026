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
  idCargo: z.coerce.number().int().positive('Seleccione un cargo'),
  idTipoUsuario: z.coerce.number().int().positive('Seleccione un tipo de usuario'),
  idInstitucion: z.coerce.number().int().positive('Seleccione una institución'),
  idEntidadFederativa: z.coerce.number().int().positive('Seleccione un estado'),
});

export type RegistroFormData = z.infer<typeof registroSchema>;

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
