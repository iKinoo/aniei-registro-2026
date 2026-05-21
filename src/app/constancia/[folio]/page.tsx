import { getUsuarioRepository, getCatalogoRepository, getPdfService } from '@/infrastructure/config/container';
import { FolioRegistro } from '@/core/value-objects/FolioRegistro';
import { NextResponse } from 'next/server';

export default async function ConstanciaPage({
  params,
}: {
  params: Promise<{ folio: string }>;
}) {
  const { folio } = await params;

  try {
    const usuarioRepo = getUsuarioRepository();
    const folioVO = FolioRegistro.create(folio);
    const usuario = await usuarioRepo.buscarPorFolio(folioVO);

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

    // Obtener datos de catálogos
    const catalogoRepo = getCatalogoRepository();
    const [instituciones, titulos] = await Promise.all([
      catalogoRepo.obtenerInstituciones(),
      catalogoRepo.obtenerTitulos(),
    ]);

    const institucion = instituciones.find((i) => i.idInstitucion === usuario.idInstitucion);
    const titulo = titulos.find((t) => t.idTitulo === usuario.idTitulo);

    const fechaStr = usuario.fechaRegistro.toLocaleDateString('es-MX', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    // Renderizar información de la constancia con opción de descarga PDF
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
              <span>{institucion?.nombre ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b py-2">
              <span className="font-medium text-gray-600">Tipo:</span>
              <span>{titulo?.descripcion ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="font-medium text-gray-600">Fecha:</span>
              <span>{fechaStr}</span>
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
  } catch {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-2 text-xl font-bold text-red-800">Error</h1>
          <p className="text-gray-600">Folio inválido o no encontrado.</p>
          <a href="/registro" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
            ← Volver al registro
          </a>
        </div>
      </div>
    );
  }
}
