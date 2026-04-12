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

export async function generarConstanciaPonenteAction(idActividad: number, idUsuario: number) {
  try {
    const useCase = new GenerarConstanciaPonenteUseCase(
      getPdfService(),
      getStorageService(),
      getActividadRepository(),
      getPonentesRepository(),
      getUsuarioRepository()
    );

    const url = await useCase.execute(idActividad, idUsuario);
    return { success: true as const, url };
  } catch (error) {
    console.error('Error en generarConstanciaPonenteAction:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al generar' };
  }
}

export async function enviarConstanciaPonenteAction(idActividad: number, idUsuario: number) {
  try {
    const useCase = new EnviarConstanciaPonenteUseCase(
      getPdfService(),
      getEmailService(),
      getActividadRepository(),
      getUsuarioRepository()
    );

    await useCase.execute(idActividad, idUsuario);
    return { success: true as const };
  } catch (error) {
    console.error('Error en enviarConstanciaPonenteAction:', error);
    return { success: false as const, error: error instanceof Error ? error.message : 'Error al enviar por correo' };
  }
}