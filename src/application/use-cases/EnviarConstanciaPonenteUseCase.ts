import { IPdfService } from '@/application/ports/IPdfService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IActividadRepository } from '@/application/ports/IActividadRepository';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';

export class EnviarConstanciaPonenteUseCase {
  constructor(
    private readonly pdfService: IPdfService,
    private readonly emailService: IEmailService,
    private readonly actividadRepo: IActividadRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(idActividad: number, idUsuario: number): Promise<void> {
    const [actividad, usuario] = await Promise.all([
      this.actividadRepo.obtenerPorId(idActividad),
      this.usuarioRepo.buscarPorId(idUsuario),
    ]);

    if (!actividad || !usuario) {
      throw new Error(`Actividad o Usuario no encontrados`);
    }

    const tipos = await this.actividadRepo.obtenerTiposActividad();
    const tipoActividad = tipos.find(t => t.idTipoActividad === actividad.idTipoActividad)?.descripcion ?? 'Actividad';

    const fechaStr = new Date().toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const pdfBuffer = await this.pdfService.generarConstanciaPonente({
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      tipoActividad,
      nombreActividad: actividad.nombre,
      fecha: fechaStr,
    });

    await this.emailService.enviarConstanciaPonente(
      usuario.correo.toString(),
      pdfBuffer,
      `${usuario.nombre} ${usuario.apellido}`,
      actividad.nombre
    );
  }
}