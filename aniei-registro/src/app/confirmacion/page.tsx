export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ folio?: string }>;
}) {
  const params = await searchParams;
  const folio = params.folio;

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="rounded-lg bg-white p-8 shadow-md">
        <div className="mb-4 text-5xl">✓</div>
        <h1 className="mb-2 text-2xl font-bold text-green-800">¡Registro exitoso!</h1>

        {folio ? (
          <>
            <p className="mb-4 text-gray-600">
              Su inscripción ha sido registrada con el folio:
            </p>
            <p className="mb-6 text-3xl font-bold text-gray-900">{folio}</p>
            <p className="mb-6 text-sm text-gray-500">
              Se ha enviado un correo de confirmación con su constancia de inscripción adjunta.
            </p>
            <a
              href={`/constancia/${folio}`}
              className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white font-medium transition-colors hover:bg-blue-700"
            >
              Descargar constancia
            </a>
          </>
        ) : (
          <p className="text-gray-600">
            Su inscripción al Congreso ANIEI 2026 ha sido procesada correctamente.
            Revise su correo electrónico para más detalles.
          </p>
        )}

        <div className="mt-8">
          <a href="/registro" className="text-sm text-blue-600 hover:underline">
            ← Volver al registro
          </a>
        </div>
      </div>
    </div>
  );
}
