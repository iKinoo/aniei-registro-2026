import { getCatalogoRepository } from '@/infrastructure/config/container';
import { RegistroForm } from './components/RegistroForm';

export default async function RegistroPage() {
  const catalogoRepo = getCatalogoRepository();

  const [cargos, estados, instituciones, tiposUsuario] = await Promise.all([
    catalogoRepo.obtenerCargos(),
    catalogoRepo.obtenerEstados(),
    catalogoRepo.obtenerInstituciones(),
    catalogoRepo.obtenerTiposUsuario(),
  ]);

  const catalogos = { cargos, estados, instituciones, tiposUsuario };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Registro — Congreso ANIEI 2026</h1>
        <p className="mt-2 text-gray-600">
          Complete el formulario para inscribirse al congreso.
        </p>
      </div>

      <RegistroForm catalogos={catalogos} />
    </div>
  );
}
