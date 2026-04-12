'use server';

import { z } from 'zod';
import { prisma } from '@/infrastructure/database/client';
import bcrypt from 'bcryptjs';
import { signIn } from '@/auth';
import { getEmailService } from '@/infrastructure/config/container';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

// Reusing part of the validation
const completarRegistroSchema = z.object({
  correo: z.string().email('Formato de correo inválido'),
  telefono: z.string().max(20).optional().or(z.literal('')),
  lada: z.string().max(10).optional().or(z.literal('')),
  extension: z.string().max(10).optional().or(z.literal('')),
  genero: z.enum(['M', 'F', 'O'], { message: 'Seleccione un género' }),
  carrera: z.string().max(128).optional().or(z.literal('')),
  dependencia: z.string().max(128).optional().or(z.literal('')),
  idCargo: z.coerce.number().int().positive('Seleccione un cargo'),
  idInstitucion: z.coerce.number().int().positive('Seleccione una institución'),
  idEntidadFederativa: z.coerce.number().int().positive('Seleccione un estado'),
});

export interface CompletarActionState {
  success?: boolean;
  errors?: Record<string, string>;
  fields?: Record<string, string | number>;
  correo?: string;
  autoLogFailed?: boolean;
}

export async function completarRegistroAction(
  token: string,
  idUsuario: number,
  prevState: CompletarActionState,
  formData: FormData
): Promise<CompletarActionState> {
  const fields = Object.fromEntries(formData.entries()) as Record<string, string>;

  try {
    const validatedData = completarRegistroSchema.parse(fields);

    // Verify token and user are valid and exist and have a dummy email
    const grupo = await prisma.grupos_registro.findUnique({
      where: { token },
      include: { miembros: { where: { id_usuario: idUsuario } } },
    });

    if (!grupo || grupo.miembros.length === 0) {
      return { fields, errors: { _form: 'Usuario o grupo inválido.' } };
    }

    const usuario = grupo.miembros[0];
    if (!usuario.correo.includes('@temp.aniei.org')) {
      return { fields, errors: { _form: 'Este registro ya fue completado.' } };
    }

    // Verify new email uniqueness
    const emailExistente = await prisma.usuarios.findUnique({
      where: { correo: validatedData.correo }
    });

    if (emailExistente) {
      return { fields, errors: { correo: 'El correo ya está registrado.' } };
    }

    const acceso = await prisma.accesos.findFirst({
      where: { id_usuario: idUsuario }
    });

    if (!acceso) {
      return { fields, errors: { _form: 'No se encontró el acceso para este usuario.' } };
    }

    // Passwords & Update
    const rawPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(rawPassword, 10);

    const emailService = getEmailService();
    const [institucion] = await Promise.all([
      prisma.instituciones.findUnique({ where: { id_institucion: validatedData.idInstitucion } }),
      prisma.$transaction(async (tx) => {
        await tx.usuarios.update({
          where: { id_usuario: idUsuario },
          data: {
            correo: validatedData.correo,
            telefono: validatedData.telefono || null,
            lada: validatedData.lada || null,
            extension: validatedData.extension || null,
            genero: validatedData.genero,
            carrera: validatedData.carrera || null,
            dependencia: validatedData.dependencia || null,
            id_cargo: validatedData.idCargo,
            id_institucion: validatedData.idInstitucion,
            id_entidad_federativa: validatedData.idEntidadFederativa,
          },
        });

        await tx.accesos.update({
          where: { id_acceso: acceso.id_acceso },
          data: {
            email: validatedData.correo,
            password: passwordHash,
          },
        });
      })
    ]);

    // Send confirmation email with credentials
    const fechaStr = new Date().toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    await emailService.enviarConfirmacionRegistro(validatedData.correo, {
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      folio: usuario.folio_recibo || 'N/A',
      institucion: institucion?.nombre || 'N/A',
      fecha: fechaStr,
      password: rawPassword,
    });

    // Auto logic to sign in
    await signIn('credentials', {
      email: validatedData.correo,
      password: rawPassword,
      redirect: false
    });

  } catch (error) {
    if (isRedirectError(error)) {
      throw error; // Let Next.js handle redirect
    }
    if (error instanceof z.ZodError) {
      const errorMap: Record<string, string> = {};
      error.issues.forEach((err) => {
        if (err.path[0]) {
          errorMap[err.path[0].toString()] = err.message;
        }
      });
      return { fields, errors: errorMap };
    }

    if (error?.toString().includes("CredentialsSignin")) {
      // In case auto login fails due to something weird, just return success true
      return { success: true, autoLogFailed: true, correo: fields.correo };
    }

    return { fields, errors: { _form: 'Ocurrió un error inesperado.' } };
  }

  redirect('/actividades');
}
