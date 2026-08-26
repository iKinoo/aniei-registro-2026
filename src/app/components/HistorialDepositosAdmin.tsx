'use client';

import { useState } from 'react';
import { HistorialDepositos, DepositoHistorialItem } from './HistorialDepositos';
import { obtenerUrlArchivoAction } from '@/app/cpanel/actions';

interface Props {
  depositos: DepositoHistorialItem[];
}

export function HistorialDepositosAdmin({ depositos }: Props) {
  const [loadingArchivo, setLoadingArchivo] = useState(false);

  const handleVerArchivo = async (ruta: string) => {
    setLoadingArchivo(true);
    try {
      const result = await obtenerUrlArchivoAction(ruta);
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
      isAdmin
      onVerArchivo={handleVerArchivo}
      loadingArchivo={loadingArchivo}
    />
  );
}
