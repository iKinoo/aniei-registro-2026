import { IPdfService } from '@/application/ports/IPdfService';
import { IEmailService } from '@/application/ports/IEmailService';
import { IActividadRepository } from '@/application/ports/IActividadRepository';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { contenidoPorTipoActividad } from '@/application/services/RedactorConstancia';

export class EnviarConstanciaParticipanteUseCase {
  constructor(
    private readonly pdfService: IPdfService,
    private readonly emailService: IEmailService,
    private readonly actividadRepo: IActividadRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(idActividad: number, folioRegistro: string): Promise<void> {
    const [actividad, usuario] = await Promise.all([
      this.actividadRepo.obtenerPorId(idActividad),
      this.usuarioRepo.buscarPorId(folioRegistro),
    ]);

    if (!actividad || !usuario) {
      throw new Error(`Actividad o Usuario no encontrados`);
    }

    const tipos = await this.actividadRepo.obtenerTiposActividad();
    const tipo = tipos.find((t) => t.idTipoActividad === actividad.idTipoActividad);

    const pdfUint8Array = await this.pdfService.generarConstancia(
      contenidoPorTipoActividad({
        destinatario: `${usuario.nombre} ${usuario.apellido}`,
        claveTipo: tipo?.clave ?? null,
        descripcionTipo: tipo?.descripcion ?? 'Actividad',
        nombreActividad: actividad.nombre,
        esPonente: false,
      }),
    );

    await this.emailService.enviarConstanciaParticipante(
      usuario.correo.toString(),
      pdfUint8Array,
      `${usuario.nombre} ${usuario.apellido}`,
      actividad.nombre
    );
  }
}
