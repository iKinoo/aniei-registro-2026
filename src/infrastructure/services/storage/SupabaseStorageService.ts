import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IStorageService } from '@/application/ports/IStorageService';

export class SupabaseStorageService implements IStorageService {
  private readonly client: SupabaseClient;

  constructor(supabaseUrl: string, serviceRoleKey: string) {
    this.client = createClient(supabaseUrl, serviceRoleKey);
  }

  async subir(ruta: string, buffer: Buffer, mime: string): Promise<string> {
    const bucket = ruta.startsWith('constancias/') ? 'constancias' : 'comprobantes';
    const filePath = ruta.startsWith('constancias/') || ruta.startsWith('comprobantes/')
      ? ruta.substring(ruta.indexOf('/') + 1)
      : ruta;

    const { error } = await this.client.storage
      .from(bucket)
      .upload(filePath, buffer, {
        contentType: mime,
        upsert: true,
      });

    if (error) {
      throw new Error(`Error al subir archivo a storage: ${error.message}`);
    }

    return `${bucket}/${filePath}`;
  }

  async getAccess(file: { bucket: string; path: string; }): Promise<string> {
    const { data, error } = await this.client.storage
      .from(file.bucket)
      .createSignedUrl(file.path, 60 * 5); // 5 minutos

    if (error) {
      throw new Error(`Error al obtener url firmada de storage: ${error.message}`);
    }

    return data.signedUrl;
  }

  async eliminar(ruta: string): Promise<void> {
    const bucket = ruta.startsWith('constancias/') ? 'constancias' : 'comprobantes';
    const filePath = ruta.startsWith('constancias/') || ruta.startsWith('comprobantes/')
      ? ruta.substring(ruta.indexOf('/') + 1)
      : ruta;

    const { error } = await this.client.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Error al eliminar archivo de storage: ${error.message}`);
    }
  }

  async descargar(ruta: string): Promise<Buffer> {
    const bucket = ruta.startsWith('constancias/') ? 'constancias' : 'comprobantes';
    const filePath = ruta.startsWith('constancias/') || ruta.startsWith('comprobantes/')
      ? ruta.substring(ruta.indexOf('/') + 1)
      : ruta;

    const { data, error } = await this.client.storage
      .from(bucket)
      .download(filePath);

    if (error || !data) {
      throw new Error(`Error al descargar archivo de storage: ${error?.message || 'Data is null'}`);
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
