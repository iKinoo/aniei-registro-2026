'use server';

import { auth } from '@/auth';
import { prisma } from '@/infrastructure/database/client';
import { RegistrarGrupoRapido } from '@/application/use-cases/RegistrarGrupoRapido';
import {
  getUsuarioRepository,
  getStorageService,
  getEmailService,
  getPdfService,
  getAccesoRepository,
} from '@/infrastructure/config/container';
import { z } from 'zod';

const miembroRapidoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(125),
  apellido: z.string().min(1, 'El apellido es requerido').max(256),
});

const grupoRapidoFormSchema = z.object({
  miembros: z.array(miembroRapidoSchema).min(1, 'Agregue al menos un miembro al grupo'),
});

export interface GrupoRapidoActionState {
  success: boolean;
  totalRegistrados?: number;
  folios?: string[];
  data?: { emailPadre: string };
  errors?: Record<string, string>;
  error?: string;
}

function validarArchivo(file: File): string | null {
  if (!file) return 'Seleccione un archivo';
  if (file.size === 0) return 'El archivo no puede estar vacío';
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) return 'El archivo debe pesar menos de 5MB';
  
  const allowedMimes = ['image/png', 'image/jpeg', 'application/pdf'];
  if (!allowedMimes.includes(file.type)) {
    return 'Solo se permiten archivos PNG, JPEG o PDF';
  }
  
  return null;
}

export async function registrarGrupoRapidoAction(
  _prevState: GrupoRapidoActionState,
  formData: FormData,
): Promise<GrupoRapidoActionState> {
  try {
    // 1. Verificar sesión
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        error: 'No hay una sesión activa',
      };
    }

    // 2. Encontrar al responsable (usuario logueado)
    const acceso = await prisma.accesos.findUnique({
      where: { email: session.user.email },
      select: { id_usuario: true },
    });

    if (!acceso?.id_usuario) {
      return {
        success: false,
        error: 'Usuario no encontrado',
      };
    }

    // Extraer miembros con nueva estructura plana nombres[] apellidos[]
    const nombres = formData.getAll('nombres[]');
    const apellidos = formData.getAll('apellidos[]');
    
    if (!nombres.length || nombres.length !== apellidos.length) {
       return {
        success: false,
        error: 'Datos de los integrantes incompletos o mal formados.'
       };
    }

    const miembrosList = nombres.map((nombre, i) => ({
      nombre: nombre as string,
      apellido: apellidos[i] as string
    }));

    // 4. Validar con Zod
    const parseResult = grupoRapidoFormSchema.safeParse({
      miembros: miembrosList,
    });

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parseResult.error.issues) {
        const key = issue.path.join('.');
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      return { success: false, errors: fieldErrors, error: 'Por favor corrija los errores en el formulario' };
    }

    // 5. Validar archivo
    const file = formData.get('archivo') as File;
    const archivoError = validarArchivo(file);
    if (archivoError) {
      return { success: false, errors: { archivo: archivoError }, error: archivoError };
    }

    // 6. Convertir archivo a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Ejecutar caso de uso
    const useCase = new RegistrarGrupoRapido(
      getUsuarioRepository(),
      getStorageService(),
      getEmailService(),
      getPdfService(),
    );

    const resultado = await useCase.execute({
      responsableId: acceso.id_usuario,
      miembros: parseResult.data.miembros,
      archivo: {
        nombre: file.name,
        mime: file.type,
        tamanio: file.size,
        buffer,
      },
    });

    return {
      success: true,
      totalRegistrados: resultado.totalRegistrados,
      folios: resultado.folios,
      data: { emailPadre: session.user.email }
    };
  } catch (error) {
    console.error('Error en registrarGrupoRapidoAction:', error);
    const message = error instanceof Error ? error.message : 'Error al registrar el grupo';
    return {
      success: false,
      error: message,
    };
  }
}
