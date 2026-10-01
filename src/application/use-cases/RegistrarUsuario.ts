import { IStorageService } from '@/application/ports/IStorageService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IPdfService } from '@/application/ports/IPdfService';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';
import type { TransactionContext, ITransactionManager } from '@/application/ports/ITransactionManager';
import { RegistroUsuarioDTO } from '@/application/dtos/RegistroUsuarioDTO';
import { ResultadoRegistro } from '@/application/dtos/ResultadoRegistro';
import { Usuario } from '@/core/entities/Usuario';
import { Deposito } from '@/core/entities/Deposito';
import { Facturacion } from '@/core/entities/Facturacion';
import { Monto } from '@/core/value-objects/Monto';
import { Email } from '@/core/value-objects/Email';
import { Telefono } from '@/core/value-objects/Telefono';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import type { IPasswordHasher } from '@/application/ports/IPasswordHasher';
import type { IIdGenerator } from '@/application/ports/IIdGenerator';
import type { IPasswordGenerator } from '@/application/ports/IPasswordGenerator';

export class RegistrarUsuario {
  constructor(
    private readonly storageService: IStorageService,
    private readonly emailService: IEmailService,
    private readonly pdfService: IPdfService,
    private readonly catalogoRepo: ICatalogoRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly idGenerator: IIdGenerator,
    private readonly passwordGenerator: IPasswordGenerator,
    private readonly txManager: ITransactionManager,
  ) {}

  async execute(dto: RegistroUsuarioDTO): Promise<ResultadoRegistro> {
    ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio);

    const correo = Email.create(dto.correo);
    const usuario = Usuario.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo,
      telefono: dto.telefono ? Telefono.create(dto.telefono, dto.lada, dto.extension) : null,
      genero: dto.genero,
      carrera: dto.carrera,
      dependencia: dto.dependencia,
      idTitulo: dto.idTitulo,
      idTipoParticipante: dto.idTipoParticipante,
      idInstitucion: dto.idInstitucion,
      institucionExterna: dto.institucionExterna,
      idEntidadFederativa: dto.idEntidadFederativa,
    });

    const generatedPassword = this.passwordGenerator.generar();
    const passwordHash = await this.passwordHasher.hash(generatedPassword);

    const monto = Monto.create(dto.deposito.monto);
    const [instituciones, titulos] = await Promise.all([
      this.catalogoRepo.obtenerInstituciones(),
      this.catalogoRepo.obtenerTitulos(),
    ]);
    const institucion = instituciones.find((i) => i.idInstitucion === dto.idInstitucion);
    const titulo = titulos.find((t) => t.idTitulo === dto.idTitulo);
    const ext = dto.archivo.nombre.split('.').pop() || 'bin';
    const archivoRuta = `comprobantes/${this.idGenerator.uuid()}.${ext}`;
    let constanciaRuta: string | null = null;
    let urlConstanciaFiscal: string | null = null;
    let folioRegistro: string;
    try {
      const urlComprobante = await this.storageService.subir(archivoRuta, dto.archivo.buffer, dto.archivo.mime);

      if (dto.facturacion?.archivoConstancia) {
        const constanciaExt = dto.facturacion.archivoConstancia.nombre.split('.').pop() || 'bin';
        constanciaRuta = `comprobantes/constancias/${this.idGenerator.uuid()}.${constanciaExt}`;
        urlConstanciaFiscal = await this.storageService.subir(constanciaRuta, dto.facturacion.archivoConstancia.buffer, dto.facturacion.archivoConstancia.mime);
      }

      const deposito = Deposito.create({
        folioRegistro: '__PENDING__',
        bancoSucursal: dto.deposito.bancoSucursal ?? null,
        ciudad: dto.deposito.ciudad ?? null,
        referencia: dto.deposito.referencia,
        monto,
        fechaDeposito: dto.deposito.fechaDeposito,
        archivoUrl: urlComprobante,
        archivoNombre: dto.archivo.nombre,
        archivoMime: dto.archivo.mime,
        archivoTamanio: dto.archivo.tamanio,
        notas: dto.deposito.notas ?? null,
      });

      const doTx = async (ctx: TransactionContext) => {
        const uRepo = ctx.usuarioRepo;
        const aRepo = ctx.accesoRepo;
        const dRepo = ctx.depositoRepo;
        const fRepo = ctx.facturacionRepo;
        const iRepo = ctx.inscripcionRepo;

        const usuarioPersistido = await uRepo.crear(usuario);
        folioRegistro = usuarioPersistido.folioRegistro!;

        await aRepo.crear(passwordHash, 'USER', folioRegistro, `${dto.nombre} ${dto.apellido}`, dto.correo);

        const depositoReal = Deposito.create({
          folioRegistro,
          bancoSucursal: deposito.bancoSucursal,
          ciudad: deposito.ciudad,
          referencia: deposito.referencia,
          monto: deposito.monto,
          fechaDeposito: deposito.fechaDeposito,
          archivoUrl: deposito.archivoUrl,
          archivoNombre: dto.archivo.nombre,
          archivoMime: dto.archivo.mime,
          archivoTamanio: dto.archivo.tamanio,
          notas: dto.deposito.notas ?? null,
        });
        await dRepo.crear(depositoReal);

        if (dto.facturacion) {
          const facturacion = Facturacion.create({
            folioRegistro,
            razonSocial: dto.facturacion.razonSocial,
            rfc: dto.facturacion.rfc,
            calle: dto.facturacion.calle ?? null,
            numExterior: dto.facturacion.numExterior ?? null,
            numInterior: dto.facturacion.numInterior ?? null,
            colonia: dto.facturacion.colonia ?? null,
            municipio: dto.facturacion.municipio ?? null,
            codigoPostal: dto.facturacion.codigoPostal ?? null,
            idEntidadFederativaRfc: dto.facturacion.idEntidadFederativaRfc ?? null,
            constanciaUrl: urlConstanciaFiscal,
            constanciaNombre: dto.facturacion.archivoConstancia?.nombre ?? null,
            constanciaMime: dto.facturacion.archivoConstancia?.mime ?? null,
            constanciaTamanio: dto.facturacion.archivoConstancia?.tamanio ?? null,
          });
          await fRepo.crear(facturacion);
        }

        if (dto.actividadesIds && dto.actividadesIds.length > 0) {
          await iRepo.crearMuchasConValidacion(folioRegistro, dto.actividadesIds);
        }
      };

      await this.txManager.run(doTx);
    } catch (e: unknown) {
      try { await this.storageService.eliminar(archivoRuta); } catch (cleanupError) { console.error('Error al compensar comprobante:', cleanupError); }
      if (constanciaRuta) {
        try { await this.storageService.eliminar(constanciaRuta); } catch (cleanupError) { console.error('Error al compensar constancia fiscal:', cleanupError); }
      }
      throw e;
    }

    const folio = folioRegistro!;

    const fechaStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    let urlConstancia = `constancias/${folio}.pdf`;
    try {
      const pdfUint8Array = await this.pdfService.generarConstanciaInscripcion({
        nombre: dto.nombre,
        apellido: dto.apellido,
        folio,
        institucion: institucion?.nombre ?? 'N/A',
        tipoUsuario: titulo?.descripcion ?? 'N/A',
        fecha: fechaStr,
      });

      const constanciaRuta = `constancias/${folio}.pdf`;
      urlConstancia = await this.storageService.subir(constanciaRuta, pdfUint8Array, 'application/pdf');
    } catch (error) {
      console.error('Error al generar o subir constancia, se regenerará en CPanel:', error);
    }

    try {
      await this.emailService.enviarConfirmacionRegistro(dto.correo, {
        nombre: dto.nombre,
        apellido: dto.apellido,
        folio,
        institucion: institucion?.nombre ?? 'N/A',
        fecha: fechaStr,
        password: generatedPassword,
      });
    } catch (e) {
      console.error('Error al enviar correo confirmación:', e);
    }

    return {
      success: true,
      folio,
      urlConstancia,
      correo: dto.correo,
      passwordPlana: generatedPassword,
    };
  }
}
