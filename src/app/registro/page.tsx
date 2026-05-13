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

  return (
    <div className="min-h-screen bg-slate-50">
      <RegistroForm
        catalogos={{ cargos, estados, instituciones, tiposUsuario }}
      />
    </div>
  );
}
