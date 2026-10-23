import ExcelJS from 'exceljs';
import type { HojaExcel, IExcelService, TipoColumnaExcel } from '@/application/ports/IExcelService';

const FORMATOS: Record<TipoColumnaExcel, string> = {
  texto: '@',
  numero: '#,##0',
  moneda: '"$"#,##0.00',
  fecha: 'dd/mm/yyyy hh:mm',
};

export class ExcelJsService implements IExcelService {
  async generarHoja(hoja: HojaExcel): Promise<Uint8Array> {
    const libro = new ExcelJS.Workbook();
    libro.creator = 'Sistema de Registro ANIEI 2026';

    const worksheet = libro.addWorksheet(hoja.nombre, {
      views: [{ state: 'frozen', ySplit: 1 }],
    });

    const encabezado = worksheet.addRow(hoja.columnas.map((columna) => columna.titulo));
    encabezado.font = { bold: true };
    encabezado.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
      cell.alignment = { vertical: 'middle' };
    });

    hoja.columnas.forEach((columna, indice) => {
      const columnaExcel = worksheet.getColumn(indice + 1);
      columnaExcel.width = columna.ancho ?? 18;
      columnaExcel.numFmt = FORMATOS[columna.tipo];
    });

    for (const fila of hoja.filas) {
      worksheet.addRow(fila);
    }

    if (hoja.filas.length > 0) {
      const ultimaColumna = hoja.columnas.length;
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: hoja.filas.length + 1, column: ultimaColumna },
      };
    }

    const buffer = await libro.xlsx.writeBuffer();
    return new Uint8Array(buffer);
  }
}
