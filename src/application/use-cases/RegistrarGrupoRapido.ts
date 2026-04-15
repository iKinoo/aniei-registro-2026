import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IStorageService } from '@/application/ports/IStorageService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IPdfService } from '@/application/ports/IPdfService';
import { RegistrarGrupoRapidoDTO } from '@/application/dtos/RegistrarGrupoRapidoDTO';
import { ResultadoRegistroGrupo } from '@/application/dtos/ResultadoRegistroGrupo';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import bcrypt from 'bcryptjs';

export class RegistrarGrupoRapido {
  // Configuración: El ID que corresponde al tipo "Alumno"
  private readonly ID_TIPO_USUARIO_ALUMNO = 1;
  private readonly ID_CARGO_ALUMNO = 1;

  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly storageService: IStorageService,
    private readonly emailService: IEmailService,
    private readonly pdfService: IPdfService,
  ) {}

  async execute(dto: RegistrarGrupoRapidoDTO): Promise<ResultadoRegistroGrupo> {
    // 1. Validar responsable existe
    const responsable = await this.usuarioRepo.buscarPorId(dto.responsableId);
    if (!responsable) {
      throw new Error(`Responsable con ID ${dto.responsableId} no encontrado`);
    }

    // 2. Validar archivo comprobante
    ArchivoComprobante.create(dto.archivo.nombre, dto.archivo.mime, dto.archivo.tamanio);

    // 3. Generar token de grupo
    const token = crypto.randomUUID();

    // 4. Subir comprobante (un solo archivo por el grupo)
    const ext = dto.archivo.nombre.split('.').pop() || 'bin';
    const archivoRuta = `comprobantes_grupo/${token}.${ext}`;
    await this.storageService.subir(archivoRuta, dto.archivo.buffer, dto.archivo.mime);

    // 5. Preparar los datos de los miembros (Mapeo)
    const passwordGenerico = await bcrypt.hash(crypto.randomUUID(), 10);
    const miembrosMapeados = dto.miembros.map((miembro, i) => ({
      nombre: miembro.nombre,
      apellido: miembro.apellido,
      correoDummy: `grupo_${token}_${i}@temp.aniei.org`,
      passwordHash: passwordGenerico // Se reutiliza el mismo hash genérico para todos
    }));

    // 6. Delegar la persistencia transaccional al Repositorio
    // Aquí es donde las herencias (Institución, Dependencia, Estado) se pasan para insertarse
    const { folios, usuariosIds } = await this.usuarioRepo.crearGrupoTransaccional({
      token,
      responsableId: dto.responsableId,
      institucionId: responsable.idInstitucion,
      dependenciaId: responsable.dependencia || '',
      estadoId: responsable.idEntidadFederativa, 
      tipoUsuarioAlumnoId: this.ID_TIPO_USUARIO_ALUMNO,
      cargoAlumnoId: this.ID_CARGO_ALUMNO,
      miembros: miembrosMapeados
    });

    // 7. Generar el PDF
    const nombres = dto.miembros.map(m => `${m.nombre} ${m.apellido}`);
    const pdfBuffer = await this.pdfService.generarHojaRegistroGrupo({
      token,
      nombres,
      responsableNombre: `${responsable.nombre} ${responsable.apellido}`
    });

    // 8. Enviar correo al responsable
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
