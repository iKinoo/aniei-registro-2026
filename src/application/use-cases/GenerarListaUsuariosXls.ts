import type { IAdminQueryService } from '../ports/IAdminQueryService';
import type { HojaExcel, IExcelService } from '../ports/IExcelService';
import type { UsuarioForAdminDTO } from '../dtos/UsuarioForAdminDTO';

export class GenerarListaUsuariosXls {
  constructor(private readonly consultas: IAdminQueryService, private readonly excel: IExcelService) {}

  async obtener(): Promise<UsuarioForAdminDTO[]> {
    return this.consultas.listarTodosUsuariosForAdmin();
  }

  async generar(): Promise<Uint8Array> {
    const usuarios = await this.obtener();
    const hoja: HojaExcel = {
      nombre: 'Usuarios registrados',
      columnas: [
        { titulo: 'Folio de registro', tipo: 'texto', ancho: 18 },
        { titulo: 'Nombre completo', tipo: 'texto', ancho: 32 },
        { titulo: 'Correo electrónico', tipo: 'texto', ancho: 32 },
        { titulo: 'Teléfono', tipo: 'texto', ancho: 16 },
        { titulo: 'Institución', tipo: 'texto', ancho: 38 },
        { titulo: 'Título', tipo: 'texto', ancho: 18 },
        { titulo: 'Fecha de registro', tipo: 'fecha', ancho: 20 },
        { titulo: 'Monto de depósito', tipo: 'moneda', ancho: 18 },
        { titulo: 'Fecha de depósito', tipo: 'fecha', ancho: 20 },
        { titulo: 'Referencia de depósito', tipo: 'texto', ancho: 24 },
      ],
      filas: usuarios.map((u) => [
        u.folioRegistro,
        u.nombreCompleto,
        u.correo,
        u.telefono,
        u.institucion,
        u.tipoUsuario,
        u.fechaRegistro,
        u.deposito?.monto ?? null,
        u.deposito?.fecha ?? null,
        u.deposito?.referencia ?? null,
      ]),
    };
    return this.excel.generarHoja(hoja);
  }
}
