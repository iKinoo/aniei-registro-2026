import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IStorageService } from '@/application/ports/IStorageService';
import { IEmailService } from '@/application/ports/IEmailService';
import type { TransactionContext, ITransactionManager } from '@/application/ports/ITransactionManager';
import { RegistrarGrupoRapidoDTO } from '@/application/dtos/RegistrarGrupoRapidoDTO';
import { ResultadoRegistroGrupo } from '@/application/dtos/ResultadoRegistroGrupo';
import { Deposito } from '@/core/entities/Deposito';
import { Monto } from '@/core/value-objects/Monto';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import type { IPasswordHasher } from '@/application/ports/IPasswordHasher';
import type { IIdGenerator } from '@/application/ports/IIdGenerator';
import type { IPasswordGenerator } from '@/application/ports/IPasswordGenerator';

export class RegistrarGrupoRapido {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly storageService: IStorageService,
    private readonly emailService: IEmailService,
    private readonly passwordHasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
    private readonly passwordGenerator: IPasswordGenerator,
    private readonly txManager: ITransactionManager,
  ) {}

  async execute(dto: RegistrarGrupoRapidoDTO): Promise<ResultadoRegistroGrupo> {
    const responsable = await this.usuarioRepo.buscarPorId(dto.responsableId);
    if (!responsable) {
      throw new Error(`Responsable con ID ${dto.responsableId} no encontrado`);
    }

    ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio);

    const miembrosMapeados = await Promise.all(
      dto.miembros.map(async (miembro) => {
        const passwordPlana = this.passwordGenerator.generar();

        return {
          passwordPlana,
          nombre: miembro.nombre,
          apellido: miembro.apellido,
          correo: miembro.correo,
          passwordHash: await this.passwordHasher.hash(passwordPlana),
          idTipoParticipante: responsable.idTipoParticipante ?? 0,
        };
      })
    );

    const monto = Monto.create(dto.deposito.monto);
    const token = this.idGenerator.uuid();
    const ext = dto.archivo.nombre.split('.').pop() || 'bin';
    const archivoRuta = `comprobantes_grupo/${token}.${ext}`;
    const urlComprobante = await this.storageService.subir(archivoRuta, dto.archivo.buffer, dto.archivo.mime);

    const depositoBase = {
      bancoSucursal: dto.deposito.bancoSucursal ?? null,
      ciudad: dto.deposito.ciudad ?? null,
      referencia: dto.deposito.referencia,
      monto,
      fechaDeposito: dto.deposito.fechaDeposito,
      archivoUrl: urlComprobante,
      archivoNombre: dto.archivo.nombre,
      archivoMime: dto.archivo.mime,
      archivoTamanio: dto.archivo.tamanio,
      proposito: 'GRUPO_RAPIDO' as const,
      notas: dto.deposito.notas ?? null,
    };

    let folios: string[] = [];
    let usuariosIds: string[] = [];

    const doTx = async (ctx: TransactionContext) => {
      const dRepo = ctx.depositoRepo;
      const uRepo = ctx.usuarioRepo;

      const deposito = Deposito.create({
        folioRegistro: dto.responsableId,
        ...depositoBase,
      });
      await dRepo.crear(deposito);

      const res = await uRepo.crearGrupo({
        token,
        responsableId: dto.responsableId,
        institucionId: responsable.idInstitucion,
        dependenciaId: responsable.dependencia || '',
        estadoId: responsable.idEntidadFederativa,
        miembros: miembrosMapeados.map(m => ({ nombre: m.nombre, apellido: m.apellido, correo: m.correo,
          passwordHash: m.passwordHash, idTipoParticipante: m.idTipoParticipante })),
      });
      folios = res.folios;
      usuariosIds = res.usuariosIds;
    };

    try {
      await this.txManager.run(doTx);
    } catch (e: unknown) {
      try { await this.storageService.eliminar(archivoRuta); } catch (cleanupError) { console.error('Error al compensar comprobante:', cleanupError); }
      throw e;
    }

    const fechaStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
    for (let i = 0; i < dto.miembros.length; i++) {
      const miembro = dto.miembros[i];
      try {
        await this.emailService.enviarConfirmacionRegistro(miembro.correo, {
          nombre: miembro.nombre,
          apellido: miembro.apellido,
          folio: folios[i],
          institucion: responsable.idInstitucion?.toString() ?? 'N/A',
          fecha: fechaStr,
          password: miembrosMapeados[i].passwordPlana,
        });
      } catch (e) {
        console.error(`Error al enviar correo a miembro ${miembro.correo}:`, e);
      }
    }

    try {
      await this.emailService.enviarConfirmacionGrupoRapido(
        responsable.correo.toString(),
        {
          nombreResponsable: responsable.nombre,
          apellidoResponsable: responsable.apellido,
          token,
          totalMiembros: dto.miembros.length,
        },
      );
    } catch (error) { console.error('Error al enviar confirmación de grupo:', error); }

    return {
      success: true,
      totalRegistrados: usuariosIds.length,
      folios,
    };
  }
}
