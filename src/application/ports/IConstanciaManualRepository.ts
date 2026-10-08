import { TipoConstanciaManual, ConstanciaManualArchivo } from '@/application/dtos/ConstanciaManualDTO';

export interface ConstanciaManualEntity {
  idConstancia: number;
  tipoConstancia: TipoConstanciaManual;
  destinatarios: string[];
  descripcion: string;
  archivos: ConstanciaManualArchivo[];
  fechaGeneracion: Date;
}

export interface IConstanciaManualRepository {
  guardar(data: Omit<ConstanciaManualEntity, 'idConstancia' | 'fechaGeneracion'>): Promise<ConstanciaManualEntity>;
  obtenerTodas(): Promise<ConstanciaManualEntity[]>;
  obtenerPorId(id: number): Promise<ConstanciaManualEntity | null>;
}
