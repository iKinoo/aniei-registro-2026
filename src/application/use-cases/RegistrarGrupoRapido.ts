import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { IAccesoRepository } from '@/application/ports/IAccesoRepository';
import { IStorageService } from '@/application/ports/IStorageService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IPdfService } from '@/application/ports/IPdfService';
import { RegistrarGrupoRapidoDTO } from '@/application/dtos/RegistrarGrupoRapidoDTO';
import { ResultadoRegistroGrupo } from '@/application/dtos/ResultadoRegistroGrupo';
import { ArchivoComprobante } from '@/core/value-objects/ArchivoComprobante';
import { prisma } from '@/infrastructure/database/client';
import bcrypt from 'bcryptjs';

export class RegistrarGrupoRapido {
  constructor(
    private readonly usuarioRepo: IUsuarioRepository,
    private readonly storageService: IStorageService,
    private readonly emailService: IEmailService,
    private readonly pdfService: IPdfService,
    private readonly accesoRepo: IAccesoRepository,
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

    // 5. Iniciar la transacción para crear GrupoRegistro, Usuarios y Accesos
    const persistidos = await prisma.$transaction(async (tx) => {
      // 5.1 Crear el registro del grupo
      const grupo = await tx.grupos_registro.create({
        data: {
          token,
          id_responsable: dto.responsableId,
        },
      });

      const creados = [];

      // 5.2 Crear miembros con email temporal e incluirlos en el grupo
      for (let i = 0; i < dto.miembros.length; i++) {
        const miembro = dto.miembros[i];
        const dummyEmail = `grupo_${token}_${i}@temp.aniei.org`;

        // Generar hash de password dummy, no se usará pero para pasar las validaciones
        const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);

        const newAcceso = await tx.accesos.create({
          data: {
            email: dummyEmail,
            nombre: `${miembro.nombre} ${miembro.apellido}`,
            password: passwordHash,
            rol: 'USER',
          },
        });

        const newUsuario = await tx.usuarios.create({
          data: {
            nombre: miembro.nombre,
            apellido: miembro.apellido,
            correo: dummyEmail,
            id_tipo_usuario: miembro.idTipoUsuario,
            id_grupo_registro: grupo.id,
          },
        });

        // Relacionamos acceso con usuario
        await tx.accesos.update({
          where: { id_acceso: newAcceso.id_acceso },
          data: { id_usuario: newUsuario.id_usuario },
        });

        creados.push({ ...newUsuario, token });
      }

      return creados;
    });

    // 6. Asignar folios temporales o reales?
    // Generalmente el folio se asigna, lo saltaremos hasta que completen su registro, 
    // pero esperaría `RegistrarUsuario` que genere folios. 
    // Vamos a asignarlo!
    const folios: string[] = [];
    for (const u of persistidos) {
      const folio = `ANIEI-GRP-${String(u.id_usuario).padStart(4, '0')}`;
      await prisma.usuarios.update({
        where: { id_usuario: u.id_usuario },
        data: { folio_recibo: folio }
      });
      folios.push(folio);
    }

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
      totalRegistrados: persistidos.length,
      folios,
    };
  }
}
