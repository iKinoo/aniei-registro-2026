import type { IAlertaErrorService } from '@/application/ports/IAlertaErrorService';

export class AlertaErrorServiceDeshabilitado implements IAlertaErrorService {
  async notificarError(): Promise<void> {}
}
