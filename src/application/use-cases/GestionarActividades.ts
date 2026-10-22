import { IActividadRepository } from '@/application/ports/IActividadRepository';
import { ITransactionManager } from '@/application/ports/ITransactionManager';
import { ActividadDTO, CrearActividadDTO, ActualizarActividadDTO, HorarioActividadDTO } from '@/application/dtos/ActividadDTO';
import { TipoActividad } from '@/application/dtos/CatalogosDTO';

function validarHorarios(horarios: HorarioActividadDTO[]): void {
  for (const h of horarios) {
    if (!h.fechaInicio || !h.fechaFin) {
      throw new Error('Cada horario debe tener fecha y hora de inicio y fin.');
    }
    if (new Date(h.fechaFin) < new Date(h.fechaInicio)) {
      throw new Error('La hora de fin de un horario no puede ser anterior a su hora de inicio.');
    }
  }
}

function derivarRango(horarios: HorarioActividadDTO[]): { fechaInicio: string; fechaFin: string } {
  const ordenados = [...horarios].sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
  return {
    fechaInicio: ordenados[0].fechaInicio,
    fechaFin: [...ordenados].sort((a, b) => a.fechaFin.localeCompare(b.fechaFin))[ordenados.length - 1].fechaFin,
  };
}

function validarEnlace(enlace: string): void {
  let url: URL;
  try {
    url = new URL(enlace);
  } catch {
    throw new Error('El enlace de la sesión no tiene un formato válido.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('El enlace de la sesión debe comenzar con http:// o https://');
  }
}

export class GestionarActividades {
  constructor(
    private readonly actividadRepo: IActividadRepository,
    private readonly txManager: ITransactionManager,
  ) {}

  async listar(): Promise<ActividadDTO[]> {
    return this.actividadRepo.listar();
  }

  async listarConEquipos(): Promise<ActividadDTO[]> {
    return (await this.actividadRepo.listar()).filter(a => a.tipoActividad?.manejaEquipos);
  }

  async obtenerPorIds(ids: number[]): Promise<ActividadDTO[]> {
    const rows = await Promise.all([...new Set(ids)].map(id => this.actividadRepo.obtenerPorId(id)));
    return rows.filter(a => a !== null);
  }

  async listarPorCategoria(categoria: string): Promise<ActividadDTO[]> {
    const todas = await this.actividadRepo.listar();
    if (categoria !== 'disponibles') return todas.filter(a => a.tipoActividad?.clave?.toLowerCase() === categoria);
    return todas.filter(a => {
      const clave = a.tipoActividad?.clave?.toLowerCase() ?? '';
      const descripcion = a.tipoActividad?.descripcion.toLowerCase() ?? '';
      return ![clave, descripcion].some(texto => texto.includes('hackaton') || texto.includes('concurso'));
    });
  }

  async obtenerPorId(id: number): Promise<ActividadDTO | null> {
    return this.actividadRepo.obtenerPorId(id);
  }

  async crear(data: CrearActividadDTO): Promise<ActividadDTO> {
    if (!data.nombre || data.nombre.trim() === '') {
      throw new Error('El nombre de la actividad es requerido.');
    }

    if (data.horarios && data.horarios.length > 0) {
      validarHorarios(data.horarios);
      data = { ...data, ...derivarRango(data.horarios) };
    } else if (data.fechaInicio && data.fechaFin) {
      if (new Date(data.fechaFin) < new Date(data.fechaInicio)) {
        throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
      }
      data = { ...data, horarios: [{ fechaInicio: data.fechaInicio, fechaFin: data.fechaFin }] };
    } else {
      throw new Error('La actividad debe tener al menos un horario.');
    }

    const modalidad = data.modalidad ?? 'PRESENCIAL';
    if (modalidad === 'VIRTUAL') {
      const enlace = data.enlaceSesion?.trim();
      if (enlace) validarEnlace(enlace);
      data = { ...data, modalidad, enlaceSesion: enlace || null };
    } else {
      data = { ...data, modalidad: 'PRESENCIAL', enlaceSesion: null };
    }

    const normalized = data;
    return this.txManager.run((ctx) => ctx.actividadRepo.crear(normalized));
  }

  async actualizar(id: number, data: ActualizarActividadDTO): Promise<ActividadDTO> {
    let changes = { ...data };

    if (changes.horarios && changes.horarios.length > 0) {
      validarHorarios(changes.horarios);
      changes = { ...changes, ...derivarRango(changes.horarios) };
    } else if (changes.horarios && changes.horarios.length === 0) {
      throw new Error('La actividad debe conservar al menos un horario.');
    } else if (changes.fechaInicio && changes.fechaFin && new Date(changes.fechaFin) < new Date(changes.fechaInicio)) {
      throw new Error('La fecha de fin no puede ser anterior a la fecha de inicio.');
    }

    if (changes.modalidad === 'VIRTUAL') {
      if (changes.enlaceSesion !== undefined) {
        const enlace = changes.enlaceSesion?.trim() ?? '';
        if (enlace) validarEnlace(enlace);
        changes = { ...changes, enlaceSesion: enlace || null };
      }
    } else if (changes.modalidad === 'PRESENCIAL') {
      changes = { ...changes, enlaceSesion: null };
    }

    return this.txManager.run((ctx) => ctx.actividadRepo.actualizar(id, changes));
  }

  async obtenerTiposActividad(): Promise<TipoActividad[]> {
    return this.actividadRepo.obtenerTiposActividad();
  }
}
