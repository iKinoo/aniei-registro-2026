'use server';

import { z } from 'zod';
import { signIn } from '@/auth';
import { getEmailService, getTransactionManager, getPasswordHasher, getPasswordGenerator, getCatalogoRepository } from '@/infrastructure/config/container';
import { CompletarRegistroGrupo } from '@/application/use-cases/CompletarRegistroGrupo';
import { redirect } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

const completarRegistroSchema = z.object({
  correo: z.string().email('Formato de correo inválido'),
  telefono: z.string().max(20).optional().or(z.literal('')),
  lada: z.string().max(10).optional().or(z.literal('')),
  extension: z.string().max(10).optional().or(z.literal('')),
  genero: z.enum(['M', 'F', 'O'], { message: 'Seleccione un género' }),
  carrera: z.string().max(128).optional().or(z.literal('')),
  idTitulo: z.coerce.number().int().positive('Seleccione un título'),
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
  folioRegistro: string,
  prevState: CompletarActionState,
  formData: FormData
): Promise<CompletarActionState> {
  const fields = Object.fromEntries(formData.entries()) as Record<string, string>;

  try {
    const validatedData = completarRegistroSchema.parse(fields);

    const resultado = await new CompletarRegistroGrupo(getTransactionManager(), getPasswordHasher(),
      getPasswordGenerator(), getEmailService(), getCatalogoRepository()).execute(token, folioRegistro, validatedData);

    await signIn('credentials', {
      folioRegistro: resultado.folioRegistro,
      password: resultado.password,
      redirect: false
    });

  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
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
      return { success: true, autoLogFailed: true, correo: fields.correo };
    }

    return { fields, errors: { _form: 'Ocurrió un error inesperado.' } };
  }

  redirect('/actividades');
}
