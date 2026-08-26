'use client';

import { useState } from 'react';
import { HistorialDepositos, DepositoHistorialItem } from './HistorialDepositos';
import { obtenerUrlComprobanteAction } from '@/app/perfil/actions';

interface Props {
  depositos: DepositoHistorialItem[];
}

export function HistorialDepositosUsuario({ depositos }: Props) {
  const [loadingArchivo, setLoadingArchivo] = useState(false);

  const handleVerArchivo = async (ruta: string) => {
    setLoadingArchivo(true);
    try {
      const result = await obtenerUrlComprobanteAction(ruta);
      if (result.success) {
        window.open(result.url, '_blank');
      } else {
        alert(result.error);
      }
    } finally {
      setLoadingArchivo(false);
    }
  };

  return (
    <HistorialDepositos
      depositos={depositos}
      onVerArchivo={handleVerArchivo}
      loadingArchivo={loadingArchivo}
    />
  );
}
