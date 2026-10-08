import { IPdfService } from '@/application/ports/IPdfService';
import { IStorageService } from '@/application/ports/IStorageService';
import { IPonentesRepository } from '@/application/ports/IPonentesRepository';
import { IActividadRepository } from '@/application/ports/IActividadRepository';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';
import { contenidoPorTipoActividad } from '@/application/services/RedactorConstancia';

export class GenerarConstanciaPonenteUseCase {
  constructor(
    private readonly pdfService: IPdfService,
    private readonly storageService: IStorageService,
    private readonly actividadRepo: IActividadRepository,
    private readonly ponentesRepo: IPonentesRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(idActividad: number, folioRegistro: string): Promise<string> {
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
        esPonente: true,
      }),
    );

    const ruta = `constancias/ponente-act-${idActividad}-usr-${folioRegistro}.pdf`;
    await this.storageService.subir(ruta, pdfUint8Array, 'application/pdf');

    await this.ponentesRepo.actualizarUrlConstancia(idActividad, folioRegistro, ruta);

    return ruta;
  }
}
