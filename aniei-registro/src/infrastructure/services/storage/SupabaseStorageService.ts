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

  async obtenerUrl(ruta: string): Promise<string> {
    const bucket = ruta.startsWith('constancias/') ? 'constancias' : 'comprobantes';
    const filePath = ruta.startsWith('constancias/') || ruta.startsWith('comprobantes/')
      ? ruta.substring(ruta.indexOf('/') + 1)
      : ruta;

    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return data.publicUrl;
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
}
