import type { IPonentesRepository } from '../ports/IPonentesRepository';
import type { IActividadRepository } from '../ports/IActividadRepository';
import type { ITransactionManager } from '../ports/ITransactionManager';
import type { IPasswordHasher } from '../ports/IPasswordHasher';
import type { IPasswordGenerator } from '../ports/IPasswordGenerator';
import type { IEmailService } from '../ports/IEmailService';
import type { RegistroPonenteDTO } from '../dtos/ActualizarUsuarioDTO';
import { Usuario } from '@/core/entities/Usuario';
import { Email } from '@/core/value-objects/Email';
import { Genero } from '@/core/enums/Genero';

export class GestionarPonentes {
  constructor(private readonly repo: IPonentesRepository) {}
  vincular(id: number, folio: string, rol: string) { return this.repo.vincular(id, folio, rol || 'Ponente'); }
  desvincular(id: number, folio: string) { return this.repo.desvincular(id, folio); }
  obtenerPorActividad(id: number) { return this.repo.obtenerPorActividad(id); }
}

export class RegistrarPonente {
  constructor(private readonly tx: ITransactionManager, private readonly actividades: IActividadRepository,
    private readonly hasher: IPasswordHasher, private readonly passwords: IPasswordGenerator,
    private readonly email: IEmailService) {}

  async execute(datos: RegistroPonenteDTO, idActividad: number, rol: string): Promise<string> {
    const actividad = idActividad > 0 ? await this.actividades.obtenerPorId(idActividad) : null;
    if (idActividad > 0 && !actividad) throw new Error('Actividad no encontrada');
    const usuario = Usuario.create({
      nombre: datos.nombre, apellido: datos.apellido, correo: Email.create(datos.correo), telefono: null,
      genero: Genero.OTRO, carrera: null, dependencia: null, idTitulo: datos.idTitulo ?? 0,
      idTipoParticipante: datos.idTipoParticipante ?? 0, idInstitucion: datos.idInstitucion ?? null, idEntidadFederativa: 0,
    });
    const password = this.passwords.generar();
    const hash = await this.hasher.hash(password);
    const folio = await this.tx.run(async ctx => {
      const creado = await ctx.usuarioRepo.crear(usuario);
      const folio = creado.folioRegistro!;
      await ctx.accesoRepo.crear(hash, 'USER', folio, `${datos.nombre} ${datos.apellido}`, datos.correo);
      if (actividad) await ctx.ponentesRepo.vincular(idActividad, folio, rol || 'Ponente');
      return folio;
    });
    try {
      await this.email.enviarNotificacionPonente(datos.correo, { nombre: datos.nombre, apellido: datos.apellido,
        folio, password, nombreActividad: actividad?.nombre ?? '', rol: rol || 'Ponente' });
    } catch (error) { console.error('Error al enviar correo de ponente:', error); }
    return folio;
  }
}
