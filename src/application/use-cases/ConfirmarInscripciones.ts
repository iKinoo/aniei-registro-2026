import type { IActividadRepository } from '../ports/IActividadRepository';
import type { IUsuarioRepository } from '../ports/IUsuarioRepository';
import type { ITransactionManager } from '../ports/ITransactionManager';
import type { IStorageService } from '../ports/IStorageService';
import type { IEmailService } from '../ports/IEmailService';
import type { IIdGenerator } from '../ports/IIdGenerator';
import type { CheckoutDTO, ConfirmacionInscripcionResult } from '../dtos/CheckoutDTO';
import { Deposito } from '@/core/entities/Deposito';
import { Facturacion } from '@/core/entities/Facturacion';
import { Monto } from '@/core/value-objects/Monto';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import { RegistroError } from '@/core/errors/RegistroError';

export class ConfirmarInscripciones {
  constructor(private readonly actividades: IActividadRepository, private readonly usuarios: IUsuarioRepository,
    private readonly tx: ITransactionManager, private readonly storage: IStorageService,
    private readonly email: IEmailService, private readonly ids: IIdGenerator) {}

  async execute(folio: string, dto: CheckoutDTO): Promise<ConfirmacionInscripcionResult> {
    const ids = [...new Set(dto.idsActividades)].sort((a, b) => a - b);
    if (!ids.length || ids.some(id => !Number.isSafeInteger(id) || id <= 0)) {
      throw RegistroError.DATOS_INVALIDOS('Seleccione actividades válidas');
    }
    const usuario = await this.usuarios.buscarPorId(folio);
    if (!usuario) throw RegistroError.DATOS_INVALIDOS('Usuario no encontrado');
    const rows = await Promise.all(ids.map(id => this.actividades.obtenerPorId(id)));
    if (rows.some(a => !a)) throw RegistroError.DATOS_INVALIDOS('Actividad no encontrada');
    const actividades = rows.filter(a => a !== null).sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
    const total = actividades.reduce((sum, a) => sum + a.costo, 0);
    if (total > 0 && (!dto.deposito || !dto.archivo)) {
      throw RegistroError.DATOS_INVALIDOS('El comprobante y el depósito son requeridos');
    }
    const facturacion = dto.facturacion ? Facturacion.create({ folioRegistro: folio,
      razonSocial: dto.facturacion.razonSocial, rfc: dto.facturacion.rfc,
      calle: dto.facturacion.calle ?? null, numExterior: dto.facturacion.numExterior ?? null,
      numInterior: dto.facturacion.numInterior ?? null, colonia: dto.facturacion.colonia ?? null,
      municipio: dto.facturacion.municipio ?? null, codigoPostal: dto.facturacion.codigoPostal ?? null,
      idEntidadFederativaRfc: dto.facturacion.idEntidadFederativaRfc ?? null,
    }) : null;
    let ruta: string | null = null;
    let deposito: Deposito | null = null;
    try {
      if (total > 0 && dto.deposito && dto.archivo) {
        ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio);
        const monto = Monto.create(dto.deposito.monto);
        ruta = `comprobantes-actividades/${this.ids.uuid()}.${dto.archivo.nombre.split('.').pop() || 'bin'}`;
        const referencia = await this.storage.subir(ruta, dto.archivo.buffer, dto.archivo.mime);
        deposito = Deposito.create({ folioRegistro: folio, ...dto.deposito, monto,
          bancoSucursal: dto.deposito.bancoSucursal ?? null, ciudad: dto.deposito.ciudad ?? null,
          archivoUrl: referencia, archivoNombre: dto.archivo.nombre, archivoMime: dto.archivo.mime,
          archivoTamanio: dto.archivo.tamanio, proposito: 'ACTIVIDADES', notas: dto.deposito.notas ?? null,
        });
      }
      await this.tx.run(async ctx => {
        const existentes = await ctx.inscripcionRepo.obtenerIdsPorUsuario(folio);
        if (ids.some(id => existentes.includes(id))) {
          throw RegistroError.DATOS_INVALIDOS('Ya existe una inscripción en alguna actividad seleccionada');
        }
        const { ok, sinCupo } = await ctx.inscripcionRepo.crearMuchasConValidacion(folio, ids);
        if (sinCupo.length || ok.length !== ids.length) {
          const nombres = actividades.filter(a => sinCupo.includes(a.idActividad)).map(a => a.nombre).join(', ');
          throw new RegistroError(`Sin cupo disponible en: ${nombres}. Por favor ajusta tu selección.`, 'SIN_CUPO');
        }
        if (deposito) await ctx.depositoRepo.crear(deposito);
        if (facturacion) await ctx.facturacionRepo.crear(facturacion);
      });
    } catch (error) {
      if (ruta) {
        try { await this.storage.eliminar(ruta); }
        catch (cleanupError) { console.error('Error al compensar comprobante:', cleanupError); }
      }
      throw error;
    }
    const datos = actividades.map(a => ({ nombre: a.nombre,
      fecha: new Date(a.fechaInicio).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
      costo: a.costo > 0 ? `$${a.costo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : null,
    }));
    const totalCosto = total > 0 ? `$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : null;
    try {
      await this.email.enviarConfirmacionActividades(usuario.correo.toString(), {
        nombre: usuario.nombre, apellido: usuario.apellido, folio, actividades: datos, totalCosto,
        fecha: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
      });
    } catch (error) { console.error('Error al enviar confirmación de actividades:', error); }
    return { success: true, nombre: usuario.nombre, folio, correo: usuario.correo.toString(), actividades: datos, totalCosto };
  }
}
