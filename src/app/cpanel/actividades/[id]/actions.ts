'use server';

import { 
  getActividadRepository, 
  getPonentesRepository, 
  getInscripcionActividadRepository,
  getPdfService,
  getStorageService,
  getUsuarioRepository,
  getEmailService
} from '@/infrastructure/config/container';
import { GenerarConstanciaPonenteUseCase } from '@/application/use-cases/GenerarConstanciaPonenteUseCase';
import { EnviarConstanciaPonenteUseCase } from '@/application/use-cases/EnviarConstanciaPonenteUseCase';
import { GenerarConstanciaParticipanteUseCase } from '@/application/use-cases/GenerarConstanciaParticipanteUseCase';
import { EnviarConstanciaParticipanteUseCase } from '@/application/use-cases/EnviarConstanciaParticipanteUseCase';

export async function getDetalleActividadAction(idActividadStr: string) {
  try {
    const idActividad = parseInt(idActividadStr, 10);
    if (isNaN(idActividad)) {
      throw new Error("ID de actividad inválido");
    }

    const repoActividad = getActividadRepository();
    const actividad = await repoActividad.obtenerPorId(idActividad);
    
    if (!actividad) {
       return { success: false as const, error: "Actividad no encontrada" };
    }

    const tipos = await repoActividad.obtenerTiposActividad();
    const nombreTipo = tipos.find(t => t.idTipoActividad === actividad.idTipoActividad)?.descripcion || 'Desconocido';

    const repoPonentes = getPonentesRepository();
    const ponentes = await repoPonentes.obtenerPorActividad(idActividad);

    const repoInscripciones = getInscripcionActividadRepository();
    const inscritos = await repoInscripciones.obtenerPorActividad(idActividad);

    return { 
      success: true as const, 
      data: {
        actividad,
        nombreTipo,
        ponentes,
        inscritos
      } 
    };
  } catch (error) {
    console.error('Error en getDetalleActividadAction:', error);
    return { success: false as const, error: 'Error al cargar los detalles' };
  }
}

export async function generarConstanciaPonenteAction(idActividad: number, folioRegistro: string) {
  try {
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
    console.error('Error en generarConstanciaPonenteAction:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al generar' };
  }
}

export async function enviarConstanciaPonenteAction(idActividad: number, folioRegistro: string) {
  try {
    const useCase = new EnviarConstanciaPonenteUseCase(
      getPdfService(),
      getEmailService(),
      getActividadRepository(),
      getUsuarioRepository()
    );

    await useCase.execute(idActividad, folioRegistro);
    return { success: true as const };
  } catch (error) {
    console.error('Error en enviarConstanciaPonenteAction:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al enviar por correo' };
  }
}

export async function generarConstanciaParticipanteAction(idActividad: number, folioRegistro: string) {
  try {
    const useCase = new GenerarConstanciaParticipanteUseCase(
      getPdfService(),
      getStorageService(),
      getActividadRepository(),
      getInscripcionActividadRepository(),
      getUsuarioRepository()
    );

    const url = await useCase.execute(idActividad, folioRegistro);
    return { success: true as const, url };
  } catch (error) {
    console.error('Error en generarConstanciaParticipanteAction:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al generar' };
  }
}

export async function enviarConstanciaParticipanteAction(idActividad: number, folioRegistro: string) {
  try {
    const useCase = new EnviarConstanciaParticipanteUseCase(
      getPdfService(),
      getEmailService(),
      getActividadRepository(),
      getUsuarioRepository()
    );

    await useCase.execute(idActividad, folioRegistro);
    return { success: true as const };
  } catch (error) {
    console.error('Error en enviarConstanciaParticipanteAction:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al enviar por correo' };
  }
}

export async function generarConstanciaParticipanteBatchAction(idActividad: number, folioRegistros: string[]) {
  try {
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
        const url = await useCase.execute(idActividad, id);
        resultados.push({ folioRegistro: id, success: true, url });
      } catch (e) {
         resultados.push({ folioRegistro: id, success: false, error: e instanceof Error ? e.message : 'Error desconocido' });
      }
    }
    
    return { success: true as const, resultados };
  } catch (error) {
    console.error('Error en generarConstanciaParticipanteBatchAction:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al generar lote' };
  }
}