import { z } from 'zod/v4';

export const miembroSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(125),
  apellido: z.string().min(1, 'El apellido es requerido').max(256),
  correo: z.email('Formato de correo inválido'),
  genero: z.enum(['M', 'F', 'O'], { message: 'Seleccione un género' }),
  carrera: z.string().max(128).optional().or(z.literal('')),
  idTipoUsuario: z.coerce.number().int().positive('Seleccione un tipo de usuario'),
});

export const grupoSchema = z.object({
  responsable: z.object({
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
  }),
  miembros: z.array(miembroSchema).min(1, 'Agregue al menos un miembro al grupo'),
});

export type GrupoFormData = z.infer<typeof grupoSchema>;
export type MiembroFormData = z.infer<typeof miembroSchema>;
