import { TipoConstanciaManual } from '@/application/dtos/ConstanciaManualDTO';

export interface ConstanciaManualEntity {
  idConstancia: number;
  tipoConstancia: TipoConstanciaManual;
  destinatarios: string[];
  descripcion: string;
  urlPdf: string;
  fechaGeneracion: Date;
}

export interface IConstanciaManualRepository {
  guardar(data: Omit<ConstanciaManualEntity, 'idConstancia' | 'fechaGeneracion'>): Promise<ConstanciaManualEntity>;
  obtenerTodas(): Promise<ConstanciaManualEntity[]>;
  obtenerPorId(id: number): Promise<ConstanciaManualEntity | null>;
}
