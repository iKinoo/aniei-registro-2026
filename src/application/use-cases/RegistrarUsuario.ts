import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IAccesoRepository } from '@/application/ports/IAccesoRepository';
import { IDepositoRepository } from '@/application/ports/IDepositoRepository';
import { IFacturacionRepository } from '@/application/ports/IFacturacionRepository';
import { IStorageService } from '@/application/ports/IStorageService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IPdfService } from '@/application/ports/IPdfService';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';
import { IInscripcionActividadRepository } from '@/application/ports/IInscripcionActividadRepository';
import type { ITransactionManager } from '@/application/ports/ITransactionManager';
import { RegistroUsuarioDTO } from '@/application/dtos/RegistroUsuarioDTO';
import { ResultadoRegistro } from '@/application/dtos/ResultadoRegistro';
import { Usuario } from '@/core/entities/Usuario';
import { Deposito } from '@/core/entities/Deposito';
import { Facturacion } from '@/core/entities/Facturacion';
import { Monto } from '@/core/value-objects/Monto';
import { Email } from '@/core/value-objects/Email';
import { Telefono } from '@/core/value-objects/Telefono';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import { RegistroError } from '@/core/errors/RegistroError';
import type { IPasswordHasher } from '@/application/ports/IPasswordHasher';
import type { IIdGenerator } from '@/application/ports/IIdGenerator';
import { BcryptPasswordHasher } from '@/infrastructure/services/auth/BcryptPasswordHasher';
import { generateSecurePassword } from '@/shared/security/password';
import { mapPrismaError } from '@/infrastructure/errors/prismaErrorMapper';

export class RegistrarUsuario {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly depositoRepo: IDepositoRepository,
    private readonly facturacionRepo: IFacturacionRepository,
    private readonly storageService: IStorageService,
    private readonly emailService: IEmailService,
    private readonly pdfService: IPdfService,
    private readonly catalogoRepo: ICatalogoRepository,
    private readonly accesoRepo: IAccesoRepository,
    private readonly inscripcionRepo?: IInscripcionActividadRepository,
    private readonly passwordHasher: IPasswordHasher = new BcryptPasswordHasher(),
    private readonly idGenerator: IIdGenerator = { uuid: () => crypto.randomUUID() },
    private readonly txManager?: ITransactionManager,
  ) {}

  async execute(dto: RegistroUsuarioDTO): Promise<ResultadoRegistro> {
    const tStart = Date.now();
    const phase = (label: string, t: number) => { console.log(`[RegistrarUsuario] ${label} ${Date.now()-t}ms`); return Date.now(); };
    let t = tStart;
    // 1. Verificar correo duplicado (optimista, también capturado por P2002)
    const correo = Email.create(dto.correo);
    const existente = await this.usuarioRepo.buscarPorCorreo(correo);
    t = phase('buscarPorCorreo', t);
    if (existente) {
      throw RegistroError.CORREO_DUPLICADO(dto.correo);
    }

    // 2. Validar archivo comprobante
    ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio);

    // 3. Subir comprobante a storage (side-effect compensable)
    const ext = dto.archivo.nombre.split('.').pop() || 'bin';
    const archivoRuta = `comprobantes/${this.idGenerator.uuid()}.${ext}`;
    const urlComprobante = await this.storageService.subir(archivoRuta, dto.archivo.buffer, dto.archivo.mime);
    t = phase('storage.subir comprobante', t);

    // Preparar entidades previas a tx
    const usuario = Usuario.create({
      nombre: dto.nombre,
      apellido: dto.apellido,
      correo,
      telefono: dto.telefono ? Telefono.create(dto.telefono, dto.lada, dto.extension) : null,
      genero: dto.genero,
      carrera: dto.carrera,
      dependencia: dto.dependencia,
      idTitulo: dto.idTitulo,
      idInstitucion: dto.idInstitucion,
      idEntidadFederativa: dto.idEntidadFederativa,
    });

    const generatedPassword = generateSecurePassword(12, false);
    const passwordHash = await this.passwordHasher.hash(generatedPassword);

    const deposito = Deposito.create({
      folioRegistro: '__PENDING__', // placeholder, reemplazado tras crear usuario
      bancoSucursal: dto.deposito.bancoSucursal ?? null,
      ciudad: dto.deposito.ciudad ?? null,
      referencia: dto.deposito.referencia,
      monto: Monto.create(dto.deposito.monto),
      fechaDeposito: dto.deposito.fechaDeposito,
      archivoUrl: urlComprobante,
      archivoNombre: dto.archivo.nombre,
      archivoMime: dto.archivo.mime,
      archivoTamanio: dto.archivo.tamanio,
      notas: dto.deposito.notas ?? null,
    });

    let folioRegistro: string;
    const doTx = async (ctx?: any) => {
      const uRepo = ctx?.usuarioRepo ?? this.usuarioRepo;
      const aRepo = ctx?.accesoRepo ?? this.accesoRepo;
      const dRepo = ctx?.depositoRepo ?? this.depositoRepo;
      const fRepo = ctx?.facturacionRepo ?? this.facturacionRepo;
      const iRepo = ctx?.inscripcionRepo ?? this.inscripcionRepo;

      const usuarioPersistido = await uRepo.crear(usuario);
      folioRegistro = usuarioPersistido.folioRegistro!;

      await aRepo.crear(dto.correo, passwordHash, 'USER', folioRegistro, `${dto.nombre} ${dto.apellido}`);

      // Deposito con folio real
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
        });
        await fRepo.crear(facturacion);
      }

      if (dto.actividadesIds && dto.actividadesIds.length > 0 && iRepo) {
        await iRepo.crearMuchasConValidacion(folioRegistro, dto.actividadesIds);
      }
    };

    try {
      if (this.txManager) {
        await this.txManager.run(async (ctx) => { await doTx(ctx); });
      } else {
        // Fallback: si no hay txManager, ejecutar directo pero con manejo de P2002
        // Intenta usar prisma.$transaction si está disponible vía repos
        const { prisma } = await import('@/infrastructure/database/client');
        await (prisma as any).$transaction(async (tx: any) => {
          const { PrismaUsuarioRepository } = await import('@/infrastructure/repositories/PrismaUsuarioRepository');
          const { PrismaAccesoRepository } = await import('@/infrastructure/repositories/PrismaAccesoRepository');
          const { PrismaDepositoRepository } = await import('@/infrastructure/repositories/PrismaDepositoRepository');
          const { PrismaFacturacionRepository } = await import('@/infrastructure/repositories/PrismaFacturacionRepository');
          const { PrismaInscripcionActividadRepository } = await import('@/infrastructure/repositories/PrismaInscripcionActividadRepository');
          const ctx = {
            usuarioRepo: new PrismaUsuarioRepository(tx),
            accesoRepo: new PrismaAccesoRepository(tx),
            depositoRepo: new PrismaDepositoRepository(tx),
            facturacionRepo: new PrismaFacturacionRepository(tx),
            inscripcionRepo: this.inscripcionRepo ? new PrismaInscripcionActividadRepository(tx) : undefined,
          };
          await doTx(ctx);
        });
      }
    } catch (e: unknown) {
      // Compensar archivo subido
      try { await this.storageService.eliminar(archivoRuta); } catch {}
      const mapped = mapPrismaError(e, dto.correo);
      if (mapped) throw mapped;
      throw e;
    }
    t = phase('db transaction', t);

    const folio = folioRegistro!;

    // 9. Obtener datos de catálogos para el PDF y correo
    const [instituciones, titulos] = await Promise.all([
      this.catalogoRepo.obtenerInstituciones(),
      this.catalogoRepo.obtenerTitulos(),
    ]);
    t = phase('catalogos', t);
    const institucion = instituciones.find((i) => i.idInstitucion === dto.idInstitucion);
    const titulo = titulos.find((t) => t.idTitulo === dto.idTitulo);
    const fechaStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

    // 10. Generar constancia PDF
    const pdfBuffer = await this.pdfService.generarConstanciaInscripcion({
      nombre: dto.nombre,
      apellido: dto.apellido,
      folio,
      institucion: institucion?.nombre ?? 'N/A',
      tipoUsuario: titulo?.descripcion ?? 'N/A',
      fecha: fechaStr,
    });
    t = phase('pdf generarConstancia', t);

    // 11. Subir constancia a storage (si falla, no revierte registro; se regenera en CPanel)
    let urlConstancia = '';
    try {
      const constanciaRuta = `constancias/${folio}.pdf`;
      urlConstancia = await this.storageService.subir(constanciaRuta, pdfBuffer, 'application/pdf');
      t = phase('storage.subir constancia', t);
    } catch (e) {
      console.error('Error al subir constancia, se regenerará en CPanel:', e);
      urlConstancia = `constancias/${folio}.pdf`;
    }

    // 12. Enviar correo de confirmación (best-effort, no revierte)
    try {
      await this.emailService.enviarConfirmacionRegistro(dto.correo, {
        nombre: dto.nombre,
        apellido: dto.apellido,
        folio,
        institucion: institucion?.nombre ?? 'N/A',
        fecha: fechaStr,
        password: generatedPassword,
      });
      t = phase('email enviarConfirmacion', t);
      console.log(`[RegistrarUsuario] total ${Date.now()-tStart}ms folio=${folio}`);
    } catch (e) {
      console.error('Error al enviar correo confirmación:', e);
      // No lanza; el admin puede reenviar desde CPanel
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
