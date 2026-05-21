import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IAccesoRepository } from '@/application/ports/IAccesoRepository';
import bcrypt from 'bcryptjs';
import { IDepositoRepository } from '@/application/ports/IDepositoRepository';
import { IFacturacionRepository } from '@/application/ports/IFacturacionRepository';
import { IStorageService } from '@/application/ports/IStorageService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IPdfService } from '@/application/ports/IPdfService';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';
import { IInscripcionActividadRepository } from '@/application/ports/IInscripcionActividadRepository';
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
  ) {}

  async execute(dto: RegistroUsuarioDTO): Promise<ResultadoRegistro> {
    // 1. Verificar correo duplicado
    const correo = Email.create(dto.correo);
    const existente = await this.usuarioRepo.buscarPorCorreo(correo);
    if (existente) {
      throw RegistroError.CORREO_DUPLICADO(dto.correo);
    }

    // 2. Validar archivo comprobante
    ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio);

    // 3. Subir comprobante a storage
    const ext = dto.archivo.nombre.split('.').pop() || 'bin';
    const archivoRuta = `comprobantes/${crypto.randomUUID()}.${ext}`;
    const urlComprobante = await this.storageService.subir(archivoRuta, dto.archivo.buffer, dto.archivo.mime);

    // 4. Crear entidad Usuario
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

    // 5. Persistir usuario
    const usuarioPersistido = await this.usuarioRepo.crear(usuario);
    const folioRegistro = usuarioPersistido.folioRegistro!;

    // 5.5 Generar contraseña y crear perfil de acceso
    const generatedPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(generatedPassword, 10);
    await this.accesoRepo.crear(
      dto.correo,
      passwordHash,
      'USER',
      folioRegistro,
      `${dto.nombre} ${dto.apellido}`
    );

    // 6. Asignar folio (Ya generado por DB)
    const folio = folioRegistro;

    // 7. Crear registro de depósito con comprobante de archivo
    const deposito = Deposito.create({
      folioRegistro,
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
    await this.depositoRepo.crear(deposito);

    // 8. Guardar facturación si se proporcionó
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
      await this.facturacionRepo.crear(facturacion);
    }

    // 8.5 Inscribir a actividades seleccionadas (si las hay)
    if (dto.actividadesIds && dto.actividadesIds.length > 0 && this.inscripcionRepo) {
      await this.inscripcionRepo.crearMuchasConValidacion(folioRegistro, dto.actividadesIds);
    }

    // 9. Obtener datos de catálogos para el PDF y correo
    const [instituciones, titulos] = await Promise.all([
      this.catalogoRepo.obtenerInstituciones(),
      this.catalogoRepo.obtenerTitulos(),
    ]);
    const institucion = instituciones.find((i) => i.idInstitucion === dto.idInstitucion);
    const titulo = titulos.find((t) => t.idTitulo === dto.idTitulo);
    const fechaStr = new Date().toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // 9. Generar constancia PDF
    const pdfBuffer = await this.pdfService.generarConstanciaInscripcion({
      nombre: dto.nombre,
      apellido: dto.apellido,
      folio,
      institucion: institucion?.nombre ?? 'N/A',
      tipoUsuario: titulo?.descripcion ?? 'N/A',
      fecha: fechaStr,
    });

    // 10. Subir constancia a storage
    const constanciaRuta = `constancias/${folio}.pdf`;
    const urlConstancia = await this.storageService.subir(constanciaRuta, pdfBuffer, 'application/pdf');

    // 11. Enviar correo de confirmación
    await this.emailService.enviarConfirmacionRegistro(dto.correo, {
      nombre: dto.nombre,
      apellido: dto.apellido,
      folio,
      institucion: institucion?.nombre ?? 'N/A',
      fecha: fechaStr,
      password: generatedPassword,
    });

    // Nota: El envío de constancia ha sido delegado al administrador (CPanel) 
    // a través del caso de uso EnviarConfirmacion.

    return {
      success: true,
      folio,
      urlConstancia,
      correo: dto.correo,
      passwordPlana: generatedPassword,
    };
  }
}
