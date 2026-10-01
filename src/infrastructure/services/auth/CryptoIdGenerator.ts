import { randomUUID } from 'node:crypto';
import type { IIdGenerator } from '@/application/ports/IIdGenerator';

export class CryptoIdGenerator implements IIdGenerator {
  uuid(): string {
    return randomUUID();
  }
}
