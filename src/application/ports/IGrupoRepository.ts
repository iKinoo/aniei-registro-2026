import type { Usuario } from '@/core/entities/Usuario';

export interface IGrupoRepository {
  bloquearMiembro(token: string, folio: string): Promise<Usuario | null>;
}
