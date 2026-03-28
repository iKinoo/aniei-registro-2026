import { getCatalogoRepository } from '@/infrastructure/config/container';
import { RegistroForm } from './components/RegistroForm';
import { GrupoForm } from './components/GrupoForm';

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const params = await searchParams;
  const catalogoRepo = getCatalogoRepository();

  const [cargos, estados, instituciones, tiposUsuario] = await Promise.all([
    catalogoRepo.obtenerCargos(),
    catalogoRepo.obtenerEstados(),
    catalogoRepo.obtenerInstituciones(),
    catalogoRepo.obtenerTiposUsuario(),
  ]);

  const catalogos = { cargos, estados, instituciones, tiposUsuario };
  const grupalHabilitado = process.env.ENABLE_GROUP_REGISTRATION === 'true';
  const esGrupal = grupalHabilitado && params.tipo === 'grupal';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Registro — Congreso ANIEI 2026</h1>
        <p className="mt-2 text-gray-600">
          Complete el formulario para inscribirse al congreso.
        </p>
      </div>

      {grupalHabilitado && (
        <div className="mb-6 flex justify-center gap-2">
          <a
            href="/registro"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              !esGrupal
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Individual
          </a>
          <a
            href="/registro?tipo=grupal"
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              esGrupal
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Grupal
          </a>
        </div>
      )}

      {esGrupal ? (
        <GrupoForm catalogos={catalogos} />
      ) : (
        <RegistroForm catalogos={catalogos} />
      )}
    </div>
  );
}
