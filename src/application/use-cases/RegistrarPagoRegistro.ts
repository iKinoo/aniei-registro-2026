import type { IRegistroQueryService } from '../ports/IRegistroQueryService';
import type { IPrecioInscripcionRepository } from '../ports/IPrecioInscripcionRepository';
import type { IDepositoRepository } from '../ports/IDepositoRepository';
import type { IStorageService } from '../ports/IStorageService';
import type { ITransactionManager } from '../ports/ITransactionManager';
import type { IIdGenerator } from '../ports/IIdGenerator';
import type { RegistrarPagoRegistroDTO } from '../dtos/RegistrarPagoRegistroDTO';
import { Deposito } from '@/core/entities/Deposito';
import { Monto } from '@/core/value-objects/Monto';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import { RegistroError } from '@/core/errors/RegistroError';
import { datosRegistroCompletos } from '../services/EstadoRegistroPerfil';

export class RegistrarPagoRegistro {
  constructor(
    private readonly registros: IRegistroQueryService,
    private readonly depositos: IDepositoRepository,
    private readonly precios: IPrecioInscripcionRepository,
    private readonly storage: IStorageService,
    private readonly tx: ITransactionManager,
    private readonly ids: IIdGenerator,
  ) {}

  async execute(folio: string, dto: RegistrarPagoRegistroDTO): Promise<{ monto: number }> {
    const usuario = await this.registros.obtenerUsuario(folio);
    if (!usuario) {
      throw RegistroError.INSCRIPCION_INEXISTENTE();
    }
    if (usuario.idGrupoRegistro !== null) {
      throw new RegistroError('El pago ya está cubierto por el registro grupal', 'PAGO_CUBIERTO');
    }
    if (!datosRegistroCompletos(usuario)) {
      throw new RegistroError('Complete sus datos de registro antes de registrar el pago', 'DATOS_INCOMPLETOS');
    }

    const existentes = await this.depositos.buscarTodosPorUsuario(folio);
    if (existentes.some((deposito) => deposito.proposito === 'EVENTO_PRINCIPAL')) {
      throw new RegistroError('Ya existe un pago de inscripción registrado', 'PAGO_EXISTENTE');
    }

    if (!usuario.idTipoParticipante) {
      throw new RegistroError('No se pudo determinar el tipo de participante', 'DATOS_INCOMPLETOS');
    }

    const precio = await this.precios.obtenerVigente(usuario.idTipoParticipante, usuario.idInstitucion !== null);
    if (!precio) {
      throw new RegistroError('No hay un precio vigente configurado para su registro', 'PRECIO_NO_DISPONIBLE');
    }
    if (precio.costo <= 0) {
      throw new RegistroError('Su registro no requiere pago', 'SIN_COSTO');
    }

    ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio);

    const monto = Monto.create(precio.costo);
    const extension = dto.archivo.nombre.split('.').pop() || 'bin';
    const archivoRuta = `comprobantes/${this.ids.uuid()}.${extension}`;
    const urlComprobante = await this.storage.subir(archivoRuta, dto.archivo.buffer, dto.archivo.mime);

    const deposito = Deposito.create({
      folioRegistro: folio,
      bancoSucursal: dto.bancoSucursal ?? null,
      ciudad: dto.ciudad ?? null,
      referencia: dto.referencia,
      monto,
      fechaDeposito: dto.fechaDeposito,
      archivoUrl: urlComprobante,
      archivoNombre: dto.archivo.nombre,
      archivoMime: dto.archivo.mime,
      archivoTamanio: dto.archivo.tamanio,
      proposito: 'EVENTO_PRINCIPAL',
      notas: dto.notas ?? null,
    });

    try {
      await this.tx.run(async (ctx) => {
        const pagos = await ctx.depositoRepo.buscarTodosPorUsuario(folio);
        if (pagos.some((pago) => pago.proposito === 'EVENTO_PRINCIPAL')) {
          throw new RegistroError('Ya existe un pago de inscripción registrado', 'PAGO_EXISTENTE');
        }
        await ctx.depositoRepo.crear(deposito);
      });
    } catch (error) {
      try {
        await this.storage.eliminar(archivoRuta);
      } catch (cleanupError) {
        console.error('Error al compensar comprobante:', cleanupError);
      }
      throw error;
    }

    return { monto: precio.costo };
  }
}
