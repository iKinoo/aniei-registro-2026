import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IDepositoRepository } from '@/application/ports/IDepositoRepository';
import { IStorageService } from '@/application/ports/IStorageService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IPdfService } from '@/application/ports/IPdfService';
import type { ITransactionManager } from '@/application/ports/ITransactionManager';
import { RegistrarGrupoRapidoDTO } from '@/application/dtos/RegistrarGrupoRapidoDTO';
import { ResultadoRegistroGrupo } from '@/application/dtos/ResultadoRegistroGrupo';
import { Deposito } from '@/core/entities/Deposito';
import { Monto } from '@/core/value-objects/Monto';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import type { IPasswordHasher } from '@/application/ports/IPasswordHasher';
import type { IIdGenerator } from '@/application/ports/IIdGenerator';
import { BcryptPasswordHasher } from '@/infrastructure/services/auth/BcryptPasswordHasher';

export class RegistrarGrupoRapido {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly depositoRepo: IDepositoRepository,
    private readonly storageService: IStorageService,
    private readonly emailService: IEmailService,
    private readonly pdfService: IPdfService,
    private readonly passwordHasher: IPasswordHasher = new BcryptPasswordHasher(),
    private readonly idGenerator: IIdGenerator = { uuid: () => crypto.randomUUID() },
    private readonly txManager?: ITransactionManager,
  ) {}

  async execute(dto: RegistrarGrupoRapidoDTO): Promise<ResultadoRegistroGrupo> {
    const responsable = await this.usuarioRepo.buscarPorId(dto.responsableId);
    if (!responsable) {
      throw new Error(`Responsable con ID ${dto.responsableId} no encontrado`);
    }

    ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio);

    const token = this.idGenerator.uuid();
    const ext = dto.archivo.nombre.split('.').pop() || 'bin';
    const archivoRuta = `comprobantes_grupo/${token}.${ext}`;
    const urlComprobante = await this.storageService.subir(archivoRuta, dto.archivo.buffer, dto.archivo.mime);

    // Preparar deposito
    const depositoBase = {
      bancoSucursal: dto.deposito.bancoSucursal ?? null,
      ciudad: dto.deposito.ciudad ?? null,
      referencia: dto.deposito.referencia,
      monto: Monto.create(dto.deposito.monto),
      fechaDeposito: dto.deposito.fechaDeposito,
      archivoUrl: urlComprobante,
      archivoNombre: dto.archivo.nombre,
      archivoMime: dto.archivo.mime,
      archivoTamanio: dto.archivo.tamanio,
      proposito: 'GRUPO_RAPIDO' as const,
      notas: dto.deposito.notas ?? null,
    };

    const miembrosMapeados = await Promise.all(
      dto.miembros.map(async (miembro, i) => ({
        nombre: miembro.nombre,
        apellido: miembro.apellido,
        correoDummy: `grupo_${token}_${i}@temp.aniei.org`,
        passwordHash: await this.passwordHasher.hash(this.idGenerator.uuid()),
      }))
    );

    let folios: string[] = [];
    let usuariosIds: string[] = [];

    const doTx = async (ctx: any) => {
      const dRepo = ctx?.depositoRepo ?? this.depositoRepo;
      const uRepo = ctx?.usuarioRepo ?? this.usuarioRepo;

      // Crear depósito dentro de la transacción
      const deposito = Deposito.create({
        folioRegistro: dto.responsableId,
        ...depositoBase,
      });
      await dRepo.crear(deposito);

      const res = await uRepo.crearGrupoTransaccional({
        token,
        responsableId: dto.responsableId,
        institucionId: responsable.idInstitucion,
        dependenciaId: responsable.dependencia || '',
        estadoId: responsable.idEntidadFederativa,
        miembros: miembrosMapeados,
      });
      folios = res.folios;
      usuariosIds = res.usuariosIds;
    };

    try {
      if (this.txManager) {
        await this.txManager.run(async (ctx) => { await doTx(ctx); });
      } else {
        // Fallback: crear deposito + grupo en una sola $transaction usando prisma directo
        const { prisma } = await import('@/infrastructure/database/client');
        await (prisma as any).$transaction(async (tx: any) => {
          const { PrismaDepositoRepository } = await import('@/infrastructure/repositories/PrismaDepositoRepository');
          const { PrismaUsuarioRepository } = await import('@/infrastructure/repositories/PrismaUsuarioRepository');
          const ctx = {
            depositoRepo: new PrismaDepositoRepository(tx),
            usuarioRepo: new PrismaUsuarioRepository(tx),
          };
          await doTx(ctx);
        });
      }
    } catch (e: unknown) {
      // Compensar archivo
      try { await this.storageService.eliminar(archivoRuta); } catch {}
      throw e;
    }

    const nombres = dto.miembros.map((m) => `${m.nombre} ${m.apellido}`);
    const pdfBuffer = await this.pdfService.generarHojaRegistroGrupo({
      token,
      nombres,
      responsableNombre: `${responsable.nombre} ${responsable.apellido}`,
    });

    await this.emailService.enviarConfirmacionGrupoRapido(
      responsable.correo.toString(),
      {
        nombreResponsable: responsable.nombre,
        apellidoResponsable: responsable.apellido,
        token,
        totalMiembros: dto.miembros.length,
      },
      pdfBuffer
    );

    return {
      success: true,
      totalRegistrados: usuariosIds.length,
      folios,
    };
  }
}
