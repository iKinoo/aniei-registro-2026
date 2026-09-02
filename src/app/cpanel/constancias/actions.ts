'use server';

import { requireAdmin } from '@/shared/auth/requireAdmin';
import { getPdfService, getStorageService, getConstanciaManualRepository } from '@/infrastructure/config/container';
import { GenerarConstanciaManualUseCase } from '@/application/use-cases/GenerarConstanciaManualUseCase';
import { ConstanciaManualDTO, TipoConstanciaManual, TIPOS_CONSTANCIA } from '@/application/dtos/ConstanciaManualDTO';
import { ConstanciaManualEntity } from '@/application/ports/IConstanciaManualRepository';

export interface ConstanciaManualResponse {
  idConstancia: number;
  tipoConstancia: string;
  tipoConstanciaLabel: string;
  destinatarios: string[];
  descripcion: string;
  urlPdf: string;
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
    urlPdf: entity.urlPdf,
    fechaGeneracion: entity.fechaGeneracion.toISOString(),
  };
}

export async function generarConstanciaManualAction(
  formData: FormData
): Promise<{ success: true; data: ConstanciaManualResponse } | { success: false; error: string }> {
  try {
    await requireAdmin();

    const tipoConstancia = formData.get('tipoConstancia') as TipoConstanciaManual;
    const destinatariosRaw = formData.get('destinatarios') as string;
    const nombreActividad = formData.get('nombreActividad') as string | null;
    const nombrePonencia = formData.get('nombrePonencia') as string | null;
    const nombreEquipo = formData.get('nombreEquipo') as string | null;
    const nombreTesis = formData.get('nombreTesis') as string | null;
    const lugar = formData.get('lugar') as string | null;

    if (!tipoConstancia || !destinatariosRaw) {
      return { success: false, error: 'Tipo de constancia y destinatarios son requeridos' };
    }

    const destinatarios = destinatariosRaw
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (destinatarios.length === 0) {
      return { success: false, error: 'Debe ingresar al menos un destinatario' };
    }

    const dto: ConstanciaManualDTO = {
      tipoConstancia,
      destinatarios,
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
    console.error('Error in generarConstanciaManualAction:', error);
    return { success: false, error: 'Ocurrió un error al generar la constancia' };
  }
}

export async function obtenerConstanciasManualesAction(): Promise<
  { success: true; data: ConstanciaManualResponse[] } | { success: false; error: string }
> {
  try {
    await requireAdmin();
    const repo = getConstanciaManualRepository();
    const entidades = await repo.obtenerTodas();
    return { success: true, data: entidades.map(entityToResponse) };
  } catch (error) {
    console.error('Error in obtenerConstanciasManualesAction:', error);
    return { success: false, error: 'Ocurrió un error al obtener las constancias' };
  }
}
