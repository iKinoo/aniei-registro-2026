import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IComprobantePagoRepository } from '@/application/ports/IComprobantePagoRepository';
import { IStorageService } from '@/application/ports/IStorageService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IPdfService } from '@/application/ports/IPdfService';
import { ICatalogoRepository } from '@/application/ports/ICatalogoRepository';
import { RegistroGrupoDTO } from '@/application/dtos/RegistroGrupoDTO';
import { ResultadoRegistroGrupo } from '@/application/dtos/ResultadoRegistroGrupo';
import { Usuario } from '@/core/entities/Usuario';
import { ComprobantePago } from '@/core/entities/ComprobantePago';
import { GrupoRegistro, MiembroInput } from '@/core/entities/GrupoRegistro';
import { Email } from '@/core/value-objects/Email';
import { Telefono } from '@/core/value-objects/Telefono';
import { FolioRecibo } from '@/core/value-objects/FolioRecibo';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import { GrupoRegistroError } from '@/core/errors/GrupoRegistroError';
import { Genero } from '@/core/enums/Genero';

export class RegistrarGrupo {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly comprobanteRepo: IComprobantePagoRepository,
    private readonly storageService: IStorageService,
    private readonly emailService: IEmailService,
    private readonly pdfService: IPdfService,
    private readonly catalogoRepo: ICatalogoRepository,
  ) {}

  async execute(dto: RegistroGrupoDTO): Promise<ResultadoRegistroGrupo> {
    const resp = dto.responsable;

    // 1. Verificar si el responsable ya está registrado
    const correoResponsable = Email.create(resp.correo);
    const responsableExistente = await this.usuarioRepo.buscarPorCorreo(correoResponsable);

    // 2. Verificar correos de miembros no estén ya registrados
    for (const miembro of dto.miembros) {
      const correoMiembro = Email.create(miembro.correo);
      const existente = await this.usuarioRepo.buscarPorCorreo(correoMiembro);
      if (existente) {
        throw GrupoRegistroError.MIEMBRO_CORREO_DUPLICADO(miembro.correo);
      }
    }

    // 3. Validar archivo comprobante
    ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio);

    // 4. Subir comprobante a storage
    const ext = dto.archivo.nombre.split('.').pop() || 'bin';
    const archivoRuta = `comprobantes/${crypto.randomUUID()}.${ext}`;
    const urlComprobante = await this.storageService.subir(archivoRuta, dto.archivo.buffer, dto.archivo.mime);

    // 5. Crear entidad responsable
    const responsableEntity = responsableExistente ?? Usuario.create({
      nombre: resp.nombre,
      apellido: resp.apellido,
      correo: correoResponsable,
      telefono: resp.telefono ? Telefono.create(resp.telefono, resp.lada, resp.extension) : null,
      genero: resp.genero,
      carrera: resp.carrera,
      dependencia: resp.dependencia,
      idCargo: resp.idCargo,
      idTipoUsuario: resp.idTipoUsuario,
      idInstitucion: resp.idInstitucion,
      idEntidadFederativa: resp.idEntidadFederativa,
    });

    // 6. Crear GrupoRegistro con herencia de campos
    const miembrosInput: MiembroInput[] = dto.miembros.map((m) => ({
      nombre: m.nombre,
      apellido: m.apellido,
      correo: m.correo,
      genero: m.genero as Genero,
      carrera: m.carrera,
      idTipoUsuario: m.idTipoUsuario,
    }));

    const grupo = GrupoRegistro.create(
      responsableEntity,
      miembrosInput,
      !!responsableExistente,
    );

    // 7. Persistir nuevos registros
    const nuevos = grupo.obtenerNuevosRegistros();
    const persistidos = await this.usuarioRepo.crearMuchos(nuevos);

    // 8. Generar folios
    const folios: string[] = [];
    for (const u of persistidos) {
      const folio = `ANIEI-2026-${String(u.idUsuario!).padStart(4, '0')}`;
      u.asignarFolio(FolioRecibo.create(folio));
      folios.push(folio);
    }

    // 9. Registrar comprobante grupal
    const idResponsable = responsableExistente?.idUsuario ?? persistidos[0].idUsuario!;
    const comprobante = ComprobantePago.create({
      idUsuario: idResponsable,
      archivoUrl: urlComprobante,
      archivoNombre: dto.archivo.nombre,
      archivoMime: dto.archivo.mime,
      archivoTamanio: dto.archivo.tamanio,
      esGrupal: true,
    });
    await this.comprobanteRepo.crear(comprobante);

    // 10. Obtener catálogos para PDFs y correos
    const [instituciones, tiposUsuario] = await Promise.all([
      this.catalogoRepo.obtenerInstituciones(),
      this.catalogoRepo.obtenerTiposUsuario(),
    ]);

    const fechaStr = new Date().toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // 11. Generar constancias y enviar correos a cada miembro persistido
    for (let i = 0; i < persistidos.length; i++) {
      const u = persistidos[i];
      const folio = folios[i];
      const institucion = instituciones.find((inst) => inst.idInstitucion === u.idInstitucion);
      const tipo = tiposUsuario.find((t) => t.idTipoUsuario === u.idTipoUsuario);

      const pdfBuffer = await this.pdfService.generarConstanciaInscripcion({
        nombre: u.nombre,
        apellido: u.apellido,
        folio,
        institucion: institucion?.nombre ?? 'N/A',
        tipoUsuario: tipo?.descripcion ?? 'N/A',
        fecha: fechaStr,
      });

      await this.storageService.subir(`constancias/${folio}.pdf`, pdfBuffer, 'application/pdf');
      await this.emailService.enviarConstancia(u.correo.toString(), pdfBuffer, folio);
    }

    // 12. Enviar confirmación al responsable
    const instResp = instituciones.find((i) => i.idInstitucion === responsableEntity.idInstitucion);
    await this.emailService.enviarConfirmacionRegistro(resp.correo, {
      nombre: resp.nombre,
      apellido: resp.apellido,
      folio: folios[0] ?? 'GRUPO',
      institucion: instResp?.nombre ?? 'N/A',
      fecha: fechaStr,
    });

    return {
      success: true,
      totalRegistrados: persistidos.length,
      folios,
    };
  }
}
