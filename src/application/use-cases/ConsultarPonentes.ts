import type { IPonentesRepository } from '../ports/IPonentesRepository';
import type { PonenteResumenDTO } from '../dtos/ActividadDTO';

export class ConsultarPonentes {
  constructor(private readonly ponentes: IPonentesRepository) {}

  async ejecutar(): Promise<PonenteResumenDTO[]> {
    const vinculos = await this.ponentes.obtenerTodos();
    const porFolio = new Map<string, PonenteResumenDTO>();
    for (const v of vinculos) {
      let ponente = porFolio.get(v.folioRegistro);
      if (!ponente) {
        ponente = {
          folioRegistro: v.folioRegistro,
          nombre: v.nombre,
          apellido: v.apellido,
          correo: v.correo,
          actividades: [],
        };
        porFolio.set(v.folioRegistro, ponente);
      }
      ponente.actividades.push({ idActividad: v.idActividad, nombre: v.nombreActividad, rol: v.rol });
    }
    return Array.from(porFolio.values()).sort((a, b) =>
      `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`, 'es'),
    );
  }
}
