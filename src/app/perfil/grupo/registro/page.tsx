import { GrupoRapidoForm } from './GrupoRapidoForm';
import { prisma } from '@/infrastructure/database/client';

export const metadata = {
  title: 'Registro Rápido de Grupo | ANIEI 2026',
  description: 'Registra un grupo de participantes rápidamente',
};

export default async function GrupoRegistroPage() {
  const tiposUsuario = await prisma.tipo_usuario.findMany({ orderBy: { id_tipo_usuario: 'asc' } });
  
  // Transform to the expected shape (idTipoUsuario instead of id_tipo_usuario)
  const mappedTipos = tiposUsuario.map(t => ({
    idTipoUsuario: t.id_tipo_usuario,
    descripcion: t.descripcion
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight border-b pb-4">Registra un Grupo</h1>
          <p className="text-gray-600 mt-2">
            Llena los nombres básicos de tu equipo y asocia el comprobante de pago. Recibirás un folio
            y un código QR para que ellos completen el registro.
          </p>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-lg border border-gray-100">
          <GrupoRapidoForm tiposUsuario={mappedTipos} />
        </div>
      </div>
    </div>
  );
}
