import { IPdfService } from '@/application/ports/IPdfService';
import { IStorageService, parseFileReference } from '@/application/ports/IStorageService';
import { IPonentesRepository } from '@/application/ports/IPonentesRepository';
import { IActividadRepository } from '@/application/ports/IActividadRepository';
import { IUsuarioRepository } from '@/application/ports/IUsuarioRepository';

export class GenerarConstanciaPonenteUseCase {
  constructor(
    private readonly pdfService: IPdfService,
    private readonly storageService: IStorageService,
    private readonly actividadRepo: IActividadRepository,
    private readonly ponentesRepo: IPonentesRepository,
    private readonly usuarioRepo: IUsuarioRepository,
  ) {}

  async execute(idActividad: number, idUsuario: number): Promise<string> {
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

    const ruta = `constancias/ponente-act-${idActividad}-usr-${idUsuario}.pdf`;
    await this.storageService.subir(ruta, pdfBuffer, 'application/pdf');

    const fileRef = parseFileReference(ruta);
    const publicUrl = await this.storageService.getAccess(fileRef);

    await this.ponentesRepo.actualizarUrlConstancia(idActividad, idUsuario, publicUrl);

    return publicUrl;
  }
}