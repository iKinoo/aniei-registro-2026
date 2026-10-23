export type TipoColumnaExcel = 'texto' | 'numero' | 'moneda' | 'fecha';

export type CeldaExcel = string | number | Date | null;

export interface ColumnaExcel {
  titulo: string;
  tipo: TipoColumnaExcel;
  ancho?: number;
}

export interface HojaExcel {
  nombre: string;
  columnas: ColumnaExcel[];
  filas: CeldaExcel[][];
}

export interface IExcelService {
  generarHoja(hoja: HojaExcel): Promise<Uint8Array>;
}
