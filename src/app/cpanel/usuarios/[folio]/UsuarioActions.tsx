'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { eliminarUsuarioAction } from '@/app/cpanel/actions';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';

interface Props {
  folio: string;
  nombreCompleto: string;
}

export function UsuarioActions({ folio, nombreCompleto }: Props) {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEliminar = async () => {
    setIsDeleting(true);
    const result = await eliminarUsuarioAction(folio);
    setIsDeleting(false);
    
    if (result.success) {
      setDeleteDialog(false);
      router.push('/cpanel');
      router.refresh();
    } else {
      alert(result.error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.push(`/cpanel/usuarios/${folio}/editar`)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </button>
        <button
          type="button"
          onClick={() => setDeleteDialog(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 shadow-sm text-sm font-medium rounded-lg text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>

      <ConfirmDialog
        isOpen={deleteDialog}
        title="Eliminar usuario"
        message={`¿Estás seguro de que deseas eliminar al usuario "${nombreCompleto}"? Esta acción no se puede deshacer y eliminará todos sus datos, incluyendo depósitos e inscripciones.`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleEliminar}
        onCancel={() => setDeleteDialog(false)}
      />
    </>
  );
}
