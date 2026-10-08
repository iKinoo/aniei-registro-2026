'use server';

import { requireAdmin } from '@/shared/auth/requireAdmin';
import { reportarErrorEnAccion, getPdfService, getStorageService, getConstanciaManualRepository } from '@/infrastructure/config/container';
import { GenerarConstanciaManualUseCase } from '@/application/use-cases/GenerarConstanciaManualUseCase';
import { ConstanciaManualDTO, ConstanciaManualArchivo, RolConstanciaManual, TipoConstanciaManual, TIPOS_CONSTANCIA } from '@/application/dtos/ConstanciaManualDTO';
import { ConstanciaManualEntity } from '@/application/ports/IConstanciaManualRepository';

export interface ConstanciaManualResponse {
  idConstancia: number;
  tipoConstancia: string;
  tipoConstanciaLabel: string;
  destinatarios: string[];
  descripcion: string;
  archivos: ConstanciaManualArchivo[];
  fechaGeneracion: string;
}

function entityToResponse(entity: ConstanciaManualEntity): ConstanciaManualResponse {
  const tipoLabel = TIPOS_CONSTANCIA.find((t) => t.value === entity.tipoConstancia)?.label ?? entity.tipoConstancia;
  return {
    idConstancia: entity.idConstancia,
    tipoConstancia: entity.tipoConstancia,
    tipoConstanciaLabel: tipoLabel,
    destinatarios: entity.destinatarios,
    descripcion: entity.descripcion,
    archivos: entity.archivos,
    fechaGeneracion: entity.fechaGeneracion.toISOString(),
  };
}

export async function generarConstanciaManualAction(
  formData: FormData
): Promise<{ success: true; data: ConstanciaManualResponse } | { success: false; error: string }> {
  try {
    await requireAdmin();

    const tipoConstancia = formData.get('tipoConstancia') as TipoConstanciaManual;
    const rol = (formData.get('rol') as string | null) ?? '';
    const destinatariosRaw = formData.get('destinatarios') as string;
    const nombreActividad = formData.get('nombreActividad') as string | null;
    const nombrePonencia = formData.get('nombrePonencia') as string | null;
    const nombreEquipo = formData.get('nombreEquipo') as string | null;
    const nombreTesis = formData.get('nombreTesis') as string | null;
    const lugar = formData.get('lugar') as string | null;

    if (!tipoConstancia || !destinatariosRaw) {
      return { success: false, error: 'Tipo de constancia y destinatarios son requeridos' };
    }

    if (!TIPOS_CONSTANCIA.some((t) => t.value === tipoConstancia)) {
      return { success: false, error: 'Tipo de constancia no válido' };
    }

    const destinatarios = destinatariosRaw
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (destinatarios.length === 0) {
      return { success: false, error: 'Debe ingresar al menos un destinatario' };
    }

    if ((tipoConstancia === 'TALLER' || tipoConstancia === 'CONFERENCIA_MAGISTRAL') && !nombreActividad?.trim()) {
      return { success: false, error: 'El nombre de la actividad es obligatorio' };
    }
    if (tipoConstancia === 'PONENTE' && !nombrePonencia?.trim()) {
      return { success: false, error: 'El nombre de la ponencia o artículo es obligatorio' };
    }
    if (tipoConstancia === 'TESIS' && (!nombreTesis?.trim() || !lugar?.trim())) {
      return { success: false, error: 'El nombre de la tesis y el lugar obtenido son obligatorios' };
    }
    if (tipoConstancia === 'HACKATHON' && (!nombreEquipo?.trim() || !lugar?.trim())) {
      return { success: false, error: 'El nombre del proyecto y el lugar obtenido son obligatorios' };
    }
    if (tipoConstancia === 'CONCURSO_PROGRAMACION' && !lugar?.trim()) {
      return { success: false, error: 'El lugar obtenido es obligatorio' };
    }

    const dto: ConstanciaManualDTO = {
      tipoConstancia,
      destinatarios,
      rol: (rol || undefined) as RolConstanciaManual | undefined,
      nombreActividad: nombreActividad ?? undefined,
      nombrePonencia: nombrePonencia ?? undefined,
      nombreEquipo: nombreEquipo ?? undefined,
      nombreTesis: nombreTesis ?? undefined,
      lugar: lugar ?? undefined,
    };

    const useCase = new GenerarConstanciaManualUseCase(
      getPdfService(),
      getStorageService(),
      getConstanciaManualRepository()
    );
    const entity = await useCase.execute(dto);

    return { success: true, data: entityToResponse(entity) };
  } catch (error) {
    reportarErrorEnAccion('Error in generarConstanciaManualAction', error);
    return { success: false, error: 'Ocurrió un error al generar la constancia' };
  }
}

export async function obtenerConstanciasManualesAction(): Promise<
  { success: true; data: ConstanciaManualResponse[] } | { success: false; error: string }
> {
  try {
    await requireAdmin();
    const repo = new GenerarConstanciaManualUseCase(getPdfService(), getStorageService(), getConstanciaManualRepository());
    const entidades = await repo.obtenerTodas();
    return { success: true, data: entidades.map(entityToResponse) };
  } catch (error) {
    reportarErrorEnAccion('Error in obtenerConstanciasManualesAction', error);
    return { success: false, error: 'Ocurrió un error al obtener las constancias' };
  }
}
