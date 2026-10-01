import { getUsuarioRepository, getCatalogoRepository, getPdfService } from '@/infrastructure/config/container';
import { ConsultarConstancia } from '@/application/use-cases/ConsultarConstancia';

export default async function ConstanciaPage({
  params,
}: {
  params: Promise<{ folio: string }>;
}) {
  const { folio } = await params;

  let usuario;
  try {
    usuario = await new ConsultarConstancia(getUsuarioRepository(), getCatalogoRepository(), getPdfService()).obtener(folio);
  } catch {
    usuario = null;
  }

    if (!usuario) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <h1 className="mb-2 text-xl font-bold text-red-800">Folio no encontrado</h1>
            <p className="text-gray-600">
              No se encontró un registro con el folio <strong>{folio}</strong>.
            </p>
            <a href="/registro" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
              ← Volver al registro
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">Constancia de Inscripción</h1>
          <div className="mb-6 space-y-2 text-left">
            <div className="flex justify-between border-b py-2">
              <span className="font-medium text-gray-600">Nombre:</span>
              <span>{usuario.nombre} {usuario.apellido}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-medium text-gray-600">Folio:</span>
              <span className="font-bold">{folio}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-medium text-gray-600">Institución:</span>
              <span>{usuario.institucion}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-medium text-gray-600">Tipo:</span>
              <span>{usuario.tipoUsuario}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Fecha:</span>
              <span>{usuario.fecha}</span>
            </div>
          </div>
          <a
            href={`/api/constancia/${folio}`}
            className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium transition-colors hover:bg-blue-700"
          >
            Descargar PDF
          </a>
          <div className="mt-4">
            <a href="/registro" className="text-sm text-blue-600 hover:underline">
              ← Volver al registro
            </a>
          </div>
        </div>
      </div>
    );
}
