'use server';

import { after } from 'next/server';
import { z } from 'zod';
import { 
  reportarErrorEnAccion,
  getActividadRepository, 
  getPonentesRepository, 
  getInscripcionActividadRepository,
  getPdfService,
  getStorageService,
  getUsuarioRepository,
  getEmailService,
  getCatalogoRepository,
  getRegistroQueryService,
  getTransactionManager
} from '@/infrastructure/config/container';
import { GenerarConstanciaPonenteUseCase } from '@/application/use-cases/GenerarConstanciaPonenteUseCase';
import { EnviarConstanciaPonenteUseCase } from '@/application/use-cases/EnviarConstanciaPonenteUseCase';
import { GenerarConstanciaParticipanteUseCase } from '@/application/use-cases/GenerarConstanciaParticipanteUseCase';
import { EnviarConstanciaParticipanteUseCase } from '@/application/use-cases/EnviarConstanciaParticipanteUseCase';
import { EnviarConstanciasParticipantesActividad } from '@/application/use-cases/EnviarConstanciasParticipantesActividad';

import { requireAdmin } from '@/shared/auth/requireAdmin';
import { ConsultarDetalleActividad } from '@/application/use-cases/ConsultarDetalleActividad';
import { EliminarInscripcionActividad } from '@/application/use-cases/EliminarInscripcionActividad';
import { InscribirParticipantesActividad } from '@/application/use-cases/InscribirParticipantesActividad';
import { ActualizarSeleccionConstancia } from '@/application/use-cases/ActualizarSeleccionConstancia';
import { ConsultarRegistros } from '@/application/use-cases/ConsultarRegistros';
import type { ResultadoInscripcionManualDTO } from '@/application/dtos/InscripcionActividadDTO';
import { RegistroError } from '@/core/errors/RegistroError';

export interface UsuarioInscripcionBusqueda {
  folioRegistro: string;
  nombre: string;
  apellido: string;
  correo: string;
}

const inscribirParticipantesSchema = z.object({
  idActividad: z.number().int().positive(),
  folios: z.array(z.string().trim().min(1).max(15)).min(1).max(50),
});

const seleccionConstanciaSchema = z.object({
  idActividad: z.number().int().positive(),
  folioRegistro: z.string().trim().min(1).max(15).nullable(),
  incluir: z.boolean(),
});

export async function buscarUsuariosInscripcionAction(
  query: string,
): Promise<{ success: true; data: UsuarioInscripcionBusqueda[] } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const termino = query.trim().slice(0, 100);
    if (termino.length < 2) return { success: true, data: [] };
    const data = await new ConsultarRegistros(getRegistroQueryService()).buscarUsuarios(termino);
    return { success: true, data };
  } catch (error) {
    reportarErrorEnAccion('Error en buscarUsuariosInscripcionAction', error);
    return { success: false, error: 'Error al buscar usuarios' };
  }
}

export async function inscribirParticipantesAction(
  idActividad: number,
  folios: string[],
): Promise<{ success: true; resultados: ResultadoInscripcionManualDTO[] } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const parsed = inscribirParticipantesSchema.safeParse({ idActividad, folios });
    if (!parsed.success) {
      return { success: false, error: 'Los datos de la inscripción son inválidos' };
    }

    const resultados = await new InscribirParticipantesActividad(
      getActividadRepository(),
      getTransactionManager(),
    ).execute(parsed.data.idActividad, parsed.data.folios);

    return { success: true, resultados };
  } catch (error) {
    if (error instanceof RegistroError) return { success: false, error: error.message };
    reportarErrorEnAccion(`Error en inscribirParticipantesAction actividad ${idActividad}`, error);
    return { success: false, error: 'Ocurrió un error al inscribir a los participantes' };
  }
}

export async function actualizarSeleccionConstanciaAction(
  idActividad: number,
  folioRegistro: string | null,
  incluir: boolean,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin();
    const parsed = seleccionConstanciaSchema.safeParse({ idActividad, folioRegistro, incluir });
    if (!parsed.success) {
      return { success: false, error: 'Los datos de la selección son inválidos' };
    }

    await new ActualizarSeleccionConstancia(getTransactionManager()).execute(
      parsed.data.idActividad,
      parsed.data.folioRegistro,
      parsed.data.incluir,
    );
    return { success: true };
  } catch (error) {
    if (error instanceof RegistroError) return { success: false, error: error.message };
    reportarErrorEnAccion(
      `Error en actualizarSeleccionConstanciaAction actividad ${idActividad} folio ${folioRegistro ?? 'todos'}`,
      error,
    );
    return { success: false, error: 'Ocurrió un error al guardar la selección de constancias' };
  }
}

export async function getDetalleActividadAction(idActividadStr: string) {
  try {
    await requireAdmin();
    const idActividad = parseInt(idActividadStr, 10);
    if (isNaN(idActividad)) {
      throw new Error("ID de actividad inválido");
    }

    const data = await new ConsultarDetalleActividad(getActividadRepository(), getPonentesRepository(),
      getInscripcionActividadRepository(), getCatalogoRepository(), getPdfService()).obtener(idActividad);
    return { success: true as const, data };
  } catch (error) {
    reportarErrorEnAccion('Error en getDetalleActividadAction', error);
    return { success: false as const, error: 'Error al cargar los detalles' };
  }
}

export async function generarConstanciaPonenteAction(idActividad: number, folioRegistro: string) {
  try {
    await requireAdmin();
    const useCase = new GenerarConstanciaPonenteUseCase(
      getPdfService(),
      getStorageService(),
      getActividadRepository(),
      getPonentesRepository(),
      getUsuarioRepository()
    );

    const url = await useCase.execute(idActividad, folioRegistro);
    return { success: true as const, url };
  } catch (error) {
    reportarErrorEnAccion('Error en generarConstanciaPonenteAction', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al generar' };
  }
}

export async function enviarConstanciaPonenteAction(idActividad: number, folioRegistro: string) {
  try {
    await requireAdmin();
    const useCase = new EnviarConstanciaPonenteUseCase(
      getPdfService(),
      getEmailService(),
      getActividadRepository(),
      getUsuarioRepository()
    );

    await useCase.execute(idActividad, folioRegistro);
    return { success: true as const };
  } catch (error) {
    reportarErrorEnAccion('Error en enviarConstanciaPonenteAction', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al enviar por correo' };
  }
}

export async function generarConstanciaParticipanteAction(idActividad: number, folioRegistro: string) {
  try {
    await requireAdmin();
    const useCase = new GenerarConstanciaParticipanteUseCase(
      getPdfService(),
      getStorageService(),
      getActividadRepository(),
      getInscripcionActividadRepository(),
      getUsuarioRepository()
    );

    const { ruta } = await useCase.execute(idActividad, folioRegistro);
    return { success: true as const, url: ruta };
  } catch (error) {
    reportarErrorEnAccion('Error en generarConstanciaParticipanteAction', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al generar' };
  }
}

export async function enviarConstanciaParticipanteAction(idActividad: number, folioRegistro: string) {
  try {
    await requireAdmin();
    const useCase = new EnviarConstanciaParticipanteUseCase(
      getPdfService(),
      getEmailService(),
      getActividadRepository(),
      getUsuarioRepository(),
      getInscripcionActividadRepository(),
    );

    await useCase.execute(idActividad, folioRegistro);
    return { success: true as const };
  } catch (error) {
    reportarErrorEnAccion('Error en enviarConstanciaParticipanteAction', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al enviar por correo' };
  }
}

export async function enviarConstanciasParticipantesAction(idActividad: number): Promise<
  | { success: true; data: { total: number; garantizadas: number; porGenerar: number } }
  | { success: false; error: string }
> {
  try {
    await requireAdmin();
    if (!Number.isSafeInteger(idActividad) || idActividad <= 0) {
      return { success: false, error: 'La actividad no es válida' };
    }

    const generarConstancia = new GenerarConstanciaParticipanteUseCase(
      getPdfService(),
      getStorageService(),
      getActividadRepository(),
      getInscripcionActividadRepository(),
      getUsuarioRepository(),
    );
    const useCase = new EnviarConstanciasParticipantesActividad(
      getInscripcionActividadRepository(),
      getActividadRepository(),
      generarConstancia,
      getEmailService(),
    );

    const resumen = await useCase.preparar(idActividad);
    after(async () => {
      try {
        const resultados = await useCase.enviar(resumen);
        for (const fallo of resultados.filter((resultado) => !resultado.exito)) {
          reportarErrorEnAccion(
            `Error al enviar constancia de la actividad ${idActividad} al folio ${fallo.folioRegistro}`,
            new Error(fallo.error ?? 'Error desconocido'),
            { folio: fallo.folioRegistro },
          );
        }
      } catch (error) {
        reportarErrorEnAccion(`Error al enviar constancias de la actividad ${idActividad}`, error);
      }
    });

    return {
      success: true,
      data: {
        total: resumen.total,
        garantizadas: resumen.garantizadas,
        porGenerar: resumen.porGenerar,
      },
    };
  } catch (error) {
    if (error instanceof RegistroError) return { success: false, error: error.message };
    reportarErrorEnAccion(`Error en enviarConstanciasParticipantesAction actividad ${idActividad}`, error);
    return { success: false, error: 'Ocurrió un error al programar el envío de constancias' };
  }
}

export async function generarConstanciaParticipanteBatchAction(idActividad: number, folioRegistros: string[]) {
  try {
    await requireAdmin();
    const useCase = new GenerarConstanciaParticipanteUseCase(
      getPdfService(),
      getStorageService(),
      getActividadRepository(),
      getInscripcionActividadRepository(),
      getUsuarioRepository()
    );

    const resultados = [];
    for (const id of folioRegistros) {
      try {
        const { ruta } = await useCase.execute(idActividad, id);
        resultados.push({ folioRegistro: id, success: true, url: ruta });
      } catch (e) {
        resultados.push({ folioRegistro: id, success: false, error: e instanceof Error ? e.message : 'Error desconocido' });
      }
    }
    
    return { success: true as const, resultados };
  } catch (error) {
    reportarErrorEnAccion('Error en generarConstanciaParticipanteBatchAction', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al generar lote' };
  }
}

export async function eliminarInscripcionAction(
  idActividad: number,
  folioRegistro: string,
): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await requireAdmin();
    await new EliminarInscripcionActividad(getInscripcionActividadRepository(), getStorageService())
      .execute(idActividad, folioRegistro);
    return { success: true as const };
  } catch (error) {
    if (error instanceof RegistroError) return { success: false as const, error: error.message };
    reportarErrorEnAccion(`Error en eliminarInscripcionAction actividad ${idActividad} folio ${folioRegistro}`, error);
    return { success: false as const, error: 'Ocurrió un error al eliminar la inscripción' };
  }
}

export async function generarListaParticipantesPdfAction(idActividad: number) {
  try {
    await requireAdmin();
    const resultado = await new ConsultarDetalleActividad(getActividadRepository(), getPonentesRepository(),
      getInscripcionActividadRepository(), getCatalogoRepository(), getPdfService()).generarLista(idActividad);
    return { success: true as const, data: {
      base64: Buffer.from(resultado.buffer).toString('base64'), nombreArchivo: resultado.nombreArchivo,
    } };
  } catch (error) {
    reportarErrorEnAccion('Error en generarListaParticipantesPdfAction', error);
    return { success: false as const, error: 'Error al generar la lista de participantes' };
  }
}